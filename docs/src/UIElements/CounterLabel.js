//A special label with an image at the end

import {Vector2} from "../Utility/Vector2.js";
import {Label} from "./Label.js";

export class CounterLabel extends Label {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, label, size, sticky, offset);
        this.itemImage = null
    }
    draw(){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition();

        if (this.image != null){
            //Draw an image if there is one
            let sprite = this.game.assetManager.getImage(this.image);
            image(sprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
        } else {
            const dentSprite = this.game.assetManager.getImage("UI Dent Corners");
            const dentMiddleSprite = this.game.assetManager.getImage("UI Dent Middle");

            if (dentSprite && dentMiddleSprite){
                const x = Math.round(this.pos.x);
                const y = Math.round(this.pos.y);
                const w = Math.round(this.size.x);
                const h = Math.round(this.size.y);
                const capWidth = Math.round(h / 2);
                const middleX = x + capWidth;
                const middleWidth = Math.max(0, w - (2 * capWidth));

                // Tile/stretch the dent middle so caps connect seamlessly.
                if (middleWidth > 0){
                    image(dentMiddleSprite, middleX, y, middleWidth, h);
                }

                // Left cap
                image(dentSprite, x, y, capWidth, h);

                // Right cap (mirrored)
                push();
                translate(x + w, y);
                scale(-1, 1);
                image(dentSprite, 0, 0, capWidth, h);
                pop();
            } else if (dentSprite){
                image(dentSprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
            } else {
                // Fallback if UI assets are missing.
                fill(this.style.fillColor);
                stroke(this.style.outline);
                strokeWeight(this.style.outlineWidth);
                rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);
            }
        }
        
        // Write text in the given style
        textFont(this.style.font);
        textAlign(this.style.textAlign.x,this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);
        fill(this.style.textColor);
        strokeWeight(1);

        text(this.label, this.pos.x, this.pos.y, this.size.x - this.size.y, this.size.y);

        if (this.itemImage != null){
            let sprite = this.game.assetManager.getImage(this.itemImage);
            let imageSize = this.size.y;
            let imageX = this.pos.x + this.size.x - this.size.y - 5;
            let imageY = this.pos.y;

            if (this.itemImage == "UI Coin"){
                const coinScale = 0.8;
                imageSize = this.size.y * coinScale;
                imageX = this.pos.x + this.size.x - imageSize - 5;
                imageY = this.pos.y + (this.size.y - imageSize) / 2;
            }

            image(sprite, imageX, imageY, imageSize, imageSize);
        }
    }
        
    resize(){
        super.resize();
        if (this.itemImage != null){
            this.size.x += this.size.y

        }
        
    }
}