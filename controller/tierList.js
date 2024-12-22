const express = require("express");
const router = express.Router();

const ListAbl = require("../abl/tierList/listAbl");
const CreateAbl = require("../abl/tierList/createAbl");
const UpdateAbl = require("../abl/tierList/updateAbl");
const DeleteAbl = require("../abl/tierList/deleteAbl");
const ExportAbl = require("../abl/tierList/exportAbl");

router.get("/list", ListAbl);
router.get("/export", ExportAbl);
router.post("/create", CreateAbl);
router.post("/update", UpdateAbl);
router.post("/delete", DeleteAbl);

module.exports = router;
