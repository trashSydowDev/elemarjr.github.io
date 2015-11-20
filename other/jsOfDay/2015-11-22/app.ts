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


class BarnsleyFern {
    private nthPoint = {x: 0, y: 0}
    
    private f_1() {
        this.nthPoint.x = 0;
        this.nthPoint.y *= 0.16;
    };
    private f_2() {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = 0.85 * oldX + 0.04 * oldY;
        this.nthPoint.y = -0.04 * oldX + 0.85 * oldY + 1.6;
    }
    private f_3() {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = 0.2 * oldX + -0.26 * oldY;
        this.nthPoint.y = 0.23 * oldX + 0.22 * oldY + 1.6;
    }
    private f_4() {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = -0.15 * oldX + 0.28 * oldY;
        this.nthPoint.y = 0.26 * oldX + 0.24 * oldY + 0.44;
    } 

    public iterate() : IPointXY {
        var rand = Math.floor(Math.random() * 100);
        if (rand <= 3)
            this.f_1();
        else if (rand <= 76)
            this.f_2();
        else if (rand <= 90)
            this.f_3();
        else if (rand >= 90)
            this.f_4();
        return this.nthPoint;
    }
}

interface ILimits {
    min : IPointXY;
    max : IPointXY;
}

class BarnsleyViewport {
    private margin = 40;
    public points = new Array<IPointXY>(2);
    public moving = 0;
    
    constructor(w: number, h: number) {
        var size = Math.min(w, h) - this.margin;
        
        this.points[0] = {
            x: w / 2 - size / 4,
            y: h / 2 - size / 2
        };
        
        this.points[1] = {
            x: w / 2 + size / 4,
            y: h / 2 + size / 2
        };
    }
    
    public getLimits() : ILimits {
        return {
            min: {
                x: Math.min(this.points[0].x, this.points[1].x),
                y: Math.min(this.points[0].y, this.points[1].y)
            },
            max: {
                x: Math.max(this.points[0].x, this.points[1].x),
                y: Math.max(this.points[0].y, this.points[1].y)
            }
        };
    }
    
    public pickPoint(x: number, y: number) {
        if (MathHelper.distance(x, y, this.points[0].x, this.points[0].y) < 10)
            return 0;
        if (MathHelper.distance(x, y, this.points[1].x, this.points[1].y) < 10)
            return 1;
        return -1;
    };
    
    public project(point : IPointXY) {
        var limits = this.getLimits();
        var w = limits.max.x - limits.min.x;
        var h = limits.max.y - limits.min.y;
        return {
            x: point.x * (w / 5) + limits.min.x + ((2.18 / 5) * w),
            y: point.y * (h / 10) + limits.min.y
        }
    }
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
        this.context.clearRect(0, 0,
            this.canvas.width,
            this.canvas.height
            );
    };
    
    public setColor(color : string) 
    {
        this.context.strokeStyle = color;
    }
    
    public drawLine(x1: number, y1: number, x2: number, y2: number) {
        this.context.beginPath();
        this.context.moveTo(x1, this.canvas.height - y1);
        this.context.lineTo(x2, this.canvas.height - y2);
        this.context.closePath();
        this.context.stroke();
    };
    
    public drawPoint = function (p: IPointXY) {
        this.drawLine(p.x, p.y, p.x + 1, p.y);
    };
    
    public drawMarker(x: number, y: number) {
        this.drawLine(x - 10, y, x + 10, y);
        this.drawLine(x, y - 10, x, y + 10);
    };
    
        
    public drawFrame(x1: number, y1: number, x2: number, y2: number, moving: number) {
        this.context.strokeStyle = "#eee";
        this.drawLine(x1, y1, x2, y1);
        this.drawLine(x2, y1, x2, y2);
        this.drawLine(x2, y2, x1, y2);
        this.drawLine(x1, y2, x1, y1);
        this.context.strokeStyle = 0 == moving ? "#f00" : "#fff";
        this.drawMarker(x1, y1);
        this.context.strokeStyle = 1 == moving ? "#f00" : "#fff";
        this.drawMarker(x2, y2);
    }; 
}
    

class App {
    private engine: RenderingEngine;
    private model: BarnsleyFern;
    private viewport: BarnsleyViewport
    
    public init() {
        this.model = new BarnsleyFern();
        var canvas = <HTMLCanvasElement> document.getElementById('target');
        this.engine = new RenderingEngine(canvas);
        this.viewport = new BarnsleyViewport(canvas.width, canvas.height);
        
        var that = this;
        canvas.addEventListener('click', (e) => {
            var picked = 0;
            var nx = e.pageX - canvas.offsetLeft;
            var ny = this.engine.canvas.height - (e.pageY - canvas.offsetTop);
            if ((picked = that.viewport.pickPoint(nx, ny)) != -1)
                that.viewport.moving = picked;
            else {
                that.viewport.points[that.viewport.moving].x = nx;
                that.viewport.points[that.viewport.moving].y = ny;
                this.engine.clear();
            }
        });
        return this;
    }
    
    public run() {
        
        var that = this;
        var iterate = () => {
            that.engine.setColor( "#0f0");
            for (var i = 0; i < 100; i++) {
                that.engine.drawPoint(that.viewport.project(that.model.iterate()));
            }
            that.engine.drawFrame(
                that.viewport.points[0].x, 
                that.viewport.points[0].y, 
                that.viewport.points[1].x, 
                that.viewport.points[1].y, 
                that.viewport.moving);
            setTimeout(iterate, 33);
        }
        this.engine.clear();
        iterate();
    }
}

window.onload = () => {
    new App()
        .init()
        .run();
};