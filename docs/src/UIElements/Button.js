//Button Element

import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";

export class Button extends UIElement {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, offset, size, sticky);
        this.label = label;
    }

    draw(gameSize){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition(this.game.view.gameSize);
        fill(255, 0, 0);
        stroke(0);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        fill(0);
        textAlign(CENTER,CENTER);
        text(this.label, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    onClick(){}

    update(events){
        if (!this.isVisible) { return; }

        let mousePos = new Vector2(mouseX, mouseY);
        if (mousePos.withinBox(this.pos, this.size)){
            cursor(HAND);
        }

        for (let event of events){
            if (event.type == "click"){
                if (mousePos.withinBox(this.pos, this.size)){
                    this.onClick();
                }
            }
        }

    }
}