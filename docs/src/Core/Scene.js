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




}