import ShoppingList from "../../src/models/ShoppingList";
import mongoose from "mongoose";

// Helper function to validate ObjectId
function validateObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new Error("Invalid shopping list ID");
  }
}

// Helper function to find shopping list and handle not found case
async function findShoppingListById(id) {
  //validateObjectId(id);
  const shoppingList = await ShoppingList.findById(id);
  console.log(shoppingList);
  if (!shoppingList) {
    throw new Error("Shopping list not found");
  }
  console.log(shoppingList);
  return shoppingList;
}

const shoppingListDao = {
  async createShoppingList(data) {
    try {
      // Vytvoření seznamu
      const newShoppingList = new ShoppingList(data);
      await newShoppingList.save();

      return { success: true, data: newShoppingList };
    } catch (error) {
      // Zpracování validačních chyb
      if (error.name === "ValidationError") {
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

      // Zpracování dalších chyb
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
    const shoppingList = await ShoppingList.findById(listId);

    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }

    shoppingList.items.push(itemData); // Přidání položky přímo jako objekt
    await shoppingList.save();
    return shoppingList.items[shoppingList.items.length - 1]; // Vrátíme přidanou položku
  },

  async updateItem(listId, itemId, updates) {
    const shoppingList = await this.findById(listId);

    const item = shoppingList.items.id(itemId);
    if (!item) {
      throw new Error("Item not found");
    }

    // Update allowed fields
    if (updates.name) item.name = updates.name;
    if (updates.quantity) item.quantity = updates.quantity;
    if (updates.status) item.status = updates.status;

    await shoppingList.save();
    return item;
  },

  async deleteItem(listId, itemId) {
    validateObjectId(listId);
    validateObjectId(itemId);

    // Použijeme `$pull` k odstranění položky přímo v MongoDB
    const result = await ShoppingList.updateOne(
      { _id: listId },
      { $pull: { items: { _id: itemId } } }
    );

    // Zkontrolujeme, zda byla položka skutečně odstraněna
    if (result.modifiedCount === 0) {
      throw new Error("Item not found or already deleted");
    }

    return { success: true, message: "Item deleted successfully" };
  },
  async removeMember(shoppingListId, memberId) {
    const shoppingList = await ShoppingList.findById(shoppingListId);

    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }

    // Odebereme člena podle ID
    shoppingList.members = shoppingList.members.filter(
      (member) => member._id.toString() !== memberId
    );

    await shoppingList.save();

    return { success: true, message: "Member removed successfully" };
  },
  async addMember(shoppingListId, memberId) {
    const shoppingList = await ShoppingList.findById(shoppingListId);

    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }

    // Kontrola, zda člen už není přidán
    if (shoppingList.members.includes(memberId)) {
      throw new Error("Member is already in the shopping list");
    }

    // Přidání člena
    shoppingList.members.push(memberId);

    await shoppingList.save();

    return shoppingList;
  },
  async findByIdWithDetails(id) {
    return await ShoppingList.findById(id)
      .populate("ownerId", "name email") // Populate owner details
      .populate("members", "name email"); // Populate member details
  },
  async findListsByUser(userId) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }

    // Najít seznamy, kde je uživatel vlastníkem nebo členem
    const shoppingLists = await ShoppingList.find({
      $or: [{ ownerId: userId }, { members: userId }],
    }).populate("members"); // Pokud chceš mít detaily členů

    return shoppingLists;
  },
};

export default shoppingListDao;
