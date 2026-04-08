import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class PhaseProgressBar extends UIElement {
    constructor(game, leftAnchor, rightAnchor){

        super(game, new Vector2(), new Vector2(), new Vector2("Right", "Top"));
        this.style = new Style();
        game.view.defaultStyle(this.style);

        this.leftAnchor = leftAnchor;
        this.rightAnchor = rightAnchor;
        this.pos = new Vector2();
        this.pos.y = 10;
    }

    draw(){
        if (!this.isVisible) { return; }

        fill(this.style.fillColor);
        stroke(this.style.outline);
        strokeWeight(this.style.outlineWidth);

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y);

        let phaseProgress = this.pos.x + (this.size.x * this.game.model.gameState.phaseProgress)

        line(phaseProgress, this.pos.y, phaseProgress, this.pos.y + this.size.y);

        if (this.game.model.gameState.phaseProgress < 0.5){
            let moonPos = this.pos.x + (this.size.x * (0.5 + this.game.model.gameState.phaseProgress))
            text("🌙", moonPos, this.pos.y, this.size.y, this.size.y)
        } else {
            let sunPos = this.pos.x + (this.size.x * (this.game.model.gameState.phaseProgress - 0.5))
            text("☀️", sunPos, this.pos.y, this.size.y, this.size.y)
        }
    }

    onClick(){}

    update(events){
        if (!this.isVisible) { return; }
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
    resize(){
        this.style.textSize = this.game.view.textSize;

        this.pos.x = this.leftAnchor.pos.x + this.leftAnchor.size.x + 10

        this.size.y = 1.5 * this.style.textSize
        this.size.x = this.rightAnchor.pos.x - this.pos.x - 10;
        
    }
}