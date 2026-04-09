import { Scene } from "../Core/Scene.js";
import { Vector2 } from "../Utility/Vector2.js";

import { MenuData } from "../Core/MenuData.js";
import { Order } from "../Core/Order.js";

import { PlayerChef_MVP } from "../Entities/PlayerChef_MVP.js";
import { KitchenStation_MVP } from "../Entities/KitchenStation_MVP.js";
import { Counter_MVP } from "../Entities/Counter_MVP.js";
import { Customer_MVP } from "../Entities/Customer_MVP.js";

import { TaskList } from "../Core/TaskList.js";
import { ProductionManager } from "../Core/ProductionManager.js";
import { ShooterScene } from "./ShooterScene.js";

export class KitchenScene_MVP extends Scene {
  constructor(game) {
    super(game);

    console.log("KitchenScene_MVP loaded");

    // ===== Shared game state =====
    // Kitchen now uses the same global state as Shooter
    this.state = this.game.model.gameState;
    this.menu = new MenuData();

    // ===== Core managers kept from old system =====
    this.taskList = new TaskList();
    this.productionManager = new ProductionManager(this.game);

    // ===== Main phase =====
    this.phase = "PLANNING"; // PLANNING | PRODUCTION | END

    // ===== Global kitchen timer =====
    const difficulty = this.game.model.difficulty || "normal";
    if (difficulty === "easy") {
      this.kitchenTimeLimit = 75;
    } else if (difficulty === "hard") {
      this.kitchenTimeLimit = 45;
    } else {
      this.kitchenTimeLimit = 60;
    }
    this.kitchenTimer = this.kitchenTimeLimit;
    this.timerStarted = false;

    // ===== Order flow =====
    this.orderQueue = [];
    this.currentOrder = null;
    this.success = false;
    this.endTimer = 2;

    // ===== Logging =====
    this._loggedDoneTaskIds = new Set();

    // ===== Message UI =====
    this.message = "";
    this.messageTimer = 0;

    // ===== UI panel states =====
    this.isMenuOpen = false;
    this.isTaskListOpen = false;

    // ===== UI hitboxes =====
    this.menuButtons = [];
    this.menuHoverZones = [];
    this.menuCloseButton = null;
    this.taskCloseButton = null;
    this.menuOpenTab = null;
    this.taskOpenTab = null;

    // ===== Player =====
    this.player = new PlayerChef_MVP(game);
    this.player.pos = new Vector2(6.2, 7.0);
    this.player.size = new Vector2(0.7, 0.7);

    // ===== Kitchen Stations =====
    this.stations = [];

    const stationSize = new Vector2(2.0, 1.2);
    const startX = 3.0;
    const startY = 0.8;
    const verticalSpacing = 1.6;

    const stationTypes = [
      "grill",
      "pot",
      "oven",
      "prep",
      "special"
    ];

    for (let i = 0; i < 5; i++) {
      const pos = new Vector2(startX, startY + i * verticalSpacing);
      const station = new KitchenStation_MVP(game, pos, stationTypes[i]);
      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // ===== Counter =====
    this.counter = new Counter_MVP(game, new Vector2(8.2, 0.8));
    this.counter.size = new Vector2(1.2, 7.4);

    // ===== Customer =====
    this.customer = new Customer_MVP(game, new Vector2(12.2, 6.8), null);
    this.customer.isVisible = false;
    this.customer.state = "WAITING";

    // ===== Colliders =====
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(4.8, 9) },
      { pos: this.counter.pos, size: this.counter.size },
    ];

