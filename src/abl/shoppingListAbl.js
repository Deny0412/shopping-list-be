import shoppingListDao from "@/src/dao/shoppingListDao";

async function verifyOwnership(shoppingList, userId) {
  if (!shoppingList) {
    throw new Error("Shopping list not found");
  }

  if (shoppingList.ownerId.toString() !== userId) {
    throw new Error("Unauthorized access");
  }
}

const shoppingListAbl = {
  async createShoppingList({ name, members, items, ownerId }) {
    if (!ownerId) {
      throw new Error("Owner ID is required to create a shopping list");
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

  async updateShoppingList({ id, name, members, items, userId }) {
    if (!id) {
      throw new Error("Shopping list ID is required");
    }

    const shoppingList = await shoppingListDao.findById(id);
    await verifyOwnership(shoppingList, userId);

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
    await verifyOwnership(shoppingList, userId);

    // Delete the shopping list
    await shoppingListDao.deleteById(id);

    return { success: true, message: "Shopping list deleted successfully" };
  },

  async addItem({ listId, name, quantity, userId }) {
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

    // Find shopping list and validate access
    const shoppingList = await shoppingListDao.findById(listId);

    // Check if the user is the owner or a member
    const isOwner = shoppingList.ownerId.toString() === userId;
    const isMember = shoppingList.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new Error("Unauthorized access");
    }

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
    const isOwner = shoppingList.ownerId.toString() === userId;
    const isMember = shoppingList.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new Error("Unauthorized access");
    }

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
    const isOwner = shoppingList.ownerId.toString() === userId;
    const isMember = shoppingList.members.some(
      (memberId) => memberId.toString() === userId
    );

    if (!isOwner && !isMember) {
      throw new Error("Unauthorized access");
    }

    return await shoppingListDao.deleteItem(listId, itemId);
  },
  async getShoppingListsByOwner(ownerId) {
    return await shoppingListDao.findAllByOwner(ownerId);
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
};

export default shoppingListAbl;
