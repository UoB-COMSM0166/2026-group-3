export class SalesSystem {
  constructor(game = null) {
    this.game = game;
  }

  _getDifficulty(state = null) {
    return (
      this.game?.model?.difficulty ||
      state?.difficulty ||
      "normal"
    );
  }

  _applyDifficultyMultiplier(baseCoins, difficulty) {
    let coins = baseCoins;

    if (difficulty === "easy") {
      coins *= 1.2;
    } else if (difficulty === "hard") {
      coins *= 0.8;
    }

    return Math.floor(coins);
  }

  sellOrder(order, state) {
    if (!order || !state) {
      console.log("[Sales] Invalid order or state.");
      return 0;
    }

    const difficulty = this._getDifficulty(state);
    const reward = this._applyDifficultyMultiplier(order.rewardCoins || 0, difficulty);

    if (typeof state.addCoins === "function") {
      state.addCoins(reward);
    } else {
      state.coins = (state.coins || 0) + reward;
    }

    console.log("[Sales] Order sold:", order.recipeId);
    console.log("[Sales] Earned coins:", reward);
    console.log("[Sales] Total coins now:", state.coins);

    return reward;
  }

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

    const difficulty = this._getDifficulty(state);
    totalCoins = this._applyDifficultyMultiplier(totalCoins, difficulty);

    if (typeof state.addCoins === "function") {
      state.addCoins(totalCoins);
    } else {
      state.coins = (state.coins || 0) + totalCoins;
    }

    console.log("[Sales] Sold dishes:", collectedTasks.length);
    console.log("[Sales] Earned coins:", totalCoins);
    console.log("[Sales] Total coins now:", state.coins);

    return totalCoins;
  }
}
