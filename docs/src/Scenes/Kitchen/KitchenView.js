import { Vector2 } from "../../Utility/Vector2.js";

/**
 * p5 drawing, planning hitboxes, and on-screen HUD for `KitchenScene_MVP`.
 * Reads game state from the host scene; does not own game rules.
 */
export class KitchenView {
  constructor(scene) {
    this.scene = scene;
    this._bubbleImage = null;
    this._bubbleLoadTried = false;
  }

  draw() {
        this._drawCustomerOrderLabels();
        this._drawStationDishLabels();
        this._drawStationHoldSpacePrompt();
        this._drawCounterServePrompt();

        if (this.scene.phase === "PLANNING") {
          this._drawPlanningCenterCards();

          if (this.scene.isTaskListOpen) {
            this._drawTaskListPanel();
          }

          if (this.scene.isMenuOpen) {
            this._drawMenuPanel();
          }

          this._drawDishDetailsPanel();
          this._drawPlanningInstructionsInsideBoard();
        }

        this._drawStationCountdowns();
        this._drawInteractDebugOverlay();

        if (this.scene.phase === "END") {
          this._drawEndSummaryOverlay();
        }

        if (this.scene.message) {
          let messageX = 0;
          let messageY = 0;
          let messageW = 0;
          let messageH = 0;
          let shouldDrawMessage = false;

          if (
            this.scene.phase === "PLANNING" &&
            this.scene.isMenuOpen &&
            (
              this.scene.message === "Not enough of ingredients" ||
              this.scene.message === "Plan at least one dish" ||
              this.scene.message === "Set a quantity first"
            )
          ) {
            const layout = this.scene._getPlanningBoardLayout();
            const panelX = width / 2 - layout.midW / 2;
            const panelY = layout.panelY;
            const panelW = layout.midW;

            // Place insufficient-ingredients notice under "AVAILABLE DISHES".
            messageX = panelX + 14;
            messageY = panelY + 34;
            messageW = panelW - 28;
            messageH = 22;
            shouldDrawMessage = true;
          } else if (this.scene.phase === "PLANNING" && this.scene.isTaskListOpen) {
            const layout = this.scene._getPlanningBoardLayout();
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
            text(this.scene.message, messageX + 10, messageY + messageH / 2);
            pop();
          }
        }
  }

