//A button element is a label with a clickable effect

import {Vector2} from "../Utility/Vector2.js";
import {Label} from "./Label.js";

export class Button extends Label {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, label, size, sticky, offset);
        this.active = true; // If the button is active
        this.horizontalPadding = 14;
        this.verticalPadding = 8;
        this.pressOffsetY = 3;
        this.itemImage = null; // Optional right-side icon
        this.itemImageScale = 0.8;
    }

    onClick(){}

    async draw(){
        if (!this.isVisible) { return; }

        let mousePos = new Vector2(mouseX, mouseY);
        const isPressed = mousePos.withinBox(this.pos, this.size) && this.active && mouseIsPressed;
        const drawY = this.pos.y + (isPressed ? this.pressOffsetY : 0);

        if (this.image != null){
            image(this.game.assetManager.getImage(this.image), this.pos.x, drawY, this.size.x, this.size.y);
        } else {
            push();
            if (!this.active){
                tint(100, 100, 100);
            }
            
            
            const cornerSprite = this.game.assetManager.getImage("UI Button Corner");
            const middleSprite = this.game.assetManager.getImage("UI Button Middle");

            if (cornerSprite && middleSprite){
                // Snap to whole pixels and overlap slices by 1px to avoid seams.
                const x = Math.round(this.pos.x);
                const y = Math.round(drawY);
                const w = Math.round(this.size.x);
                const h = Math.round(this.size.y);
                const capWidth = Math.round(h / 2);
                const overlap = 1;
                const middleX = x + capWidth - overlap;
                const middleWidth = Math.max(0, w - (2 * capWidth) + (2 * overlap));

                image(cornerSprite, x, y, capWidth, h);
                image(middleSprite, middleX, y, middleWidth, h);

                push();
                translate(x + w, y);
                scale(-1, 1);
                image(cornerSprite, 0, 0, capWidth, h);
                pop();
            } else {
                fill(this.style.fillColor);
                stroke(this.style.outline);
                strokeWeight(this.style.outlineWidth);
                rect(this.pos.x, drawY, this.size.x, this.size.y, this.style.rounding);
            }
            pop()
        }

        textFont(this.style.font);
        textAlign(this.style.textAlign.x, this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);
        fill(this.style.textColor);
        strokeWeight(1);
        let textWidth = this.size.x;
        if (this.itemImage != null){
            const iconSize = this.size.y * this.itemImageScale;
            textWidth = this.size.x - iconSize - 8;
        }
        text(this.label, this.pos.x, drawY, textWidth, this.size.y);

        if (this.itemImage != null){
            const sprite = this.game.assetManager.getImage(this.itemImage);
            if (sprite){
                const iconSize = this.size.y * this.itemImageScale;
                const iconX = this.pos.x + this.size.x - iconSize - 5;
                const iconY = drawY + (this.size.y - iconSize) / 2;
                image(sprite, iconX, iconY, iconSize, iconSize);
            }
        }
    }



    async update(events){
        if (!this.isVisible || !this.active) { return; }
        if (this.parent!=this.game.view && !this.parent.isVisible) { return; }

        let mousePos = new Vector2(mouseX, mouseY);
        if (mousePos.withinBox(this.pos, this.size)){
            cursor(HAND);
            // Change the cursor if the button is clickable
        }

        for (let event of events){
            if (event.type == "click"){
                if (mousePos.withinBox(this.pos, this.size)){
                    await this.game.soundManager.playSFX("woodButton");
                    this.onClick();        
                }
            }
        }
    }

    resize(){
        if (!this.textSizeOverride){
            this.style.textSize = this.game.view.textSize;
        }

        if (this.image != null){
            super.resize();
            return;
        }

        if (this.label != null){
            textFont(this.style.font);
            textAlign(this.style.textAlign.x, this.style.textAlign.y);
            textSize(this.style.textSize);
            textStyle(this.style.textStyle);

            let bounds = textBounds(this.label, this.pos.x, this.pos.y);
            this.size.x = bounds.w + (2 * this.horizontalPadding);
            this.size.y = Math.max(this.size.y, bounds.h + (2 * this.verticalPadding));
            if (this.itemImage != null){
                this.size.x += (this.size.y * this.itemImageScale);
            }
        }
    }
}