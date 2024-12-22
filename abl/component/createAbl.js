const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const componentDao = require("../../dao/component-dao.js");

const schema = {
  type: "object",
  properties: {
    imageData: { type: "string" },
  },
  required: ["imageData"],
  additionalProperties: false,
};

async function CreateAbl(req, res) {
  try {
    let component = req.body;

    // validate input
    const valid = ajv.validate(schema, component);
    if (!valid) {
      res.status(400).json({
        code: "dtoInIsNotValid",
        message: "dtoIn is not valid",
        validationError: ajv.errors,
      });
      return;
    }

    // store component to persistent storage
    component = componentDao.create(component);

    // return properly filled dtoOut
    res.json(component);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
}

module.exports = CreateAbl;
