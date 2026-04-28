import { WelcomeScene } from "./WelcomeScene.js";
import { INTRO_STORY_DATA } from "../Core/StoryData.js";
import { INTRO_CONFIG } from "../Core/IntroSceneConfig.js";

export class IntroScene {
    constructor(game) {
        this.game = game;

        // Some existing systems may expect every scene to have uielements.
        this.uielements = [];

        this.storyData = INTRO_STORY_DATA;
        this.images = new Array(this.storyData.length);

        this.loadedCount = 0;
        this.totalImagesToLoad = this.getImageStoryCount();
        this.hasLoadedImages = false;

        this.currentIndex = 0;

        this.fade = 255;
        this.isFadingOut = false;
        this.hasFinishedIntro = false;

        this.textCharIndex = 0;
        this.frameCounter = 0;
        this.sceneFrame = 0;

        this.loadStoryImages();
    }


    getImageStoryCount() {
        return this.storyData.filter(story => !story.isBlackScreen).length;
    }

    loadStoryImages() {
        this.storyData.forEach((story, index) => {
            if (story.isBlackScreen) {
                return;
            }

            loadImage(
                story.imagePath,
                (img) => this.onImageLoaded(index, img),
                (error) => this.onImageLoadFailed(story.imagePath, error)
            );
        });
    }

    onImageLoaded(index, img) {
        this.images[index] = img;
        this.loadedCount++;

        if (this.loadedCount === this.totalImagesToLoad) {
            this.hasLoadedImages = true;
        }
    }

    onImageLoadFailed(imagePath, error) {
        console.error("Failed to load story image:", imagePath, error);
    }

    update(events = []) {
        if (this.hasFinishedIntro) {
            return;
        }

        this.handleEvents(events);

        if (!this.hasLoadedImages) {
            return;
        }

        this.sceneFrame++;
        this.frameCounter++;

        this.updateFade();
        this.updateText();
    }

    updateFade() {
        if (this.isFadingOut) {
            this.fade += INTRO_CONFIG.fadeSpeed;

            if (this.fade >= 255) {
                this.fade = 255;
                this.goToNextStory();
            }

            return;
        }

        if (this.fade > 0) {
            this.fade -= INTRO_CONFIG.fadeSpeed;

            if (this.fade < 0) {
                this.fade = 0;
            }
        }
    }

    updateText() {
        const currentStory = this.getCurrentStory();

        if (!currentStory || !currentStory.text) {
            return;
        }

        if (this.frameCounter % INTRO_CONFIG.textSpeed !== 0) {
            return;
        }

        if (this.textCharIndex < currentStory.text.length) {
            this.textCharIndex++;
        }
    }

    draw() {
        if (this.hasFinishedIntro) {
            return;
        }

        background(0);

        if (!this.hasLoadedImages) {
            this.drawLoadingScreen();
            return;
        }

        this.drawCurrentStory();
        this.drawFadeOverlay();
    }

    drawCurrentStory() {
        const currentStory = this.getCurrentStory();

        if (!currentStory) {
            this.goToWelcomeScene();
            return;
        }

        if (currentStory.isBlackScreen) {
            this.drawBlackScreenStory(currentStory);
            return;
        }

        const img = this.images[this.currentIndex];

        if (!this.isValidImage(img)) {
            this.drawLoadingScreen();
            return;
        }

        this.drawCoverImage(img);
        this.drawDarkOverlay();
        this.drawTextBox(currentStory);
    }

    handleEvents(events = []) {
        if (!events || this.isFadingOut || this.hasFinishedIntro) {
            return;
        }

        for (const event of events) {
            if (!event) {
                continue;
            }

            if (this.isSkipEvent(event)) {
                this.skipIntro();
                return;
            }

            if (this.isContinueEvent(event)) {
                this.handleNext();
            }
        }
    }

    isContinueEvent(event) {
        if (event.type === "click" || event.type === "mousedown") {
            return true;
        }

        if (event.type === "keydown") {
            return event.key === " " || event.key === "Enter";
        }

        return false;
    }

    isSkipEvent(event) {
        return (
            event.type === "keydown" &&
            event.key &&
            event.key.toLowerCase() === "s"
        );
    }

    handleNext() {
        if (!this.hasLoadedImages || this.isFadingOut || this.hasFinishedIntro) {
            return;
        }

        const currentStory = this.getCurrentStory();

        if (!currentStory || !currentStory.text) {
            this.goToWelcomeScene();
            return;
        }

        // First click / Space: show full text immediately.
        if (this.textCharIndex < currentStory.text.length) {
            this.textCharIndex = currentStory.text.length;
            return;
        }

        // Second click / Space: fade out and go to next story.
        this.isFadingOut = true;
    }

