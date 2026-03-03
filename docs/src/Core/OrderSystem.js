import { Order } from "./Order.js";

export class OrderSystem {
  constructor() {
    this.weights = {
      rotten_burger: 45,
      toxic_stew: 25,
      bone_bbq: 20,
      mutant_soup: 10,
      ultimate_feast: 2,
    };
  }

  generateRandomOrder(menu) {
    const recipes = menu.listRecipes();
    const picked = this._weightedPick(recipes);
    return new Order(picked.id, picked.rewardCoins);
    
  }

  canAccept(order, inventory, menu) {
    const recipe = menu.getRecipe(order.recipeId);
    if (!recipe) return false;
    return inventory.has(recipe.requirements);
  }

  completeOrder(order, state) {
    if (order.status !== "ACCEPTED") return false;
    state.addCoins(order.rewardCoins);
    order.complete();
    return true;
  }

  _weightedPick(recipes) {
    let total = 0;
    for (const r of recipes) total += (this.weights[r.id] ?? 1);

    let roll = Math.random() * total;
    for (const r of recipes) {
      roll -= (this.weights[r.id] ?? 1);
      if (roll <= 0) return r;
    }
    return recipes[0];
  }
}