    // ===== Register entities =====
    this.entities.push(
      this.player,
      this.counter,
      this.customer
    );

    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] Difficulty:", difficulty);
  }

  update(events) {
    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    // Update entities manually so customer only updates during PRODUCTION/END
    for (let entity of this.entities) {
      if (entity === this.customer && this.phase === "PLANNING") {
        continue;
      }
      entity.update(events);
    }

    for (let uielement of this.uielements) {
      uielement.update(events);
    }

    // Player collision rollback
    for (const c of this.colliders) {
      if (this._aabbOverlap(this.player.pos, this.player.size, c.pos, c.size)) {
        this.player.pos.x = oldPos.x;
        this.player.pos.y = oldPos.y;
        break;
      }
    }

    // Message timer
    if (this.messageTimer > 0) {
      this.messageTimer--;
    } else {
      this.message = "";
    }

    // ===== Planning input =====
    for (const event of events) {
      // Panel open/close buttons
      if (event.type === "click") {
        if (this._isInside(mouseX, mouseY, this.menuCloseButton)) {
          this.isMenuOpen = false;
          return;
        }

        if (this._isInside(mouseX, mouseY, this.taskCloseButton)) {
          this.isTaskListOpen = false;
          return;
        }

        if (this._isInside(mouseX, mouseY, this.menuOpenTab)) {
          this.isMenuOpen = true;
          return;
        }

        if (this._isInside(mouseX, mouseY, this.taskOpenTab)) {
          this.isTaskListOpen = true;
          return;
        }
      }

      // Keyboard panel toggles
      if (event.key === "m" || event.key === "M") {
        this.isMenuOpen = !this.isMenuOpen;
      }

      if (event.key === "t" || event.key === "T") {
        this.isTaskListOpen = !this.isTaskListOpen;
      }

      // ===== PLANNING =====
      if (this.phase === "PLANNING") {
        if (event.key === "1") this.taskList.increase("rotten_burger", 1);
        if (event.key === "2") this.taskList.increase("toxic_stew", 1);
        if (event.key === "3") this.taskList.increase("bone_bbq", 1);
        if (event.key === "4") this.taskList.increase("mutant_soup", 1);
        if (event.key === "5") this.taskList.increase("ultimate_feast", 1);
        if (event.key === "Backspace") this.taskList.clear();

        if (event.type === "click") {
          const clickedButton = this._getClickedMenuButton(mouseX, mouseY);

          if (clickedButton) {
            if (clickedButton.action === "increase") {
              this.taskList.increase(clickedButton.recipeId, 1);
            }

            if (clickedButton.action === "decrease") {
              this.taskList.decrease(clickedButton.recipeId, 1);
            }
          }
        }

        // Start kitchen timer and production
        if (event.key === "p" || event.key === "P") {
          const hasTasks = this._hasAnyPlannedTask();
          const feasible = this.taskList.isFeasible(this.state.inventory, this.menu);

          if (!hasTasks) {
            this.showMessage("Plan at least one dish");
            return;
          }

          if (!feasible) {
            this.showMessage("Not enough ingredients");
            return;
          }

          this.productionManager.createFromTaskList(this.taskList, this.menu);
          this.orderQueue = this._buildOrderQueueFromTaskList();
          this.phase = "PRODUCTION";
          this.timerStarted = true;
          this.kitchenTimer = this.kitchenTimeLimit;

          this._spawnNextCustomerOrder();
          this.showMessage("Cooking started");
          console.log("[Kitchen] Entered PRODUCTION");
        }
      }

      // ===== PRODUCTION =====
      if (this.phase === "PRODUCTION") {
        // E key: either cook/collect or serve
        if (event.key === "e" || event.key === "E") {
          // Try serve first if near counter
          if (this.player.isNear(this.counter)) {
            this._tryServeCurrentOrder();
            continue;
          }

          // Otherwise try station interaction
          this._handleProductionCook();
        }
      }
    }

    // ===== PRODUCTION LOOP =====
    if (this.phase === "PRODUCTION") {
      // Global timer starts here and includes cooking + serving
      if (this.timerStarted) {
        this.kitchenTimer -= deltaTime / 1000;

        if (this.kitchenTimer <= 0) {
          this.kitchenTimer = 0;
          this.success = false;
          this.phase = "END";
          this.showMessage("Time up!");
          console.log("[Kitchen] Time up. Kitchen failed.");
          return;
        }
      }

      this.productionManager.updateAll(0.02);

      for (const task of this.productionManager.getDoneTasks()) {
        if (!this._loggedDoneTaskIds.has(task.id)) {
          this._loggedDoneTaskIds.add(task.id);
          console.log("[Kitchen] Task is now DONE:", task);
        }
      }

      // Keep customer visible during production
      if (this.customer.isVisible && this.currentOrder) {
        // Show the global kitchen timer under the customer
        this.customer.waitTimer = this.kitchenTimer;
      }

      // After served customer finishes leaving, spawn next order or end
      if (this.customer.isVisible === false && this.currentOrder === null) {
        if (this.orderQueue.length > 0) {
          this._spawnNextCustomerOrder();
        } else {
          this.success = true;
          this.phase = "END";
          this.showMessage("Night completed!");
          console.log("[Kitchen] All orders served.");
        }
      }
    }

    // ===== END =====
    if (this.phase === "END") {
      this.endTimer -= deltaTime / 1000;

      if (this.endTimer <= 0) {
        this._resetAndReturnToShooter();
      }
    }
  }

  draw() {
    super.draw();

    this._drawPhaseBar();
    this._drawPanelTabs();

    if (this.isMenuOpen) {
      this._drawMenuPanel();
      this._drawMenuHoverCard();
    }

    if (this.isTaskListOpen) {
      this._drawTaskListPanel();
    }

    this._drawMainHint();

    if (this.message) {
      push();
      fill(255, 245, 200);
      stroke(0);
      rect(20, 500, 360, 30);
      fill(0);
      noStroke();
      textSize(13);
      textAlign(LEFT, CENTER);
      text(this.message, 30, 515);
      pop();
    }
  }

  // =========================================================
  // PRODUCTION LOGIC
  // =========================================================

  _buildOrderQueueFromTaskList() {
    const queue = [];
    const tasks = this.taskList.getTasks();

    for (const [recipeId, quantity] of Object.entries(tasks)) {
      for (let i = 0; i < quantity; i++) {
        queue.push(recipeId);
      }
    }

    // Shuffle so order order is not predictable
    for (let i = queue.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [queue[i], queue[j]] = [queue[j], queue[i]];
    }

    return queue;
  }

  _spawnNextCustomerOrder() {
    if (this.orderQueue.length === 0) {
      this.currentOrder = null;
      this.customer.order = null;
      this.customer.isVisible = false;
      return;
    }

    const recipeId = this.orderQueue.shift();
    const recipe = this.menu.getRecipe(recipeId);

    if (!recipe) {
      console.log("[Kitchen] Invalid recipe for customer order:", recipeId);
      this.currentOrder = null;
      return;
    }

    this.currentOrder = new Order(recipe.id, recipe.rewardCoins);
    this.customer.order = this.currentOrder;
    this.customer.state = "WAITING";
    this.customer.leaveTimer = 2;
    this.customer.isVisible = true;
    this.customer.pos.x = 12.2;
    this.customer.pos.y = 6.8;

    // Use global kitchen timer as the displayed countdown
    this.customer.waitTimer = this.kitchenTimer;

    console.log("[Kitchen] New customer order:", recipe.id);
    this.showMessage(`Customer wants ${recipe.id}`);
  }

  _getRelevantTaskForCurrentOrder() {
    if (!this.currentOrder) return null;
    const recipeId = this.currentOrder.recipeId;
    const tasks = this.productionManager.getTasks();

    // Priority: DONE -> PENDING -> COOKING -> COLLECTED
    let task = tasks.find(t => t.recipeId === recipeId && t.status === "DONE");
    if (task) return task;

    task = tasks.find(t => t.recipeId === recipeId && t.status === "PENDING");
    if (task) return task;

    task = tasks.find(t => t.recipeId === recipeId && t.status === "COOKING");
    if (task) return task;

    task = tasks.find(t => t.recipeId === recipeId && t.status === "COLLECTED");
    if (task) return task;

    return null;
  }

  _handleProductionCook() {
    if (!this.currentOrder) {
      this.showMessage("No current customer order");
      return;
    }

    const activeTask = this._getRelevantTaskForCurrentOrder();
    if (!activeTask) {
      this.showMessage("No remaining task for this order");
      return;
    }

    const targetRecipeId = activeTask.recipeId;

    for (const station of this.stations) {
      if (this.player.isNear(station)) {
        const recipe = this.menu.getRecipe(targetRecipeId);
        if (!recipe) {
          this.showMessage("Recipe not found");
          return;
        }

        if (!station.canCook(recipe)) {
          this.showMessage("Wrong station");
          return;
        }

        if (activeTask.status === "PENDING") {
          const started = station.tryCook(this.state, this.menu, targetRecipeId);

          if (started) {
            activeTask.start();
            this.showMessage(`Cooking ${targetRecipeId}`);
          } else {
            this.showMessage("Not enough ingredients");
          }
          return;
        }

        if (activeTask.status === "DONE") {
          if (this.player.heldDish) {
            this.showMessage("Already holding a dish");
            return;
          }

          this.player.heldDish = activeTask.recipeId;
          activeTask.collect();
          this.showMessage(`Collected ${activeTask.recipeId}`);
          return;
        }

        if (activeTask.status === "COOKING") {
          this.showMessage("Still cooking");
          return;
        }

        if (activeTask.status === "COLLECTED") {
          this.showMessage("Dish ready - serve at counter");
          return;
        }
      }
    }

    this.showMessage("Move near the correct station");
  }

  _tryServeCurrentOrder() {
    if (!this.currentOrder) {
      this.showMessage("No current order");
      return;
    }

    const served = this.counter.tryServe(
      this.player,
      this.customer,
      this.state,
      {
        completeOrder: (order, state) => {
          if (order.status !== "ACCEPTED") return false;
          state.addCoins(order.rewardCoins);
          order.complete();
          return true;
        }
      }
    );

    if (!served) {
      this.showMessage("Wrong dish or no dish");
      return;
    }

    // Remove one collected task matching the served dish
    this._removeOneCollectedTask(this.currentOrder.recipeId);

    console.log("[Kitchen] Served:", this.currentOrder.recipeId);
    this.showMessage("Order served!");

    this.currentOrder = null;
    this.customer.order = null;
    // Customer_MVP will switch from SERVED -> LEAVING -> invisible by itself
  }

  _removeOneCollectedTask(recipeId) {
    const tasks = this.productionManager.tasks;
    const index = tasks.findIndex(
      task => task.recipeId === recipeId && task.status === "COLLECTED"
    );

    if (index !== -1) {
      tasks.splice(index, 1);
    }
  }

  // =========================================================
  // UI DRAWING
  // =========================================================

  _drawPhaseBar() {
    push();

    const barX = 250;
    const barY = 8;
    const boxW = 110;
    const boxH = 30;
    const gap = 10;

    const phases = [
      { label: "PLAN", value: "PLANNING" },
      { label: "COOK+SERVE", value: "PRODUCTION" },
      { label: "END", value: "END" },
    ];

    for (let i = 0; i < phases.length; i++) {
      const x = barX + i * (boxW + gap);
      const isActive = this.phase === phases[i].value;

      fill(isActive ? color(255, 230, 140) : color(235));
      stroke(0);
      rect(x, barY, boxW, boxH);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text(phases[i].label, x + boxW / 2, barY + boxH / 2);
    }

    pop();
  }

  _drawMainHint() {
    push();
    fill(255, 255, 230);
    stroke(0);
    rect(20, 540, 380, 95);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);

    if (this.phase === "PLANNING") {
      text("PLANNING PHASE", 30, 550);
      textSize(12);
      text("1~5 = plan dishes", 30, 572);
      text("P = start cooking phase", 30, 592);
      text("No timer in this phase", 30, 612);
    } else if (this.phase === "PRODUCTION") {
      text("COOK + SERVE PHASE", 30, 550);
      textSize(12);
      text(`Order: ${this.currentOrder ? this.currentOrder.recipeId : "None"}`, 30, 572);
      text(`Timer: ${Math.ceil(this.kitchenTimer)}s`, 30, 592);
      text(`Coins: ${this.state.coins}`, 30, 612);
    } else {
      text("ENDING...", 30, 550);
      textSize(12);
      text(this.success ? "Night success" : "Night failed", 30, 572);
      text("Returning to Shooter...", 30, 592);
    }

    pop();
  }

  _drawPanelTabs() {
    push();

    if (!this.isMenuOpen) {
      this.menuOpenTab = { x: 20, y: 20, w: 80, h: 30 };

      fill(235);
      stroke(0);
      rect(this.menuOpenTab.x, this.menuOpenTab.y, this.menuOpenTab.w, this.menuOpenTab.h);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Menu", this.menuOpenTab.x + this.menuOpenTab.w / 2, this.menuOpenTab.y + this.menuOpenTab.h / 2);
    } else {
      this.menuOpenTab = null;
    }

    if (!this.isTaskListOpen) {
      this.taskOpenTab = { x: 20, y: 270, w: 80, h: 30 };

      fill(235);
      stroke(0);
      rect(this.taskOpenTab.x, this.taskOpenTab.y, this.taskOpenTab.w, this.taskOpenTab.h);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Tasks", this.taskOpenTab.x + this.taskOpenTab.w / 2, this.taskOpenTab.y + this.taskOpenTab.h / 2);
    } else {
      this.taskOpenTab = null;
    }

    pop();
  }

  _drawMenuPanel() {
    push();

    const panelX = 110;
    const panelY = 20;
    const panelW = 340;
    const panelH = 235;

    fill(255, 245, 220);
    stroke(0);
    rect(panelX, panelY, panelW, panelH);

    this.menuCloseButton = { x: panelX + panelW - 28, y: panelY + 8, w: 20, h: 20 };
    fill(230);
    stroke(0);
    rect(this.menuCloseButton.x, this.menuCloseButton.y, this.menuCloseButton.w, this.menuCloseButton.h);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text("X", this.menuCloseButton.x + 10, this.menuCloseButton.y + 10);

    fill(0);
    noStroke();
    textSize(16);
    textAlign(LEFT, TOP);
    text("MENU", panelX + 10, panelY + 10);

    const items = [
      { key: "1", name: "Rotten Burger", recipeId: "rotten_burger", y: panelY + 40 },
      { key: "2", name: "Toxic Stew", recipeId: "toxic_stew", y: panelY + 70 },
      { key: "3", name: "Bone BBQ", recipeId: "bone_bbq", y: panelY + 100 },
      { key: "4", name: "Mutant Soup", recipeId: "mutant_soup", y: panelY + 130 },
      { key: "5", name: "Ultimate Feast", recipeId: "ultimate_feast", y: panelY + 160 },
    ];

    this.menuButtons = [];
    this.menuHoverZones = [];

    for (const item of items) {
      fill(0);
      noStroke();
      textSize(12);
      textAlign(LEFT, TOP);
      text(`${item.key}. ${item.name}`, panelX + 10, item.y);

      this.menuHoverZones.push({
        recipeId: item.recipeId,
        x: panelX + 10,
        y: item.y,
        w: 190,
        h: 18
      });

      fill(220);
      stroke(0);
      rect(panelX + 230, item.y - 2, 22, 18);

      fill(0);
      noStroke();
      textSize(14);
      textAlign(CENTER, CENTER);
      text("-", panelX + 241, item.y + 7);

      this.menuButtons.push({
        recipeId: item.recipeId,
        action: "decrease",
        x: panelX + 230,
        y: item.y - 2,
        w: 22,
        h: 18
      });

      fill(220);
      stroke(0);
      rect(panelX + 260, item.y - 2, 22, 18);

      fill(0);
      noStroke();
      textSize(14);
      textAlign(CENTER, CENTER);
      text("+", panelX + 271, item.y + 7);

      this.menuButtons.push({
        recipeId: item.recipeId,
        action: "increase",
        x: panelX + 260,
        y: item.y - 2,
        w: 22,
        h: 18
      });
    }

    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT, TOP);
    text("Backspace = Clear", panelX + 10, panelY + 190);
    text("M = Toggle Menu", panelX + 160, panelY + 190);

    pop();
  }

  _drawMenuHoverCard() {
    const hoveredRecipeId = this._getHoveredMenuRecipe(mouseX, mouseY);
    if (!hoveredRecipeId) return;

    const recipe = this.menu.getRecipe(hoveredRecipeId);
    if (!recipe) return;

    const reqText = Object.entries(recipe.requirements)
      .map(([name, amount]) => `${name}: ${amount}`)
      .join(", ");

    const cardX = Math.min(mouseX + 12, width - 260);
    const cardY = Math.min(mouseY + 12, height - 120);

    push();
    fill(255);
    stroke(0);
    rect(cardX, cardY, 250, 105);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text(recipe.name, cardX + 10, cardY + 10);

    textSize(11);
    text(`Time: ${recipe.cookTime}`, cardX + 10, cardY + 35);
    text(`Profit: ${recipe.rewardCoins}`, cardX + 10, cardY + 55);
    text(`Needs: ${reqText}`, cardX + 10, cardY + 75, 230);

    pop();
  }

  _drawTaskListPanel() {
    const tasks = this.taskList.getTasks();
    const profit = this.taskList.getEstimatedProfit(this.menu);
    const feasible = this.taskList.isFeasible(this.state.inventory, this.menu);
    const requirements = this.taskList.getTotalRequirements(this.menu);

    const reqLines = Object.entries(requirements).length > 0
      ? Object.entries(requirements).map(([name, amount]) => `${name}: ${amount}`)
      : ["None"];

    push();

    const panelX = 110;
    const panelY = 270;
    const panelW = 420;
    const panelH = 260;

    fill(220, 240, 255);
    stroke(0);
    rect(panelX, panelY, panelW, panelH);

    this.taskCloseButton = { x: panelX + panelW - 28, y: panelY + 8, w: 20, h: 20 };
    fill(230);
    stroke(0);
    rect(this.taskCloseButton.x, this.taskCloseButton.y, this.taskCloseButton.w, this.taskCloseButton.h);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(CENTER, CENTER);
    text("X", this.taskCloseButton.x + 10, this.taskCloseButton.y + 10);

    fill(0);
    noStroke();
    textSize(16);
    textAlign(LEFT, TOP);
    text("TASK LIST", panelX + 10, panelY + 10);

    textSize(12);
    textAlign(LEFT, TOP);

    text(`Burger: ${tasks.rotten_burger}`, panelX + 10, panelY + 40);
    text(`Stew: ${tasks.toxic_stew}`, panelX + 10, panelY + 65);
    text(`BBQ: ${tasks.bone_bbq}`, panelX + 10, panelY + 90);
    text(`Soup: ${tasks.mutant_soup}`, panelX + 10, panelY + 115);
    text(`Feast: ${tasks.ultimate_feast}`, panelX + 10, panelY + 140);

    text(`Profit: ${profit}`, panelX + 10, panelY + 175);

    fill(feasible ? 0 : 200, feasible ? 120 : 0, 0);
    text(`Feasible: ${feasible}`, panelX + 10, panelY + 200);
    fill(0);

    text("Requirements:", panelX + 200, panelY + 40);

    let y = panelY + 65;
    for (const line of reqLines) {
      text(line, panelX + 200, y);
      y += 20;
    }

    pop();
  }

  _getClickedMenuButton(mx, my) {
    if (!this.isMenuOpen) return null;

    for (const button of this.menuButtons) {
      const inside =
        mx >= button.x &&
        mx <= button.x + button.w &&
        my >= button.y &&
        my <= button.y + button.h;

      if (inside) return button;
    }

    return null;
  }

  _getHoveredMenuRecipe(mx, my) {
    if (!this.isMenuOpen) return null;

    for (const zone of this.menuHoverZones) {
      const inside =
        mx >= zone.x &&
        mx <= zone.x + zone.w &&
        my >= zone.y &&
        my <= zone.y + zone.h;

      if (inside) return zone.recipeId;
    }

    return null;
  }

  _isInside(mx, my, box) {
    if (!box) return false;
    return (
      mx >= box.x &&
      mx <= box.x + box.w &&
      my >= box.y &&
      my <= box.y + box.h
    );
  }

  _hasAnyPlannedTask() {
    const tasks = this.taskList.getTasks();

    return (
      tasks.rotten_burger > 0 ||
      tasks.toxic_stew > 0 ||
      tasks.bone_bbq > 0 ||
      tasks.mutant_soup > 0 ||
      tasks.ultimate_feast > 0
    );
  }

  showMessage(msg) {
    this.message = msg;
    this.messageTimer = 120;
  }

  _resetAndReturnToShooter() {
    this.player.heldDish = null;
    this.taskList.clear();
    this.productionManager.clear();
    this._loggedDoneTaskIds.clear();

    this.customer.isVisible = false;
    this.customer.order = null;
    this.customer.state = "WAITING";

    this.game.model.gameState.phase++;
    this.game.model.scene = new ShooterScene(this.game);
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
