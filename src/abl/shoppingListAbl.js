import shoppingListDao from "../../src/dao/shoppingListDao";
import { validateUserExists } from "../../src/utils/validationHelpers";

const shoppingListAbl = {
  async createShoppingList({ name, members, items, ownerId }) {
    if (!ownerId) {
      throw new Error("Owner ID is required to create a shopping list");
    }
    if (!name) {
      throw new Error("Name is required to create a shopping list");
    }

    // Validate members
    if (members && members.length > 0) {
      for (const memberId of members) {
        await validateUserExists(memberId);
      }
    }

    const data = {
      name,
      ownerId,
      members,
      items,
    };

    const result = await shoppingListDao.createShoppingList(data);
    return result;
  },
  async verifyAccess(shoppingList, userId, requireOwnership = false) {
    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    console.log(shoppingList);
    const isOwner = shoppingList.ownerId._id.toString() === userId;
    console.log(isOwner);
    const isMember = shoppingList.members.some((member) => {
      return member._id.toString() === userId; // Kontrola pouze na `_id` uvnitř member objektu
    });

    if (requireOwnership && !isOwner) {
      throw new Error("Only the owner has access");
    }
    if (!isOwner && !isMember) {
      throw new Error("Unauthorized access");
    }

    return true; // Pokud je validace úspěšná
  },
  async updateShoppingList({ id, name, members, items, userId }) {
    if (!id) {
      throw new Error("Shopping list ID is required");
    }

    const shoppingList = await shoppingListDao.findById(id);
    await this.verifyAccess(shoppingList, userId, true);

    // Update the shopping list with allowed fields
    const updatedShoppingList = await shoppingListDao.updateShoppingList(id, {
      name,
      members,
      items,
    });
    return updatedShoppingList;
  },

  async deleteShoppingList(id, userId) {
    const shoppingList = await shoppingListDao.findById(id);
    await this.verifyAccess(shoppingList, userId, true);

    // Delete the shopping list
    await shoppingListDao.deleteById(id);

    return { success: true, message: "Shopping list deleted successfully" };
  },

  async addItem({ listId, name, quantity, userId }) {
    const shoppingList = await shoppingListDao.findById(listId);
    // Validate input
    if (!listId) {
      throw new Error("Shopping list ID is required");
    }
    if (!name) {
      throw new Error("Item name is required");
    }
    if (!quantity) {
      throw new Error("Item quantity is required");
    }
    await this.verifyAccess(shoppingList, userId);
    // Add item to the shopping list
    const newItem = await shoppingListDao.addItemToShoppingList(listId, {
      name,
      quantity,
    });

    return newItem;
  },

  async updateItem({ listId, itemId, name, quantity, status, userId }) {
    const shoppingList = await shoppingListDao.findById(listId);
    // Check if the user is the owner or a member
    // Ověříme, zda je uživatel vlastníkem
    await this.verifyAccess(shoppingList, userId);

    const updatedItem = await shoppingListDao.updateItem(listId, itemId, {
      name,
      quantity,
      status,
    });

    return updatedItem;
  },

  async deleteItem({ listId, itemId, userId }) {
    const shoppingList = await shoppingListDao.findById(listId);
    // Check if the user is the owner or a member
    // Ověříme, zda je uživatel vlastníkem
    await this.verifyAccess(shoppingList, userId);
    return await shoppingListDao.deleteItem(listId, itemId);
  },

  async getShoppingList(listId, userId) {
    const shoppingList = await shoppingListDao.findById(listId);

    // Check ownership or membership
    const isOwner = shoppingList.ownerId.toString() === userId;
    const isMember = shoppingList.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new Error("Unauthorized access");
    }

    return shoppingList;
  },
  async resolveItem({ listId, itemId, status, userId }) {
    // Získání seznamu podle ID
    const shoppingList = await shoppingListDao.findById(listId);

    await this.verifyAccess(shoppingList, userId);

    // Aktualizace statusu položky v DAO
    const updatedItem = await shoppingListDao.updateItem(listId, itemId, {
      status,
    });

    return updatedItem;
  },
  async getShoppingListDetail({ listId, userId }) {
    const shoppingList = await shoppingListDao.findById(listId);

    await this.verifyAccess(shoppingList, userId);

    return shoppingList;
  },
  async removeMember({ shoppingListId, memberId, userId }) {
    const shoppingList = await shoppingListDao.findById(shoppingListId);

    // Ověřujeme, zda uživatel existuje v seznamu členů
    const isMember = shoppingList.members.some(
      (member) => member._id.toString() === memberId
    );

    if (!isMember) {
      throw new Error("User is not a member of this shopping list");
    }

    if (
      shoppingList.members.includes(memberId) &&
      memberId !== userId &&
      shoppingList.ownerId.toString() !== userId
    ) {
      throw new Error("Unauthorized access");
    }

    const result = await shoppingListDao.removeMember(shoppingListId, memberId);
    return result;
  },

  async addMember({ shoppingListId, memberId, userId }) {
    // Nejprve ověříme, zda je uživatel vlastníkem
    const shoppingList = await shoppingListDao.findById(shoppingListId);

    if (!shoppingList) {
      throw new Error("Shopping list not found");
    }
    // Kontrola, zda je uživatel vlastníkem
    if (shoppingList.ownerId.toString() === memberId) {
      throw new Error("Owner cannot be added as a member");
    }

    // Ověření, že aktuálně přihlášený uživatel (owner) provádí tuto akci
    if (shoppingList.ownerId.toString() !== userId) {
      throw new Error("Only the owner can add members");
    }

    // Přidání člena
    const updatedShoppingList = await shoppingListDao.addMember(
      shoppingListId,
      memberId
    );

    return updatedShoppingList;
  },
  async getListsByUser(userId) {
    if (!userId) {
      throw new Error("User ID is required to retrieve shopping lists");
    }

    // Najdeme seznamy, kde je uživatel vlastníkem nebo členem
    const shoppingLists = await shoppingListDao.findListsByUser(userId);

    return {
      shoppingLists,
    };
  },
};

export default shoppingListAbl;
