const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const componentDao = require("../../dao/component-dao.js");
const tierListDao = require("../../dao/tierList-dao.js");

const schema = {
  type: "object",
  properties: {
    id: { type: "string", minLength: 32, maxLength: 32 },
    row: { type: "string" },
    order: { type: "number" },
  },
  required: ["id", "row", "order"],
  additionalProperties: false,
};

async function DragAbl(req, res) {
  try {
    const component = req.body;

    // Validate input
    const valid = ajv.validate(schema, component);
    if (!valid) {
      return res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
    }

    // Check if the row exists in tierList
    const rows = tierListDao.list();
    const matchingRow = rows.find((tierList) => tierList.name === component.row);
    if (!matchingRow) {
      return res.status(400).json({
        code: "rowDoesNotExist",
        message: `Row '${component.row}' does not exist in the tierList`,
      });
    }

    // Fetch the current component
    const currentComponent = componentDao.get(component.id);
    if (!currentComponent) {
      return res.status(404).json({
        code: "componentNotFound",
        message: `Component '${component.id}' not found`,
      });
    }

    // Update the order if it has changed
    if (currentComponent.row !== component.row || currentComponent.order !== component.order) {
      // Adjust orders of other components in the same row
      componentDao.updateOrder(component.row, component.order, component.id);
    }

    // Update the dragged component
    const updatedComponent = componentDao.update(component);
    if (!updatedComponent) {
      return res.status(500).json({
        code: "failedToUpdateComponent",
        message: `Failed to update component '${component.id}'`,
      });
    }

    // Return the updated component
    res.status(200).json(updatedComponent);
  } catch (error) {
    res.status(500).json({
      code: "unexpectedError",
      message: "An unexpected error occurred",
      error: error.message,
    });
  }
}

module.exports = DragAbl;