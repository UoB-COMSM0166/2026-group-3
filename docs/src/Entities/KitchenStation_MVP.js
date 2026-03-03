import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class KitchenStation_MVP extends Entity {
  constructor(game, pos, supportedRecipeIds = []) {
    super(game, pos, new Vector2(1.2, 1.0));
    this.supportedRecipeIds = supportedRecipeIds;
  }

  tryCook(player, state, menu, targetRecipeId) {
    if (player.heldDish) {
      console.log("[Station] Player already holding a dish:", player.heldDish);
      return false;
    }

    const recipe = menu.getRecipe(targetRecipeId);
    if (!recipe) {
      console.log("[Station] Recipe not found:", targetRecipeId);
      return false;
    }

    // 站点限制：不支持的菜不能做
    if (!this.supportedRecipeIds.includes(recipe.id)) {
      console.log("[Station] Station cannot cook:", recipe.id);
      return false;
    }

    // 库存检查 & 消耗
    if (!state.inventory.has(recipe.requirements)) {
      console.log("[Station] Not enough ingredients for:", recipe.id);
      return false;
    }

    state.inventory.consume(recipe.requirements);
    player.heldDish = recipe.id;

    console.log("[Station] Cooked:", recipe.id, "Inventory:", state.inventory.items);
    return true;
  }

  draw() {
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);
    fill(120, 200, 160);
    rect(relPos.x, relPos.y, relSize.x, relSize.y);
  }
}