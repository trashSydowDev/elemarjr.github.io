var RenderingEngine = (function () {
    function RenderingEngine(canvas) {
        var _this = this;
        this.width = function () { return _this.canvas.width; };
        this.height = function () { return _this.canvas.height; };
        this.canvas = canvas;
        this.context = canvas.getContext("2d");
    }
    RenderingEngine.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    RenderingEngine.prototype.drawCircle = function (circle) {
        this.context.fillStyle = "rgb(255, 255, 255)";
        this.context.beginPath();
        this.context.arc(circle.getCenter().getX(), circle.getCenter().getY(), circle.getRadius(), 0, Math.PI * 2);
        this.context.closePath();
        this.context.fill();
    };
    return RenderingEngine;
})();
;
var Point = (function () {
    function Point(x, y) {
        var _this = this;
        this.getX = function () { return _this.x; };
        this.getY = function () { return _this.y; };
        this.x = x;
        this.y = y;
    }
    Point.prototype.distanceTo = function (another) {
        var dx = this.x - another.x;
        var dy = this.y - another.y;
        return Math.sqrt(dx * dx + dy * dy);
    };
    Point.prototype.add = function (another) {
        return new Point(this.x + another.x, this.y + another.y);
    };
    return Point;
})();
var Sphere = (function () {
    function Sphere(position, velocity, radius, mass) {
        var _this = this;
        this.left = function () { return _this.center.getX() - _this.radius; };
        this.right = function () { return _this.center.getX() + _this.radius; };
        this.top = function () { return _this.center.getY() - _this.radius; };
        this.bottom = function () { return _this.center.getY() + _this.radius; };
        this.getCenter = function () { return _this.center; };
        this.getRadius = function () { return _this.radius; };
        this.getVelocity = function () { return _this.velocity; };
        this.getMass = function () { return _this.mass; };
        this.mass = mass;
        this.radius = radius;
        this.velocity = velocity;
        this.center = position;
    }
    Sphere.prototype.update = function (engine) {
        this.center = this.center.add(this.velocity);
        if (this.left() < 0 || this.right() > engine.width()) {
            this.velocity = new Point(this.velocity.getX() * -1, this.velocity.getY());
        }
        if (this.top() < 0 || this.bottom() > engine.height()) {
            this.velocity = new Point(this.velocity.getX(), this.velocity.getY() * -1);
        }
        return this;
    };
    Sphere.prototype.collide = function (another) {
        return this.center.distanceTo(another.center) <
            (this.radius + another.radius);
    };
    Sphere.prototype.draw = function (engine) {
        engine.drawCircle(this);
    };
    Sphere.prototype.moveTo = function (point) {
        this.center = point;
    };
    Sphere.prototype.adjustVelocity = function (dx, dy) {
        this.velocity = new Point(dx, dy);
    };
    return Sphere;
})();
var SphereSet = (function () {
    function SphereSet(canvasWidth, canvasHeight, numberOfSpheres) {
        if (numberOfSpheres === void 0) { numberOfSpheres = 50; }
        this.spheres = new Array();
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
    SphereSet.prototype.update = function (engine) {
        this.spheres.forEach(function (sphere) { return sphere.update(engine); });
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
                    sphere1.moveTo(new Point(sphere1.getCenter().getX() + (x * cosine - y * sine), sphere1.getCenter().getY() + (y * cosine + x * sine)));
                    sphere2.moveTo(new Point(sphere1.getCenter().getX() + (xB * cosine - yB * sine), sphere1.getCenter().getY() + (yB * cosine + xB * sine)));
                    sphere1.adjustVelocity(vX * cosine - vY * sine, vY * cosine + vX * sine);
                    sphere2.adjustVelocity(vXb * cosine - vYb * sine, vYb * cosine + vXb * sine);
                }
            }
    };
    SphereSet.prototype.draw = function (engine) {
        this.spheres.forEach(function (sphere) { return sphere.draw(engine); });
    };
    return SphereSet;
})();
var App = (function () {
    function App() {
    }
    App.prototype.init = function () {
        this.engine = new RenderingEngine(document.getElementById("target"));
        this.spheres = new SphereSet(this.engine.width(), this.engine.height());
        return this;
    };
    App.prototype.run = function () {
        var _this = this;
        var that = this;
        var iterate = function () {
            that.engine.clear();
            _this.spheres.update(_this.engine);
            _this.spheres.draw(_this.engine);
            setTimeout(iterate, 33);
        };
        iterate();
    };
    return App;
})();
window.onload = function () {
    new App()
        .init()
        .run();
};
