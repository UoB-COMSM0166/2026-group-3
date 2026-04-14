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
    this.state.time = "Day";
    this.menu = new MenuData();

    // Core managers
    this.taskList = new TaskList();
    this.productionManager = new ProductionManager(this.game);

    // Main phase
    this.phase = "PLANNING";

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

    //Image
    this.background = "Kitchen Background";

    // UI layout helpers
    this.planningUIAutoVisible = true;

    // Pending dish editor state
    this.pendingRecipeId = "toxic_stew";
    this.pendingQuantity = 0;

    // Hold-to-cook state
    this.holdCookTaskId = null;
    this.holdCookRecipeId = null;
    this.holdCookStation = null;
    this.holdCookProgress = 0;
    this.holdCookDuration = 0;
    this.spaceLastFrame = false;

    // Placeholder descriptions
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
    this.player.pos = new Vector2(2.2, 4.0);

    // Kitchen stations
    this.stations = [];

    const stationSize = new Vector2(1.8, 2.0);
    const startX = 0.4;
    const startY = 1.2;
    const verticalSpacing = 1.6;

    // Top-to-bottom station order:
    // Ramen, BBQ, Burger, Fried, Keg
    const stationTypes = ["pot", "grill", "oven", "prep", "special"];

    for (let i = 0; i < 5; i++) {
      const pos = new Vector2(startX, startY + i * 0.8 * verticalSpacing);
      const station = new KitchenStation_MVP(game, pos, stationTypes[i]);
      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // Counter
    this.counter = new Counter_MVP(game, new Vector2(4.5, 1.8));
    this.counter.size = new Vector2(2.0, 5.7);

    // Customer
    this.customer = new Customer_MVP(game, new Vector2(12.2, 6.8), null);
    this.customer.isVisible = false;
    this.customer.state = "WAITING";

    // Colliders
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(stationSize.x + startX - 0.6, 9) },
      { pos: this.counter.pos.add(new Vector2(1.0, 0)), size: this.counter.size.add(new Vector2(-1.0, -1.5)) },
    ];

    // Register entities
    this.entities.push(this.counter, this.player, this.customer);

    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] Difficulty:", difficulty);
    console.log("[Kitchen] Time of day:", this.time);
  }

  async update(events) {
    

    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    this.game.model.gameState.phaseProgress = 1 - (this.kitchenTimer / this.kitchenTimeLimit)

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
        if (event.key === "2") this._selectRecipe("mutant_soup");
        if (event.key === "3") this._selectRecipe("toxic_stew");
        if (event.key === "4") this._selectRecipe("bone_bbq");
        if (event.key === "5") this._selectRecipe("ultimate_feast");

        if (event.key === "=" || event.key === "+") {
        await this.game.soundManager.playSFX("woodButton");
          this._tryIncreasePending();
        }

        if (event.key === "-" || event.key === "_") {
            await this.game.soundManager.playSFX("woodButton");
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
                  await this.game.soundManager.playSFX("woodButton");
              this._tryIncreasePending();
            }

            if (clickedButton.action === "decrease") {
                  await this.game.soundManager.playSFX("woodButton");
              this._decreasePending();
            }

            if (clickedButton.action === "confirm") {
               await this.game.soundManager.playSFX("kitchenDing");
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

          this._resetHoldCooking();
          this._spawnNextCustomerOrder();
          this.showMessage("Cooking started");
          console.log("[Kitchen] Entered PRODUCTION");
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
          this._resetHoldCooking();
          this.showMessage("Time up!");
          console.log("[Kitchen] Time up. Kitchen failed.");
          return;
        }
      }

      // Keep this if your ProductionManager has other housekeeping logic.
      // In this design, cooking no longer uses async task timers.
      this.productionManager.updateAll(deltaTime / 1000);

      this._updateHoldCooking();

      if (this.customer.isVisible && this.currentOrder) {
        this.customer.waitTimer = this.kitchenTimer;
      }

      if (this.customer.isVisible === false && this.currentOrder === null) {
        if (this.orderQueue.length > 0) {
          this._spawnNextCustomerOrder();
        } else {
          this.success = true;
          this.phase = "END";
          this._resetHoldCooking();
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

    let background = this.game.assetManager.getImage(this.background);
    image(background, 0, this.uiBar.size.y, this.game.view.size.x, this.game.view.size.y - this.uiBar.size.y);


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

    this._resetHoldCooking();

    console.log("[Kitchen] New customer order:", recipe.id);
    this.showMessage(`Customer wants ${this._getDisplayName(recipe.id)}`);
  }

  _getRelevantTaskForCurrentOrder() {
    if (!this.currentOrder) return null;

    const recipeId = this.currentOrder.recipeId;
    const tasks = this.productionManager.getTasks();

    return tasks.find(t => t.recipeId === recipeId && t.status === "PENDING") || null;
  }

  _getNearbyMatchingStation(recipe) {
    if (!recipe) return null;

    for (const station of this.stations) {
      if (!this.player.isNear(station)) continue;
      if (station.canCook(recipe)) return station;
    }

    return null;
  }

  _isInteractHeld() {
    if (this.player && typeof this.player.isInteractHeld === "function") {
      return this.player.isInteractHeld();
    }

    return keyIsDown(32);
  }

  _resetHoldCooking() {
    this.holdCookTaskId = null;
    this.holdCookRecipeId = null;
    this.holdCookStation = null;
    this.holdCookProgress = 0;
    this.holdCookDuration = 0;
  }

  _tryConsumeIngredientsForRecipe(recipeId) {
    const recipe = this.menu.getRecipe(recipeId);
    if (!recipe) return false;

    const inventory = this.state?.inventory;
    const items = inventory?.items;
    if (!items) return false;

    for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
      const have = items[ingredient] || 0;
      if (have < amount) {
        return false;
      }
    }

    for (const [ingredient, amount] of Object.entries(recipe.requirements)) {
      items[ingredient] -= amount;
    }

    return true;
  }

  _completeHeldDishTask(task) {
    const tasks = this.productionManager.tasks;
    const index = tasks.findIndex(t => t.id === task.id);

    if (index !== -1) {
      tasks.splice(index, 1);
    }
  }

  async _updateHoldCooking() {
    const spaceDown = this._isInteractHeld();
    this.spaceLastFrame = spaceDown;

    // Stop hold if space is released
    if (!spaceDown) {
      if (this.holdCookProgress > 0) {
        this.showMessage("Cooking interrupted");
      }
      this._resetHoldCooking();
      return;
    }

    // If already holding the correct dish and standing near counter, serve directly
    if (
      this.currentOrder &&
      this.player.heldDish &&
      this.player.heldDish === this.currentOrder.recipeId &&
      this.player.isNear(this.counter)
    ) {
      this._resetHoldCooking();
      this._tryServeCurrentOrder();
      return;
    }

    // No current order
    if (!this.currentOrder) {
      this._resetHoldCooking();
      this.showMessage("No current order");
      return;
    }

    // Already holding some dish: only next valid action is serve
    if (this.player.heldDish) {
      this._resetHoldCooking();

      if (this.player.heldDish === this.currentOrder.recipeId) {
        if (this.player.isNear(this.counter)) {
          this._tryServeCurrentOrder();
        } else {
          this.showMessage(`Serve ${this._getDisplayName(this.player.heldDish)} at counter`);
        }
      } else {
        this.showMessage("Wrong dish in hand");
      }
      return;
    }

    const activeTask = this._getRelevantTaskForCurrentOrder();
    if (!activeTask) {
      this._resetHoldCooking();
      this.showMessage("No remaining task for this order");
      return;
    }

    const recipe = this.menu.getRecipe(activeTask.recipeId);
    if (!recipe) {
      this._resetHoldCooking();
      this.showMessage("Recipe not found");
      return;
    }

    const station = this._getNearbyMatchingStation(recipe);
    if (!station) {
      this._resetHoldCooking();
      this.showMessage("Move near the correct station");
      return;
    }

    // Start a new hold session
    if (this.holdCookTaskId !== activeTask.id) {
      this.holdCookTaskId = activeTask.id;
      this.holdCookRecipeId = activeTask.recipeId;
      this.holdCookStation = station;
      this.holdCookProgress = 0;
      this.holdCookDuration = recipe.cookTime || 1;
    }

    // If player moved away from the original station, cancel hold
    if (this.holdCookStation !== station) {
      this._resetHoldCooking();
      this.showMessage("Cooking interrupted");
      return;
    }

    this.holdCookProgress += deltaTime / 1000;

    const remain = Math.max(0, this.holdCookDuration - this.holdCookProgress);
    this.showMessage(
      `Hold SPACE to cook ${this._getDisplayName(activeTask.recipeId)}: ${remain.toFixed(1)}s`
    );

    if (this.holdCookProgress < this.holdCookDuration) {
      return;
    }

    // HOLD TIME IS THE FULL COOK TIME:
    // once finished, consume ingredients and directly put dish in player's hand
    const cooked = this._tryConsumeIngredientsForRecipe(activeTask.recipeId);

    if (!cooked) {
      this._resetHoldCooking();
      this.showMessage("Not enough ingredients");
      return;
    }

    this.player.heldDish = activeTask.recipeId;
    this._completeHeldDishTask(activeTask);

    this._resetHoldCooking();
    await this.game.soundManager.playSFX("kitchenDing"); 
    this.showMessage(`Cooked ${this._getDisplayName(activeTask.recipeId)}`);
  }

  _tryServeCurrentOrder() {
    if (!this.currentOrder) {
      this.showMessage("No current order");
      return;
    }

    const servedRecipeId = this.currentOrder.recipeId;

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

    console.log("[Kitchen] Served:", servedRecipeId);
    this.showMessage(`Served ${this._getDisplayName(servedRecipeId)}!`);

    this.currentOrder = null;
    this.customer.order = null;

    this._resetHoldCooking();
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
      "mutant_soup",
      "toxic_stew",
      "bone_bbq",
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
    const displayNameMap = {
      rotten_burger: "ZOMBURGER",
      mutant_soup: "DFD",
      toxic_stew: "ZOMMEN",
      bone_bbq: "ZOMBBQ",
      ultimate_feast: "ZOMBEER",
    };

    return displayNameMap[recipeId] || recipeId;
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

  _getPlanningBoardLayout() {
    const boardW = 1120;
    const boardH = 800;
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
      controlsH: 132,
    };
  }

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
    text("Space = Cook / Serve", boxX + 14, boxY + 106);

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
      { key: "1", name: "ZOMBURGER", recipeId: "rotten_burger",  y: panelY + 60 },
      { key: "2", name: "DFD",       recipeId: "mutant_soup",    y: panelY + 150 },
      { key: "3", name: "ZOMMEN",    recipeId: "toxic_stew",     y: panelY + 240 },
      { key: "4", name: "ZOMBBQ",    recipeId: "bone_bbq",       y: panelY + 330 },
      { key: "5", name: "ZOMBEER",   recipeId: "ultimate_feast", y: panelY + 420 },
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

    fill(240);
    stroke(0);
    rect(panelX + 18, panelY + 44, 90, 90, 8);

    fill(0);
    noStroke();
    textSize(11);
    textAlign(CENTER, CENTER);
    text("IMAGE", panelX + 63, panelY + 89);

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(18);
    text(this._getDisplayName(this.pendingRecipeId), panelX + 128, panelY + 54);

    textSize(16);
    text(`G${recipe.rewardCoins}`, panelX + 128, panelY + 96);

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

    fill(0);
    noStroke();
    textSize(15);
    textAlign(LEFT, TOP);
    text("INGREDIENTS", panelX + 18, panelY + 292);

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

    fill(70);
    noStroke();
    textSize(11);
    textAlign(LEFT, TOP);
    text(`Pending quantity: ${this.pendingQuantity}`, panelX + 18, panelY + 466);

    pop();
  }

  _drawStationCountdowns() {
    if (this.phase !== "PRODUCTION") return;
    if (!this.holdCookTaskId || !this.holdCookStation) return;
    if (this.holdCookProgress <= 0) return;

    const relPos = this.game.view.localToScreen(this.holdCookStation.pos);
    const relSize = this.game.view.localToScreen(this.holdCookStation.size);

    const remain = Math.max(0, this.holdCookDuration - this.holdCookProgress);
    const labelText = `Cooking ${remain.toFixed(1)}s`;

    push();

    const badgeMarginX = 10;
    const badgeMarginY = 8;
    const badgeX = relPos.x + badgeMarginX;
    const badgeY = relPos.y + badgeMarginY;
    const badgeW = Math.max(80, relSize.x - badgeMarginX * 2);
    const badgeH = 26;

    fill(255, 244, 170, 235);
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

    this._resetHoldCooking();

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
