const Ajv = require("ajv");
const addFormats = require("ajv-formats").default;
const ajv = new Ajv();
addFormats(ajv);

const tierListDao = require("../../dao/tierList-dao.js");
const componentDao = require("../../dao/component-dao.js");

async function ListAbl(req, res) {
    try {
        // Fetch rows and components
        const tierListList = tierListDao.list();
        const componentList = componentDao.list();

        // Combine into a single dtoOut
        const dtoOut = {
            tierLists: tierListList,
            components: componentList,
        };

        // Set headers for file download
        res.setHeader("Content-Disposition", "attachment; filename=data.json");
        res.setHeader("Content-Type", "application/json");

        // Return the combined data as a downloadable file
        res.send(JSON.stringify(dtoOut, null, 2));
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
}

module.exports = ListAbl;