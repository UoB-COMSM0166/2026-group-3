//Abstract class for a UI element in a scene
//All UI elements that inherit from this are stored in the UIElements folder
import {Vector2} from "../Utility/Vector2.js";

export class UIElement {
    constructor(game, offset = new Vector2(), size = new Vector2(), sticky = new Vector2("Left","Top")){
        //UI Element position is relative to the screen
        this.offset = offset;
        this.size = size;
        this.game = game;
        this.parent = game.view
        //X sticky: Left, Centre, Right
        //Y sticky: Top, Centre, Bottom 
        this.sticky = sticky;
        this.anchor = new Vector2(null, null);
        this.pos = this.calculatePosition();
        this.isVisible = true;
        this.id = null;
        
    }

    calculatePosition(){
        let pos = new Vector2();
        let parentSize = this.parent.size;
        if (this.anchor.x == null){
            if (this.sticky.x == "Left"){
                pos.x = this.parent.pos.x + this.offset.x;
            } else if (this.sticky.x == "Right") {
                pos.x = this.parent.pos.x + (parentSize.x + this.offset.x) - this.size.x;
            } else if (this.sticky.x == "Centre") {
                pos.x = this.parent.pos.x + (parentSize.x / 2) - (this.size.x / 2) + this.offset.x;
            } else {
                pos.x = this.parent.pos.x + this.offset.x;
                console.log("Unknown Sticky Value: ", this.sticky.x);
            }
        } else {
            this.anchor.x.resize()
            if (this.sticky.x == "Left"){
                pos.x = this.anchor.x.pos.x + this.anchor.x.size.x + this.offset.x;
            } else if (this.sticky.x == "Centre"){
                pos.x = parentSize.x - this.anchor.x.pos.x - this.anchor.x.size.x
            } else if (this.sticky.x == "Right"){
                pos.x = this.anchor.x.pos.x - this.size.x + this.offset.x
            } else {
                pos.x = this.anchor.x.pos.x + this.anchor.x.size.x + this.offset.x;
                console.log("Unknown Sticky Value: ", this.sticky.y);
            }
        }

        if (this.anchor.y == null){
            if (this.sticky.y == "Top"){
                pos.y = this.parent.pos.y + this.offset.y;
            } else if (this.sticky.y == "Bottom") {
                pos.y = this.parent.pos.y + (parentSize.y + this.offset.y) - this.size.y;
            } else if (this.sticky.y == "Centre") {
                pos.y = this.parent.pos.y + (parentSize.y / 2) - (this.size.y / 2) + this.offset.y;
            } else {
                pos.y = this.parent.pos.y + this.offset.y;
                console.log("Unknown Sticky Value: ", this.sticky.y);
            }
        } else {
            this.anchor.y.resize()
            if (this.sticky.y == "Top"){
                pos.y = this.anchor.y.pos.y + this.anchor.y.size.y + this.offset.y;
            } else if (this.sticky.y == "Centre"){
                pos.y = parentSize.y - this.anchor.y.pos.y - this.anchor.y.size.y
            } else if (this.sticky.y == "Bottom"){
                pos.y = this.anchor.y.pos.y - this.size.y + this.offset.y
            } else {
                pos.y = this.anchor.y.pos.y + this.anchor.y.size.y + this.offset.y;
                console.log("Unknown Sticky Value: ", this.sticky.y);
            }
        }

        return pos;
    }

    draw(){}
    update(events){}

    resize(){
        this.pos = this.calculatePosition();
    }
}