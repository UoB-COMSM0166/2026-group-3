import { Scene } from "../Core/Scene.js";
import { Vector2 } from "../Utility/Vector2.js";

import { GameState } from "../Core/GameState.js";
import { MenuData } from "../Core/MenuData.js";

import { PlayerChef_MVP } from "../Entities/PlayerChef_MVP.js";
import { KitchenStation_MVP } from "../Entities/KitchenStation_MVP.js";
import { Counter_MVP } from "../Entities/Counter_MVP.js";
import { Customer_MVP } from "../Entities/Customer_MVP.js";

import { TaskList } from "../Core/TaskList.js";
import { ProductionManager } from "../Core/ProductionManager.js";
import { SalesSystem } from "../Core/SalesSystem.js";

export class KitchenScene_MVP extends Scene {
  constructor(game) {
    super(game);

    console.log("KitchenScene_MVP loaded");

    // ===== Core Logic =====
    this.state = new GameState();
    this.menu = new MenuData();
    this.time = "Night";

    this.taskList = new TaskList();
    this.productionManager = new ProductionManager();
    this.salesSystem = new SalesSystem();
    this.phase = "PLANNING";

    this._loggedDoneTaskIds = new Set();

    // ===== UI panel states (default closed) =====
    this.isMenuOpen = false;
    this.isTaskListOpen = false;

    // ===== UI hitboxes =====
    this.menuButtons = [];
    this.menuHoverZones = [];

    this.menuCloseButton = null;
    this.taskCloseButton = null;
    this.menuOpenTab = null;
    this.taskOpenTab = null;

    // ===== Selling flow state =====
    this.saleInProgress = false;
    this.saleStage = "IDLE"; // IDLE | ENTERING | TO_COUNTER | TO_SEAT | EATING | LEAVING
    this.saleTimer = 0;
    this.saleSettled = false;

    // positions for customer selling animation
    this.doorPos = new Vector2(15.2, 8.0);
    this.counterServePos = new Vector2(12.2, 6.8);
    this.seatPos = new Vector2(12.8, 2.4);
    this.exitPos = new Vector2(16.2, 8.5);

    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] TaskList:", this.taskList.getTasks());
    console.log(
      "[Kitchen] TaskList feasible:",
      this.taskList.isFeasible(this.state.inventory, this.menu)
    );

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

    // ===== Customer (selling-stage visual role only) =====
    this.customer = new Customer_MVP(game, this.doorPos, null);
    this.customer.pos = new Vector2(this.doorPos.x, this.doorPos.y);

    // ===== Colliders =====
    this.colliders = [
      { pos: new Vector2(0, 0), size: new Vector2(4.8, 9) },
      { pos: this.counter.pos, size: this.counter.size },
    ];

