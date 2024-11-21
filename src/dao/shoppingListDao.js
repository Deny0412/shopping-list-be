import ShoppingList from "@/src/models/ShoppingList";
import Item from "@/src/models/Item";
import mongoose from "mongoose";

// Helper function to validate ObjectId
function validateObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid shopping list ID");
  }
}

// Helper function to find shopping list and handle not found case
async function findShoppingListById(id) {
  validateObjectId(id);
  const shoppingList = await ShoppingList.findById(id);
  if (!shoppingList) {
    throw new Error("Shopping list not found");
  }
  return shoppingList;
}

// Helper function to validate item structure using the Item model
async function validateItemStructure(items) {
  for (const [index, item] of items.entries()) {
    const validationInstance = new Item(item);
    try {
      await validationInstance.validate();
    } catch (validationError) {
      throw new Error(
        `Validation error in item at index ${index} (${
          item.name || "Unnamed item"
        }): ${validationError.message}`
      );
    }
  }
}

const shoppingListDao = {
  async createShoppingList(data) {
    try {
      // Validate item structure using the Item model
      if (Array.isArray(data.items)) {
        await validateItemStructure(data.items);
      }

      const newShoppingList = new ShoppingList(data);
      await newShoppingList.save();
      return { success: true, data: newShoppingList };
    } catch (error) {
      if (error.name === "ValidationError") {
        // Collect validation errors for detailed message
        const messages = Object.keys(error.errors).map((key) => {
          const errorObj = error.errors[key];
          if (key.startsWith("items")) {
            const indexMatch = key.match(/items\.(\d+)\./);
            if (indexMatch) {
              const index = indexMatch[1];
              return `Validation error in item at index ${index} (${
                data.items[index]?.name || "Unnamed item"
              }): ${errorObj.message}`;
            }
          }
          return errorObj.message;
        });

        throw new Error(messages.join(", "));
      }

      throw new Error(`Error creating shopping list: ${error.message}`);
    }
  },

  /* async findById(id) {
    return await findShoppingListById(id);
  }, */

  async findById(listId) {
    validateObjectId(listId);
    const shoppingList = await ShoppingList.findById(listId).populate(
      "members"
    );
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    return shoppingList;
  },

  async updateShoppingList(id, updates) {
    const shoppingList = await findShoppingListById(id);

    // Validate item structure if items are being updated
    if (Array.isArray(updates.items)) {
      await validateItemStructure(updates.items);
    }

    // Update only allowed fields
    if (updates.name) {
      shoppingList.name = updates.name;
    }
    if (Array.isArray(updates.members)) {
      shoppingList.members = updates.members;
    }
    if (Array.isArray(updates.items)) {
      shoppingList.items = updates.items;
    }

    await shoppingList.save();
    return shoppingList;
  },

  async deleteById(id) {
    const deletedShoppingList = await ShoppingList.findByIdAndDelete(id);
    if (!deletedShoppingList) {
      throw new Error("Shopping list not found");
    }

    return deletedShoppingList;
  },

  async addItemToShoppingList(listId, itemData) {
    const shoppingList = await findShoppingListById(listId);

    const newItem = {
      _id: new mongoose.Types.ObjectId(),
      ...itemData,
    };

    shoppingList.items.push(newItem);
    await shoppingList.save();
    return newItem;
  },

  async updateItem(listId, itemId, updates) {
    const shoppingList = await this.findById(listId);

    const item = shoppingList.items.id(itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Validate item structure for updates using the Item model
    await validateItemStructure([{ ...item.toObject(), ...updates }]);

    // Update allowed fields
    if (updates.name) item.name = updates.name;
    if (updates.quantity) item.quantity = updates.quantity;
    if (updates.status) item.status = updates.status;

    await shoppingList.save();
    return item;
  },

  async deleteItem(listId, itemId) {
    const shoppingList = await this.findById(listId);

    const item = shoppingList.items.id(itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    item.remove();
    await shoppingList.save();
    return { success: true, message: "Item deleted successfully" };
  },
  async findAllByOwner(ownerId) {
    validateObjectId(ownerId);
    return await ShoppingList.find({ ownerId }).populate("members");
  },
};

export default shoppingListDao;
