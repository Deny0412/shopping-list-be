import ShoppingList from "@/src/models/ShoppingList";
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

export default {
  async createShoppingList(data) {
    try {
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
  async findById(id) {
    return await findShoppingListById(id);
  },
  async updateShoppingList(id, updates) {
    const shoppingList = await findShoppingListById(id);

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
};
