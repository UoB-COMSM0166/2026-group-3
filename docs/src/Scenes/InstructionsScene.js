import { Menu } from "../UIElements/Menu.js";
import { Vector2 } from "../Utility/Vector2.js";
import { Label } from "../UIElements/Label.js";
import { Button } from "../UIElements/Button.js";
export class InstructionsScene extends Menu {
  constructor(game) {
   super(game, new Vector2(500,500));
this.position = new Vector2(0, 120);

    this.style.fillColor = color(150);
    this.style.outlineWidth = 3

    this.title = new Label(
          game,
          "INSTRUCTIONS",
          new Vector2(420, 50),
          new Vector2("Centre", "Top"),
          new Vector2() 
        );

        this.title.style.textSize = 30;
        this.title.textSizeOverride = true;
        this.title.style.textAlign = { x: "center", y: "center" };
        this.title.parent = this;

         // Back button
        this.backButton = new Button(
                 game,
                 "",
                 new Vector2(32, 32),
                 new Vector2("Right", "Top"),
                 new Vector2(-8, 8)
            );
            this.backButton.parent = this;
            this.backButton.image = "Cross Button";
            this.backButton.expandToFit.x = false;
            this.backButton.expandToFit.y = false;
        
            this.backButton.onClick = function() {
        
              // Hide all instructions scene 
              this.parent.isVisible = false;
            };

            [this.title,
            this.backButton,
    ].forEach((el) => this.elements.push(el));
  }

  draw(){
    super.draw();

    if (!this.isVisible) { return; }

    fill(0);
    textAlign(CENTER, CENTER);
    textSize(12);
    textStyle(BOLD);

    text(
`DOOMSDAY KITCHEN: SHOOTER PHASE

Harvest ingredients before the dinner rush begins.

CONTROLS
WASD - Move
Space - Shoot

THE STAKES
If zombies get too close, the kitchen falls.

Reach the kitchen for full controls... if you dare.`,
      this.pos.x + this.size.x / 2,
      this.pos.y + 220
    );
  }


   
}
   

