var Random;
(function (Random) {
    function inRange(min, max) {
        return Math.abs(Math.random()) * (max - min) + min;
    }
    Random.inRange = inRange;
})(Random || (Random = {}));
;
var RenderingEngine = (function () {
    function RenderingEngine(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
    RenderingEngine.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    RenderingEngine.prototype.drawStar = function (star) {
        var k = 128 / star.position.z;
        var px = star.position.x * k + (this.canvas.width / 2);
        var py = star.position.y * k + (this.canvas.height / 2);
        if (px >= 0 && px <= this.canvas.width && py >= 0 && py <= this.canvas.height) {
            var s = star.shade;
            this.context.fillStyle = "rgb(" + s + ", " + s + ", " + s + ")";
            this.context.fillRect(px, py, star.size, star.size);
        }
    };
    return RenderingEngine;
})();
;
var Point3 = (function () {
    function Point3(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    Point3.Random = function () {
        return new Point3(Random.inRange(-20, 20), Random.inRange(-20, 20), Random.inRange(0, 32));
    };
    return Point3;
})();
var Star = (function () {
    function Star() {
        this.size = 0;
        this.shade = 0;
        this.reset();
        this.position.z = Random.inRange(0, 32);
    }
    Star.prototype.reset = function () {
        this.position = Point3.Random();
    };
    Star.prototype.update = function () {
        this.position.z -= 0.2;
        if (this.position.z <= 0)
            this.reset();
        this.size = (1 - this.position.z / 32.0) * 5;
        this.shade = Math.floor((1 - this.position.z / 32.0) * 255);
        return this;
    };
    Star.prototype.draw = function (engine) {
        engine.drawStar(this);
        return this;
    };
    return Star;
})();
;
var App = (function () {
    function App() {
    }
    App.prototype.init = function () {
        this.engine = new RenderingEngine(document.getElementById("target"));
        this.stars = new Array();
        for (var i = 0; i < 512; i++) {
            this.stars.push(new Star());
        }
        return this;
    };
    App.prototype.run = function () {
        var _this = this;
        var that = this;
        var iterate = function () {
            that.engine.clear();
            that.stars.forEach(function (star) { return star.update().draw(_this.engine); });
            setTimeout(iterate, 33);
        };
        iterate();
    };
    return App;
})();
window.onload = function () {
    new App().init().run();
};