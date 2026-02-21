//Abstract class for a UI element in a scene
//All UI elements that inherit from this are stored in the UIElements folder
import {Vector2} from "../Utility/Vector2.js";

export class UIElement {
    constructor(game, offset = new Vector2(), size = new Vector2(), sticky = new Vector2("Left","Top")){
        //UI Element position is relative to the screen
        this.offset = offset;
        this.size = size;
        this.game = game;
        //X sticky: Left, Centre, Right
        //Y sticky: Top, Centre, Bottom 
        this.sticky = sticky;
        this.pos = this.calculatePosition(this.game.view.gameSize);
        this.isVisible;

    }
    calculatePosition(gameSize){
        let pos = new Vector2();
        if (this.sticky.x == "Left"){
            pos.x = this.offset.x;
        } else if (this.sticky.x == "Right") {
            pos.x = (gameSize.x - this.offset.x) - this.size.x;
        } else if (this.sticky.x == "Centre") {
            pos.x = (gameSize.x / 2) - (this.size.x / 2);
        } else {
            pos.x = this.offset.x;
            console.log("Unknown Sticky Value: ", this.sticky.x);
        }
        if (this.sticky.y == "Top"){
            pos.y = this.offset.y;
        } else if (this.sticky.y == "Bottom") {
            pos.y = (gameSize.y - this.offset.y) - this.size.y;
        } else if (this.sticky.y == "Centre") {
            pos.y = (gameSize.y / 2) - (this.size.y / 2);
        } else {
            pos.y = this. offset.y;
            console.log("Unknown Sticky Value: ", this.sticky.y);
        }
        return pos;
    }

    draw(gameSize){}
    update(events){}

    resize(gameSize){
        this.pos = this.calculatePosition(gameSize);
    }
}