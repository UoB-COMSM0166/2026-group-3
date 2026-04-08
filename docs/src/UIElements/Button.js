//Button Element

import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";
import {Label} from "./Label.js";

export class Button extends Label {
    constructor(game, label, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, label, size, sticky, offset);
        this.active = true;
    }

    onClick(){}

    update(events){
        if (!this.isVisible || !this.active) { return; }
        if (this.parent!=this.game.view && !this.parent.isVisible) { return; }

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