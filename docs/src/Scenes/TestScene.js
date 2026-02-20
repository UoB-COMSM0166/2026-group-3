//Test Scene
import {Scene} from "../Core/Scene.js";
import {TestEntity} from "../Entities/TestEntity.js";
import {TestUIElement} from "../UIElements/TestUIElement.js";

export class TestScene extends Scene {
    constructor(game){
        super(game);

        let testEntity = new TestEntity(game);
        this.entities.push(testEntity);

        let testUIElement = new TestUIElement(game);
        this.uielements.push(testUIElement);
    }
}