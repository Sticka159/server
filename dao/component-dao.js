const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const componentFolderPath = path.join(
  __dirname,
  "storage",
  "componentList"
);

// Method to read a component from a file
function get(componentId) {
  try {
    const filePath = path.join(componentFolderPath, `${componentId}.json`);
    const fileData = fs.readFileSync(filePath, "utf8");
    return JSON.parse(fileData);
  } catch (error) {
    if (error.code === "ENOENT") return null;
    throw { code: "failedToReadComponent", message: error.message };
  }
}

// Method to write a component to a file
function create(component) {
  try {
    const componentList = list();
    // Find the maximum order number from existing components
    const maxOrder = componentList.reduce((max, item) => {
      return item.order > max ? item.order : max;
    }, 0); // If no components exist, `maxOrder` will be 0

    // Assign the new order as the largest existing order + 1
    component.order = maxOrder + 1;
    component.row = "default";
    component.id = crypto.randomBytes(16).toString("hex");
    const filePath = path.join(componentFolderPath, `${component.id}.json`);
    const fileData = JSON.stringify(component);
    fs.writeFileSync(filePath, fileData, "utf8");
    return component;
  } catch (error) {
    throw { code: "failedToCreateComponent", message: error.message };
  }
}

// Method to update component in a file
function update(component) {
  try {
    const currentComponent = get(component.id);
    if (!currentComponent) return null;
    const newComponent = { ...currentComponent, ...component };
    const filePath = path.join(componentFolderPath, `${component.id}.json`);
    const fileData = JSON.stringify(newComponent);
    fs.writeFileSync(filePath, fileData, "utf8");
    return newComponent;
  } catch (error) {
    throw { code: "failedToUpdateComponent", message: error.message };
  }
}

// Method to list components in a folder
function list(filter = {}) {
  try {
    const files = fs.readdirSync(componentFolderPath);
    return files.map((file) => {
      const fileData = fs.readFileSync(
          path.join(componentFolderPath, file),
          "utf8"
      );
      return JSON.parse(fileData);
    });
  } catch (error) {
    throw { code: "failedToListComponents", message: error.message };
  }
}

function updateOrder(row, newOrder, draggedComponentId) {
  try {
    const components = list();
    const sameRowComponents = components.filter(
        (component) => component.row === row && component.id !== draggedComponentId
    );

    // Sort components by order
    sameRowComponents.sort((a, b) => a.order - b.order);

    // Adjust orders for the row to avoid conflicts
    let adjustedOrder = newOrder;
    sameRowComponents.forEach((component) => {
      if (component.order === adjustedOrder) {
        adjustedOrder++;
        component.order = adjustedOrder; // Move to the next order
      }
    });

    // Save updated components
    sameRowComponents.forEach((component) => {
      const filePath = path.join(componentFolderPath, `${component.id}.json`);
      const fileData = JSON.stringify(component);
      fs.writeFileSync(filePath, fileData, "utf8");
    });

    return sameRowComponents;
  } catch (error) {
    throw { code: "failedToUpdateOrder", message: error.message };
  }
}

module.exports = {
  get,
  create,
  update,
  list,
  updateOrder
};
