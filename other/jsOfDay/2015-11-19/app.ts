module Random {
    export function inRange(min: number, max: number): number {
        return Math.abs(Math.random()) * (max - min) + min;
    }
};


interface IRenderingEngine {
    clear() : void;
    drawStar(start: IStar) : void;
}

class RenderingEngine implements IRenderingEngine {
    private canvas: HTMLCanvasElement;
    private context : CanvasRenderingContext2D;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }

    clear(): void {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStar(star: IStar): void {
        var k = 128 / star.position.z;
        var px = star.position.x * k + (this.canvas.width / 2);
        var py = star.position.y * k + (this.canvas.height / 2);
        if (px >= 0 && px <= this.canvas.width && py >= 0 && py <= this.canvas.height) {

            var s = star.shade;
            this.context.fillStyle = "rgb(" + s + ", " + s + ", " + s + ")";

            this.context.fillRect(px, py, star.size, star.size);
        
        }
    }
};

class Point3 {
    constructor(
        public x: number,
        public y: number,
        public z: number
    ) {}

    static Random(): Point3 {
        return new Point3(
            Random.inRange(-20, 20),
            Random.inRange(-20, 20),
            Random.inRange(0, 32)
        );
    }
}

interface IStar {
    position : Point3;
    shade: number;
    size: number; 
    
    update() : IStar;
    draw(engine: IRenderingEngine) : IStar;
}

class Star implements  IStar {
    position : Point3;
    size = 0;
    shade = 0;

    constructor() {
        this.reset();
        this.position.z = Random.inRange(0, 32);
    }

    private reset(): void {
        this.position = Point3.Random();
    }

    update(): IStar {
        this.position.z -= 0.2;
        if (this.position.z <= 0) this.reset();

        this.size = (1 - this.position.z / 32.0) * 5;
        this.shade = Math.floor((1 - this.position.z / 32.0) * 255);

        return this;
    }

    draw(engine): IStar {
        engine.drawStar(this);
        return this;
    }
};

interface IApp {
    init() : IApp;
    run();    
}

class App {
    private engine: RenderingEngine;
    private stars : Array<IStar>;

    init(): App {
        
        this.engine = new RenderingEngine(
            <HTMLCanvasElement> document.getElementById("target")
            );

        this.stars = new Array<IStar>();
        for (var i = 0; i < 512; i++) {
            this.stars.push(new Star());
        }

        return this;
    }

    run(): void {
        var that = this;
        var iterate = () => 
        {
            that.engine.clear();
            that.stars.forEach((star) => star
                .update()
                .draw(this.engine)
                );

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