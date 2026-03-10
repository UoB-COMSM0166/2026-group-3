import { Scene } from "../Core/Scene.js";
import { Vector2 } from "../Utility/Vector2.js";

import { GameState } from "../Core/GameState.js";
import { MenuData } from "../Core/MenuData.js";
import { OrderSystem } from "../Core/OrderSystem.js";

import { PlayerChef_MVP } from "../Entities/PlayerChef_MVP.js";
import { KitchenStation_MVP } from "../Entities/KitchenStation_MVP.js";
import { Counter_MVP } from "../Entities/Counter_MVP.js";
import { Customer_MVP } from "../Entities/Customer_MVP.js";

import { ShooterScene } from "./ShooterScene.js";

export class KitchenScene_MVP extends Scene {
  constructor(game) {
    super(game);

    console.log("KitchenScene_MVP loaded");

    // Core logic layer
    this.state = new GameState();
    this.menu = new MenuData();
    this.orderSystem = new OrderSystem();

    // Recipe selection phase
    this.availableRecipes = [];
    this.isSelectionPhase = true;

    // Scene transition control
    this.hasFinishedKitchenPhase = false;

    // On-screen feedback message
    this.message = "";
    this.messageTimer = 0;

    // Build a flat list of recipe ids
    this.allRecipes = this._extractRecipeIds();

    // Create player
    this.player = new PlayerChef_MVP(game);
    this.player.pos = new Vector2(6.2, 7.0);
    this.player.size = new Vector2(0.7, 0.7);

    // Create kitchen stations
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
      const pos = new Vector2(startX, startY + i * verticalSpacing);

      const station = new KitchenStation_MVP(game, pos, stationRecipes[i]);
      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // Create counter
    this.counter = new Counter_MVP(game, new Vector2(8.2, 0.8));
    this.counter.size = new Vector2(1.2, 7.4);

    // Create customer without an initial order
    this.customer = new Customer_MVP(
      game,
      new Vector2(14.0, 1.0),
      null
    );

    // Keep only the counter collider for now
    this.colliders = [
      { pos: this.counter.pos, size: this.counter.size },
    ];

    // Register entities
    this.entities.push(
      this.player,
      this.counter,
      this.customer
    );
  }

  update(events) {
    // Handle dish selection before kitchen gameplay starts
    if (this.isSelectionPhase) {
      this.handleSelection(events);
      return;
    }

    // Store previous player position for collision rollback
    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    // Update all entities
    super.update(events);

    // Update feedback message timer
    if (this.messageTimer > 0) {
      this.messageTimer--;
    } else {
      this.message = "";
    }

    // Roll back movement if the player overlaps a collider
    for (const c of this.colliders) {
      if (this._aabbOverlap(this.player.pos, this.player.size, c.pos, c.size)) {
        this.player.pos.x = oldPos.x;
        this.player.pos.y = oldPos.y;
        break;
      }
    }

    // If the customer has fully left, end the kitchen phase
    if (
      !this.hasFinishedKitchenPhase &&
      this.customer.state === "LEAVING" &&
      this.customer.isVisible === false
    ) {
      this.hasFinishedKitchenPhase = true;
      console.log("[Kitchen] Customer has left. Returning to Shooter.");

      this.game.model.phase++;
      this.game.model.scene = new ShooterScene(this.game);
      return;
    }

    // Handle interaction key
    if (this._wasEPressed(events)) {
      console.log("[Kitchen] E pressed");

      // Try serving first
      if (this.player.isNear(this.counter)) {
        console.log("[Kitchen] Player is near counter");

        const served = this.counter.tryServe(
          this.player,
          this.customer,
          this.state,
          this.orderSystem
        );

        if (served) {
          console.log("[Kitchen] Customer served successfully.");
          this.showMessage("Order served!");
        } else {
          this.showMessage("Could not serve order");
        }

        return;
      }

      // Otherwise try cooking at a nearby station
      const targetRecipeId = this.customer.order?.recipeId;
      if (!targetRecipeId) {
        console.log("[Kitchen] No current order.");
        this.showMessage("No current order");
        return;
      }

      for (const station of this.stations) {
        if (this.player.isNear(station)) {
          console.log("[Kitchen] Player is near station:", station.supportedRecipeIds);

          const result = station.tryCook(
            this.player,
            this.state,
            this.menu,
            targetRecipeId
          );

          if (result?.ok) {
            this.showMessage(`Cooked: ${result.dish}`);
          } else {
            this.showMessage(result?.reason ?? "Cooking failed");
          }

          return;
        }
      }

      console.log("[Kitchen] Press E near a station or the counter.");
      this.showMessage("Move closer to a station or the counter");
    }
  }

