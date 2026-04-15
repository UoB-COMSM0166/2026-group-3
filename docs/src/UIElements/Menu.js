import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class Menu extends UIElement {
    constructor(game, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, offset, size, sticky);
        this.style = new Style();
        game.view.defaultStyle(this.style);
        this.elements = [];
        this.expandToFit = new Vector2(null, null);
        this.border = new Vector2();
    }

    draw(){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition();

        fill(this.style.fillColor);
        stroke(this.style.outline);
        strokeWeight(this.style.outlineWidth);

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);

        for (let element of this.elements){
            element.draw();
        }
    }
    update(events){
        for (let element of this.elements){
            element.update(events);
        }
    }
    resize(){
        for (let element of this.elements){
            element.resize();
        }
        for (let element of this.elements){
            element.matchSize();
        }
        for (let element of this.elements){
            element.reposition();
        }
        if (this.expandToFit.x != null){
            this.size.x = this.expandToFit.x.size.x + (this.expandToFit.x.pos.x - this.pos.x) + this.border.x
        }
        if (this.expandToFit.y != null){
            this.size.y = this.expandToFit.y.size.y + (this.expandToFit.y.pos.y - this.pos.y) + this.border.y
        }
        for (let element of this.elements){
            element.resize();
        }
        for (let element of this.elements){
            element.matchSize();
        }
        for (let element of this.elements){
            element.reposition();
        }
        super.resize();
    }
}