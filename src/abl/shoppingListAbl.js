import shoppingListDao from "@/src/dao/shoppingListDao";

export default {
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
    await verifyOwnership(shoppingList, userId); // Check ownership here

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
    await verifyOwnership(shoppingList, userId); // Check ownership here

    // Delete the shopping list
    await shoppingListDao.deleteById(id);

    return { success: true, message: "Shopping list deleted successfully" };
  },
};

async function verifyOwnership(shoppingList, userId) {
  if (!shoppingList) {
    throw new Error("Shopping list not found");
  }

  if (shoppingList.ownerId.toString() !== userId) {
    throw new Error("Unauthorized access");
  }
}
