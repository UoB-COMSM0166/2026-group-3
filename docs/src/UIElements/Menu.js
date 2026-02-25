import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class Menu extends UIElement {
    constructor(game, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, offset, size, sticky);
        this.style = new Style();
        game.view.defaultStyle(this.style);
        this.elements = [];
    }

    draw(){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition();

        fill(this.style.fillColor);
        stroke(this.style.outline);

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        for (let element of this.elements){
            element.draw();
        }
    }
    update(events){
        for (let element of this.elements){
            element.update(events);
        }
    }
}