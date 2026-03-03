//Abstract class representing the current scene
//Stores any data for the current scene
//Contains all entities and elements for the current scene
//All scenes that extend this are contained in the Scenes folder
export class Scene {
    constructor(game){
        this.entities = [];
        this.uielements = [];
        this.game = game;
    }

    update(events){
        for (let entity of this.entities){
            entity.update(events);
        }
        for (let uielement of this.uielements){
            uielement.update(events);
        }
    }
    draw(){
        for (let entity of this.entities){
            entity.draw();
        }
        for (let uielement of this.uielements){
            uielement.draw();
        }
    }
    getEntity(id){
        for (let entity of this.entities){
            if (entity.id=="id"){
                return entity;
            }
        }
        return null;
    }
    getEntities(id){
        let entities = [];
        for (let entity of this.entities){
            
        }
    }
    addEntity(entity){}
    removeEntity(entity){}
    


}