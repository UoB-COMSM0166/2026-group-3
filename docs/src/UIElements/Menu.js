//A menu acts as a collection of UI elements
// The elements in the menu should NOT be added to the scene itself

import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class Menu extends UIElement {
    constructor(game, size, sticky = new Vector2("Centre","Centre"), offset = new Vector2()){
        super(game, offset, size, sticky);
        this.style = new Style();
        game.view.defaultStyle(this.style);
        this.elements = []; // The list fo UI elements in the menu
        this.expandToFit = new Vector2(null, null); // An element (x and y) the menu should expand to fit around
        this.border = new Vector2(); // A buffer to the edge of the menu if expand to fit is used
    }

    draw(){
        if (!this.isVisible) { return; }
        this.pos = this.calculatePosition();

        fill(this.style.fillColor);
        stroke(this.style.outline);
        strokeWeight(this.style.outlineWidth);
        //Draw the background
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);

        for (let element of this.elements){
            //Draw each element in the menu
            element.draw();
        }
    }
    update(events){
        for (let element of this.elements){
            element.update(events);
        }
    }
    resize(){
        //Update each element size/position accordingly
        for (let element of this.elements){
            element.resize();
        }
        for (let element of this.elements){
            element.matchSize();
        }
        for (let element of this.elements){
            element.reposition();
        }

        //Expand the menu to fit with it's elements
        if (this.expandToFit.x != null){
            this.size.x = this.expandToFit.x.size.x + (this.expandToFit.x.pos.x - this.pos.x) + this.border.x
        }
        if (this.expandToFit.y != null){
            this.size.y = this.expandToFit.y.size.y + (this.expandToFit.y.pos.y - this.pos.y) + this.border.y
        }

        //Used to expand any UI elements that match the size of the menu
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