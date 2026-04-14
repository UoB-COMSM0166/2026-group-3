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

    // Order / customer flow
    this.orderQueue = [];
    this.currentOrder = null;
    this.success = false;
    this.endTimer = 2;

    // Multiple random customers
    this.customers = [];
    this.maxCustomersOnScreen = 3;
    this.customerSpawnTimer = 1.2;
    this.customerSpawnIntervalMin = 3.2;
    this.customerSpawnIntervalMax = 5.8;
    this.totalOrdersToServe = 0;
    this.servedOrdersCount = 0;
    this.nextCustomerId = 1;

    this.customerTargetSlots = [
      new Vector2(12.2, 2.3),
      new Vector2(12.2, 4.5),
      new Vector2(12.2, 6.7),
    ];
    this.customerSpawnX = 14.2;
    this.customerLeaveX = 15.4;
    this.customerMoveSpeed = 2.6;

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

    // Keep your original background key
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
    this.holdCookCustomerId = null;
    this.spaceLastFrame = false;

    // Placeholder descriptions
    this.recipeDescriptions = {
      rotten_burger: "Description coming soon.",
      toxic_stew: "Description coming soon.",
      bone_bbq: "Description coming soon.",
      mutant_soup: "Description coming soon.",
      ultimate_feast: "Description coming soon.",
    };

    // Station labels shown below each station
    this.stationDishLabels = {
      pot: "ZOMMEN",
      grill: "ZOMBBQ",
      oven: "ZOMBURGER",
      prep: "DFD",
      special: "ZOMBEER",
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

    // Spread stations apart so interaction zones do not chain together
    const stationSize = new Vector2(1.45, 1.15);
    const startX = 0.55;
    const startY = 1.0;
    const stationGap = 1.48;

    // Keep your intended top-to-bottom order:
    // Ramen, BBQ, Burger, Fried, Keg
    const stationTypes = ["pot", "grill", "oven", "prep", "special"];

    for (let i = 0; i < 5; i++) {
      const pos = new Vector2(startX, startY + i * stationGap);
      const station = new KitchenStation_MVP(game, pos, stationTypes[i]);
      station.size = stationSize;

      this.stations.push(station);
      this.entities.push(station);
    }

    // Counter
    this.counter = new Counter_MVP(game, new Vector2(4.55, 1.65));
    this.counter.size = new Vector2(1.9, 5.85);

    // Colliders
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(1.45, 9) },
      { pos: this.counter.pos.add(new Vector2(1.0, 0)), size: this.counter.size.add(new Vector2(-1.0, -1.5)) },
    ];

    // Register fixed entities
    this.entities.push(this.counter, this.player);

    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] Difficulty:", difficulty);
  }

  async update(events) {
    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    this.game.model.gameState.phaseProgress =
      1 - (this.kitchenTimer / this.kitchenTimeLimit);

    // Update entities manually so customers do not update during planning
    for (let entity of this.entities) {
      if (entity instanceof Customer_MVP && this.phase === "PLANNING") {
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
        // Keep your original menu order
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

          this.totalOrdersToServe = this.orderQueue.length;
          this.servedOrdersCount = 0;
          this.customerSpawnTimer = 0.4;
          this.currentOrder = null;

          // clear old customers if any
          for (const customer of this.customers) {
            const idx = this.entities.indexOf(customer);
            if (idx !== -1) this.entities.splice(idx, 1);
          }
          this.customers = [];

          this.phase = "PRODUCTION";
          this.timerStarted = true;
          this.kitchenTimer = this.kitchenTimeLimit;

          this.isMenuOpen = false;
          this.isTaskListOpen = false;

          this._resetHoldCooking();
          this._spawnRandomCustomerIfPossible();
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

      this.productionManager.updateAll(deltaTime / 1000);

      this._updateCustomerMovement();
      this._updateCustomerSpawning();
      this._refreshCurrentOrderReference();
      await this._updateHoldCooking();

      for (const customer of this.customers) {
        if (customer.isVisible && customer.order && customer._phase === "WAITING") {
          customer.waitTimer = this.kitchenTimer;
        }
      }

      const visibleCustomers = this.customers.filter(c => c.isVisible);

      if (
        this.servedOrdersCount >= this.totalOrdersToServe &&
        this.orderQueue.length === 0 &&
        visibleCustomers.length === 0
      ) {
        this.success = true;
        this.phase = "END";
        this._resetHoldCooking();
        this.showMessage("Night completed!");
        console.log("[Kitchen] All orders served.");
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
    const background = this.game.assetManager.getImage(this.background);
    if (background) {
      image(
        background,
        0,
        this.uiBar.size.y,
        this.game.view.size.x,
        this.game.view.size.y - this.uiBar.size.y
      );
    }

    super.draw();

    // station labels go below the stations
    this._drawCustomerOrderLabels();
    this._drawStationDishLabels();

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

  // =========================================================
  // CUSTOMER / ORDER FLOW
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

  _getRandomSpawnInterval() {
    return random(this.customerSpawnIntervalMin, this.customerSpawnIntervalMax);
  }

  _getAvailableCustomerSlotIndex() {
    const occupied = new Set();

    for (const customer of this.customers) {
      if (customer.isVisible && typeof customer._slotIndex === "number") {
        occupied.add(customer._slotIndex);
      }
    }

    const available = [];
    for (let i = 0; i < this.customerTargetSlots.length; i++) {
      if (!occupied.has(i)) available.push(i);
    }

    if (available.length === 0) return -1;
    return random(available);
  }

  _spawnRandomCustomerIfPossible() {
    if (this.orderQueue.length === 0) return false;

    const visibleCount = this.customers.filter(c => c.isVisible).length;
    if (visibleCount >= this.maxCustomersOnScreen) return false;

    const slotIndex = this._getAvailableCustomerSlotIndex();
    if (slotIndex === -1) return false;

    const recipeId = this.orderQueue.shift();
    const recipe = this.menu.getRecipe(recipeId);
    if (!recipe) return false;

    const targetPos = this.customerTargetSlots[slotIndex];

    const customer = new Customer_MVP(
      this.game,
      new Vector2(this.customerSpawnX, targetPos.y),
      null
    );

    customer.isVisible = true;
    customer.order = new Order(recipe.id, recipe.rewardCoins);
    customer.waitTimer = this.kitchenTimer;

    // scene-controlled motion
    customer._slotIndex = slotIndex;
    customer._targetPos = new Vector2(targetPos.x, targetPos.y);
    customer._phase = "ENTERING";
    customer._customerId = this.nextCustomerId++;
    customer.state = "ENTERING";

    this.customers.push(customer);
    this.entities.push(customer);

    this.customerSpawnTimer = this._getRandomSpawnInterval();

    console.log("[Kitchen] Spawned customer:", customer._customerId, recipe.id);
    this.showMessage(`Customer wants ${this._getDisplayName(recipe.id)}`);
    return true;
  }

  _updateCustomerSpawning() {
    if (this.orderQueue.length === 0) return;

    if (this.customers.filter(c => c.isVisible).length >= this.maxCustomersOnScreen) {
      return;
    }

    this.customerSpawnTimer -= deltaTime / 1000;
    if (this.customerSpawnTimer <= 0) {
      this._spawnRandomCustomerIfPossible();
    }
  }

  _updateCustomerMovement() {
    const dt = deltaTime / 1000;

    for (const customer of this.customers) {
      if (!customer.isVisible) continue;

      if (customer._phase === "ENTERING") {
        customer.pos.x -= this.customerMoveSpeed * dt;
        customer.pos.y = customer._targetPos.y;

        if (customer.pos.x <= customer._targetPos.x) {
          customer.pos.x = customer._targetPos.x;
          customer._phase = "WAITING";
          customer.state = "WAITING";
        }
      } else if (customer._phase === "LEAVING") {
        customer.pos.x += this.customerMoveSpeed * dt;

        if (customer.pos.x >= this.customerLeaveX) {
          customer.isVisible = false;
          customer.order = null;
        }
      }
    }

    // remove invisible customers from entity list + array
    const stillVisible = [];
    for (const customer of this.customers) {
      if (customer.isVisible) {
        stillVisible.push(customer);
      } else {
        const idx = this.entities.indexOf(customer);
        if (idx !== -1) this.entities.splice(idx, 1);
      }
    }
    this.customers = stillVisible;
  }

  _getVisibleWaitingCustomers() {
    return this.customers
      .filter(c => c.isVisible && c.order && c._phase === "WAITING")
      .sort((a, b) => a._customerId - b._customerId);
  }

  _refreshCurrentOrderReference() {
    const waitingCustomers = this._getVisibleWaitingCustomers();
    this.currentOrder = waitingCustomers.length > 0 ? waitingCustomers[0].order : null;
  }

  _findMatchingCustomerForHeldDish(recipeId) {
    const waitingCustomers = this._getVisibleWaitingCustomers();
    return waitingCustomers.find(c => c.order.recipeId === recipeId) || null;
  }

  _getRelevantTaskForCurrentCustomers() {
    const waitingCustomers = this._getVisibleWaitingCustomers();
    const tasks = this.productionManager.getTasks();

    for (const customer of waitingCustomers) {
      const recipeId = customer.order.recipeId;
      const task = tasks.find(t => t.recipeId === recipeId && t.status === "PENDING");
      if (task) {
        return { customer, task };
      }
    }

    return null;
  }

  _spawnNextCustomerOrder() {
    // compatibility wrapper if any old code still calls this
    this._spawnRandomCustomerIfPossible();
  }

  // =========================================================
  // COOK / SERVE LOGIC
  // =========================================================

  _getStationType(station) {
    return station.type || station.stationType || station.kind || null;
  }

  _getNearbyMatchingStation(recipe) {
    if (!recipe) return null;

    let bestStation = null;
    let bestDistance = Infinity;

    for (const station of this.stations) {
      const stationType = this._getStationType(station);
      if (stationType !== recipe.stationType) continue;
      if (!this.player.isNear(station)) continue;

      const dx = this.player.pos.x - station.pos.x;
      const dy = this.player.pos.y - station.pos.y;
      const distSq = dx * dx + dy * dy;

      if (distSq < bestDistance) {
        bestDistance = distSq;
        bestStation = station;
      }
    }

    return bestStation;
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
    this.holdCookCustomerId = null;
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

    if (!spaceDown) {
      if (this.holdCookProgress > 0) {
        this.showMessage("Cooking interrupted");
      }
      this._resetHoldCooking();
      return;
    }

    // If holding a dish, try to serve a matching customer at the counter
    if (this.player.heldDish) {
      const matchingCustomer = this._findMatchingCustomerForHeldDish(this.player.heldDish);
      this._resetHoldCooking();

      if (!matchingCustomer) {
        this.showMessage("No customer wants this dish");
        return;
      }

      if (this.player.isNear(this.counter)) {
        this._tryServeMatchingCustomer(matchingCustomer);
      } else {
        this.showMessage(`Serve ${this._getDisplayName(this.player.heldDish)} at counter`);
      }
      return;
    }

    const target = this._getRelevantTaskForCurrentCustomers();
    if (!target) {
      this._resetHoldCooking();
      this.showMessage("No remaining task for waiting customers");
      return;
    }

    const activeTask = target.task;
    const targetCustomer = target.customer;
    const recipe = this.menu.getRecipe(activeTask.recipeId);

    if (!recipe) {
      this._resetHoldCooking();
      this.showMessage("Recipe not found");
      return;
    }

    const station = this._getNearbyMatchingStation(recipe);
    if (!station) {
      this._resetHoldCooking();
      this.showMessage(`Move near ${this._getDisplayName(activeTask.recipeId)} station`);
      return;
    }

    if (
      this.holdCookTaskId !== activeTask.id ||
      this.holdCookCustomerId !== targetCustomer._customerId
    ) {
      this.holdCookTaskId = activeTask.id;
      this.holdCookRecipeId = activeTask.recipeId;
      this.holdCookStation = station;
      this.holdCookProgress = 0;
      this.holdCookDuration = recipe.cookTime || 1;
      this.holdCookCustomerId = targetCustomer._customerId;
    }

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

  _tryServeMatchingCustomer(customer) {
    if (!customer || !customer.order) {
      this.showMessage("No matching customer");
      return;
    }

    const servedRecipeId = customer.order.recipeId;

    const served = this.counter.tryServe(
      this.player,
      customer,
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

    this.servedOrdersCount += 1;
    customer._phase = "LEAVING";
    customer.state = "SERVED";

    console.log("[Kitchen] Served:", servedRecipeId, "for customer", customer._customerId);
    this.showMessage(`Served ${this._getDisplayName(servedRecipeId)}!`);

    this._resetHoldCooking();
  }

  _tryServeCurrentOrder() {
    // compatibility wrapper
    if (!this.player.heldDish) {
      this.showMessage("Wrong dish or no dish");
      return;
    }

    const customer = this._findMatchingCustomerForHeldDish(this.player.heldDish);
    if (!customer) {
      this.showMessage("No customer wants this dish");
      return;
    }

    this._tryServeMatchingCustomer(customer);
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
  // PLANNING HELPERS
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

  // =========================================================
  // UI DRAWING
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

  _drawCustomerOrderLabels() {
  if (this.phase !== "PRODUCTION") return;
  if (!this.customers || this.customers.length === 0) return;

  push();

  for (const customer of this.customers) {
    if (!customer.isVisible || !customer.order) continue;

    const relPos = this.game.view.localToScreen(customer.pos);
    const dishName = this._getDisplayName(customer.order.recipeId);

    const boxW = 120;
    const boxH = 28;
    const boxX = relPos.x - boxW / 2;
    const boxY = relPos.y - 38;

    fill(255, 248, 220, 235);
    stroke(80, 60, 20);
    rect(boxX, boxY, boxW, boxH, 6);

    fill(20);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(13);
    text(dishName, boxX + boxW / 2, boxY + boxH / 2);
  }

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
    const scale = this._getWorldScale();
    const drawW = this.holdCookStation.size.x * scale.x;
    const drawH = this.holdCookStation.size.y * scale.y;

    const remain = Math.max(0, this.holdCookDuration - this.holdCookProgress);
    const labelText = `Cooking ${remain.toFixed(1)}s`;

    push();

    const badgeMarginX = 10;
    const badgeMarginY = 8;
    const badgeX = relPos.x + badgeMarginX;
    const badgeY = relPos.y + badgeMarginY;
    const badgeW = Math.max(80, drawW - badgeMarginX * 2);
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

  _drawStationDishLabels() {
    push();

    const scale = this._getWorldScale();

    for (const station of this.stations) {
      const stationType = this._getStationType(station);
      const label = this.stationDishLabels[stationType] || stationType || "STATION";

      const relPos = this.game.view.localToScreen(station.pos);
      const drawW = station.size.x * scale.x;
      const drawH = station.size.y * scale.y;

      const labelW = 116;
      const labelH = 26;
      const labelX = relPos.x + drawW / 2 - labelW / 2;
      const labelY = relPos.y + drawH + 8;

      fill(255, 248, 220, 235);
      stroke(80, 60, 20);
      rect(labelX, labelY, labelW, labelH, 6);

      fill(20);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(13);
      text(label, labelX + labelW / 2, labelY + labelH / 2);
    }

    pop();
  }

  _getWorldScale() {
    const origin = this.game.view.localToScreen(new Vector2(0, 0));
    const one = this.game.view.localToScreen(new Vector2(1, 1));

    return {
      x: Math.abs(one.x - origin.x),
      y: Math.abs(one.y - origin.y),
    };
  }

  // =========================================================
  // SMALL HELPERS
  // =========================================================

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

    for (const customer of this.customers) {
      const idx = this.entities.indexOf(customer);
      if (idx !== -1) this.entities.splice(idx, 1);
    }
    this.customers = [];
    this.currentOrder = null;

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
