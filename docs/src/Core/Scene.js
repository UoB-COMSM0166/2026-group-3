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
            if (entity.id==id){
                return entity;
            }
        }
        return null;
    }
    getEntities(id){
        let entities = [];
        for (let entity of this.entities){
            if (entity.id==id){
                entities.push(entity);
            }
        }
        return entities;
    }
    addEntity(newEntity){
        for (let entity of this.entities){
            if (entity == null){
                entity = newEntity;
                return;
            }
        }
        this.entities.push(newEntity);
    }
    removeEntity(oldEntity){
        for (let i=0; i<this.entities.length; i++){
            if (this.entities[i] == oldEntity){
                if (i!=this.entities.length-1){
                    this.entities[i] = this.entities[this.entities.length-1];
                }
                this.entities.pop();
                return;
            }
        }
    }

    getUIElement(id){
        for (let element of this.uielements){
            if (element.id==id){
                return element;
            }
        }
        return null;
    }
    getUIElements(id){
        let uielements = [];
        for (let element of this.uielements){
            if (element.id==id){
                uielements.push(element);
            }
        }
        return uielements;
    }
    addUIElement(newUIElement){
        newUIElement.resize()
        for (let element of this.uielements){
            if (element == null){
                element = newUIElement;
                return;
            }
        }
        this.uielements.push(newUIElement);
    }
    removeUIElement(oldUIElement){
        for (let i=0; i<this.uielements.length; i++){
            if (this.uielements[i] == oldUIElement){
                if (i!=this.uielements.length-1){
                    this.uielements[i] = this.uielements[this.uielements.length-1];
                }
                this.uielements.pop();
                return;
            }
        }
    }
    


}