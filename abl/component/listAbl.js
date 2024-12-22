const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const componentDao = require("../../dao/component-dao.js");

async function ListAbl(req, res) {
  try {

    // Fetch the complete component list
    const componentList = componentDao.list();


    // Return properly filled dtoOut with the full lists
    res.json({ itemList: componentList});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
}

module.exports = ListAbl;