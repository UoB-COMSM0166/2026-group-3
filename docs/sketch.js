let Rslider;
let Gslider;
let Bslider;
let Aslider;

function setup() {
    createCanvas(700, 700);
    background(220);
    textSize(20);
    text("first painting",10,40);

    Rslider = createSlider(0,255);
    Rslider.position(20,100);
    text("R",0,115);
    Gslider = createSlider(0,255);
    Gslider.position(20,120);
    text("G",0,135);
    Bslider = createSlider(0,255);
    Bslider.position(20,140);
    text("B",0,155);
    Aslider = createSlider(0,255);
    Aslider.position(20,160);
    text("A",0,175);
}

function draw() {
    fill(220);
    rect(20,100,140,80);
    fill(Rslider.value(),Gslider.value(),Bslider.value(),Aslider.value())
    square(10,50,40);

    if (mouseIsPressed){
        noStroke();

        square(mouseX,mouseY,15)
    }
}
