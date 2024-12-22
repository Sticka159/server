const Ajv = require("ajv");
const ajv = new Ajv();

const tierListDao = require("../../dao/tierList-dao.js");

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
  },
  required: ["name"],
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let row = req.body;

    // validate input
    const valid = ajv.validate(schema, row);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        row: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // store the row to a persistant storage
    try {
      row = tierListDao.create(row);
    } catch (e) {
      res.status(400).json({
        ...e,
      });
      return;
    }

    // return properly filled dtoOut
    res.json(row);
  } catch (e) {
    res.status(500).json({ row: e.row });
  }
}

module.exports = CreateAbl;
