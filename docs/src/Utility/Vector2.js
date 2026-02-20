//Class for a 2D position
export class Vector2 {
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    }
    sub(v) {
        return this.add(v.multiply(-1));
    }
    multiply(a){
        return new Vector2(this.x * a, this.y * a);
    }
    multiplyV(v) {
        return new Vector2(this.x * v.x, this.y * v.y);
    }
    divide(a){
        return new Vector2(this.x / a, this.y / a);
    }
    divideV(v) {
        return new Vector2(this.x / v.x, this.y / v.y);
    }
    distance(v) {
        let diff = this.sub(v);
        return sqrt((diff.x ** 2) + (diff.y ** 2));
    }
    withinBox(pos, size) {
        if (this.x < pos.x || this.x > pos.x + size.x){
            return false;
        } else if (this.y < pos.y || this.y > pos.y + size.y){
            return false;
        }
        return true;
    }
}