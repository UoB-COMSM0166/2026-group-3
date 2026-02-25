//Test UI Element

import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";

export class TestUIElement extends UIElement {
    constructor(game){
        let offset = new Vector2(0, 0);
        let size = new Vector2(100, 30);
        let sticky = new Vector2("Right","Top");
        super(game, offset, size, sticky);
        this.text = "Click me";
        this.isVisible = true;
    }

    draw(){
        if (!this.isVisible) { return; }
        fill(255, 0, 0);
        stroke(0);
        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);
        fill(0);
        text(this.text, this.pos.x, this.pos.y, this.size.x, this.size.y);
    }

    handleClick(){
        for (let entity of this.game.model.scene.entities){
            entity.pos.x = random(0, this.game.gridSize.x - entity.size.x);
            entity.pos.y = random(0, this.game.gridSize.y - entity.size.y);
        }
    }


    update(events){
        if (!this.isVisible) { return; }

        let mousePos = new Vector2(mouseX, mouseY);
        if (mousePos.withinBox(this.pos, this.size)){
            cursor(HAND);
        }

        for (let event of events){
            if (event.type == "click"){
                if (mousePos.withinBox(this.pos, this.size)){
                    this.handleClick();
                }
            }
        }

    }






}

