const tierListDao = require("../../dao/tierList-dao.js");

async function ListAbl(req, res) {
  try {
    const tierList = tierListDao.list();
    res.json({ itemList: tierList });
  } catch (e) {
    res.status(500).json({ tierList: e.tierList });
  }
}

module.exports = ListAbl;
