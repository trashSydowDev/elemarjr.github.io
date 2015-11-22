module MathHelper {
    export function distance(x1: number, y1: number, x2: number, y2: number) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);        
    }
}

interface IPointXY { 
    x: number;
    y: number;
}



class RenderingEngine {
    private context: CanvasRenderingContext2D
    constructor(
        public canvas : HTMLCanvasElement
        )
    {
        this.context = canvas.getContext('2d')
    }
    
    public clear() {
        this.context.fillStyle = "white"
        this.context.fillRect(0, 0,
            this.canvas.width,
            this.canvas.height
            );
    };
    
    public setColor(color : string) 
    {
        this.context.strokeStyle = color;
    }
    
    public drawLine(x1: number, y1: number, x2: number, y2: number, pen: number) {
        this.context.beginPath();
        this.context.moveTo(x1, this.canvas.height - y1);
        this.context.lineTo(x2, this.canvas.height - y2);
        this.context.lineWidth = pen;
        this.context.lineCap = "round";
        this.context.stroke();
    };
}
    

class App {
    private engine: RenderingEngine;
    
    public init() {
        var canvas = <HTMLCanvasElement> document.getElementById('target');
        this.engine = new RenderingEngine(canvas);
        return this;
    }
    
    public run() {
        var iterate = () => {
            this.engine.clear();
            this.drawTree(12, this.engine.canvas.width / 2, 10, this.engine.canvas.height / 8, Math.PI / 2, 12)
            setTimeout(iterate, 2000);
        }
        this.engine.clear();
        iterate();
    }
    
    private drawTree(depth: number, x: number, y: number, length: number, theta: number, branchWidth: number) {
 
        if (depth < 0) return;
    
        var rand = Math.random;
        var maxAngle = Math.PI / 2;
        var x2 = x + length * Math.cos(theta);
        var y2 = y + length * Math.sin(theta);
    
        this.engine.setColor((depth <= 2) ?
            'rgb(0,' + Math.round(rand() * 64 + 128) + ',0)' :
            'rgb(' + Math.round(rand() * 64 + 64) + ',50,25)'
        );
    
        this.engine.drawLine(x, y, x2, y2, branchWidth);
    
        var subBranches = rand() * 2 + 1;
        for (var i = 0; i < subBranches; i++) {
            this.drawTree(
                depth - 1,
                x2, y2,
                length * (0.7 + rand() * 0.3),
                theta + rand() * maxAngle - 0.5 * maxAngle,
                branchWidth * 0.7
                );
        }
    };
}

window.onload = () => {
    new App()
        .init()
        .run();
};