    skipIntro() {
        this.goToWelcomeScene();
    }

    drawLoadingScreen() {
        background(0);

        this.setColor(INTRO_CONFIG.colors.text);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Loading story...", width / 2, height / 2);
    }

    drawCoverImage(img) {
        const { drawWidth, drawHeight, x, y } = this.calculateCoverImageRect(img);
        image(img, x, y, drawWidth, drawHeight);
    }

    calculateCoverImageRect(img) {
        const canvasRatio = width / height;
        const imgRatio = img.width / img.height;

        let drawWidth;
        let drawHeight;

        if (imgRatio > canvasRatio) {
            drawHeight = height;
            drawWidth = height * imgRatio;
        } else {
            drawWidth = width;
            drawHeight = width / imgRatio;
        }

        const zoom = this.getCurrentZoom();

        drawWidth *= zoom;
        drawHeight *= zoom;

        return {
            drawWidth,
            drawHeight,
            x: (width - drawWidth) / 2,
            y: (height - drawHeight) / 2
        };
    }

    getCurrentZoom() {
        const progress = Math.min(this.sceneFrame / 360, 1);
        return lerp(INTRO_CONFIG.zoomStart, INTRO_CONFIG.zoomEnd, progress);
    }

    drawDarkOverlay() {
        this.setColor(INTRO_CONFIG.colors.darkOverlay);
        noStroke();
        rect(0, 0, width, height);
    }

    drawTextBox(currentStory) {
        const box = INTRO_CONFIG.textBox;
        const boxX = box.marginX;
        const boxY = height - box.height - box.bottomMargin;
        const boxWidth = width - box.marginX * 2;

        this.setColor(INTRO_CONFIG.colors.textBox);
        noStroke();
        rect(boxX, boxY, boxWidth, box.height, box.radius);

        this.drawStoryText(currentStory, boxX, boxY, boxWidth);
        this.drawHintText(boxX, boxY, boxWidth, box.height);
    }

    drawStoryText(currentStory, boxX, boxY, boxWidth) {
        const box = INTRO_CONFIG.textBox;
        const visibleText = currentStory.text.substring(0, this.textCharIndex);

        this.setColor(INTRO_CONFIG.colors.text);
        textSize(24);
        textAlign(LEFT, TOP);
        textWrap(WORD);

        text(
            visibleText,
            boxX + box.paddingX,
            boxY + box.paddingY,
            boxWidth - box.paddingX * 2
        );
    }

    drawHintText(boxX, boxY, boxWidth, boxHeight) {
        this.setColor(INTRO_CONFIG.colors.hintText);
        textSize(15);
        textAlign(RIGHT, BOTTOM);

        text(
            INTRO_CONFIG.hints.normal,
            boxX + boxWidth - 30,
            boxY + boxHeight - 18
        );
    }

    drawBlackScreenStory(currentStory) {
        background(0);

        const visibleText = currentStory.text.substring(0, this.textCharIndex);

        this.setColor(INTRO_CONFIG.colors.text);
        textSize(40);
        textAlign(CENTER, CENTER);
        text(visibleText, width / 2, height / 2);

        this.setColor(INTRO_CONFIG.colors.blackScreenHint);
        textSize(15);
        textAlign(CENTER, CENTER);
        text(INTRO_CONFIG.hints.blackScreen, width / 2, height / 2 + 70);
    }

    drawFadeOverlay() {
        fill(0, this.fade);
        noStroke();
        rect(0, 0, width, height);
    }

    goToNextStory() {
        this.currentIndex++;

        console.log("Current intro index:", this.currentIndex);
        console.log("Story length:", this.storyData.length);

        if (this.currentIndex >= this.storyData.length) {
            console.log("Intro finished. Going to WelcomeScene.");
            this.goToWelcomeScene();
            return;
        }

        this.resetStoryState();
    }

    resetStoryState() {
        this.fade = 255;
        this.isFadingOut = false;
        this.textCharIndex = 0;
        this.frameCounter = 0;
        this.sceneFrame = 0;
    }

    goToWelcomeScene() {
        this.hasFinishedIntro = true;
        this.game.model.scene = new WelcomeScene(this.game);
    }

    getCurrentStory() {
        if (
            !this.storyData ||
            this.currentIndex < 0 ||
            this.currentIndex >= this.storyData.length
        ) {
            return null;
        }

        return this.storyData[this.currentIndex];
    }

    isValidImage(img) {
        return img && img.width > 0 && img.height > 0;
    }

    setColor(colorArray) {
        fill(...colorArray);
    }
}