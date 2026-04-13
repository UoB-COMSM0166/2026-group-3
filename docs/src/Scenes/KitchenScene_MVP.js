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
import { UIBar } from "../UIElements/UIBar.js";

export class KitchenScene_MVP extends Scene {
  constructor(game) {
    super(game);

    console.log("KitchenScene_MVP loaded");

    // Shared game state
    this.state = this.game.model.gameState;
    this.menu = new MenuData();

    // Time of day
    this.time = "Night";
    this.game.model.gameState.time = "Night";

    // Core managers
    this.taskList = new TaskList();
    this.productionManager = new ProductionManager(this.game);

    // Main phase
    this.phase = "PLANNING"; // PLANNING | PRODUCTION | END

    // Global kitchen timer
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

    // Order flow
    this.orderQueue = [];
    this.currentOrder = null;
    this.success = false;
    this.endTimer = 2;

    // Logging
    this._loggedDoneTaskIds = new Set();

    // Message UI
    this.message = "";
    this.messageTimer = 0;

    // Planning UI state
    this.isMenuOpen = true;
    this.isTaskListOpen = true;

    // UI hitboxes
    this.menuButtons = [];
    this.menuCardZones = [];
    this.menuCloseButton = null;
    this.taskCloseButton = null;
    this.menuOpenTab = null;
    this.taskOpenTab = null;

    // UI layout helpers
    this.planningUIAutoVisible = true;

    // Pending dish editor state
    this.pendingRecipeId = "rotten_burger";
    this.pendingQuantity = 0;

    // Fixed placeholder descriptions
    this.recipeDescriptions = {
      rotten_burger: "Description coming soon.",
      toxic_stew: "Description coming soon.",
      bone_bbq: "Description coming soon.",
      mutant_soup: "Description coming soon.",
      ultimate_feast: "Description coming soon.",
    };

    // Reuse shooter top bar
    this.uiBar = new UIBar(game, this);
    this.addUIElement(this.uiBar);

    if (this.uiBar.shopButton) {
      this.uiBar.shopButton.active = false;
      this.uiBar.shopButton.style.fillColor = color(150);
    }

    // Player
    this.player = new PlayerChef_MVP(game);
    this.player.pos = new Vector2(6.2, 7.0);
    this.player.size = new Vector2(0.7, 0.7);

    // Kitchen stations
    this.stations = [];

    const stationSize = new Vector2(2.0, 1.2);
    const startX = 3.0;
    const startY = 0.8;
    const verticalSpacing = 1.6;

    const stationTypes = ["grill", "pot", "oven", "prep", "special"];

    for (let i = 0; i < 5; i++) {
      const pos = new Vector2(startX, startY + i * verticalSpacing);
      const station = new KitchenStation_MVP(game, pos, stationTypes[i]);
      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // Counter
    this.counter = new Counter_MVP(game, new Vector2(8.2, 0.8));
    this.counter.size = new Vector2(1.2, 7.4);

    // Customer
    this.customer = new Customer_MVP(game, new Vector2(12.2, 6.8), null);
    this.customer.isVisible = false;
    this.customer.state = "WAITING";

    // Colliders
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(4.8, 9) },
      { pos: this.counter.pos, size: this.counter.size },
    ];

