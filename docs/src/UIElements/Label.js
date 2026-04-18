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
        this.expandToFit = new Vector2(false, false); // Expand the label to fit the text within
        this.textSizeOverride = false; // Whether to override the default game text size
    }

    draw(){
        if (!this.isVisible) { return; }

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

        text(this.label, this.pos.x, this.pos.y, this.size.x, this.size.y);
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
                this.size.x = 1.5 * this.style.textSize
            } else {
                this.size.x = bounds.w + 20
            }
        } if (this.expandToFit.y){
            this.size.y = 1.5 * this.style.textSize
        }
        super.resize();
    }
}