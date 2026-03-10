import { Entity } from "../Core/Entity.js";
import { Vector2 } from "../Utility/Vector2.js";

export class Counter_MVP extends Entity {
  constructor(game, pos) {
    super(game, pos, new Vector2(3.0, 0.8));
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
    const relPos = this.game.view.localToScreen(this.pos);
    const relSize = this.game.view.localToScreen(this.size);

    stroke(0);
    fill(180, 160, 220);
    rect(relPos.x, relPos.y, relSize.x, relSize.y);
  }
}
