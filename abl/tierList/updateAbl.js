const Ajv = require("ajv");
const ajv = new Ajv();

const tierListDao = require("../../dao/tierList-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
    name: { type: "string" },
    color: { type: "string" },
    order: { type: "number" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function UpdateAbl(req, res) {
  try {
    let tierList = req.body;

    // Validate input
    const valid = ajv.validate(schema, tierList);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        tierList: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // Get the current row from the database
    const currentRow = tierListDao.get(tierList.id);
    if (!currentRow) {
      res.status(404).json({
        code: "rowNotFound",
        tierList: `Row with id ${tierList.id} not found`,
      });
      return;
    }

    // If order is changing, update the other Rows
    if (currentRow.order !== tierList.order) {
      const updatedRows = tierListDao.updateOrder(currentRow.order, tierList.order);
      if (updatedRows.error) {
        res.status(400).json({
          code: "orderUpdateFailed",
          message: updatedRows.error,
        });
        return;
      }
    }

    // Update Rows in persistent storage
    let updatedRow;
    try {
      updatedRow = tierListDao.update(tierList);
    } catch (e) {
      res.status(400).json({
        ...e,
      });
      return;
    }

    if (!updatedRow) {
      res.status(404).json({
        code: "rowNotFound",
        tierList: `Row with id ${tierList.id} not found`,
      });
      return;
    }

    // Return updated row
    res.json(updatedRow);
  } catch (e) {
    res.status(500).json({ tierList: e.tierList });
  }
}

module.exports = UpdateAbl;