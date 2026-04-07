import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class KitchenStation_MVP extends Entity {
  constructor(game, pos, stationType) {
    super(game, pos, new Vector2(1.2, 1.0));

    this.stationType = stationType;
    this.currentTask = null;
    this.isBusy = false;
  }

  canCook(recipe) {
    if (!recipe) return false;
    return recipe.stationType === this.stationType;
  }

  tryCook(state, menu, targetRecipeId) {
    const recipe = menu.getRecipe(targetRecipeId);
    if (!recipe) {
      console.log("[Station] Recipe not found:", targetRecipeId);
      return false;
    }

    if (!this.canCook(recipe)) {
      console.log(
        "[Station] Wrong station type. Need:",
        recipe.stationType,
        "but this station is:",
        this.stationType
      );
      return false;
    }

    if (!state.inventory.has(recipe.requirements)) {
      console.log("[Station] Not enough ingredients for:", recipe.id);
      return false;
    }

    state.inventory.consume(recipe.requirements);

    console.log(
      "[Station] Started cooking:",
      recipe.id,
      "| stationType:",
      this.stationType,
      "| Inventory:",
      state.inventory.items
    );
    return true;
  }

  draw() {
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);

    if (this.stationType === "grill") {
      fill(255, 180, 120);
    } else if (this.stationType === "pot") {
      fill(120, 180, 255);
    } else if (this.stationType === "oven") {
      fill(255, 220, 120);
    } else if (this.stationType === "prep") {
      fill(180, 255, 180);
    } else if (this.stationType === "special") {
      fill(220, 160, 255);
    } else {
      fill(120, 200, 160);
    }

    rect(relPos.x, relPos.y, relSize.x, relSize.y);

    let label = this.stationType;
    if (this.stationType === "grill") label = "Burger";
    else if (this.stationType === "pot") label = "Stew";
    else if (this.stationType === "oven") label = "BBQ";
    else if (this.stationType === "prep") label = "Soup";
    else if (this.stationType === "special") label = "Feast";

    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, BOTTOM);
    text(label, relPos.x + relSize.x / 2, relPos.y - 4);
  }
}