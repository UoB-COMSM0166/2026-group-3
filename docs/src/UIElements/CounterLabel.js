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
            // Otherwise, draw a box to fit the text
            fill(this.style.fillColor);
            stroke(this.style.outline);
            strokeWeight(this.style.outlineWidth);
            rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);
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
            image(sprite, this.pos.x + this.size.x - this.size.y - 5, this.pos.y, this.size.y, this.size.y);
        }
    }
        
    resize(){
        super.resize();
        if (this.itemImage != null){
            this.size.x += this.size.y

        }
        
    }
}