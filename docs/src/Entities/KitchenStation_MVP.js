import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class KitchenStation_MVP extends Entity {
  constructor(game, pos, supportedRecipeIds = []) {
    super(game, pos, new Vector2(1.2, 1.0));
    this.supportedRecipeIds = supportedRecipeIds;
  }

  tryCook(player, state, menu, targetRecipeId) {
    console.log("[Station] Interact triggered");
    console.log("[Station] Target recipe:", targetRecipeId);
    console.log("[Station] Supported recipes:", this.supportedRecipeIds);
    console.log("[Station] Player held dish:", player.heldDish);
    console.log("[Station] Inventory object:", state.inventory);
    console.log("[Station] Inventory items:", state.inventory?.items);

    if (player.heldDish) {
      console.log("[Station] Player already holding a dish:", player.heldDish);
      return false;
    }

    const recipe = menu.getRecipe(targetRecipeId);
    if (!recipe) {
      console.log("[Station] Recipe not found:", targetRecipeId);
      return false;
    }

    console.log("[Station] Recipe requirements:", recipe.requirements);

    // Station restriction: this station can only cook certain recipes
    if (!this.supportedRecipeIds.includes(recipe.id)) {
      console.log("[Station] Station cannot cook:", recipe.id);
      return false;
    }

    // Inventory check
    if (!state.inventory.has(recipe.requirements)) {
      console.log("[Station] Not enough ingredients for:", recipe.id);
      return false;
    }

    // Consume ingredients and give player the dish
    state.inventory.consume(recipe.requirements);
    player.heldDish = recipe.id;

    console.log("[Station] Cooked:", recipe.id);
    console.log("[Station] Inventory after cooking:", state.inventory?.items);

    return true;
  }

  draw() {
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);
    fill(120, 200, 160);
    rect(relPos.x, relPos.y, relSize.x, relSize.y);

    fill(0);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);

    const label = this.supportedRecipeIds[0] ?? "Station";
    text(label, relPos.x + relSize.x / 2, relPos.y + relSize.y / 2);
  }
}
