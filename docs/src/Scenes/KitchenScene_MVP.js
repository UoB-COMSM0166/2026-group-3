import { Scene } from "../Core/Scene.js";
import { Vector2 } from "../Utility/Vector2.js";

import { GameState } from "../Core/GameState.js";
import { MenuData } from "../Core/MenuData.js";
import { OrderSystem } from "../Core/OrderSystem.js";

import { PlayerChef_MVP } from "../Entities/PlayerChef_MVP.js";
import { KitchenStation_MVP } from "../Entities/KitchenStation_MVP.js";
import { Counter_MVP } from "../Entities/Counter_MVP.js";
import { Customer_MVP } from "../Entities/Customer_MVP.js";

export class KitchenScene_MVP extends Scene {
  constructor(game) {
    super(game);

    console.log("KitchenScene_MVP loaded");

    // ===== Part A Logic Layer =====
    this.state = new GameState();
    this.menu = new MenuData();
    this.orderSystem = new OrderSystem();

    console.log("GameState:", this.state);
    console.log("Inventory object:", this.state.inventory);
    console.log("Inventory items:", this.state.inventory?.items);

    // ===== Create Player =====
    this.player = new PlayerChef_MVP(game);
    this.player.pos = new Vector2(6.2, 7.0);
    this.player.size = new Vector2(0.7, 0.7);

    // ===== Create Kitchen Stations =====
    this.stations = [];

    const stationSize = new Vector2(2.0, 1.2);
    const startX = 1.0;
    const startY = 0.8;
    const verticalSpacing = 1.6;

    const stationRecipes = [
      ["rotten_burger"],
      ["toxic_stew"],
      ["bone_bbq"],
      ["mutant_soup"],
      ["zombie_special"]
    ];

    for (let i = 0; i < 5; i++) {
      const pos = new Vector2(
        startX,
        startY + i * verticalSpacing
      );

      const station = new KitchenStation_MVP(
        game,
        pos,
        stationRecipes[i]
      );

      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // ===== Create Counter =====
    this.counter = new Counter_MVP(game, new Vector2(8.2, 0.8));
    this.counter.size = new Vector2(1.2, 7.4);

    // ===== Create Customer + Order =====
    const order = this.orderSystem.generateRandomOrder(this.menu);

    this.customer = new Customer_MVP(
      game,
      new Vector2(14.0, 1.0),
      order
    );

    console.log("New order:", order.recipeId);

    // ===== Colliders =====
    this.colliders = [
      // left equipment area
      //{ pos: new Vector2(0, 0), size: new Vector2(3, 9) },

      // counter body
      { pos: this.counter.pos, size: this.counter.size },
    ];

    // ===== Register Entities =====
    this.entities.push(
      this.player,
      this.counter,
      this.customer
    );
  }

update(events) {
  // debug: 看 events 到底有没有传进来
  // console.log("events:", events);

  // 1) 记录玩家移动前位置（用于回滚）
  const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

  // 2) 正常更新：会更新所有实体（包括玩家移动）
  super.update(events);

  // 3) 碰撞：撞到任意 collider -> 回滚到 oldPos
  for (const c of this.colliders) {
    if (this._aabbOverlap(this.player.pos, this.player.size, c.pos, c.size)) {
      this.player.pos.x = oldPos.x;
      this.player.pos.y = oldPos.y;
      break;
    }
  }

  // 4) 改成直接从 events 检测 E 键
  if (this._wasEPressed(events)) {
    console.log("[Kitchen] E pressed");

    // 4.1 先尝试交付
    if (this.player.isNear(this.counter)) {
      console.log("[Kitchen] Player is near counter");

      const served = this.counter.tryServe(
        this.player,
        this.customer,
        this.state,
        this.orderSystem
      );

      if (served) {
        this.customer.served = false;
        this.customer.order = this.orderSystem.generateRandomOrder(this.menu);
        console.log("[Kitchen] New order:", this.customer.order.recipeId);
      }
      return;
    }

    // 4.2 再尝试做菜：靠近任意一个 station 就 cook
    const targetRecipeId = this.customer.order?.recipeId;
    if (!targetRecipeId) {
      console.log("[Kitchen] No current order.");
      return;
    }

    for (const station of this.stations) {
      if (this.player.isNear(station)) {
        console.log("[Kitchen] Player is near station:", station.supportedRecipeIds);
        station.tryCook(this.player, this.state, this.menu, targetRecipeId);
        return;
      }
    }

    console.log("[Kitchen] Press E near a station or the counter.");
  }
}

  draw() {
    super.draw();

    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);

    text(`Coins: ${this.state.coins}`, 20, 20);
    text(`Held Dish: ${this.player.heldDish ?? "None"}`, 20, 45);
    text(`Current Order: ${this.customer.order?.recipeId ?? "None"}`, 20, 70);
    text(`Press E near a station to cook`, 20, 95);
    text(`Press E near the counter to serve`, 20, 120);
  }

_wasEPressed(events) {
  if (!events || !Array.isArray(events)) return false;

  for (const ev of events) {
    //print event for debug
    console.log("[Kitchen] event:", ev);

    //case 1: modern browsers with 'key' property
    if (ev.type === "keydown" && (ev.key === "e" || ev.key === "E" || ev.keyCode === 69)) {
      return true;
    }

    //case 2: older browsers with 'keyCode' property
    if (ev.keyCode === 69) {
      return true;
    }

    if (ev.code === "KeyE") {
      return true;
    }
  }

  return false;
}

  _aabbOverlap(aPos, aSize, bPos, bSize) {
    const aMinX = aPos.x;
    const aMaxX = aPos.x + aSize.x;
    const aMinY = aPos.y;
    const aMaxY = aPos.y + aSize.y;

    const bMinX = bPos.x;
    const bMaxX = bPos.x + bSize.x;
    const bMinY = bPos.y;
    const bMaxY = bPos.y + bSize.y;

    return (
      aMinX < bMaxX &&
      aMaxX > bMinX &&
      aMinY < bMaxY &&
      aMaxY > bMinY
    );
  }
}
