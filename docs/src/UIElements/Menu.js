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
        this.image = null;
    }

    draw(){
        if (!this.isVisible) { return; }

        if (this.image != null){
            //Draw an image if there is one
            let sprite = this.game.assetManager.getImage(this.image);
            image(sprite, this.pos.x, this.pos.y, this.size.x, this.size.y);
        } else {
            const cornerSprite = this.game.assetManager.getImage("UI Board Corner");
            const horizontalEdgeSprite = this.game.assetManager.getImage("UI Board Horizontal Edge");
            const verticalEdgeSprite = this.game.assetManager.getImage("UI Board Vertical Edge");
            const middleSprite = this.game.assetManager.getImage("UI Board Middle");

            if (cornerSprite && horizontalEdgeSprite && verticalEdgeSprite && middleSprite){
                const x = Math.round(this.pos.x);
                const y = Math.round(this.pos.y);
                const w = Math.round(this.size.x);
                const h = Math.round(this.size.y);
                const cornerSize = Math.round(Math.min(w / 2, h / 2, this.style.textSize + 12));
                const innerX = x + cornerSize;
                const innerY = y + cornerSize;
                const innerW = Math.max(0, w - (2 * cornerSize));
                const innerH = Math.max(0, h - (2 * cornerSize));

                if (innerW > 0 && innerH > 0){
                    image(middleSprite, innerX, innerY, innerW, innerH);
                }

                if (innerW > 0){
                    image(horizontalEdgeSprite, innerX, y, innerW, cornerSize);
                    push();
                    translate(innerX, y + h);
                    scale(1, -1);
                    image(horizontalEdgeSprite, 0, 0, innerW, cornerSize);
                    pop();
                }

                if (innerH > 0){
                    image(verticalEdgeSprite, x, innerY, cornerSize, innerH);
                    push();
                    translate(x + w, innerY);
                    scale(-1, 1);
                    image(verticalEdgeSprite, 0, 0, cornerSize, innerH);
                    pop();
                }

                image(cornerSprite, x, y, cornerSize, cornerSize);
                push();
                translate(x + w, y);
                scale(-1, 1);
                image(cornerSprite, 0, 0, cornerSize, cornerSize);
                pop();
                push();
                translate(x, y + h);
                scale(1, -1);
                image(cornerSprite, 0, 0, cornerSize, cornerSize);
                pop();
                push();
                translate(x + w, y + h);
                scale(-1, -1);
                image(cornerSprite, 0, 0, cornerSize, cornerSize);
                pop();
            } else {
                fill(this.style.fillColor);
                stroke(this.style.outline);
                strokeWeight(this.style.outlineWidth);
                rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);
            }
        } 
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
        this.reposition();

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