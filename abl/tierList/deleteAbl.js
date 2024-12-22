const Ajv = require("ajv");
const ajv = new Ajv();
const tierListDao = require("../../dao/tierList-dao.js");
const componentDao = require("../../dao/component-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string" },
  },
  required: ["id"],
  additionalProperties: false,
};

async function DeleteAbl(req, res) {
  try {
    const reqParams = req.body;

    // Validate input
    const valid = ajv.validate(schema, reqParams);
    if (!valid) {
      return res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
    }

    // Fetch the row to get its id
    const row = tierListDao.get(reqParams.id);
    if (!row) {
      return res.status(404).json({
        code: "rowNotFound",
        message: `row with ID '${reqParams.id}' not found`,
      });
    }

    const rowName = row.name;

    // Fetch all components that belong to the tierList's row
    const componentList = componentDao.list();
    const componentsToUpdate = componentList.filter((component) => component.row === rowName);

    // For each component in the deleted tierList row, update its row to "default"
    componentsToUpdate.forEach((component) => {
      component.row = "default"; // Move component to default row
    });

    // Call updateOrder to ensure there are no conflicts in the default row
    componentsToUpdate.forEach((component) => {
      componentDao.updateOrder("default", component.order, component.id); // Update order in the default row
      componentDao.update(component); // Save the updated component with the new row and order
    });

    // Remove the row
    tierListDao.remove(reqParams.id);

    // Return an empty object to indicate success
    res.json({});
  } catch (error) {
    res.status(500).json({
      code: "unexpectedError",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

module.exports = DeleteAbl;