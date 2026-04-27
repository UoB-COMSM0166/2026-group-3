import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class KitchenStation extends Entity {
  constructor(game, pos, stationType) {
    super(game, pos, new Vector2());

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

  _getStationLabel() {
    if (this.stationType === "pot") return "Ramen";
    if (this.stationType === "grill") return "BBQ";
    if (this.stationType === "oven") return "Burger";
    if (this.stationType === "prep") return "Fried";
    if (this.stationType === "special") return "Keg";
    return this.stationType;
  }

  _getStationColor() {
    if (this.stationType === "grill") return color(255, 180, 120);
    if (this.stationType === "pot") return color(120, 180, 255);
    if (this.stationType === "oven") return color(255, 220, 120);
    if (this.stationType === "prep") return color(180, 255, 180);
    if (this.stationType === "special") return color(220, 160, 255);
    return color(120, 200, 160);
  }

  draw() {
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);
    const stationOffsetX = -2;
    const stationOffsetY = -1;
    const stationScaleMultiplier = 1.5;
    const stationScaleOverrides = {
      special: 0.8, // Render keg at 80% of station scale.
    };

    let sprite = this.game.assetManager.getImage(this._getStationLabel());
    if (sprite && sprite.width > 0 && sprite.height > 0) {
      // Keep original sprite ratio and fit it within station bounds.
      const stationTypeScale = stationScaleOverrides[this.stationType] ?? 1;
      const effectiveScale = stationScaleMultiplier * stationTypeScale;
      const targetW = relSize.x * effectiveScale;
      const targetH = relSize.y * effectiveScale;
      const fitScale = Math.min(targetW / sprite.width, targetH / sprite.height);
      const drawW = sprite.width * fitScale;
      const drawH = sprite.height * fitScale;
      const drawX = relPos.x + stationOffsetX + (relSize.x - drawW) / 2;
      const drawY = relPos.y + stationOffsetY + (relSize.y - drawH) / 2;
      image(sprite, drawX, drawY, drawW, drawH);
    }


    // stroke(0);
    // fill(this._getStationColor());
    // rect(relPos.x, relPos.y, relSize.x, relSize.y);

    // const label = this._getStationLabel();

    // fill(0);
    // noStroke();
    // textSize(12);
    // textAlign(CENTER, BOTTOM);
    // text(label, relPos.x + relSize.x / 2, relPos.y - 4);
  }
}