  draw() {
    if (this.isSelectionPhase) {
      this.drawSelectionMenu();
      return;
    }

    super.draw();

    fill(0);
    textSize(16);
    textAlign(LEFT, TOP);

    text(`Coins: ${this.state.coins}`, 20, 20);
    text(`Held Dish: ${this.player.heldDish ?? "None"}`, 20, 45);
    text(`Current Order: ${this.customer.order?.recipeId ?? "None"}`, 20, 70);
    text(`Customer State: ${this.customer.state}`, 20, 95);
    text(`Time Left: ${Math.max(0, this.customer.waitTimer).toFixed(1)}`, 20, 120);
    text(`Available Tonight: ${this.availableRecipes.join(", ")}`, 20, 145);
    text(`Press E near a station to cook`, 20, 170);
    text(`Press E near the counter to serve`, 20, 195);

    if (this.message) {
      fill(200, 50, 50);
      textSize(16);
      textAlign(LEFT, TOP);
      text(`Message: ${this.message}`, 20, 220);
    }
  }

  drawSelectionMenu() {
    background(230);

    fill(0);
    textAlign(CENTER, CENTER);

    textSize(28);
    text("Select 3 dishes for tonight", width / 2, 70);

    textSize(18);
    for (let i = 0; i < this.allRecipes.length; i++) {
      const recipeId = this.allRecipes[i];
      const isSelected = this.availableRecipes.includes(recipeId);

      if (isSelected) {
        fill(0, 140, 0);
      } else {
        fill(0);
      }

      text(`${i + 1}: ${recipeId}`, width / 2, 130 + i * 35);
    }

    fill(0);
    textSize(16);
    text(
      `Selected: ${this.availableRecipes.join(", ") || "None"}`,
      width / 2,
      height - 80
    );

    textSize(14);
    text("Press number keys to select dishes", width / 2, height - 45);
  }

  handleSelection(events) {
    if (!events || !Array.isArray(events)) return;

    for (const ev of events) {
      if (ev.type !== "keydown") continue;

      const index = parseInt(ev.key) - 1;

      if (!isNaN(index) && this.allRecipes[index]) {
        const recipeId = this.allRecipes[index];

        if (!this.availableRecipes.includes(recipeId)) {
          this.availableRecipes.push(recipeId);
          console.log("[Kitchen] Selected recipe:", recipeId);
        }

        if (this.availableRecipes.length >= 3) {
          console.log("[Kitchen] Selection complete:", this.availableRecipes);
          this.isSelectionPhase = false;

          this.customer.order = this._generateOrderFromAvailableRecipes();
          console.log("[Kitchen] First order:", this.customer.order?.recipeId);

          if (!this.customer.order) {
            this.showMessage("Failed to generate first order");
          }

          return;
        }
      }
    }
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 120;
  }

  _generateOrderFromAvailableRecipes() {
    if (!this.availableRecipes.length) return null;

    for (let i = 0; i < 20; i++) {
      const order = this.orderSystem.generateRandomOrder(this.menu);

      if (order && this.availableRecipes.includes(order.recipeId)) {
        return order;
      }
    }

    console.log("[Kitchen] Failed to generate a valid order from selected recipes.");
    return null;
  }

  _extractRecipeIds() {
    if (this.menu?.recipes) {
      if (Array.isArray(this.menu.recipes)) {
        return this.menu.recipes.map((r) => r.id).filter(Boolean);
      }

      if (typeof this.menu.recipes === "object") {
        return Object.keys(this.menu.recipes);
      }
    }

    return [
      "rotten_burger",
      "toxic_stew",
      "bone_bbq",
      "mutant_soup",
      "zombie_special"
    ];
  }

  _wasEPressed(events) {
    if (!events || !Array.isArray(events)) return false;

    for (const ev of events) {
      if (ev.type === "keydown" && (ev.key === "e" || ev.key === "E" || ev.keyCode === 69)) {
        return true;
      }

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
