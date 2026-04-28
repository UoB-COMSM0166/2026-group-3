//A label element contains some text and an optional image

import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class Label extends UIElement {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, offset, size, sticky);
        this.label = label;
        this.style = new Style();
        game.view.defaultStyle(this.style);
        this.image = null;
        this.drawBackground = true;
        this.expandToFit = new Vector2(false, false); // Expand the label to fit the text within
        this.textSizeOverride = false; // Whether to override the default game text size
        this.padding = new Vector2();
        this.itemImage = null; // Optional right-side icon
        this.itemImageScale = 1.0;
    }


    drawTexture(cornerTexture, middleTexture, yOffset = 0){
        const cornerSprite = this.game.assetManager.getImage(cornerTexture);
        const middleSprite = this.game.assetManager.getImage(middleTexture);

        if (cornerSprite && middleSprite){
            const x = Math.round(this.pos.x);
            const y = Math.round(this.pos.y) + yOffset;
            const w = Math.round(this.size.x);
            const h = Math.round(this.size.y);
            const capWidth = Math.round(h / 2);
            const middleX = x + capWidth;
            const middleWidth = Math.max(0, w - (2 * capWidth));

            // Tile/stretch the dent middle so caps connect seamlessly.
            if (middleWidth > 0){
                image(middleSprite, middleX, y, middleWidth, h);
            }

            // Left cap
            image(cornerSprite, x, y, capWidth, h);

            // Right cap (mirrored)
            push();
            translate(x + w, y);
            scale(-1, 1);
            image(cornerSprite, 0, 0, capWidth, h);
            pop();
        } else if (cornerSprite){
            image(cornerSprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
        } else {
            // Fallback if UI assets are missing.
            fill(this.style.fillColor);
            stroke(this.style.outline);
            strokeWeight(this.style.outlineWidth);
            rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);
        }
    }


    draw(){
        if (!this.isVisible) { return; }

        if (this.image != null){
            //Draw an image if there is one
            let sprite = this.game.assetManager.getImage(this.image);
            image(sprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
        } else if (this.drawBackground) {
            this.drawTexture("UI Dent Corners", "UI Dent Middle");
        }
        
        // Write text in the given style
        textFont(this.style.font);
        textAlign(this.style.textAlign.x,this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);
        fill(this.style.textColor);
        stroke(this.style.outline);
        strokeWeight(1);

        let textWidth = this.size.x;
        if (this.itemImage != null){
            const iconSize = this.size.y * this.itemImageScale;
            textWidth = this.size.x - iconSize - 8;
        }
        text(this.label, this.pos.x, this.pos.y, textWidth, this.size.y);

        if (this.itemImage != null){
            const sprite = this.game.assetManager.getImage(this.itemImage);
            if (sprite){
                const iconSize = this.size.y * this.itemImageScale;
                const iconX = this.pos.x + this.size.x - iconSize - 5;
                const iconY = this.pos.y + (this.size.y - iconSize) / 2;
                image(sprite, iconX, iconY, iconSize, iconSize);
            }
        }
    }

    resize(){
        if (!this.textSizeOverride){ // Set the text size to the default
            this.style.textSize = this.game.view.textSize;
        }
        textFont(this.style.font);
        textAlign(this.style.textAlign.x,this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);

        let bounds = textBounds(this.label, this.pos.x, this.pos.y)
        if (this.expandToFit.x){ // Expand the label to fit the text size
            if (this.image !=null){
                this.size.x = 1.5 * this.style.textSize + this.padding.x;
            } else {
                this.size.x = bounds.w + 20
            }
        } if (this.expandToFit.y){
            this.size.y = 1.5 * this.style.textSize + this.padding.y;
        }
        if (this.itemImage != null){
            this.size.x += (this.size.y * this.itemImageScale);
        }
        super.resize();
    }
}