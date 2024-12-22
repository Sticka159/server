const express = require("express");
const app = express();
const port = 8888;

const componentController = require("./controller/component");
const tierListController = require("./controller/tierList");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/component", componentController);
app.use("/tierList", tierListController);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
