class Matrix {
    constructor(public cells) {
    }

    mult(m: Matrix): Matrix {
        var result = [];
        for (var i = 0; i < 4; i++) {
            result[i] = [];
            for (var j = 0; j < 4; j++) {
                result[i][j] = this.cells[i][0] * m.cells[0][j] +
                this.cells[i][1] * m.cells[1][j] +
                this.cells[i][2] * m.cells[2][j] +
                this.cells[i][3] * m.cells[3][j];
            }
        }
        return new Matrix(result);
    }

    static identity(): Matrix {
        return new Matrix([
            [1, 0, 0, 0],
            [0, 1, 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    }

    static rotationZ(q: number): Matrix {
        return new Matrix([
            [Math.cos(q), Math.sin(q), 0, 0],
            [-Math.sin(q), Math.cos(q), 0, 0],
            [0, 0, 1, 0],
            [0, 0, 0, 1]
        ]);
    }

    static rotationX(q: number): Matrix {
        return new Matrix([
            [1, 0, 0, 0],
            [0, Math.cos(q), Math.sin(q), 0],
            [0, -Math.sin(q), Math.cos(q), 0],
            [0, 0, 0, 1]
        ]);
    }

    static rotationY(q: number): Matrix {
        return new Matrix([
            [Math.cos(q), 0, -Math.sin(q), 0],
            [0, 1, 0, 0],
            [Math.sin(q), 0, Math.cos(q), 0],
            [0, 0, 0, 1]
        ]);
    }

    static translation(dx: number, dy: number = 0, dz: number = 0): Matrix {
        return new Matrix([
            [1, 0, 0, dx],
            [0, 1, 0, dy],
            [0, 0, 1, dz],
            [0, 0, 0, 1]
        ]);
    }

    static scale(sx: number, sy: number, sz: number): Matrix {
        return new Matrix([
            [sx, 0, 0, 0],
            [0, sx, 0, 0],
            [0, 0, sz, 0],
            [0, 0, 0, 1]
        ]);
    }
}


class Vector3 {
    constructor(public x: number, public y: number, public z: number)
    { }

    perspective(viewWidth: number, viewHeight: number, fov: number, viewDistance: number): Vector3 {
        var factor = fov / (viewDistance + this.z);
        var nx = this.x * factor + viewWidth / 2;
        var ny = this.y * factor + viewHeight / 2;
        return new Vector3(nx, ny, this.z);
    }

    normalize(): Vector3 {
        var d = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        return new Vector3(this.x / d, this.y / d, this.z / d);
    }

    cross(another: Vector3): Vector3 {
        var nx = this.y * another.z - this.z * another.y;
        var ny = this.z * another.x - this.x * another.z;
        var nz = this.x * another.y - this.y * another.x;
        return new Vector3(nx, ny, nz);
    }

    dot(another: Vector3): number {
        return this.x * another.x + this.y * another.y + this.z * another.z;
    }

    mult(m: Matrix): Vector3 {
        var nx = m.cells[0][0] * this.x +
            m.cells[0][1] * this.y +
            m.cells[0][2] * this.z +
            m.cells[0][3];
        var ny = m.cells[1][0] * this.x +
            m.cells[1][1] * this.y +
            m.cells[1][2] * this.z +
            m.cells[1][3];
        var nz = m.cells[2][0] * this.x +
            m.cells[2][1] * this.y +
            m.cells[2][2] * this.z +
            m.cells[2][3];
        return new Vector3(nx, ny, nz);
    }
}

class Cube {

    constructor(
        public scaleMatrix: Matrix,
        public rotationMatrix: Matrix,
        public translationMatrix: Matrix
        ) { }

    vertices: Array<Vector3> = [
        new Vector3(-1, 1, -1),
        new Vector3(1, 1, -1),
        new Vector3(1, -1, -1),
        new Vector3(-1, -1, -1),
        new Vector3(-1, 1, 1),
        new Vector3(1, 1, 1),
        new Vector3(1, -1, 1),
        new Vector3(-1, -1, 1)
    ];

    faces = [
        [0, 1, 2, 3],
        [1, 5, 6, 2],
        [5, 4, 7, 6],
        [4, 0, 3, 7],
        [0, 4, 5, 1],
        [3, 2, 6, 7]
    ];

}

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

    drawCube(cube: Cube) {
        var colors = [
            "rgb(255, 0, 0)",
            "rgb(0, 255, 0)",
            "rgb(0, 0, 255)",
            "rgb(255, 255, 0)",
            "rgb(0, 255, 255)",
            "rgb(255, 0, 255)"
        ];

        var t = new Array();
        var i: number;
        for (i = 0; i < 8; i++) {

            var v = cube.vertices[i];

            var r = v
                .mult(cube.scaleMatrix)
                .mult(cube.rotationMatrix)
                .mult(cube.translationMatrix);

            t.push(r.perspective(this.width(), this.height(),
                Math.min(this.width(), this.height()) * 0.9,
                3.5)
                );
        }

        this.context.strokeStyle = "rgb(255,255,255)";
        for (i = 0; i < cube.faces.length; i++) {
            var f = cube.faces[i];
            // calculando o vetor normal
            var v1 = new Vector3(
                t[f[1]].x - t[f[0]].x,
                t[f[1]].y - t[f[0]].y,
                t[f[1]].z - t[f[0]].z);
            var v2 = new Vector3(
                t[f[3]].x - t[f[0]].x,
                t[f[3]].y - t[f[0]].y,
                t[f[3]].z - t[f[0]].z);
            var vcross = v1.cross(v2);

            if (vcross.z < 0) { // face oculta
                this.context.fillStyle = colors[i];
                this.context.beginPath();
                this.context.moveTo(t[f[0]].x, t[f[0]].y);
                this.context.lineTo(t[f[1]].x, t[f[1]].y);
                this.context.lineTo(t[f[2]].x, t[f[2]].y);
                this.context.lineTo(t[f[3]].x, t[f[3]].y);
                this.context.closePath();
                this.context.fill();
            }
        }
    }
};

class CubeSet {
    private cubes : Array<Cube>;

    constructor() {
        this.cubes = new Array<Cube>();

        this.cubes.push(new Cube(
            Matrix.scale(0.75, 0.75, 0.75),
            Matrix.identity(),
            Matrix.translation(1, 0, 0)
            ));
        this.cubes.push(new Cube(
            Matrix.scale(0.5, 0.5, 0.5),
            Matrix.identity(),
            Matrix.translation(-1, 0, 0)
            ));
    }

    update() : CubeSet {
        var dtr = (value) => value * Math.PI / 180;
        
        this.cubes[0].rotationMatrix = this.cubes[0].rotationMatrix
            .mult(Matrix.rotationX(dtr(1)))
            .mult(Matrix.rotationY(dtr(1)))
            .mult(Matrix.rotationZ(dtr(1)));
        this.cubes[1].rotationMatrix = this.cubes[1].rotationMatrix
            .mult(Matrix.rotationX(dtr(-1)));

        return this;
    }

    draw(engine: RenderingEngine) {
        this.cubes.forEach(cube => engine.drawCube(cube)); 
    }
}

class App {
    private engine: RenderingEngine;
    private cubes: CubeSet;

    init(): App {
        this.engine = new RenderingEngine(
            <HTMLCanvasElement> document.getElementById("target")
            );
        this.cubes = new CubeSet();
        return this;
    }

    run(): void {
        var that = this;

        var iterate = () => {
            that.engine.clear();
            that.cubes.update().draw(that.engine);
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