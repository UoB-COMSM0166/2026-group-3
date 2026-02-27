//Controller class that updates every entity and uielement in the scene every frame
export class Controller {
    constructor(game, model){
        this.model = model;
        this.eventQueue = [];
        this.game = game;
    }

    update() {
        if (!this.game.assetManager.isLoaded){
            return;
        }
        cursor(ARROW);
        let events = this.eventQueue;
        this.eventQueue = [];
        if (this.model.scene == null) return;
        
        for (let entity of this.model.scene.entities){
            entity.update(events);
        }
        for (let uielement of this.model.scene.uielements){
            uielement.update(events);
        }
    }
    onEvent(event){
        this.eventQueue.push(event);
    }

}