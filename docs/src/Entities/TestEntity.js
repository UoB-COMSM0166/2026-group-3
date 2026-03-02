//Test Entity
import {Entity} from "../Core/Entity.js";
import {Vector2} from "../Utility/Vector2.js";

export class TestEntity extends Entity{
    constructor(game){
        let pos = new Vector2(4, 4);
        let size = new Vector2(0.5, 0.5);
        super(game, pos, size);
        this.speed = 0.1;
        this.color = color(0, 0, 0);
        this.isVisible = true;
        
    }

    draw(){
        if (!this.isVisible) { return; }
        fill(this.color);
        stroke(0);
        let rel_pos = this.game.view.localToScreen(this.pos);
        let rel_size = this.game.view.localToScreen(this.size);
        rect(rel_pos.x, rel_pos.y, rel_size.x, rel_size.y);
    }
    update(events){
        if (!this.isVisible) { return; }
        if (keyIsDown(UP_ARROW)) this.pos.y -= this.speed;
        if (keyIsDown(DOWN_ARROW)) this.pos.y += this.speed;
        
        this.pos.x = constrain(this.pos.x, 0, this.game.gridSize.x / 6);  // left 1/6th of the grid
        this.pos.y = constrain(this.pos.y, 0, this.game.gridSize.y);  

        let mousePos = this.game.view.screenToLocal(new Vector2(mouseX, mouseY));
        if (mousePos.withinBox(this.pos, this.size)){
            cursor(HAND);
        }

        for (let event of events){
            if (event.type == "click"){
                if (mousePos.withinBox(this.pos, this.size)){
                    this.color.setRed(random(0, 255));
                    this.color.setGreen(random(0, 255));
                    this.color.setBlue(random(0, 255));
                }
            }
        }
    }
}