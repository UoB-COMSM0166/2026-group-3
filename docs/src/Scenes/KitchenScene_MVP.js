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
    this.endOverlayButton = null;
    this.nightStartCoins = this.state?.coins || 0;
    this.nightEarnedCoins = 0;

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
      new Vector2(5.8, 2.3),
      new Vector2(5.8, 4.5),
      new Vector2(5.8, 6.7),
    ];
    this.customerSpawnX = 14.2;
    this.customerLeaveX = 15.4;
    this.customerMoveSpeed = 4.7;

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
    this.pendingRecipeId = "rotten_burger";
    this.pendingQuantity = 0;
    this.cookPriorityRecipeId = null;

    // Hold-to-cook state
    this.holdCookTaskId = null;
    this.holdCookRecipeId = null;
    this.holdCookStation = null;
    this.holdCookProgress = 0;
    this.holdCookDuration = 0;
    this.holdCookCustomerId = null;
    this.spaceLastFrame = false;
    this.showInteractDebug = false;

    // Bubble cache
    this._bubbleImage = null;
    this._bubbleLoadTried = false;

    // Placeholder descriptions
    this.recipeDescriptions = {
      rotten_burger: "A wasteland classic. We've hand-pressed the finest zombie mince into a patty that's surprisingly juicy-though we recommend not asking what the 'juice' actually is. Flame-grilled to mask the slight scent of decay. It's the ultimate comfort food for the end of the world.",
      mutant_soup: "\"Doomsday Fried Drumstick\" double-breaded and deep-fried to a perfect, radioactive golden-brown. The thick crust provides a satisfying crunch that helps you forget the rubbery texture of the 'poultry' underneath. It's finger-lickin' good, provided you've still got all your fingers.",
      toxic_stew: "A steaming bowl of scavenged noodles swimming in a rich, dark marrow broth. The 'meat' slices are slow-simmered until they stop twitching, absorbing all the salty goodness of the soup. It's a bowl of warmth in a cold, dead world.",
      bone_bbq: "The crown jewel of the kitchen. These premium ribs are slow-smoked for 12 hours over charred driftwood and old-world furniture. The meat falls right off the bone-which is convenient, because the zombie it came from didn't need them anymore anyway. Sweet, smoky, and suspiciously tender.",
      ultimate_feast: "Brewed in a repurposed radiator using fermented fungal spores and a prayer. It's got a thick head, a copper aftertaste, and enough kick to make a shambler sprint. Best served lukewarm. Drink enough of these, and the apocalypse starts looking like a party.",
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

    // ===== =====
    const stationSize = new Vector2(1.45, 1.15);
const startX = 0.25;
const startY = 1.95;
const stationGap = 1.25;

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
    this.counter = new Counter_MVP(game, new Vector2(3.2, 2.65));
    this.counter.size = new Vector2(1.9, 5.85);

    // Colliders
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(1.45, 9) },
      { pos: this.counter.pos.add(new Vector2(1.0, 0)), size: this.counter.size.add(new Vector2(-1.0, -1.5)) },
      // Keep chef in the full tiled kitchen area (behind the counter only).
      { pos: new Vector2(4.9, 1.8), size: new Vector2(11, 7.4) },
      // Block walking into the top wall area.
      { pos: new Vector2(0, 0), size: new Vector2(4.9, 1.35) },
      // Block walking into the bottom wooden frame area.
      { pos: new Vector2(0, 8.6), size: new Vector2(4.9, 0.85) },
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
        if (this.phase === "END" && this._isInside(mx, my, this.endOverlayButton)) {
          this._resetAndReturnToShooter();
          return;
        }

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

      if (this.phase === "END" && event.key === "Enter") {
        this._resetAndReturnToShooter();
        return;
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
          this.nightStartCoins = this.state?.coins || 0;
          this.nightEarnedCoins = 0;

          this.isMenuOpen = false;
          this.isTaskListOpen = false;

          this._resetHoldCooking();
          this._spawnRandomCustomerIfPossible();
          console.log("[Kitchen] Entered PRODUCTION");
        }
      }

      // Production phase: let player choose cook priority dish
      if (this.phase === "PRODUCTION") {
        if (event.key === "1") this._setCookPriorityRecipe("rotten_burger");
        if (event.key === "2") this._setCookPriorityRecipe("mutant_soup");
        if (event.key === "3") this._setCookPriorityRecipe("toxic_stew");
        if (event.key === "4") this._setCookPriorityRecipe("bone_bbq");
        if (event.key === "5") this._setCookPriorityRecipe("ultimate_feast");
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
        this.showMessage("Day completed!");
        console.log("[Kitchen] All orders served.");
      }
    }

    // End phase
    if (this.phase === "END") {
      this.nightEarnedCoins = Math.max(0, (this.state?.coins || 0) - this.nightStartCoins);
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

    this._drawCustomerOrderLabels();
    this._drawStationDishLabels();
    this._drawStationHoldSpacePrompt();
    this._drawCounterServePrompt();

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
    this._drawInteractDebugOverlay();

    if (this.phase === "END") {
      this._drawEndSummaryOverlay();
    }

    if (this.message) {
      let messageX = 0;
      let messageY = 0;
      let messageW = 0;
      let messageH = 0;
      let shouldDrawMessage = false;

      if (
        this.phase === "PLANNING" &&
        this.isMenuOpen &&
        (
          this.message === "Not enough of ingredients" ||
          this.message === "Plan at least one dish" ||
          this.message === "Set a quantity first"
        )
      ) {
        const layout = this._getPlanningBoardLayout();
        const panelX = width / 2 - layout.midW / 2;
        const panelY = layout.panelY;
        const panelW = layout.midW;

        // Place insufficient-ingredients notice under "AVAILABLE DISHES".
        messageX = panelX + 14;
        messageY = panelY + 34;
        messageW = panelW - 28;
        messageH = 22;
        shouldDrawMessage = true;
      } else if (this.phase === "PLANNING" && this.isTaskListOpen) {
        const layout = this._getPlanningBoardLayout();
        const panelX = width / 2 - layout.midW / 2 - layout.panelGap - layout.leftW;
        const panelY = layout.panelY;
        const panelW = layout.leftW;

        // Place status message just below the "TODAY'S MENU" header.
        messageX = panelX + 14;
        messageY = panelY + 34;
        messageW = panelW - 28;
        messageH = 22;
        shouldDrawMessage = true;
      }

      if (shouldDrawMessage) {
        push();
        fill(255, 245, 200);
        stroke(0);
        rect(messageX, messageY, messageW, messageH);

        fill(0);
        noStroke();
        textSize(13);
        textAlign(LEFT, CENTER);
        text(this.message, messageX + 10, messageY + messageH / 2);
        pop();
      }
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

    const queuePickIndex = Math.floor(Math.random() * this.orderQueue.length);
    const [recipeId] = this.orderQueue.splice(queuePickIndex, 1);
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

  _getNearbyInteractableStation() {
    const interactPoint = this._getPlayerStationInteractPoint();

    let bestStation = null;
    let bestDistance = Infinity;

    for (const station of this.stations) {
      const anchor = this._getStationInteractAnchor(station);
      const dx = interactPoint.x - anchor.x;
      const dy = interactPoint.y - anchor.y;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);
      const inRange = absX <= 0.78 && absY <= 0.30;
      if (!inRange) continue;

      const distSq = dx * dx + dy * dy;
      if (distSq < bestDistance) {
        bestDistance = distSq;
        bestStation = station;
      }
    }

    return bestStation;
  }

  _getRelevantTaskForCurrentCustomers(preferredRecipeId = null) {
    const waitingCustomers = this._getVisibleWaitingCustomers();
    const tasks = this.productionManager.getTasks();

    const tryPickRecipe = (recipeId) => {
      if (!recipeId) return null;
      const customer = waitingCustomers.find(c => c.order.recipeId === recipeId);
      if (!customer) return null;

      const task = tasks.find(t => t.recipeId === recipeId && t.status === "PENDING");
      if (!task) return null;

      return { customer, task };
    };

    // 1) Station-selected dish (player standing near a station)
    const preferredTask = tryPickRecipe(preferredRecipeId);
    if (preferredTask) return preferredTask;

    // Player-selected recipe gets first priority when possible.
    if (this.cookPriorityRecipeId) {
      const hotkeyPreferredTask = tryPickRecipe(this.cookPriorityRecipeId);
      if (hotkeyPreferredTask) return hotkeyPreferredTask;
    }

    for (const customer of waitingCustomers) {
      const recipeId = customer.order.recipeId;
      const task = tasks.find(t => t.recipeId === recipeId && t.status === "PENDING");
      if (task) {
        return { customer, task };
      }
    }

    return null;
  }

  _setCookPriorityRecipe(recipeId) {
    if (!recipeId) return;
    this.cookPriorityRecipeId = recipeId;
    this.showMessage(`Cook priority: ${this._getDisplayName(recipeId)}`);
  }

  _spawnNextCustomerOrder() {
    this._spawnRandomCustomerIfPossible();
  }

  // =========================================================
  // COOK / SERVE LOGIC
  // =========================================================

  _getStationType(station) {
    return station.type || station.stationType || station.kind || null;
  }

  _getPlayerStationInteractPoint() {
    // 厨师站在站台右边时，用身体左侧中部作为交互点
    return new Vector2(
      this.player.pos.x + 0.18,
      this.player.pos.y + this.player.size.y * 0.58
    );
  }

  _getStationInteractAnchor(station) {
    // 每个站台唯一交互点：机器右侧中部
    return new Vector2(
      station.pos.x + station.size.x + 0.08,
      station.pos.y + station.size.y * 0.58
    );
  }

  _getNearbyMatchingStation(recipe) {
    if (!recipe) return null;

    const interactPoint = this._getPlayerStationInteractPoint();

    let bestStation = null;
    let bestDistance = Infinity;

    for (const station of this.stations) {
      const stationType = this._getStationType(station);
      if (stationType !== recipe.stationType) continue;

      const anchor = this._getStationInteractAnchor(station);
      const dx = interactPoint.x - anchor.x;
      const dy = interactPoint.y - anchor.y;

      const absX = Math.abs(dx);
      const absY = Math.abs(dy);

      // 严格限制纵向，彻底防止串到上下站台
      const inRange = absX <= 0.78 && absY <= 0.30;
      if (!inRange) continue;

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

    const nearbyStation = this._getNearbyInteractableStation();
    const stationType = nearbyStation ? this._getStationType(nearbyStation) : null;
    const stationRecipeId = stationType ? this._getRecipeIdForStationType(stationType) : null;

    const target = this._getRelevantTaskForCurrentCustomers(stationRecipeId);
    if (!target) {
      this._resetHoldCooking();
      if (stationRecipeId) {
        this.showMessage(`No waiting customer for ${this._getDisplayName(stationRecipeId)}`);
      } else {
        this.showMessage("No remaining task for waiting customers");
      }
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
      this.showMessage("Not enough of ingredients");
    }
  }

  _decreasePending() {
    this.pendingQuantity = Math.max(0, this.pendingQuantity - 1);
  }

  _confirmPendingDish() {
    if (!this.pendingRecipeId) return;

    if (this.pendingQuantity <= 0) {
      this.showMessage("Set a quantity first");
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

  _getRecipeIdForStationType(stationType) {
    const map = {
      pot: "toxic_stew",
      grill: "bone_bbq",
      oven: "rotten_burger",
      prep: "mutant_soup",
      special: "ultimate_feast",
    };

    return map[stationType] || null;
  }

  _getBubbleImage() {
    if (this._bubbleLoadTried) return this._bubbleImage;

    this._bubbleLoadTried = true;

    const fromAsset =
      this.game.assetManager.getImage("UI Bubble") ||
      this.game.assetManager.getImage("bubble.png") ||
      this.game.assetManager.getImage("bubble");

    if (fromAsset) {
      this._bubbleImage = fromAsset;
      return this._bubbleImage;
    }

    try {
      this._bubbleImage = loadImage("./assets/UI/bubble.png");
    } catch (e) {
      this._bubbleImage = null;
    }

    return this._bubbleImage;
  }

  _getDishIconImage(recipeId) {
    if (!recipeId) return null;

    const dishImageMap = {
      rotten_burger: "Dish ZOMBURGER",
      mutant_soup: "Dish DFD",
      toxic_stew: "Dish ZOMMEN",
      bone_bbq: "Dish ZOMBBQ",
      ultimate_feast: "Dish ZOMBEER",
    };

    const mappedImage = this.game.assetManager.getImage(dishImageMap[recipeId]);
    if (mappedImage) return mappedImage;

    return (
      this.game.assetManager.getImage(`${recipeId}.png`) ||
      this.game.assetManager.getImage(recipeId) ||
      null
    );
  }

  _drawBubbleWithDish(centerX, centerY, recipeId, bubbleW = 56, bubbleH = 46, iconSize = 22, progressRatio = null) {
    const bubbleImg = this._getBubbleImage();
    const dishImg = this._getDishIconImage(recipeId);
    const globalBubbleAssetScale = 0.85;
    const iconScaleMultiplier = 2.25 * globalBubbleAssetScale;
    const dishScaleOverrides = {
      rotten_burger: 0.88,
      ultimate_feast: 0.88,
    };
    const dishYOffsetOverrides = {
      rotten_burger: -2,
      ultimate_feast: -2,
    };
    const iconRecipeMultiplier = dishScaleOverrides[recipeId] ?? 1;
    const dishRecipeYOffset = dishYOffsetOverrides[recipeId] ?? 0;
    const bubbleScaleMultiplier = 1.5 * globalBubbleAssetScale;
    const scaledBubbleW = bubbleW * bubbleScaleMultiplier;
    const scaledBubbleH = bubbleH * bubbleScaleMultiplier;
    const scaledIconSize = iconSize * iconScaleMultiplier * iconRecipeMultiplier;
    let dishTopY = centerY - scaledIconSize / 2 - 2;

    push();

    if (bubbleImg && bubbleImg.width > 0) {
      image(
        bubbleImg,
        centerX - scaledBubbleW / 2,
        centerY - scaledBubbleH / 2,
        scaledBubbleW,
        scaledBubbleH
      );
    } else {
      fill(255);
      stroke(0);
      strokeWeight(2);
      rect(centerX - scaledBubbleW / 2, centerY - scaledBubbleH / 2, scaledBubbleW, scaledBubbleH, 10);
      triangle(
        centerX - 6,
        centerY + scaledBubbleH / 2 - 2,
        centerX + 6,
        centerY + scaledBubbleH / 2 - 2,
        centerX,
        centerY + scaledBubbleH / 2 + 7
      );
    }

    if (dishImg) {
      let dishDrawW = scaledIconSize;
      let dishDrawH = scaledIconSize;
      if (dishImg.width > 0 && dishImg.height > 0) {
        const aspectRatio = dishImg.width / dishImg.height;
        if (aspectRatio >= 1) {
          dishDrawH = scaledIconSize / aspectRatio;
        } else {
          dishDrawW = scaledIconSize * aspectRatio;
        }
      }
      dishTopY = centerY - dishDrawH / 2 - 4 + dishRecipeYOffset;
      image(
        dishImg,
        centerX - dishDrawW / 2,
        dishTopY,
        dishDrawW,
        dishDrawH
      );
    } else {
      fill(40);
      noStroke();
      textAlign(CENTER, CENTER);
      textSize(8);
      text(this._getDisplayName(recipeId), centerX, centerY - 1);
    }

    if (typeof progressRatio === "number") {
      const clamped = Math.max(0, Math.min(1, progressRatio));
      const barW = Math.max(16, (scaledBubbleW - 18) * 0.5);
      const barH = 5;
      const barX = centerX - barW / 2;
      // Keep the timer inside the bubble and slightly above the dish icon.
      const barY = dishTopY - 7;

      fill(215, 215, 215, 230);
      stroke(110);
      strokeWeight(1);
      rect(barX, barY, barW, barH, 2);

      noStroke();
      fill(75, 190, 85, 235);
      rect(barX + 1, barY + 1, Math.max(0, (barW - 2) * clamped), Math.max(0, barH - 2), 1);
    }

    pop();
  }

  _drawCustomerOrderLabels() {
    if (this.phase !== "PRODUCTION") return;
    if (!this.customers || this.customers.length === 0) return;

    const scale = this._getWorldScale();
    const bubbleOffsetX = 0.05 * scale.x;
    const bubbleOffsetY = -0.15 * scale.y;

    for (const customer of this.customers) {
      if (!customer.isVisible || !customer.order || customer._phase !== "WAITING") continue;

      const relPos = this.game.view.localToScreen(customer.pos);
      const drawW = customer.size.x * scale.x;

      const bubbleX = relPos.x + drawW / 2 + bubbleOffsetX;
      const bubbleY = relPos.y - 24 + bubbleOffsetY;
      const waitProgress = this.kitchenTimeLimit > 0
        ? customer.waitTimer / this.kitchenTimeLimit
        : 0;

      this._drawBubbleWithDish(
        bubbleX,
        bubbleY,
        customer.order.recipeId,
        56,
        52,
        22,
        waitProgress
      );
    }
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

  _drawPaperPanel(panelX, panelY, panelW, panelH) {
    const cornerSprite = this.game.assetManager.getImage("UI Paper Corner");
    const horizontalEdgeSprite = this.game.assetManager.getImage("UI Paper Horizontal Edge");
    const verticalEdgeSprite = this.game.assetManager.getImage("UI Paper Vertical Edge");
    const middleSprite = this.game.assetManager.getImage("UI Paper Middle");

    if (cornerSprite && horizontalEdgeSprite && verticalEdgeSprite && middleSprite) {
      const x = Math.round(panelX);
      const y = Math.round(panelY);
      const w = Math.round(panelW);
      const h = Math.round(panelH);
      const cornerSize = Math.round(Math.min(w / 2, h / 2, 28));
      const innerX = x + cornerSize;
      const innerY = y + cornerSize;
      const innerW = Math.max(0, w - (2 * cornerSize));
      const innerH = Math.max(0, h - (2 * cornerSize));

      if (innerW > 0 && innerH > 0) {
        image(middleSprite, innerX, innerY, innerW, innerH);
      }

      if (innerW > 0) {
        image(horizontalEdgeSprite, innerX, y, innerW, cornerSize);
        push();
        translate(innerX, y + h);
        scale(1, -1);
        image(horizontalEdgeSprite, 0, 0, innerW, cornerSize);
        pop();
      }

      if (innerH > 0) {
        image(verticalEdgeSprite, x, innerY, cornerSize, innerH);
        push();
        translate(x + w, innerY);
        scale(-1, 1);
        image(verticalEdgeSprite, 0, 0, cornerSize, innerH);
        pop();
      }

      image(cornerSprite, x, y, cornerSize, cornerSize);
      push();
      translate(x + w, y);
      scale(-1, 1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      push();
      translate(x, y + h);
      scale(1, -1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      push();
      translate(x + w, y + h);
      scale(-1, -1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      return;
    }

    fill(255, 245, 220);
    stroke(0);
    rect(panelX, panelY, panelW, panelH, 12);
  }

  _drawBoardPanel(panelX, panelY, panelW, panelH) {
    const cornerSprite = this.game.assetManager.getImage("UI Board Corner");
    const horizontalEdgeSprite = this.game.assetManager.getImage("UI Board Horizontal Edge");
    const verticalEdgeSprite = this.game.assetManager.getImage("UI Board Vertical Edge");
    const middleSprite = this.game.assetManager.getImage("UI Board Middle");

    if (cornerSprite && horizontalEdgeSprite && verticalEdgeSprite && middleSprite) {
      const x = Math.round(panelX);
      const y = Math.round(panelY);
      const w = Math.round(panelW);
      const h = Math.round(panelH);
      const cornerSize = Math.round(Math.min(w / 2, h / 2, 28));
      const innerX = x + cornerSize;
      const innerY = y + cornerSize;
      const innerW = Math.max(0, w - (2 * cornerSize));
      const innerH = Math.max(0, h - (2 * cornerSize));

      if (innerW > 0 && innerH > 0) {
        image(middleSprite, innerX, innerY, innerW, innerH);
      }

      if (innerW > 0) {
        image(horizontalEdgeSprite, innerX, y, innerW, cornerSize);
        push();
        translate(innerX, y + h);
        scale(1, -1);
        image(horizontalEdgeSprite, 0, 0, innerW, cornerSize);
        pop();
      }

      if (innerH > 0) {
        image(verticalEdgeSprite, x, innerY, cornerSize, innerH);
        push();
        translate(x + w, innerY);
        scale(-1, 1);
        image(verticalEdgeSprite, 0, 0, cornerSize, innerH);
        pop();
      }

      image(cornerSprite, x, y, cornerSize, cornerSize);
      push();
      translate(x + w, y);
      scale(-1, 1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      push();
      translate(x, y + h);
      scale(1, -1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      push();
      translate(x + w, y + h);
      scale(-1, -1);
      image(cornerSprite, 0, 0, cornerSize, cornerSize);
      pop();
      return;
    }

    fill(255, 245, 220);
    stroke(0);
    rect(panelX, panelY, panelW, panelH, 12);
  }

  _drawMenuPanel() {
    push();

    const layout = this._getPlanningBoardLayout();
    const panelX = width / 2 - layout.midW / 2;
    const panelY = layout.panelY;
    const panelW = layout.midW;
    const panelH = layout.panelH;
    const minusSprite = this.game.assetManager.getImage("UI Minus");
    const plusSprite = this.game.assetManager.getImage("UI Plus");
    const tickSprite = this.game.assetManager.getImage("UI Tick");
    const coinSprite = this.game.assetManager.getImage("UI Coin");
    const controlsOffsetX = -12;
    const controlsOffsetY = 4;
    const tickOffsetX = 7;
    const controlButtonW = 24;
    const controlButtonH = 20;
    const tickButtonW = 16;
    const tickButtonH = 20;

    this._drawBoardPanel(panelX, panelY, panelW, panelH);

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

      const dishImage = this._getDishIconImage(item.recipeId);
      const thumbX = cardX + 8;
      const thumbY = cardY + 8;
      const thumbSize = 50;

      fill(245, 235, 210);
      stroke(0);
      rect(thumbX, thumbY, thumbSize, thumbSize, 6);

      if (dishImage && dishImage.width > 0) {
        const pad = 5;
        const maxW = thumbSize - pad * 2;
        const maxH = thumbSize - pad * 2;
        const scale = Math.min(maxW / dishImage.width, maxH / dishImage.height);
        const drawW = dishImage.width * scale;
        const drawH = dishImage.height * scale;
        const drawX = thumbX + (thumbSize - drawW) / 2;
        const drawY = thumbY + (thumbSize - drawH) / 2;
        image(dishImage, drawX, drawY, drawW, drawH);
      }

      fill(0);
      noStroke();
      textSize(13);
      textAlign(LEFT, TOP);
      text(`${item.name}`, thumbX + thumbSize + 8, cardY + 10);

      textSize(16);
      fill(80);
      const rewardText = `${recipe ? recipe.rewardCoins : "-"}`;
      const rewardX = thumbX + thumbSize + 8;
      const rewardY = cardY + 34;
      text(rewardText, rewardX, rewardY);
      if (coinSprite) {
        const coinSize = 18;
        image(coinSprite, rewardX + textWidth(rewardText) + 4, rewardY - 2, coinSize, coinSize);
      }

      if (minusSprite) {
        image(minusSprite, panelX + 198 + controlsOffsetX, item.y + 10 + controlsOffsetY, controlButtonW, controlButtonH);
      } else {
        fill(220);
        stroke(0);
        rect(panelX + 198 + controlsOffsetX, item.y + 10 + controlsOffsetY, controlButtonW, controlButtonH, 4);
        fill(0);
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text("-", panelX + 209 + controlsOffsetX, item.y + 19 + controlsOffsetY);
      }

      this.menuButtons.push({
        recipeId: item.recipeId,
        action: "decrease",
        x: panelX + 198 + controlsOffsetX,
        y: item.y + 10 + controlsOffsetY,
        w: controlButtonW,
        h: controlButtonH
      });

      fill(0);
      noStroke();
      textSize(14);
      textAlign(CENTER, CENTER);
      text(pendingShown, panelX + 234 + controlsOffsetX, item.y + 19 + controlsOffsetY);

      if (plusSprite) {
        image(plusSprite, panelX + 246 + controlsOffsetX, item.y + 10 + controlsOffsetY, controlButtonW, controlButtonH);
        if (!canAdd) {
          fill(120, 120, 120, 140);
          noStroke();
          rect(panelX + 246 + controlsOffsetX, item.y + 10 + controlsOffsetY, controlButtonW, controlButtonH, 4);
        }
      } else {
        fill(canAdd ? color(220) : color(170));
        stroke(0);
        rect(panelX + 246 + controlsOffsetX, item.y + 10 + controlsOffsetY, controlButtonW, controlButtonH, 4);
        fill(canAdd ? color(0) : color(90));
        noStroke();
        textSize(14);
        textAlign(CENTER, CENTER);
        text("+", panelX + 257 + controlsOffsetX, item.y + 19 + controlsOffsetY);
      }

      this.menuButtons.push({
        recipeId: item.recipeId,
        action: "increase",
        x: panelX + 246 + controlsOffsetX,
        y: item.y + 10 + controlsOffsetY,
        w: controlButtonW,
        h: controlButtonH
      });

      if (tickSprite) {
        image(tickSprite, panelX + 270 + controlsOffsetX + tickOffsetX, item.y + 10 + controlsOffsetY, tickButtonW, tickButtonH);
      } else {
        fill(isSelected && pendingShown > 0 ? color(215, 235, 205) : color(200));
        stroke(0);
        rect(panelX + 270 + controlsOffsetX + tickOffsetX, item.y + 10 + controlsOffsetY, tickButtonW, tickButtonH, 4);
        fill(0);
        noStroke();
        textSize(10);
        textAlign(CENTER, CENTER);
        text("✓", panelX + 276 + controlsOffsetX + tickOffsetX, item.y + 19 + controlsOffsetY);
      }

      this.menuButtons.push({
        recipeId: item.recipeId,
        action: "confirm",
        x: panelX + 270 + controlsOffsetX + tickOffsetX,
        y: item.y + 10 + controlsOffsetY,
        w: tickButtonW,
        h: tickButtonH
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

    this._drawPaperPanel(panelX, panelY, panelW, panelH);

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
    const coinSprite = this.game.assetManager.getImage("UI Coin");

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
    const detailsShiftY = 36;

    this._drawPaperPanel(panelX, panelY, panelW, panelH);

    fill(0);
    noStroke();
    textSize(18);
    textAlign(LEFT, TOP);
    text("DISH DETAILS", panelX + 14, panelY + 12);

    fill(245, 235, 210);
    stroke(0);
    rect(panelX + 18, panelY + 44, 90, 90, 8);

    const dishImage = this._getDishIconImage(this.pendingRecipeId);
    if (dishImage && dishImage.width > 0) {
      const imageBoxX = panelX + 18;
      const imageBoxY = panelY + 44;
      const imageBoxSize = 90;
      const imagePadding = 8;
      const maxW = imageBoxSize - imagePadding * 2;
      const maxH = imageBoxSize - imagePadding * 2;
      const scale = Math.min(maxW / dishImage.width, maxH / dishImage.height);
      const drawW = dishImage.width * scale;
      const drawH = dishImage.height * scale;
      const drawX = imageBoxX + (imageBoxSize - drawW) / 2;
      const drawY = imageBoxY + (imageBoxSize - drawH) / 2;

      image(dishImage, drawX, drawY, drawW, drawH);
    } else {
      fill(0);
      noStroke();
      textSize(11);
      textAlign(CENTER, CENTER);
      text("IMAGE", panelX + 63, panelY + 89);
    }

    fill(0);
    noStroke();
    textAlign(LEFT, TOP);
    textSize(18);
    text(this._getDisplayName(this.pendingRecipeId), panelX + 128, panelY + 54);

    textSize(16);
    const rewardText = `${recipe.rewardCoins}`;
    const rewardX = panelX + 128;
    const rewardY = panelY + 96;
    text(rewardText, rewardX, rewardY);
    if (coinSprite) {
      const coinSize = 21;
      const coinX = rewardX + textWidth(rewardText) + 4;
      const coinY = rewardY - 2;
      image(coinSprite, coinX, coinY, coinSize, coinSize);
    }

    fill(245, 235, 210);
    stroke(0);
    rect(panelX + 18, panelY + 148, panelW - 36, 180, 8);

    fill(0);
    noStroke();
    textSize(12);
    textAlign(LEFT, TOP);
    text(
      this._getDescription(this.pendingRecipeId),
      panelX + 28,
      panelY + 162,
      panelW - 56,
      160
    );

    fill(0);
    noStroke();
    textSize(15);
    textAlign(LEFT, TOP);
    text("INGREDIENTS", panelX + 18, panelY + 302 + detailsShiftY);

    fill(245, 235, 210);
    stroke(0);
    rect(panelX + 18, panelY + 326 + detailsShiftY, panelW - 36, 110, 8);

    let y = panelY + 340 + detailsShiftY;
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
    text(`Pending quantity: ${this.pendingQuantity}`, panelX + 18, panelY + 446 + detailsShiftY);

    pop();
  }

  _drawStationCountdowns() {
    if (this.phase !== "PRODUCTION") return;
    if (!this.holdCookTaskId || !this.holdCookStation) return;
    if (this.holdCookProgress <= 0) return;

    const relPos = this.game.view.localToScreen(this.holdCookStation.pos);
    const scale = this._getWorldScale();
    const drawW = this.holdCookStation.size.x * scale.x;
    const bubbleOffsetX = 0.25 * scale.x;
    const bubbleOffsetY = -0.15 * scale.y;
    const requestedRecipeIds = this._getRequestedRecipeIds();
    const activeRecipeId =
      this.holdCookRecipeId ||
      this._getRecipeIdForStationType(this._getStationType(this.holdCookStation));
    const isRequested = activeRecipeId ? requestedRecipeIds.has(activeRecipeId) : false;
    const bobOffsetY = isRequested
      ? this._getStationBubbleBobOffset(this.holdCookStation, scale)
      : 0;

    // Match bubble anchor used by _drawStationDishLabels so progress stays attached to bubble.
    const bubbleX = relPos.x + drawW * 0.24 + bubbleOffsetX;
    const bubbleY = relPos.y - 16 + bubbleOffsetY + bobOffsetY;

    const progressRatio = this.holdCookDuration > 0
      ? Math.max(0, Math.min(1, this.holdCookProgress / this.holdCookDuration))
      : 0;

    push();

    // Draw progress bar inside the bubble, above the dish icon.
    const badgeW = 42;
    const badgeH = 9;
    const badgeX = bubbleX - badgeW / 2;
    const badgeY = bubbleY - 6;

    fill(30, 35, 45, 210);
    stroke(245, 235, 205, 220);
    strokeWeight(1);
    rect(badgeX, badgeY, badgeW, badgeH, 5);

    const barPadding = 2;
    const barX = badgeX + barPadding;
    const barY = badgeY + barPadding;
    const barW = badgeW - barPadding * 2;
    const barH = badgeH - barPadding * 2;

    // Empty track
    fill(90, 90, 90, 140);
    noStroke();
    rect(barX, barY, barW, barH, 4);

    // Filled progress
    const fillW = barW * progressRatio;
    stroke(0, 0, 0, 180);
    strokeWeight(0.8);
    fill(116, 210, 120, 235);
    rect(barX, barY, fillW, barH, 4);

    pop();
  }

  _drawStationDishLabels() {
    const scale = this._getWorldScale();
    const bubbleOffsetX = 0.25 * scale.x;
    const bubbleOffsetY = -0.15 * scale.y;
    const requestedRecipeIds = this._getRequestedRecipeIds();

    for (const station of this.stations) {
      const stationType = this._getStationType(station);
      const recipeId = this._getRecipeIdForStationType(stationType);
      if (!recipeId) continue;

      const relPos = this.game.view.localToScreen(station.pos);
      const drawW = station.size.x * scale.x;
      const isRequested = requestedRecipeIds.has(recipeId);
      const bobOffsetY = isRequested
        ? this._getStationBubbleBobOffset(station, scale)
        : 0;

      // bubble 跟着站台走，位置固定在站台左上附近
      const bubbleX = relPos.x + drawW * 0.24 + bubbleOffsetX;
      const bubbleY = relPos.y - 16 + bubbleOffsetY + bobOffsetY;

      this._drawBubbleWithDish(
        bubbleX,
        bubbleY,
        recipeId,
        56,
        46,
        22
      );
    }
  }

  _drawStationHoldSpacePrompt() {
    if (this.phase !== "PRODUCTION") return;
    if (!this.player || !this.stations || this.stations.length === 0) return;

    const station = this._getNearbyInteractableStation();
    if (!station) return;

    const stationType = this._getStationType(station);
    const recipeId = this._getRecipeIdForStationType(stationType);
    if (!recipeId) return;

    const scale = this._getWorldScale();
    const relPos = this.game.view.localToScreen(station.pos);
    const drawW = station.size.x * scale.x;

    const bubbleOffsetX = 0.25 * scale.x;
    const bubbleOffsetY = -0.15 * scale.y;
    const requestedRecipeIds = this._getRequestedRecipeIds();
    const isRequested = requestedRecipeIds.has(recipeId);
    const bobOffsetY = isRequested ? this._getStationBubbleBobOffset(station, scale) : 0;

    const bubbleX = relPos.x + drawW * 0.24 + bubbleOffsetX;
    const bubbleY = relPos.y - 16 + bubbleOffsetY + bobOffsetY;

    const promptY = bubbleY + 34;
    const promptText = "Hold [SPACE]";

    push();
    textSize(11);
    textAlign(CENTER, TOP);

    const textW = textWidth(promptText);
    const padX = 8;
    const padY = 4;
    const boxW = textW + padX * 2;
    const boxH = 18;
    const boxX = bubbleX - boxW / 2;
    const boxY = promptY - padY;

    fill(20, 24, 32, 210);
    stroke(245, 235, 200, 230);
    strokeWeight(1);
    rect(boxX, boxY, boxW, boxH, 6);

    fill(255, 245, 205);
    noStroke();
    text(promptText, bubbleX, promptY);
    pop();
  }

  _drawCounterServePrompt() {
    if (this.phase !== "PRODUCTION") return;
    if (!this.player || !this.counter) return;
    if (!this.player.heldDish) return;

    const scale = this._getWorldScale();
    const counterTopCenter = new Vector2(
      this.counter.pos.x + this.counter.size.x * 0.46 + 0.4,
      this.counter.pos.y + this.counter.size.y * 0.18 + 0.8
    );
    const screenPos = this.game.view.localToScreen(counterTopCenter);

    const time = typeof frameCount === "number" ? frameCount : 0;
    const bob = Math.sin(time * 0.11) * Math.max(2, scale.y * 0.04);
    const promptX = screenPos.x;
    const promptY = screenPos.y - 34 + bob;
    const promptText = "Hold [SPACE] to serve";

    push();
    textSize(12);
    textAlign(CENTER, TOP);

    const textW = textWidth(promptText);
    const padX = 10;
    const boxW = textW + padX * 2;
    const boxH = 20;
    const boxX = promptX - boxW / 2;
    const boxY = promptY - 3;

    fill(20, 24, 32, 215);
    stroke(245, 235, 200, 230);
    strokeWeight(1);
    rect(boxX, boxY, boxW, boxH, 7);

    fill(255, 245, 205);
    noStroke();
    text(promptText, promptX, promptY);
    pop();
  }

  _drawUIButtonBackground(x, y, w, h) {
    const cornerSprite = this.game.assetManager.getImage("UI Button Corner");
    const middleSprite = this.game.assetManager.getImage("UI Button Middle");

    if (cornerSprite && middleSprite) {
      const px = Math.round(x);
      const py = Math.round(y);
      const pw = Math.round(w);
      const ph = Math.round(h);
      const capWidth = Math.round(ph / 2);
      const overlap = 1;
      const middleX = px + capWidth - overlap;
      const middleW = Math.max(0, pw - (2 * capWidth) + (2 * overlap));

      image(cornerSprite, px, py, capWidth, ph);
      image(middleSprite, middleX, py, middleW, ph);

      push();
      translate(px + pw, py);
      scale(-1, 1);
      image(cornerSprite, 0, 0, capWidth, ph);
      pop();
      return;
    }

    fill(240, 220, 160);
    stroke(0);
    rect(x, y, w, h, 10);
  }

  _drawEndSummaryOverlay() {
    const scale = this._getWorldScale();
    const overlayX = width / 2 - 220;
    const overlayY = this.uiBar.size.y + 90 + 1.25 * scale.y;
    const overlayW = 440;
    const overlayH = 290;
    const phaseNum = this.game?.model?.gameState?.phase || 1;

    push();
    fill(0, 0, 0, 135);
    noStroke();
    rect(0, this.uiBar.size.y, width, height - this.uiBar.size.y);

    this._drawBoardPanel(overlayX, overlayY, overlayW, overlayH);

    fill(25);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(34);
    text(`Day ${phaseNum}`, overlayX + overlayW / 2, overlayY + 32);

    textSize(22);
    const madeText = `You made ${this.nightEarnedCoins}`;
    const madeY = overlayY + 108;
    text(madeText, overlayX + overlayW / 2 - 12, madeY);

    const coinSprite = this.game.assetManager.getImage("UI Coin");
    if (coinSprite) {
      const coinSize = 28;
      const textW = textWidth(madeText);
      const coinX = overlayX + overlayW / 2 - 12 + textW / 2 + 8;
      const coinY = madeY - 1;
      image(coinSprite, coinX, coinY, coinSize, coinSize);
    }

    const btnW = 196;
    const btnH = 50;
    const btnX = overlayX + (overlayW - btnW) / 2;
    const btnY = overlayY + overlayH - 82;

    this.endOverlayButton = { x: btnX, y: btnY, w: btnW, h: btnH };
    this._drawUIButtonBackground(btnX, btnY, btnW, btnH);

    fill(20);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(22);
    text("Next Day", btnX + btnW / 2, btnY + btnH / 2 - 1);
    pop();
  }

  _getRequestedRecipeIds() {
    const requested = new Set();
    const waitingCustomers = this._getVisibleWaitingCustomers();

    for (const customer of waitingCustomers) {
      const recipeId = customer?.order?.recipeId;
      if (recipeId) requested.add(recipeId);
    }

    return requested;
  }

  _getStationBubbleBobOffset(station, scale) {
    const time = typeof frameCount === "number" ? frameCount : 0;
    const stationIndex = Math.max(0, this.stations.indexOf(station));
    const phaseShift = stationIndex * 0.6;
    const speed = 0.11;
    const amplitudePx = Math.max(1.8, Math.min(3.2, scale.y * 0.035));
    return Math.sin(time * speed + phaseShift) * amplitudePx;
  }

  _drawInteractDebugOverlay() {
    if (!this.showInteractDebug || !this.player || !this.stations) return;

    const playerPoint = this._getPlayerStationInteractPoint();
    const playerScreen = this.game.view.localToScreen(playerPoint);

    push();
    stroke(255, 0, 0, 190);
    strokeWeight(2);
    fill(255, 0, 0, 210);

    // Player interact point marker.
    circle(playerScreen.x, playerScreen.y, 8);

    // Station anchor markers and connector lines.
    for (const station of this.stations) {
      const anchor = this._getStationInteractAnchor(station);
      const anchorScreen = this.game.view.localToScreen(anchor);

      line(playerScreen.x, playerScreen.y, anchorScreen.x, anchorScreen.y);
      circle(anchorScreen.x, anchorScreen.y, 8);
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