    // Register entities
    this.entities.push(this.player, this.counter, this.customer);

    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] Difficulty:", difficulty);
    console.log("[Kitchen] Time of day:", this.time);
  }

  update(events) {
    this.time = "Night";
    this.game.model.gameState.time = "Night"; 

    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    this.state.time = "Night";

    // Update entities manually so the customer does not update during planning
    for (let entity of this.entities) {
      if (entity === this.customer && this.phase === "PLANNING") {
        continue;
      }
      entity.update(events);
    }

    for (let uielement of this.uielements) {
      uielement.update(events);
    }

    // Roll back player movement on collision
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

    // Keep planning panels visible during planning
    if (this.phase === "PLANNING" && this.planningUIAutoVisible) {
      this.isMenuOpen = true;
      this.isTaskListOpen = true;
    }

    // Hide planning panels outside planning
    if (this.phase !== "PLANNING") {
      this.isMenuOpen = false;
      this.isTaskListOpen = false;
    }

    // Input handling
    for (const event of events) {
      const mx = event?.x ?? mouseX;
      const my = event?.y ?? mouseY;

      // Panel open or close buttons
      if (event.type === "click") {

        if (this._isInside(mx, my, this.menuOpenTab)) {
          this.isMenuOpen = true;
          return;
        }

        if (this._isInside(mx, my, this.taskOpenTab)) {
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

      // Planning phase
      if (this.phase === "PLANNING") {
        if (event.key === "1") this._selectRecipe("rotten_burger");
        if (event.key === "2") this._selectRecipe("toxic_stew");
        if (event.key === "3") this._selectRecipe("bone_bbq");
        if (event.key === "4") this._selectRecipe("mutant_soup");
        if (event.key === "5") this._selectRecipe("ultimate_feast");

        if (event.key === "=" || event.key === "+") {
          this._tryIncreasePending();
        }

        if (event.key === "-" || event.key === "_") {
          this._decreasePending();
        }

        if (event.key === "Backspace") {
          this.taskList.clear();
          this.pendingQuantity = 0;
        }

        if (event.key === "Enter") {
          this._confirmPendingDish();
        }

        if (event.key === "n" || event.key === "N") {
          this.success = true;
          this.phase = "END";
          this.endTimer = 0.6;
          this.showMessage("Skipped kitchen");
          return;
        }

        if (event.type === "click") {
          const clickedButton = this._getClickedMenuButton(mx, my);
          const clickedCard = this._getClickedMenuCard(mx, my);

          if (clickedCard) {
            this._selectRecipe(clickedCard.recipeId);
          }

          if (clickedButton) {
            this._selectRecipe(clickedButton.recipeId);

            if (clickedButton.action === "increase") {
              this._tryIncreasePending();
            }

            if (clickedButton.action === "decrease") {
              this._decreasePending();
            }

            if (clickedButton.action === "confirm") {
              this._confirmPendingDish();
            }
          }
        }

        // Start production
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

          this.isMenuOpen = false;
          this.isTaskListOpen = false;

          this._spawnNextCustomerOrder();
          this.showMessage("Cooking started");
          console.log("[Kitchen] Entered PRODUCTION");
        }
      }

      // Production phase
      if (this.phase === "PRODUCTION") {
        if (event.key === "e" || event.key === "E") {
          if (this.player.isNear(this.counter)) {
            this._tryServeCurrentOrder();
            continue;
          }

          this._handleProductionCook();
        }
      }
    }

    // Production loop
    if (this.phase === "PRODUCTION") {
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

      this.productionManager.updateAll(deltaTime / 1000);

      for (const task of this.productionManager.getDoneTasks()) {
        if (!this._loggedDoneTaskIds.has(task.id)) {
          this._loggedDoneTaskIds.add(task.id);
          console.log("[Kitchen] Task is now DONE:", task);
        }
      }

      if (this.customer.isVisible && this.currentOrder) {
        this.customer.waitTimer = this.kitchenTimer;
      }

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

    // End phase
    if (this.phase === "END") {
      this.endTimer -= deltaTime / 1000;

      if (this.endTimer <= 0) {
        this._resetAndReturnToShooter();
      }
    }
  }

  draw() {
    super.draw();

    if (this.phase === "PLANNING") {
      this._drawPlanningCenterCards();

      if (this.isTaskListOpen) {
        this._drawTaskListPanel();
      }

      if (this.isMenuOpen) {
        this._drawMenuPanel();
      }

      this._drawDishDetailsPanel();
      this._drawPlanningInstructionsInsideBoard();
    }

    this._drawProductionStatusPanel();
    this._drawStationCountdowns();

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
  // Production logic
  // =========================================================

  _buildOrderQueueFromTaskList() {
    const queue = [];
    const tasks = this.taskList.getTasks();

    for (const [recipeId, quantity] of Object.entries(tasks)) {
      for (let i = 0; i < quantity; i++) {
        queue.push(recipeId);
      }
    }

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
    this.customer.waitTimer = this.kitchenTimer;

    console.log("[Kitchen] New customer order:", recipe.id);
    this.showMessage(`Customer wants ${recipe.id}`);
  }

  _getRelevantTaskForCurrentOrder() {
    if (!this.currentOrder) return null;
    const recipeId = this.currentOrder.recipeId;
    const tasks = this.productionManager.getTasks();

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

    this._removeOneCollectedTask(this.currentOrder.recipeId);

    console.log("[Kitchen] Served:", this.currentOrder.recipeId);
    this.showMessage("Order served!");

    this.currentOrder = null;
    this.customer.order = null;
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
  // Planning helpers
  // =========================================================

  _selectRecipe(recipeId) {
    if (this.pendingRecipeId !== recipeId) {
      this.pendingRecipeId = recipeId;
      this.pendingQuantity = 0;
    }
  }

  _tryIncreasePending() {
    if (this._canIncreasePending(this.pendingRecipeId, this.pendingQuantity + 1)) {
      this.pendingQuantity += 1;
    } else {
      this.showMessage("Not enough ingredients for this dish");
    }
  }

  _decreasePending() {
    this.pendingQuantity = Math.max(0, this.pendingQuantity - 1);
  }

  _confirmPendingDish() {
    if (!this.pendingRecipeId) return;

    if (this.pendingQuantity <= 0) {
      this.showMessage("Set a quantity before confirming");
      return;
    }

    this.taskList.increase(this.pendingRecipeId, this.pendingQuantity);
    this.showMessage(`Added ${this.pendingQuantity} ${this._getDisplayName(this.pendingRecipeId)}`);
    this.pendingQuantity = 0;
  }

  _canIncreasePending(recipeId, nextPendingQuantity) {
    const recipe = this.menu.getRecipe(recipeId);
    if (!recipe) return false;

    const inventoryItems = this.state?.inventory?.items || {};
    const confirmedRequirements = this.taskList.getTotalRequirements(this.menu);

    for (const [ingredient, perDishNeed] of Object.entries(recipe.requirements)) {
      const totalHave = inventoryItems[ingredient] || 0;
      const confirmedUsed = confirmedRequirements[ingredient] || 0;
      const remainingAfterConfirmed = totalHave - confirmedUsed;
      const totalPendingNeed = perDishNeed * nextPendingQuantity;

      if (remainingAfterConfirmed < totalPendingNeed) {
        return false;
      }
    }

    return true;
  }

  _getPlannedMenuEntries() {
    const tasks = this.taskList.getTasks();

    const orderedRecipeIds = [
      "rotten_burger",
      "toxic_stew",
      "bone_bbq",
      "mutant_soup",
      "ultimate_feast"
    ];

    const result = [];

    for (const recipeId of orderedRecipeIds) {
      const quantity = tasks[recipeId] || 0;
      if (quantity > 0) {
        result.push({ recipeId, quantity });
      }
    }

    while (result.length < 5) {
      result.push(null);
    }

    return result;
  }

  _getDisplayName(recipeId) {
    const recipe = this.menu.getRecipe(recipeId);
    if (!recipe) return recipeId;
    return recipe.name || recipeId;
  }

  _getDescription(recipeId) {
    return this.recipeDescriptions[recipeId] || "Description coming soon.";
  }

  _getPendingNeedMap(recipeId, pendingQuantity) {
    const recipe = this.menu.getRecipe(recipeId);
    const result = {};

    if (!recipe) return result;

    for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
      result[ingredient] = amount * pendingQuantity;
    }

    return result;
  }

  _getConfirmedRemainingMap() {
    const inventoryItems = this.state?.inventory?.items || {};
    const confirmedRequirements = this.taskList.getTotalRequirements(this.menu);
    const result = {};

    for (const [name, amount] of Object.entries(inventoryItems)) {
      result[name] = Math.max(0, amount - (confirmedRequirements[name] || 0));
    }

    return result;
  }

  // =========================================================
  // Layout helpers
  // =========================================================

  _getPlanningBoardLayout() {
  const boardW = 1120;
  const boardH = 760;
  const boardX = width / 2 - boardW / 2;
  const boardY = 40;

  return {
    boardX,
    boardY,
    boardW,
    boardH,
    panelGap: 28,
    leftW: 280,
    midW: 300,
    rightW: 280,
    panelH: 500,

    panelY: boardY + 90,

    controlsX: boardX + 24,
    controlsY: boardY + 620,
    controlsW: boardW - 48,
    controlsH: 100,
  };
}

  // =========================================================
  // UI drawing
  // =========================================================

  _drawPlanningCenterCards() {
  const layout = this._getPlanningBoardLayout();

  push();

  fill(15, 18, 28, 170);
  noStroke();
  rect(layout.boardX, layout.boardY, layout.boardW, layout.boardH, 18);

  fill(255);
  textAlign(CENTER, TOP);
  textSize(22);
  text("Night Prep", width / 2, layout.boardY + 16);

  pop();
}

  _drawPlanningInstructionsInsideBoard() {
  if (this.phase !== "PLANNING") return;

  const layout = this._getPlanningBoardLayout();

  push();

  const boxX = layout.controlsX;
  const boxY = layout.controlsY;
  const boxW = layout.controlsW;
  const boxH = layout.controlsH;

  fill(40, 40, 40, 230);
  stroke(70);
  rect(boxX, boxY, boxW, boxH, 8);

  fill(255);
  noStroke();

  textAlign(LEFT, TOP);
  textSize(14);
  text("Controls", boxX + 14, boxY + 10);

  textSize(12);
  text("Select dishes in the middle panel.", boxX + 14, boxY + 40);
  text("Use + / - to change pending quantity.", boxX + 14, boxY + 62);
  text("Press Enter or click ✓ to confirm into Today's Menu.", boxX + 14, boxY + 84);

  textAlign(RIGHT, TOP);
  text("Backspace = Clear full plan", boxX + boxW - 18, boxY + 40);
  text("P = Start cooking", boxX + boxW - 18, boxY + 62);
  text("N = Skip kitchen", boxX + boxW - 18, boxY + 84);

  pop();
}

  _drawPanelTabs() {
    push();

    if (!this.isMenuOpen) {
      this.menuOpenTab = { x: 20, y: 100, w: 92, h: 30 };

      fill(235);
      stroke(0);
      rect(this.menuOpenTab.x, this.menuOpenTab.y, this.menuOpenTab.w, this.menuOpenTab.h, 6);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Dishes", this.menuOpenTab.x + this.menuOpenTab.w / 2, this.menuOpenTab.y + this.menuOpenTab.h / 2);
    } else {
      this.menuOpenTab = null;
    }

    if (!this.isTaskListOpen) {
      this.taskOpenTab = { x: 20, y: 138, w: 92, h: 30 };

      fill(235);
      stroke(0);
      rect(this.taskOpenTab.x, this.taskOpenTab.y, this.taskOpenTab.w, this.taskOpenTab.h, 6);

      fill(0);
      noStroke();
      textSize(12);
      textAlign(CENTER, CENTER);
      text("Menu", this.taskOpenTab.x + this.taskOpenTab.w / 2, this.taskOpenTab.y + this.taskOpenTab.h / 2);
    } else {
      this.taskOpenTab = null;
    }

    pop();
  }

  _drawMenuPanel() {
  push();

  const layout = this._getPlanningBoardLayout();

  const panelX = width / 2 - layout.midW / 2;
  const panelY = layout.panelY;
  const panelW = layout.midW;
  const panelH = layout.panelH;

  fill(255, 245, 220);
  stroke(0);
  rect(panelX, panelY, panelW, panelH, 12);

  this.menuCloseButton = null;

  fill(0);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text("AVAILABLE DISHES", panelX + 14, panelY + 12);

  const items = [
    { key: "1", name: "Rotten Burger", recipeId: "rotten_burger", y: panelY + 60 },
    { key: "2", name: "Toxic Stew", recipeId: "toxic_stew", y: panelY + 150 },
    { key: "3", name: "Bone BBQ", recipeId: "bone_bbq", y: panelY + 240 },
    { key: "4", name: "Mutant Soup", recipeId: "mutant_soup", y: panelY + 330 },
    { key: "5", name: "Ultimate Feast", recipeId: "ultimate_feast", y: panelY + 420 },
  ];

  this.menuButtons = [];
  this.menuCardZones = [];

  for (const item of items) {
    const recipe = this.menu.getRecipe(item.recipeId);
    const isSelected = this.pendingRecipeId === item.recipeId;
    const pendingShown = isSelected ? this.pendingQuantity : 0;
    const canAdd = isSelected
      ? this._canIncreasePending(item.recipeId, this.pendingQuantity + 1)
      : this._canIncreasePending(item.recipeId, 1);

    const cardX = panelX + 10;
    const cardY = item.y - 6;
    const cardW = 278;
    const cardH = 66;

    fill(isSelected ? color(250, 232, 180) : color(245, 235, 210));
    stroke(0);
    rect(cardX, cardY, cardW, cardH, 8);

    this.menuCardZones.push({
      recipeId: item.recipeId,
      x: cardX,
      y: cardY,
      w: cardW,
      h: cardH
    });

    fill(0);
    noStroke();
    textSize(13);
    textAlign(LEFT, TOP);
    text(`${item.key}. ${item.name}`, panelX + 16, item.y);

    textSize(11);
    fill(80);
    text(`Profit ${recipe ? recipe.rewardCoins : "-"}`, panelX + 16, item.y + 24);

    fill(220);
    stroke(0);
    rect(panelX + 198, item.y + 10, 22, 18, 4);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("-", panelX + 209, item.y + 19);

    this.menuButtons.push({
      recipeId: item.recipeId,
      action: "decrease",
      x: panelX + 198,
      y: item.y + 10,
      w: 22,
      h: 18
    });

    fill(0);
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text(pendingShown, panelX + 234, item.y + 19);

    fill(canAdd ? color(220) : color(170));
    stroke(0);
    rect(panelX + 246, item.y + 10, 22, 18, 4);

    fill(canAdd ? color(0) : color(90));
    noStroke();
    textSize(14);
    textAlign(CENTER, CENTER);
    text("+", panelX + 257, item.y + 19);

    this.menuButtons.push({
      recipeId: item.recipeId,
      action: "increase",
      x: panelX + 246,
      y: item.y + 10,
      w: 22,
      h: 18
    });

    fill(isSelected && pendingShown > 0 ? color(215, 235, 205) : color(200));
    stroke(0);
    rect(panelX + 270, item.y + 10, 12, 18, 4);

    fill(0);
    noStroke();
    textSize(10);
    textAlign(CENTER, CENTER);
    text("✓", panelX + 276, item.y + 19);

    this.menuButtons.push({
      recipeId: item.recipeId,
      action: "confirm",
      x: panelX + 270,
      y: item.y + 10,
      w: 12,
      h: 18
    });
  }

  pop();
}

  _drawTaskListPanel() {
  const plannedEntries = this._getPlannedMenuEntries();

  push();

  const layout = this._getPlanningBoardLayout();

  const panelX = width / 2 - layout.midW / 2 - layout.panelGap - layout.leftW;
  const panelY = layout.panelY;
  const panelW = layout.leftW;
  const panelH = layout.panelH;

  fill(220, 240, 255);
  stroke(0);
  rect(panelX, panelY, panelW, panelH, 12);

  this.taskCloseButton = null;

  fill(0);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text("TODAY'S MENU", panelX + 14, panelY + 12);

  const slotX = panelX + 16;
  const slotW = panelW - 32;
  const slotH = 64;
  const gap = 16;

  for (let i = 0; i < 5; i++) {
    const slotY = panelY + 58 + i * (slotH + gap);
    const entry = plannedEntries[i];

    fill(245, 235, 210);
    stroke(0);
    rect(slotX, slotY, slotW, slotH, 8);

    fill(0);
    noStroke();
    textAlign(LEFT, CENTER);

    if (entry) {
      const name = this._getDisplayName(entry.recipeId);
      textSize(14);
      text(name, slotX + 16, slotY + 22);

      textSize(12);
      fill(70);
      text(`Quantity: ${entry.quantity}`, slotX + 16, slotY + 44);
    } else {
      textSize(18);
      text("+ Add Menu", slotX + 16, slotY + slotH / 2);
    }
  }

  pop();
}

  _drawDishDetailsPanel() {
  if (this.phase !== "PLANNING") return;

  const recipe = this.menu.getRecipe(this.pendingRecipeId);
  if (!recipe) return;

  const confirmedRemaining = this._getConfirmedRemainingMap();
  const reqEntries = Object.entries(recipe.requirements);
  const quantityForDisplay = this.pendingQuantity > 0 ? this.pendingQuantity : 1;
  const pendingNeedMap = this._getPendingNeedMap(this.pendingRecipeId, quantityForDisplay);

  push();

  const layout = this._getPlanningBoardLayout();

  const panelX = width / 2 + layout.midW / 2 + layout.panelGap;
  const panelY = layout.panelY;
  const panelW = layout.rightW;
  const panelH = layout.panelH;

  fill(255, 245, 220);
  stroke(0);
  rect(panelX, panelY, panelW, panelH, 12);

  fill(0);
  noStroke();
  textSize(18);
  textAlign(LEFT, TOP);
  text("DISH DETAILS", panelX + 14, panelY + 12);

  // Image placeholder
  fill(240);
  stroke(0);
  rect(panelX + 18, panelY + 44, 90, 90, 8);

  fill(0);
  noStroke();
  textSize(11);
  textAlign(CENTER, CENTER);
  text("IMAGE", panelX + 63, panelY + 89);

  // Dish name and profit
  fill(0);
  noStroke();
  textAlign(LEFT, TOP);
  textSize(18);
  text(this._getDisplayName(this.pendingRecipeId), panelX + 128, panelY + 54);

  textSize(16);
  text(`G${recipe.rewardCoins}`, panelX + 128, panelY + 96);

  // Description box
  fill(245, 245, 245);
  stroke(0);
  rect(panelX + 18, panelY + 160, panelW - 36, 110, 8);

  fill(0);
  noStroke();
  textSize(12);
  textAlign(LEFT, TOP);
  text(
    this._getDescription(this.pendingRecipeId),
    panelX + 28,
    panelY + 174,
    panelW - 56,
    82
  );

  // Ingredients title
  fill(0);
  noStroke();
  textSize(15);
  textAlign(LEFT, TOP);
  text("INGREDIENTS", panelX + 18, panelY + 292);

  // Ingredients box
  fill(250);
  stroke(0);
  rect(panelX + 18, panelY + 326, panelW - 36, 128, 8);

  let y = panelY + 340;
  for (const [name] of reqEntries) {
    const remaining = confirmedRemaining[name] || 0;
    const need = pendingNeedMap[name] || 0;

    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT, TOP);
    text(`${name}  ${remaining}/${need}`, panelX + 28, y);
    y += 22;
  }

  // Pending quantity info
  fill(70);
  noStroke();
  textSize(11);
  textAlign(LEFT, TOP);
  text(`Pending quantity: ${this.pendingQuantity}`, panelX + 18, panelY + 466);

  pop();
}

  _drawProductionStatusPanel() {
    if (this.phase !== "PRODUCTION") return;

    push();

    const x = width - 290;
    const y = 205;
    const w = 260;
    const h = 130;

    fill(255, 251, 236, 235);
    stroke(0);
    rect(x, y, w, h, 10);

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(15);
    text("CURRENT STATUS", x + 12, y + 12);

    textSize(12);

    const orderText = this.currentOrder ? this.currentOrder.recipeId : "None";
    const queued = this.orderQueue ? this.orderQueue.length : 0;
    const heldDish = this.player && this.player.heldDish ? this.player.heldDish : "None";

    text(`Night: ${this.time}`, x + 12, y + 40);
    text(`Order: ${orderText}`, x + 12, y + 62);
    text(`Remaining Orders: ${queued}`, x + 12, y + 84);
    text(`Holding: ${heldDish}`, x + 12, y + 106);

    pop();
  }

  _drawStationCountdowns() {
    if (this.phase !== "PRODUCTION") return;

    const relevantTasks = this.productionManager
      .getTasks()
      .filter(task => task.status === "COOKING" || task.status === "DONE");

    if (relevantTasks.length === 0) return;

    for (const task of relevantTasks) {
      const recipe = this.menu.getRecipe(task.recipeId);
      if (!recipe) continue;

      const station = this.stations.find(
        s =>
          s.type === recipe.stationType ||
          s.stationType === recipe.stationType ||
          s.kind === recipe.stationType
      );

      if (!station) continue;

      const relPos = this.game.view.localToScreen(station.pos);
      const relSize = this.game.view.localToScreen(station.size);

      let labelText = "";
      let badgeColor;

      if (task.status === "COOKING") {
        labelText = `Cooking ${this._getCookCountdownText(task)}`;
        badgeColor = color(255, 244, 170, 235);
      } else if (task.status === "DONE") {
        labelText = "Ready - Pick up";
        badgeColor =
          frameCount % 30 < 15
            ? color(190, 255, 190, 235)
            : color(165, 245, 165, 235);
      } else {
        continue;
      }

      push();

      const badgeMarginX = 10;
      const badgeMarginY = 8;
      const badgeX = relPos.x + badgeMarginX;
      const badgeY = relPos.y + badgeMarginY;
      const badgeW = Math.max(80, relSize.x - badgeMarginX * 2);
      const badgeH = 26;

      fill(badgeColor);
      stroke(60, 60, 60);
      strokeWeight(1.2);
      rect(badgeX, badgeY, badgeW, badgeH, 6);

      fill(35);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(13);
      text(labelText, badgeX + badgeW / 2, badgeY + badgeH / 2);

      pop();
    }
  }

  _getCookCountdownText(task) {
    if (!task) return "...";

    if (typeof task.remainingTime === "number") {
      return `${Math.max(0, Math.ceil(task.remainingTime))}s`;
    }

    if (typeof task.timeLeft === "number") {
      return `${Math.max(0, Math.ceil(task.timeLeft))}s`;
    }

    if (typeof task.cookTimer === "number") {
      return `${Math.max(0, Math.ceil(task.cookTimer))}s`;
    }

    if (typeof task.timer === "number") {
      return `${Math.max(0, Math.ceil(task.timer))}s`;
    }

    if (typeof task.elapsedTime === "number" && typeof task.totalTime === "number") {
      return `${Math.max(0, Math.ceil(task.totalTime - task.elapsedTime))}s`;
    }

    if (typeof task.progress === "number" && typeof task.totalTime === "number") {
      return `${Math.max(0, Math.ceil(task.totalTime - task.progress))}s`;
    }

    const recipe = this.menu.getRecipe(task.recipeId);
    if (recipe && typeof recipe.cookTime === "number") {
      return `~${Math.ceil(recipe.cookTime)}s`;
    }

    return "Cooking...";
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

  _getClickedMenuCard(mx, my) {
    if (!this.isMenuOpen) return null;

    for (const zone of this.menuCardZones) {
      const inside =
        mx >= zone.x &&
        mx <= zone.x + zone.w &&
        my >= zone.y &&
        my <= zone.y + zone.h;

      if (inside) return zone;
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
