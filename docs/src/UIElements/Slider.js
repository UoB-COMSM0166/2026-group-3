import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class Slider extends UIElement {
    constructor(game, min, max, initialValue, size, sticky = new Vector2("Centre", "Centre"), offset = new Vector2()) {
        super(game, offset, size, sticky);
        this.min = min;
        this.max = max;
        this.onClick = null;
        this.value = initialValue;
        this.style = new Style();
        game.view.defaultStyle(this.style);
    }

    draw() {
    if (!this.isVisible) { return; }
    this.pos = this.calculatePosition();

    let centerY = this.pos.y + (this.size.y / 2);

    // line
    stroke(this.style.outline);
    strokeWeight(this.style.outlineWidth);
    line(this.pos.x, centerY, this.pos.x + this.size.x, centerY);

    // convert to slider val
    let slideVal = map(this.value, this.min, this.max, this.pos.x, this.pos.x + this.size.x);

    fill(this.style.fillColor);

    // slider drag
    ellipse(slideVal, centerY, 20, 20);
}


    update(events) {
    if (!this.isVisible) { return; }

    let mousePos = new Vector2(mouseX, mouseY);

    if (mouseIsPressed) {

        if (mousePos.withinBox(this.pos, this.size)) {
            
            this.value = map(mouseX, this.pos.x, this.pos.x + this.size.x, this.min, this.max, true);
          
          if (this.onClick) this.onClick(this.value);
        }
    }
  
}
}






