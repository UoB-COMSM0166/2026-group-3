//Abstract class for a UI element in a scene
//All UI elements that inherit from this are stored in the UIElements folder
import {Vector2} from "../Utility/Vector2.js";

export class UIElement {
    constructor(game, offset = new Vector2(), size = new Vector2(), sticky = new Vector2("Left","Top")){
        //UI Element position is relative to the screen
        this.offset = offset;
        this.size = size;
        this.game = game;
        this.parent = game.view // The container of the UI element, usually the view or a menu
        //X sticky: Left, Centre, Right
        //Y sticky: Top, Centre, Bottom 
        this.sticky = sticky; // Represents where on the parent the element will stick to
        this.anchor = new Vector2(null, null); //Another UI element to anchor this one to (in x and y)
        this.pos = this.calculatePosition(); 
        this.sizeMatch = new Vector2([],[]); // A set of UI elements. Will expand to match the largest of these elements
        
        this.isVisible = true;
        this.id = null;
        
    }

    calculatePosition(){
        //Calculates an elements position based on its anchor, sticky and offset
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
            this.anchor.x.reposition()
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
            this.anchor.y.reposition()
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

    draw(){} // Draw the element
    update(events){} // Update the element

    reposition(){
        //Updates the position of the element
        this.pos = this.calculatePosition();
    }

    resize(){} // Resizes the element

    matchSize(){
        // Updates the elements size based on its sizeMatch values
        for (let elem of this.sizeMatch.x){
            if (elem.size.x > this.size.x){
                this.size.x = elem.size.x;
            }
        }
        for (let elem of this.sizeMatch.y){
            if (elem.size.y > this.size.y){
                this.size.y = elem.size.y;
            }
        }
    }

}