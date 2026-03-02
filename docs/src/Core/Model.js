//Model class that holds all game data and the current scene
//Global data is held here
//Data local to the scene is held in the scene
export class Model {
    constructor(game){
        this.scene = null;
        this.game = game;
        //TODO add any game variables here (e.g money or day)
    }
    update(events){
        if (this.scene != null){
            this.scene.update(events);
        }
    }

    draw(){
        if (this.scene != null){
            this.scene.draw();
        }
    }


}