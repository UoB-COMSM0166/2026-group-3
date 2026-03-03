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

    // ===== Create Counter ====
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

    this.colliders = [
    // 左侧设备区
    { pos: new Vector2(0, 0), size: new Vector2(3, 9) },

    // 只挡吧台本体
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

  // 4) 交互逻辑（按 E 触发一次）
  if (this.player.justPressedE()) {
    // 4.1 先尝试交付
    if (this.player.isNear(this.counter)) {
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
    if (!targetRecipeId) return;

    for (const station of this.stations) {
      if (this.player.isNear(station)) {
        station.tryCook(this.player, this.state, this.menu, targetRecipeId);
        return;
      }
    }

    console.log("[Kitchen] Press E near a station or the counter.");
  }
}

  draw() {
   super.draw();
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

  return (aMinX < bMaxX && aMaxX > bMinX && aMinY < bMaxY && aMaxY > bMinY);
  }
}