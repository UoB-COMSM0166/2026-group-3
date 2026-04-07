export class SalesSystem {
  sellAllCollected(productionManager, menu, state) {
    const collectedTasks = productionManager.getCollectedTasks();

    if (collectedTasks.length === 0) {
      console.log("[Sales] No collected dishes to sell.");
      return 0;
    }

    let totalCoins = 0;

    for (const task of collectedTasks) {
      const recipe = menu.getRecipe(task.recipeId);
      if (!recipe) continue;

      totalCoins += recipe.rewardCoins;
    }

    state.coins += totalCoins;

    console.log("[Sales] Sold dishes:", collectedTasks.length);
    console.log("[Sales] Earned coins:", totalCoins);
    console.log("[Sales] Total coins now:", state.coins);

    return totalCoins;
  }
}