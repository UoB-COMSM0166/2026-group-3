//Label Element

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
    }

    draw(){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition();

        fill(this.style.fillColor);
        stroke(this.style.outline);
        strokeWeight(this.style.outlineWidth);

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        if (this.image != null){
            let sprite = this.game.assetManager.getImage(this.image);
            image(sprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
        }
        
        textFont(this.style.font);
        textAlign(this.style.textAlign.x,this.style.textAlign.y);
        textSize(this.style.textSize);
        textStyle(this.style.textStyle);
        fill(this.style.textColor);
        strokeWeight(1);

        text(this.label, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }
}