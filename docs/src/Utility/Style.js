import { Vector2 } from "./Vector2.js";


export class Style {
    constructor(){
        this.outline;
        this.outlineWidth;
        this.fillColor;
        this.textColor;
        this.font;
        this.textAlign = new Vector2();
        this.textSize;
        this.textStyle;
        this.rounding;
    }
}