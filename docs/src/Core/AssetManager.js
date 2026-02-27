
export class AssetManager {
    constructor(callback){
        this.isLoaded = false;
        this.promises = []
        this.images = {};
    }

    async preload(){

        //Add all image loads here:

        this.loadImage("testSprite","./assets/test_image.png");

        // for testing loading:

        // for (let i=0; i<1000; i++){
        //     this.load("testSprites","./assets/test_image.png");
        // }

        await Promise.all(this.promises);
        this.isLoaded = true;
    }

    //Can be called to load an image individually
    //Be aware of async stuff
    async loadImage(name,path){
        this.promises.push(loadImage(path).then(value => this.images[name] = value));
    }

    getImage(name){
        return this.images[name];
    }
}