//View class that draws each entity and ui element every frame
import {Vector2} from "../Utility/Vector2.js";

export class View {
    constructor(game, model, windowSize){
        this.model = model;
        this.game = game;
        this.pos = new Vector2(0,0);

        this.size = this.calculateWindowSize(windowSize);
        createCanvas(this.size.x, this.size.y);
    }

    defaultStyle(style){
        style.outline = color(100);
        style.fillColor = color(90,90,255);
        style.textColor = color(0);
        style.font = 'Courier New';
        style.textAlign.x = CENTER;
        style.textAlign.y = CENTER;
        style.textSize = 20;
        style.textStyle = NORMAL;
    }

    calculateWindowSize(windowSize) {
        let gameSize = new Vector2();

        if (windowSize.x / this.game.gridSize.x > windowSize.y / this.game.gridSize.y) {
            gameSize.x = windowSize.y * this.game.gridSize.x / this.game.gridSize.y;
            gameSize.y = windowSize.y;
        } else {
            gameSize.x = windowSize.x;
            gameSize.y = windowSize.x * this.game.gridSize.y / this.game.gridSize.x;
        }
        return gameSize;
    }


    resize(windowSize) {
        this.size = this.calculateWindowSize(windowSize);
        resizeCanvas(this.size.x, this.size.y);
        for (let uielement of this.model.scene.uielements){
            uielement.resize(this.size);
        }
    }

    localToScreen(pos){
        return pos.multiplyV(this.size).divideV(this.game.gridSize);
    }
    screenToLocal(pos){
        return pos.multiplyV(this.game.gridSize).divideV(this.size);
    }

    drawGrid(){
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
    //TODO: figure out a way to draw everything in the correct order
    //All assets should be layered correctly
    //Maybe sort by y-height
    draw() {
        background(255);
    // Visualize allowed area (left 1/6th of grid)
        fill(100, 100, 255, 50); // semi-transparent blue
        noStroke();
        let rectWidth = this.localToScreen(new Vector2(this.game.gridSize.x / 6+0.5, 0)).x;
        let rectHeight = this.localToScreen(new Vector2(0, this.game.gridSize.y)).y;
        rect(0, 0, rectWidth, rectHeight);


        if (!this.game.assetManager.isLoaded){
            text("Loading...",100,100);
            return;
        }

        if (this.game.debug){
            this.drawGrid();
        }
        if (this.model.scene == null){
            return;
        }
        for (let entity of this.model.scene.entities){
            entity.draw();
            
        }
        for (let uielement of this.model.scene.uielements){
            uielement.draw();
        }
    }
}