    // ===== Register Remaining Entities =====
    this.entities.push(
      this.player,
      this.counter,
      this.customer
    );
  }

  update(events) {
    const oldPos = new Vector2(this.player.pos.x, this.player.pos.y);

    super.update(events);

    for (const c of this.colliders) {
      if (this._aabbOverlap(this.player.pos, this.player.size, c.pos, c.size)) {
        this.player.pos.x = oldPos.x;
        this.player.pos.y = oldPos.y;
        break;
      }
    }

    if (this.phase === "PRODUCTION") {
      this.productionManager.updateAll(0.02);

      for (const task of this.productionManager.getDoneTasks()) {
        if (!this._loggedDoneTaskIds.has(task.id)) {
          this._loggedDoneTaskIds.add(task.id);
          console.log("[Kitchen] Task is now DONE:", task);
        }
      }
    }

    if (this.phase === "SELLING" && this.saleInProgress) {
      this._updateSellingFlow();
    }

    for (const event of events) {
      // ===== Click: panel open/close buttons (all phases) =====
      if (event.type === "click") {
        if (this._isInside(mouseX, mouseY, this.menuCloseButton)) {
          this.isMenuOpen = false;
          console.log("[Kitchen] Menu panel:", this.isMenuOpen);
          return;
        }

        if (this._isInside(mouseX, mouseY, this.taskCloseButton)) {
          this.isTaskListOpen = false;
          console.log("[Kitchen] Task list panel:", this.isTaskListOpen);
          return;
        }

        if (this._isInside(mouseX, mouseY, this.menuOpenTab)) {
          this.isMenuOpen = true;
          console.log("[Kitchen] Menu panel:", this.isMenuOpen);
          return;
        }

        if (this._isInside(mouseX, mouseY, this.taskOpenTab)) {
          this.isTaskListOpen = true;
          console.log("[Kitchen] Task list panel:", this.isTaskListOpen);
          return;
        }
      }

      // ===== Keyboard toggles still available in all phases =====
      if (event.key === "m" || event.key === "M") {
        this.isMenuOpen = !this.isMenuOpen;
        console.log("[Kitchen] Menu panel:", this.isMenuOpen);
      }

      if (event.key === "t" || event.key === "T") {
        this.isTaskListOpen = !this.isTaskListOpen;
        console.log("[Kitchen] Task list panel:", this.isTaskListOpen);
      }

      // ===== Planning phase only =====
      if (this.phase === "PLANNING") {
        if (event.key === "1") {
          this.taskList.increase("rotten_burger", 1);
          console.log("[Kitchen] Added rotten_burger");
        }
        if (event.key === "2") {
          this.taskList.increase("toxic_stew", 1);
          console.log("[Kitchen] Added toxic_stew");
        }
        if (event.key === "3") {
          this.taskList.increase("bone_bbq", 1);
          console.log("[Kitchen] Added bone_bbq");
        }
        if (event.key === "4") {
          this.taskList.increase("mutant_soup", 1);
          console.log("[Kitchen] Added mutant_soup");
        }
        if (event.key === "5") {
          this.taskList.increase("ultimate_feast", 1);
          console.log("[Kitchen] Added ultimate_feast");
        }
        if (event.key === "Backspace") {
          this.taskList.clear();
          console.log("[Kitchen] Task list cleared");
        }

        // mouse click add/remove buttons
        if (event.type === "click") {
          const clickedButton = this._getClickedMenuButton(mouseX, mouseY);

          if (clickedButton) {
            if (clickedButton.action === "increase") {
              this.taskList.increase(clickedButton.recipeId, 1);
              console.log("[Kitchen] Added by mouse:", clickedButton.recipeId);
            }

            if (clickedButton.action === "decrease") {
              this.taskList.decrease(clickedButton.recipeId, 1);
              console.log("[Kitchen] Removed by mouse:", clickedButton.recipeId);
            }
          }
        }
      }

      // ===== P: enter production phase =====
      if ((event.key === "p" || event.key === "P") && this.phase === "PLANNING") {
        console.log("[Kitchen] P key event received");

        const hasTasks = this._hasAnyPlannedTask();
        const feasible = this.taskList.isFeasible(this.state.inventory, this.menu);

        console.log("[Kitchen] Has tasks =", hasTasks);
        console.log("[Kitchen] Feasible =", feasible);

        if (!hasTasks) {
          console.log("[Kitchen] Task list is empty. Please plan at least one dish.");
          return;
        }

        if (!feasible) {
          console.log("[Kitchen] Task list is not feasible. Cannot start production.");
          return;
        }

        this.productionManager.createFromTaskList(this.taskList, this.menu);
        this.phase = "PRODUCTION";

        console.log("[Kitchen] Entered production phase");
        console.log("[Kitchen] Production tasks:", this.productionManager.getTasks());
      }

      // ===== E: interaction =====
      if (event.key === "e" || event.key === "E") {
        console.log("[Kitchen] E key event received");

        if (this.phase === "PRODUCTION") {
          const activeTask =
            this.productionManager.getDoneTasks()[0] ||
            this.productionManager.getPendingTasks()[0];

          if (!activeTask) {
            console.log("[Kitchen] No active production tasks.");
            return;
          }

          const targetRecipeId = activeTask.recipeId;
          console.log("[Kitchen] Current active task recipe:", targetRecipeId);
          console.log("[Kitchen] Current active task status:", activeTask.status);

          for (const station of this.stations) {
            if (this.player.isNear(station)) {
              console.log("[Kitchen] Player is near station:", station.stationType);

              const recipe = this.menu.getRecipe(targetRecipeId);
              if (!recipe) {
                console.log("[Kitchen] Recipe not found for active task.");
                return;
              }

              if (!station.canCook(recipe)) {
                console.log("[Kitchen] This is not the correct station.");
                return;
              }

              if (activeTask.status === "PENDING") {
                const started = station.tryCook(
                  this.state,
                  this.menu,
                  targetRecipeId
                );

                if (started) {
                  activeTask.start();
                  console.log("[Kitchen] Task started:", activeTask);
                }
                return;
              }

              if (activeTask.status === "DONE") {
                if (this.player.heldDish) {
                  console.log(
                    "[Kitchen] Player is already holding a dish:",
                    this.player.heldDish
                  );
                  return;
                }

                this.player.heldDish = activeTask.recipeId;
                activeTask.collect();
                console.log("[Kitchen] Task collected:", activeTask);
                console.log("[Kitchen] Player now holds:", this.player.heldDish);
                return;
              }

              if (activeTask.status === "COOKING") {
                console.log("[Kitchen] This task is still cooking. Please wait.");
                return;
              }

              if (activeTask.status === "COLLECTED") {
                console.log("[Kitchen] This task has already been collected.");
                return;
              }
            }
          }

          console.log("[Kitchen] Press E near the correct station.");
          return;
        }
      }

      // ===== S: start selling flow =====
      if (event.key === "s" || event.key === "S") {
        console.log("[Kitchen] S key event received");

        if (!this.player.isNear(this.counter)) {
          console.log("[Kitchen] Move near the counter to sell dishes.");
          return;
        }

        if (!this.productionManager.allTasksCollected()) {
          console.log("[Kitchen] Not all tasks are collected yet.");
          return;
        }

        this.phase = "SELLING";
        this.saleInProgress = true;
        this.saleSettled = false;
        this.saleStage = "ENTERING";
        this.saleTimer = 0;

        this.customer.pos.x = this.doorPos.x;
        this.customer.pos.y = this.doorPos.y;

        console.log("[Kitchen] Selling started. Customer enters from the door.");
        return;
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

    if (this.phase === "SELLING") {
      this._drawSellingHint();
    }
  }

  _drawPhaseBar() {
    push();

    const barX = 250;
    const barY = 8;
    const boxW = 110;
    const boxH = 30;
    const gap = 10;

    const phases = [
      { label: "PLAN", value: "PLANNING" },
      { label: "COOK", value: "PRODUCTION" },
      { label: "SELL", value: "SELLING" },
    ];

    for (let i = 0; i < phases.length; i++) {
      const x = barX + i * (boxW + gap);
      const isActive = this.phase === phases[i].value;

      fill(isActive ? color(255, 230, 140) : color(235));
      stroke(0);
      rect(x, barY, boxW, boxH);

      fill(0);
      noStroke();
      textSize(13);
      textAlign(CENTER, CENTER);
      text(phases[i].label, x + boxW / 2, barY + boxH / 2);
    }

    pop();
  }

  _updateSellingFlow() {
    if (this.saleStage === "ENTERING") {
      this.saleStage = "TO_COUNTER";
      console.log("[Kitchen] Customer is walking to the counter.");
    }

    if (this.saleStage === "TO_COUNTER") {
      const arrived = this._moveToward(this.customer.pos, this.counterServePos, 0.03);
      if (arrived) {
        this.saleStage = "TO_SEAT";

        if (!this.saleSettled) {
          const earned = this.salesSystem.sellAllCollected(
            this.productionManager,
            this.menu,
            this.state
          );
          this.saleSettled = true;
          console.log("[Kitchen] Customer bought the food. Earned:", earned);
        }

        console.log("[Kitchen] Customer is walking to the seat.");
      }
      return;
    }

    if (this.saleStage === "TO_SEAT") {
      const arrived = this._moveToward(this.customer.pos, this.seatPos, 0.03);
      if (arrived) {
        this.saleStage = "EATING";
        this.saleTimer = 120;
        console.log("[Kitchen] Customer is now eating.");
      }
      return;
    }

    if (this.saleStage === "EATING") {
      this.saleTimer--;
      if (this.saleTimer <= 0) {
        this.saleStage = "LEAVING";
        console.log("[Kitchen] Customer finished eating and is leaving.");
      }
      return;
    }

    if (this.saleStage === "LEAVING") {
      const arrived = this._moveToward(this.customer.pos, this.exitPos, 0.04);
      if (arrived) {
        console.log("[Kitchen] Customer left the kitchen.");
        this.saleInProgress = false;
        this.saleStage = "IDLE";
        this._resetKitchenAfterSelling();
      }
    }
  }

  _moveToward(pos, target, speed) {
    const dx = target.x - pos.x;
    const dy = target.y - pos.y;
    const dist = Math.hypot(dx, dy);

    if (dist < speed || dist < 0.02) {
      pos.x = target.x;
      pos.y = target.y;
      return true;
    }

    pos.x += (dx / dist) * speed;
    pos.y += (dy / dist) * speed;
    return false;
  }

  _drawSellingHint() {
    push();
    fill(255, 255, 230);
    stroke(0);
    rect(20, 540, 300, 55);

    fill(0);
    noStroke();
    textSize(14);
    textAlign(LEFT, TOP);
    text("SELLING PHASE", 30, 550);

    textSize(12);
    text(`Customer state: ${this.saleStage}`, 30, 572);
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

      if (inside) {
        return button;
      }
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

      if (inside) {
        return zone.recipeId;
      }
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

  _resetKitchenAfterSelling() {
    console.log("[Kitchen] Resetting kitchen state...");

    this.player.heldDish = null;

    this.taskList.clear();
    this.productionManager.clear();
    this._loggedDoneTaskIds.clear();

    this.saleInProgress = false;
    this.saleStage = "IDLE";
    this.saleTimer = 0;
    this.saleSettled = false;

    // send customer back to the door
    this.customer.pos.x = this.doorPos.x;
    this.customer.pos.y = this.doorPos.y;

    // temporary refill for repeated kitchen testing
    this.state.inventory.add("zombie_meat", 2);
    this.state.inventory.add("spice_powder", 1);

    this.phase = "PLANNING";

    console.log("[Kitchen] Kitchen reset complete.");
    console.log("[Kitchen] Current phase:", this.phase);
    console.log("[Kitchen] TaskList:", this.taskList.getTasks());
    console.log(
      "[Kitchen] TaskList feasible:",
      this.taskList.isFeasible(this.state.inventory, this.menu)
    );
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