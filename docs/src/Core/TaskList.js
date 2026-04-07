export class TaskList {
  constructor() {
    this.tasks = {
      rotten_burger: 0,
      toxic_stew: 0,
      bone_bbq: 0,
      mutant_soup: 0,
      ultimate_feast: 0
    };
  }

  setQuantity(recipeId, quantity) {
    if (!(recipeId in this.tasks)) return;
    this.tasks[recipeId] = Math.max(0, quantity);
  }

  increase(recipeId, amount = 1) {
    if (!(recipeId in this.tasks)) return;
    this.tasks[recipeId] += amount;
  }

  decrease(recipeId, amount = 1) {
    if (!(recipeId in this.tasks)) return;
    this.tasks[recipeId] = Math.max(0, this.tasks[recipeId] - amount);
  }

  clear() {
    for (const key in this.tasks) {
      this.tasks[key] = 0;
    }
  }

  getTasks() {
    return this.tasks;
  }

  getTotalRequirements(menu) {
    const totalRequirements = {};

    for (const [recipeId, quantity] of Object.entries(this.tasks)) {
      if (quantity <= 0) continue;

      const recipe = menu.getRecipe(recipeId);
      if (!recipe) continue;

      for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
        totalRequirements[ingredient] = (totalRequirements[ingredient] ?? 0) + amount * quantity;
      }
    }

    return totalRequirements;
  }

  getEstimatedProfit(menu) {
    let totalProfit = 0;

    for (const [recipeId, quantity] of Object.entries(this.tasks)) {
      if (quantity <= 0) continue;

      const recipe = menu.getRecipe(recipeId);
      if (!recipe) continue;

      totalProfit += recipe.rewardCoins * quantity;
    }

    return totalProfit;
  }

  isFeasible(inventory, menu) {
    const totalRequirements = this.getTotalRequirements(menu);
    return inventory.has(totalRequirements);
  }
}