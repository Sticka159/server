const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rowFolderPath = path.join(__dirname, "storage", "rowList");

// Method to read a row from a file
function get(tierListId) {
  try {
    const filePath = path.join(rowFolderPath, `${tierListId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw { code: "failedToReadRow", tierList: error.tierList };
  }
}

// Method to write a row to a file
function create(tierList) {
  try {
    const tierListList = list();

    // Check if a row with the same name already exists
    if (tierListList.some((item) => item.name === tierList.name)) {
      throw {
        code: "uniqueNameAlreadyExists",
        message: "Row with the given name already exists",
      };
    }

    // Find the maximum order number from existing rows
    const maxOrder = tierListList.reduce((max, item) => {
      return item.order > max ? item.order : max;
    }, 0); // If no tier lists exist, `maxOrder` will be 0

    // Assign the new order as the largest existing order + 1
    tierList.order = maxOrder + 1;
    tierList.color = "black";
    tierList.id = crypto.randomBytes(16).toString("hex");

    // Save the row to a file
    const filePath = path.join(rowFolderPath, `${tierList.id}.json`);
    const fileData = JSON.stringify(tierList);
    fs.writeFileSync(filePath, fileData, "utf8");

    return tierList;
  } catch (error) {
    throw { code: "failedToCreateRow", tierList: error.tierList };
  }
}
function updateOrder(oldOrder, newOrder) {
  try {
    // Fetch all rows
    const allTierLists = list();

    // Adjust orders based on the movement direction
    if (oldOrder < newOrder) {
      // Moving down: decrement the order of items between oldOrder and newOrder
      allTierLists.forEach((tierList) => {
        if (tierList.order > oldOrder && tierList.order <= newOrder) {
          tierList.order -= 1;
          update(tierList); // Save updated order
        }
      });
    } else if (oldOrder > newOrder) {
      // Moving up: increment the order of items between newOrder and oldOrder
      allTierLists.forEach((tierList) => {
        if (tierList.order >= newOrder && tierList.order < oldOrder) {
          tierList.order += 1;
          update(tierList); // Save updated order
        }
      });
    }

    return { success: true };
  } catch (error) {
    return { error: "Failed to update order: " + error.message };
  }
}
// Method to update row in a file
function update(tierList) {
  try {
    const currentTierList = get(tierList.id);
    if (!currentTierList) return null;

    // Update row properties
    const newTierList = { ...currentTierList, ...tierList };
    const filePath = path.join(rowFolderPath, `${tierList.id}.json`);
    const fileData = JSON.stringify(newTierList);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newTierList;
  } catch (error) {
    throw { code: "failedToUpdateRow", tierList: error.tierList };
  }
}

// Method to remove a row from a file
function remove(tierListId) {
  try {
    const filePath = path.join(rowFolderPath, `${tierListId}.json`);
    fs.unlinkSync(filePath);
    return {};
  } catch (error) {
    if (error.code === "ENOENT") {
      return {};
    }
    throw { code: "failedToRemoveRow", tierList: error.tierList };
  }
}

// Method to list rows in a folder
function list() {
  try {
    const files = fs.readdirSync(rowFolderPath);
    return files.map((file) => {
      const fileData = fs.readFileSync(
          path.join(rowFolderPath, file),
          "utf8"
      );
      return JSON.parse(fileData);
    });
  } catch (error) {
    throw { code: "failedToListRows", tierList: error.tierList };
  }
}

module.exports = {
  get,
  create,
  update,
  remove,
  list,
  updateOrder,
};
