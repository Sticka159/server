const express = require("express");
const router = express.Router();

const ListAbl = require("../abl/component/listAbl");
const CreateAbl = require("../abl/component/createAbl");
const DragAbl = require("../abl/component/dragAbl");

router.get("/list", ListAbl);
router.post("/create", CreateAbl);
router.post("/drag", DragAbl);

module.exports = router;
