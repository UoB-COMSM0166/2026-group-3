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
      console.log("[Counter] Wrong dish. Need:", customer.order.recipeId, "Got:", player.heldDish);
      return false;
    }

    // 完成订单
    customer.order.accept(); // 若你不想要 ACCEPTED 状态，也可以删掉这一行
    orderSystem.completeOrder(customer.order, state);

    console.log("[Counter] Served! Coins:", state.coins);

    // 清空玩家手上的菜
    player.heldDish = null;

    // 顾客标记为已服务（Scene 会生成新订单）
    customer.served = true;

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