    _drawPlanningCenterCards() {
      const layout = this.scene._getPlanningBoardLayout();

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

    _getBubbleImage() {
      if (this._bubbleLoadTried) return this._bubbleImage;

      this._bubbleLoadTried = true;

      const fromAsset =
        this.scene.game.assetManager.getImage("UI Bubble") ||
        this.scene.game.assetManager.getImage("bubble.png") ||
        this.scene.game.assetManager.getImage("bubble");

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

      const mappedImage = this.scene.game.assetManager.getImage(dishImageMap[recipeId]);
      if (mappedImage) return mappedImage;

      return (
        this.scene.game.assetManager.getImage(`${recipeId}.png`) ||
        this.scene.game.assetManager.getImage(recipeId) ||
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
        text(this.scene._getDisplayName(recipeId), centerX, centerY - 1);
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
      if (this.scene.phase !== "PRODUCTION") return;
      if (!this.scene.customerManager.customers || this.scene.customerManager.customers.length === 0) return;

      const scale = this._getWorldScale();
      const bubbleOffsetX = 0.05 * scale.x;
      const bubbleOffsetY = -0.15 * scale.y;

      for (const customer of this.scene.customerManager.customers) {
        if (!customer.isVisible || !customer.order || customer._phase !== "WAITING") continue;

        const relPos = this.scene.game.view.localToScreen(customer.pos);
        const drawW = customer.size.x * scale.x;

        const bubbleX = relPos.x + drawW / 2 + bubbleOffsetX;
        const bubbleY = relPos.y - 24 + bubbleOffsetY;
        const waitProgress = this.scene.kitchenTimeLimit > 0
          ? customer.waitTimer / this.scene.kitchenTimeLimit
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
      if (this.scene.phase !== "PLANNING") return;

      const layout = this.scene._getPlanningBoardLayout();

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

      if (!this.scene.isMenuOpen) {
        this.scene.menuOpenTab = { x: 20, y: 100, w: 92, h: 30 };
        fill(235);
        stroke(0);
        rect(this.scene.menuOpenTab.x, this.scene.menuOpenTab.y, this.scene.menuOpenTab.w, this.scene.menuOpenTab.h, 6);

        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text("Dishes", this.scene.menuOpenTab.x + this.scene.menuOpenTab.w / 2, this.scene.menuOpenTab.y + this.scene.menuOpenTab.h / 2);
      } else {
        this.scene.menuOpenTab = null;
      }

      if (!this.scene.isTaskListOpen) {
        this.scene.taskOpenTab = { x: 20, y: 138, w: 92, h: 30 };
        fill(235);
        stroke(0);
        rect(this.scene.taskOpenTab.x, this.scene.taskOpenTab.y, this.scene.taskOpenTab.w, this.scene.taskOpenTab.h, 6);

        fill(0);
        noStroke();
        textSize(12);
        textAlign(CENTER, CENTER);
        text("Menu", this.scene.taskOpenTab.x + this.scene.taskOpenTab.w / 2, this.scene.taskOpenTab.y + this.scene.taskOpenTab.h / 2);
      } else {
        this.scene.taskOpenTab = null;
      }

      pop();
    }

    _drawPaperPanel(panelX, panelY, panelW, panelH) {
      const cornerSprite = this.scene.game.assetManager.getImage("UI Paper Corner");
      const horizontalEdgeSprite = this.scene.game.assetManager.getImage("UI Paper Horizontal Edge");
      const verticalEdgeSprite = this.scene.game.assetManager.getImage("UI Paper Vertical Edge");
      const middleSprite = this.scene.game.assetManager.getImage("UI Paper Middle");

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
      const cornerSprite = this.scene.game.assetManager.getImage("UI Board Corner");
      const horizontalEdgeSprite = this.scene.game.assetManager.getImage("UI Board Horizontal Edge");
      const verticalEdgeSprite = this.scene.game.assetManager.getImage("UI Board Vertical Edge");
      const middleSprite = this.scene.game.assetManager.getImage("UI Board Middle");

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

      const layout = this.scene._getPlanningBoardLayout();
      const panelX = width / 2 - layout.midW / 2;
      const panelY = layout.panelY;
      const panelW = layout.midW;
      const panelH = layout.panelH;
      const minusSprite = this.scene.game.assetManager.getImage("UI Minus");
      const plusSprite = this.scene.game.assetManager.getImage("UI Plus");
      const tickSprite = this.scene.game.assetManager.getImage("UI Tick");
      const coinSprite = this.scene.game.assetManager.getImage("UI Coin");
      const controlsOffsetX = -12;
      const controlsOffsetY = 4;
      const tickOffsetX = 7;
      const controlButtonW = 24;
      const controlButtonH = 20;
      const tickButtonW = 16;
      const tickButtonH = 20;

      this._drawBoardPanel(panelX, panelY, panelW, panelH);

      this.scene.menuCloseButton = null;

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

      this.scene.menuButtons = [];
      this.scene.menuCardZones = [];

      for (const item of items) {
        const recipe = this.scene.menu.getRecipe(item.recipeId);
        const isSelected = this.scene.pendingRecipeId === item.recipeId;
        const pendingShown = isSelected ? this.scene.pendingQuantity : 0;
        const canAdd = isSelected
          ? this.scene._canIncreasePending(item.recipeId, this.scene.pendingQuantity + 1)
          : this.scene._canIncreasePending(item.recipeId, 1);

        const cardX = panelX + 10;
        const cardY = item.y - 6;
        const cardW = 278;
        const cardH = 66;

        fill(isSelected ? color(250, 232, 180) : color(245, 235, 210));
        stroke(0);
        rect(cardX, cardY, cardW, cardH, 8);

        this.scene.menuCardZones.push({
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

        this.scene.menuButtons.push({
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

        this.scene.menuButtons.push({
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

        this.scene.menuButtons.push({
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
      const plannedEntries = this.scene._getPlannedMenuEntries();

      push();

      const layout = this.scene._getPlanningBoardLayout();
      const panelX = width / 2 - layout.midW / 2 - layout.panelGap - layout.leftW;
      const panelY = layout.panelY;
      const panelW = layout.leftW;
      const panelH = layout.panelH;

      this._drawPaperPanel(panelX, panelY, panelW, panelH);

      this.scene.taskCloseButton = null;

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
          const name = this.scene._getDisplayName(entry.recipeId);
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
      if (this.scene.phase !== "PLANNING") return;

      const recipe = this.scene.menu.getRecipe(this.scene.pendingRecipeId);
      if (!recipe) return;
      const coinSprite = this.scene.game.assetManager.getImage("UI Coin");

      const confirmedRemaining = this.scene._getConfirmedRemainingMap();
      const reqEntries = Object.entries(recipe.requirements);
      const quantityForDisplay = this.scene.pendingQuantity > 0 ? this.scene.pendingQuantity : 1;
      const pendingNeedMap = this.scene._getPendingNeedMap(this.scene.pendingRecipeId, quantityForDisplay);

      push();

      const layout = this.scene._getPlanningBoardLayout();
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

      const dishImage = this._getDishIconImage(this.scene.pendingRecipeId);
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
      text(this.scene._getDisplayName(this.scene.pendingRecipeId), panelX + 128, panelY + 54);

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
        this.scene._getDescription(this.scene.pendingRecipeId),
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
      text(`Pending quantity: ${this.scene.pendingQuantity}`, panelX + 18, panelY + 446 + detailsShiftY);

      pop();
    }

    _drawStationCountdowns() {
      if (this.scene.phase !== "PRODUCTION") return;
      if (!this.scene.holdCookTaskId || !this.scene.holdCookStation) return;
      if (this.scene.holdCookProgress <= 0) return;

      const relPos = this.scene.game.view.localToScreen(this.scene.holdCookStation.pos);
      const scale = this._getWorldScale();
      const drawW = this.scene.holdCookStation.size.x * scale.x;
      const bubbleOffsetX = 0.25 * scale.x;
      const bubbleOffsetY = -0.15 * scale.y;
      const requestedRecipeIds = this._getRequestedRecipeIds();
      const activeRecipeId =
        this.scene.holdCookRecipeId ||
        this.scene._getRecipeIdForStationType(this.scene._getStationType(this.scene.holdCookStation));
      const isRequested = activeRecipeId ? requestedRecipeIds.has(activeRecipeId) : false;
      const bobOffsetY = isRequested
        ? this._getStationBubbleBobOffset(this.scene.holdCookStation, scale)
        : 0;

      // Match bubble anchor used by _drawStationDishLabels so progress stays attached to bubble.
      const bubbleX = relPos.x + drawW * 0.24 + bubbleOffsetX;
      const bubbleY = relPos.y - 16 + bubbleOffsetY + bobOffsetY;

      const progressRatio = this.scene.holdCookDuration > 0
        ? Math.max(0, Math.min(1, this.scene.holdCookProgress / this.scene.holdCookDuration))
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

      for (const station of this.scene.stations) {
        const stationType = this.scene._getStationType(station);
        const recipeId = this.scene._getRecipeIdForStationType(stationType);
        if (!recipeId) continue;

        const relPos = this.scene.game.view.localToScreen(station.pos);
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
      if (this.scene.phase !== "PRODUCTION") return;
      if (!this.scene.player || !this.scene.stations || this.scene.stations.length === 0) return;

      const station = this.scene._getNearbyInteractableStation();
      if (!station) return;

      const stationType = this.scene._getStationType(station);
      const recipeId = this.scene._getRecipeIdForStationType(stationType);
      if (!recipeId) return;

      const scale = this._getWorldScale();
      const relPos = this.scene.game.view.localToScreen(station.pos);
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
      if (this.scene.phase !== "PRODUCTION") return;
      if (!this.scene.player || !this.scene.counter) return;
      if (!this.scene.player.heldDish) return;

      const scale = this._getWorldScale();
      const counterTopCenter = new Vector2(
        this.scene.counter.pos.x + this.scene.counter.size.x * 0.46 + 0.4,
        this.scene.counter.pos.y + this.scene.counter.size.y * 0.18 + 0.8
      );
      const screenPos = this.scene.game.view.localToScreen(counterTopCenter);

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
      const cornerSprite = this.scene.game.assetManager.getImage("UI Button Corner");
      const middleSprite = this.scene.game.assetManager.getImage("UI Button Middle");

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
      const overlayY = this.scene.uiBar.size.y + 90 + 1.25 * scale.y;
      const overlayW = 440;
      const overlayH = 290;
      const phaseNum = this.scene.game?.model?.gameState?.phase || 1;

      push();
      fill(0, 0, 0, 135);
      noStroke();
      rect(0, this.scene.uiBar.size.y, width, height - this.scene.uiBar.size.y);

      this._drawBoardPanel(overlayX, overlayY, overlayW, overlayH);

      fill(25);
      noStroke();
      textAlign(CENTER, TOP);
      textSize(34);
      text(`Day ${phaseNum}`, overlayX + overlayW / 2, overlayY + 32);

      textSize(22);
      const madeText = `You made ${this.scene.nightEarnedCoins}`;
      const madeY = overlayY + 108;
      text(madeText, overlayX + overlayW / 2 - 12, madeY);

      const coinSprite = this.scene.game.assetManager.getImage("UI Coin");
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

      this.scene.endOverlayButton = { x: btnX, y: btnY, w: btnW, h: btnH };
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
      const waitingCustomers = this.scene.customerManager.getVisibleWaitingCustomers();

      for (const customer of waitingCustomers) {
        const recipeId = customer?.order?.recipeId;
        if (recipeId) requested.add(recipeId);
      }

      return requested;
    }

    _getStationBubbleBobOffset(station, scale) {
      const time = typeof frameCount === "number" ? frameCount : 0;
      const stationIndex = Math.max(0, this.scene.stations.indexOf(station));
      const phaseShift = stationIndex * 0.6;
      const speed = 0.11;
      const amplitudePx = Math.max(1.8, Math.min(3.2, scale.y * 0.035));
      return Math.sin(time * speed + phaseShift) * amplitudePx;
    }

    _drawInteractDebugOverlay() {
      if (!this.scene.showInteractDebug || !this.scene.player || !this.scene.stations) return;

      const playerPoint = this.scene._getPlayerStationInteractPoint();
      const playerScreen = this.scene.game.view.localToScreen(playerPoint);

      push();
      stroke(255, 0, 0, 190);
      strokeWeight(2);
      fill(255, 0, 0, 210);

      // Player interact point marker.
      circle(playerScreen.x, playerScreen.y, 8);

      // Station anchor markers and connector lines.
      for (const station of this.scene.stations) {
        const anchor = this.scene._getStationInteractAnchor(station);
        const anchorScreen = this.scene.game.view.localToScreen(anchor);

        line(playerScreen.x, playerScreen.y, anchorScreen.x, anchorScreen.y);
        circle(anchorScreen.x, anchorScreen.y, 8);
      }

      pop();
    }

    _getWorldScale() {
      const origin = this.scene.game.view.localToScreen(new Vector2(0, 0));
      const one = this.scene.game.view.localToScreen(new Vector2(1, 1));

      return {
        x: Math.abs(one.x - origin.x),
        y: Math.abs(one.y - origin.y),
      };
    }


    getClickedMenuButton(mx, my) {
      if (!this.scene.isMenuOpen) return null;

      for (const button of this.scene.menuButtons) {
        const inside =
          mx >= button.x &&
          mx <= button.x + button.w &&
          my >= button.y &&
          my <= button.y + button.h;

        if (inside) return button;
      }

      return null;
    }

    getClickedMenuCard(mx, my) {
      if (!this.scene.isMenuOpen) return null;

      for (const zone of this.scene.menuCardZones) {
        const inside =
          mx >= zone.x &&
          mx <= zone.x + zone.w &&
          my >= zone.y &&
          my <= zone.y + zone.h;

        if (inside) return zone;
      }

      return null;
    }

  isInside(mx, my, box) {
    if (!box) return false;
    return (
      mx >= box.x &&
      mx <= box.x + box.w &&
      my >= box.y &&
      my <= box.y + box.h
    );
  }
}

