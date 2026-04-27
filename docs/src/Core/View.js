//View class that draws each entity and ui element every frame
import {Vector2} from "../Utility/Vector2.js";

export class View {
    constructor(game, model, windowSize){
        this.model = model;
        this.game = game;
        this.pos = new Vector2(0,0);

        this.minSize = new Vector2(1024,576); // The minimum window size

        this.size = this.calculateWindowSize(windowSize);
        createCanvas(this.size.x, this.size.y);

        this.textSize = 20; // Initial text size

        noSmooth(); // Renders Pixel Art Better
    }

    defaultStyle(style){
        //The default style used throughout the game
        //Can be copied top any newly created ui elements
        style.outline = color(50);
        style.outlineWidth = 2;
        style.fillColor = color(255);
        style.textColor = color(0);
        style.font = this.game.assetManager.getFont("PixelMix");
        style.textAlign.x = CENTER;
        style.textAlign.y = CENTER;
        style.textSize = this.textSize;
        style.textStyle = NORMAL;
        style.rounding = 5;
    }

    calculateWindowSize() {
        //Calculates the window size, keepign a 16:9 ratio and not less than the minimum
        let windowSize = new Vector2(windowWidth, windowHeight)
        let gameSize = new Vector2();

        if (windowSize.x / this.game.gridSize.x > windowSize.y / this.game.gridSize.y) {
            gameSize.x = windowSize.y * this.game.gridSize.x / this.game.gridSize.y;
            gameSize.y = windowSize.y;
        } else {
            gameSize.x = windowSize.x;
            gameSize.y = windowSize.x * this.game.gridSize.y / this.game.gridSize.x;
        }
        if (gameSize.x < this.minSize.x){
            gameSize.x = this.minSize.x
            gameSize.y = this.minSize.y
        }
        return gameSize;
    }


    resize() { // Called whenever the window is resized
               // Resizes all UI elements of the current scene
        this.size = this.calculateWindowSize();
        resizeCanvas(this.size.x, this.size.y);

        if (this.model.scene == null) {return;} // Leave here if no scene is loaded
        
        //This order allows expand to fit, sizematch and anchors to work correctly
        for (let uielement of this.model.scene.uielements){
            uielement.resize();
        }
        for (let uielement of this.model.scene.uielements){
            uielement.matchSize();
        }
        for (let uielement of this.model.scene.uielements){
            uielement.reposition();
        }
        this.model.resize();
    }

    localToScreen(pos){ // Returns a screen coordinate from a grid coordinate
        return pos.multiplyV(this.size).divideV(this.game.gridSize);
    }
    screenToLocal(pos){ // Returns a grid coordinate from a screen coordinate
        return pos.multiplyV(this.game.gridSize).divideV(this.size);
    }

    drawGrid(){ // Draws a grid on the screen, for use when Debug = true
        stroke(0);
        for (let i=1; i<this.game.gridSize.x; i++){
            let l1 = this.localToScreen(new Vector2(i, 0));
            let l2 = this.localToScreen(new Vector2(i, this.game.gridSize.y));
            line(l1.x, l1.y, l2.x, l2.y);
        }
        for (let i = 1; i < this.game.gridSize.y; i++){
            let l1 = this.localToScreen(new Vector2(0, i));
            let l2 = this.localToScreen(new Vector2(this.game.gridSize.x, i));
            line(l1.x, l1.y, l2.x, l2.y);
        }
    }

    draw() { // Draws the game
        background(255);

        if (!this.game.assetManager.isLoaded){
            textAlign(LEFT, TOP);
            if (this.game.assetManager.loadError) {
                fill(180, 0, 0);
                text(this.game.assetManager.loadError, 24, 24, width - 48, height - 48);
            } else {
                fill(0);
                text("Loading...", 100, 100);
            }
            return;
            //Returns if the assets aren't loaded
        }

        textAlign(CENTER, CENTER);

        if (this.game.debug){
            this.drawGrid();
        }

        this.resize();

        this.model.draw(); // Draws the current model

        // Brightness overlay    
        let opacity = (1 - this.game.brightness) * 255;
        fill(0, 0, 0, opacity);
        rect(0, 0, width, height);
    }
}