class RenderingEngine {
    private canvas: HTMLCanvasElement;
    private context: CanvasRenderingContext2D;
 
    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
 
    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
 
    width = () => this.canvas.width;
    height = () => this.canvas.height;
 
    drawCircle(circle: ICircle) {
        this.context.fillStyle = "rgb(255, 255, 255)";
        this.context.beginPath();
        this.context.arc(circle.getCenter().getX(), circle.getCenter().getY(), circle.getRadius(), 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
    }
};
 
class Point {
    private x : number;
    private y : number;
 
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }
 
    getX = () => this.x;
    getY = () => this.y; 
 
    distanceTo(another: Point): number {
        var dx = this.x - another.x;
        var dy = this.y - another.y;
        return Math.sqrt(dx * dx + dy * dy);
    }
 
    add(another: Point): Point {
        return new Point(
            this.x + another.x,
            this.y + another.y
        );
    }
}
 
interface ICircle {
    getCenter() : Point;
    getRadius() : number;
}
 
class Sphere implements  ICircle {
    private center: Point;
    private velocity: Point;
 
    private radius : number;
    private mass : number;
 
    constructor(position: Point, velocity: Point, radius: number, mass: number) {
        this.mass = mass;
        this.radius = radius;
        this.velocity = velocity;
        this.center = position;
    }
 
    left = () => this.center.getX() - this.radius;
    right = () => this.center.getX() + this.radius;
    top = () => this.center.getY() - this.radius;
    bottom = () => this.center.getY() + this.radius;
 
    update(engine : RenderingEngine): Sphere {
        this.center = this.center.add(this.velocity);
 
        if (this.left() < 0 || this.right() > engine.width()) {
            this.velocity = new Point(this.velocity.getX() * -1, this.velocity.getY());
        }
 
        if (this.top() < 0 || this.bottom() > engine.height()) {
            this.velocity = new Point(this.velocity.getX(), this.velocity.getY() * -1);
        }
 
        return this;
    }
 
    collide(another: Sphere): boolean {
        return this.center.distanceTo(another.center) <
            (this.radius + another.radius);
    }
 
    draw(engine: RenderingEngine): void {
        engine.drawCircle(this);
    }
 
    getCenter = () => this.center; 
    getRadius = () => this.radius;
     
    getVelocity = () => this.velocity;
    getMass = () => this.mass;
 
    moveTo(point: Point): void {
        this.center = point;
    }
 
    adjustVelocity(dx : number, dy: number): void {
        this.velocity = new Point(dx, dy);
    }
}
 
class SphereSet {
    private spheres: Array<Sphere>;
 
    constructor(canvasWidth : number, canvasHeight : number, numberOfSpheres : number = 50) {
        this.spheres = new Array<Sphere>();
        for (var i = 0; i < numberOfSpheres; i++) {
            var x = 20 + (Math.random() * (canvasWidth - 40));
            var y = 20 + (Math.random() * (canvasHeight - 40));
            var radius = 5 + Math.random() * 10;
            var mass = radius / 2;
            var vX = Math.random() * 4 - 2;
            var vY = Math.random() * 4 - 2;
            this.spheres.push(new Sphere(new Point(x, y), new Point(vX, vY), radius, mass));
        }
    }
 
    update(engine: RenderingEngine): void {
        this.spheres.forEach((sphere) => sphere.update(engine));
         
        for (var i = 0; i < this.spheres.length; i++)
        for (var j = i + 1; j < this.spheres.length; j++) {
            if (this.spheres[i].collide(this.spheres[j])) {
                var sphere1 = this.spheres[i];
                var sphere2 = this.spheres[j];
 
                var dX = sphere2.getCenter().getX() - sphere1.getCenter().getX();
                var dY = sphere2.getCenter().getY() - sphere1.getCenter().getY();
                 
                var angle = Math.atan2(dY, dX);
                var sine = Math.sin(angle);
                var cosine = Math.cos(angle);
 
                var x = 0;
                var y = 0;
                var xB = dX * cosine + dY * sine;
                var yB = dY * cosine - dX * sine;
                var vX = sphere1.getVelocity().getX() * cosine + sphere1.getVelocity().getY() * sine;
                var vY = sphere1.getVelocity().getY() * cosine - sphere1.getVelocity().getX() * sine;
                var vXb = sphere2.getVelocity().getX() * cosine + sphere2.getVelocity().getY() * sine;
                var vYb = sphere2.getVelocity().getY() * cosine - sphere2.getVelocity().getX() * sine;
                var vTotal = vX - vXb;
                 
                vX = ((sphere1.getMass() - sphere2.getMass()) * vX + 2 * sphere2.getMass() * vXb)
                    / (sphere1.getMass() + sphere2.getMass());
                 
                vXb = vTotal + vX;
                xB = x + (sphere1.getRadius() + sphere2.getRadius());
 
                sphere1.moveTo(new Point(
                    sphere1.getCenter().getX() + (x * cosine - y * sine),
                    sphere1.getCenter().getY() + (y * cosine + x * sine)
                ));
 
                sphere2.moveTo(new Point(
                    sphere1.getCenter().getX() + (xB * cosine - yB * sine),
                    sphere1.getCenter().getY() + (yB * cosine + xB * sine)
                    ));
 
                sphere1.adjustVelocity(
                    vX * cosine - vY * sine,
                    vY * cosine + vX * sine
                );
 
                sphere2.adjustVelocity(
                    vXb * cosine - vYb * sine,
                    vYb * cosine + vXb * sine
                );
            }        
        }
    }
 
    draw(engine: RenderingEngine): void {
        this.spheres.forEach((sphere) => sphere.draw(engine));
    }
}
 
class App {
    private engine: RenderingEngine;
    private spheres : SphereSet;
 
    init(): App {
        this.engine = new RenderingEngine(
            <HTMLCanvasElement> document.getElementById("target")
            );
        this.spheres = new SphereSet(this.engine.width(), this.engine.height());
        return this;
    }
 
    run(): void {
        var that = this;
 
        var iterate = () => {
            that.engine.clear();
            this.spheres.update(this.engine);
            this.spheres.draw(this.engine);
            setTimeout(iterate, 33);
        };
 
        iterate();
    }
} 

 
window.onload = () => {
    new App()
        .init()
        .run();
};