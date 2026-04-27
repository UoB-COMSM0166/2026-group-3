//A button element is a label with a clickable effect

import {Vector2} from "../Utility/Vector2.js";
import {Label} from "./Label.js";

export class Button extends Label {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, label, size, sticky, offset);
        this.active = true; // If the button is active
        this.pressOffsetY = 3;
        this.itemImage = null; // Optional right-side icon
        this.itemImageScale = 0.8;
    }

    onClick(){}

    async draw(){
        if (!this.isVisible) { return; }

        let mousePos = new Vector2(mouseX, mouseY);
        const isPressed = mousePos.withinBox(this.pos, this.size) && this.active && mouseIsPressed && !(this.parent.id!="pausemenu" && this.game.model.isPaused);
        const drawY = this.pos.y + (isPressed ? this.pressOffsetY : 0);

        if (this.image != null){
            image(this.game.assetManager.getImage(this.image), this.pos.x, drawY, this.size.x, this.size.y);
        } else {
            push();
            if (!this.active){
                tint(100, 100, 100);
            }
            this.drawTexture("UI Button Corner", "UI Button Middle", (isPressed ? this.pressOffsetY : 0));
            pop()
        }

        textFont(this.style.font);
        textAlign(this.style.textAlign.x, this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);
        fill(this.style.textColor);
        strokeWeight(1);
        stroke(this.style.outline);

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

    // resize(){
    //     if (!this.textSizeOverride){
    //         this.style.textSize = this.game.view.textSize;
    //     }

    //     if (this.image != null){
    //         super.resize();
    //         return;
    //     }

    //     if (this.label != null){
    //         textFont(this.style.font);
    //         textAlign(this.style.textAlign.x, this.style.textAlign.y);
    //         textSize(this.style.textSize);
    //         textStyle(this.style.textStyle);

    //         let bounds = textBounds(this.label, this.pos.x, this.pos.y);
    //         this.size.x = bounds.w + (2 * this.horizontalPadding);
    //         this.size.y = Math.max(this.size.y, bounds.h + (2 * this.verticalPadding));
    //         if (this.itemImage != null){
    //             this.size.x += (this.size.y * this.itemImageScale);
    //         }
    //     }
    // }
}