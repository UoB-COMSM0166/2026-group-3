import {UIElement} from "../Core/UIElement.js";
import {Vector2} from "../Utility/Vector2.js";
import {Style} from "../Utility/Style.js";

export class PhaseProgressBar extends UIElement {
    constructor(game, leftAnchor, rightAnchor){

        super(game, new Vector2(), new Vector2(), new Vector2("Right", "Top"));
        this.style = new Style();
        game.view.defaultStyle(this.style);
        this.style.fillColor = color(0);
        this.style.rounding = 10;

        this.leftAnchor = leftAnchor;
        this.rightAnchor = rightAnchor;
        this.pos = new Vector2();
        this.pos.y = 10;
    }

    draw(){
        if (!this.isVisible) { return; }

        let phaseProgress = this.game.model.gameState.phaseProgress;
        let time = this.game.model.gameState.time;
        let xMin = this.pos.x + 10;
        let xMax = this.pos.x + this.size.x - 10;
        let xSize = xMax - xMin


        let dayNightBoundary = xMin + (xSize * phaseProgress)
        

        let sunPos = null;
        let moonPos = null

        if (time == "Night"){
            if (phaseProgress < 0.5){
                moonPos = xMin + (xSize * (0.5 + phaseProgress))
            } else {
                sunPos = xMin + (xSize * (phaseProgress - 0.5))
            }
        } else {
            if (phaseProgress < 0.5){
                sunPos = xMin + (xSize * (0.5 + phaseProgress))
            } else {
                moonPos = xMin + (xSize * (phaseProgress - 0.5))
            }
        }
        
        fill(this.style.fillColor);
        stroke(color(0,0,0,0));

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);

        this.drawGradient(xMin, xMax, sunPos, moonPos)

        if (sunPos!=null){
            text("☀️", sunPos - this.size.y/2 - 3, this.pos.y, this.size.y, this.size.y)
        }
        if (moonPos!=null){
            text("🌙", moonPos - this.size.y/2 - 3, this.pos.y, this.size.y, this.size.y)
        }
        
        fill(color(0,0,0,0));
        stroke(this.style.outline);
        strokeWeight(this.style.outlineWidth);

        rect(this.pos.x, this.pos.y, this.size.x, this.size.y, this.style.rounding);

        stroke(color(150,50,50))
        strokeWeight((3))

        line(dayNightBoundary, this.pos.y + 2, dayNightBoundary, this.pos.y + this.size.y - 2);


        
    }


    drawGradient(xMin, xMax, sunPos, moonPos){
        let lightBlue = color(0, 150, 230);
        let darkBlue = color(0, 0, 64);
        let x_color = color(0)
        let drawWidth = 5;



        for (let x = xMin; x < xMax; x+= drawWidth){
            
            if (sunPos != null){
                let x_distance = abs(x - sunPos)
                if (x_distance/(this.size.x) < 0.25){
                    x_color = lightBlue
                } else {
                    let p = (x_distance/(this.size.x) - 0.25)
                    x_color = this.mixColors(darkBlue, lightBlue, p)
                }
            }
            if (moonPos != null){
                let x_distance = abs(x - moonPos)
                if (x_distance/(this.size.x) < 0.25){
                    x_color = darkBlue
                } else {
                    let p = (x_distance/(this.size.x) - 0.25)
                    x_color = this.mixColors(lightBlue, darkBlue, p)
                }
            }
            fill(x_color);
            stroke(x_color);
            rect(x, this.pos.y, drawWidth, this.size.y)
        }
    }


    mixColors(color1, color2, p){

        let redc = (red(color1) * p) + (red(color2) * (1-p));
        let greenc = (green(color1) * p) + (green(color2) * (1-p));
        let bluec = (blue(color1) * p) + (blue(color2) * (1-p));

        let c = color(redc, greenc, bluec);
        return c;
    }

    reposition(){
        this.pos.x = this.leftAnchor.pos.x + this.leftAnchor.size.x + 10
    }

    resize(){
        this.style.textSize = this.game.view.textSize;

        this.size.y = 1.5 * this.style.textSize
        this.size.x = this.rightAnchor.pos.x - this.pos.x - 10;
        
    }
}