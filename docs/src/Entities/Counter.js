import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Counter extends Entity {
  constructor(game, pos) {
    super(game, pos, new Vector2(3.0, 0.8));
    this.sprite = "Counter";
  }

  tryServe(player, customer, state, orderSystem) {
    if (!customer.order) {
      console.log("[Counter] No active order.");
      return false;
    }

    if (!player.heldDish) {
      console.log("[Counter] Player not holding any dish.");
      return false;
    }

    if (player.heldDish !== customer.order.recipeId) {
      console.log(
        "[Counter] Wrong dish. Need:",
        customer.order.recipeId,
        "Got:",
        player.heldDish
      );
      return false;
    }

    // Complete the order
    customer.order.accept();
    orderSystem.completeOrder(customer.order, state);

    console.log("[Counter] Served! Coins:", state.coins);

    // Clear the dish currently held by the player
    player.heldDish = null;

    // Mark the customer as served
    customer.markServed();

    return true;
  }

  draw() {
    let sprite = this.game.assetManager.getImage(this.sprite);

    image(
        sprite, 
        0,                                                  
        this.game.model.scene.uiBar.size.y,                 
        this.game.view.size.x,                              
        this.game.view.size.y - this.game.model.scene.uiBar.size.y 
    );
  }
}
