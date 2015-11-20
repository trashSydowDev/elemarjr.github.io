var MathHelper;
(function (MathHelper) {
    function distance(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    MathHelper.distance = distance;
})(MathHelper || (MathHelper = {}));
var BarnsleyFern = (function () {
    function BarnsleyFern() {
        this.nthPoint = { x: 0, y: 0 };
    }
    BarnsleyFern.prototype.f_1 = function () {
        this.nthPoint.x = 0;
        this.nthPoint.y *= 0.16;
    };
    ;
    BarnsleyFern.prototype.f_2 = function () {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = 0.85 * oldX + 0.04 * oldY;
        this.nthPoint.y = -0.04 * oldX + 0.85 * oldY + 1.6;
    };
    BarnsleyFern.prototype.f_3 = function () {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = 0.2 * oldX + -0.26 * oldY;
        this.nthPoint.y = 0.23 * oldX + 0.22 * oldY + 1.6;
    };
    BarnsleyFern.prototype.f_4 = function () {
        var oldX = this.nthPoint.x;
        var oldY = this.nthPoint.y;
        this.nthPoint.x = -0.15 * oldX + 0.28 * oldY;
        this.nthPoint.y = 0.26 * oldX + 0.24 * oldY + 0.44;
    };
    BarnsleyFern.prototype.iterate = function () {
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
    };
    return BarnsleyFern;
})();
var BarnsleyViewport = (function () {
    function BarnsleyViewport(w, h) {
        this.margin = 40;
        this.points = new Array(2);
        this.moving = 0;
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
    BarnsleyViewport.prototype.getLimits = function () {
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
    };
    BarnsleyViewport.prototype.pickPoint = function (x, y) {
        if (MathHelper.distance(x, y, this.points[0].x, this.points[0].y) < 10)
            return 0;
        if (MathHelper.distance(x, y, this.points[1].x, this.points[1].y) < 10)
            return 1;
        return -1;
    };
    ;
    BarnsleyViewport.prototype.project = function (point) {
        var limits = this.getLimits();
        var w = limits.max.x - limits.min.x;
        var h = limits.max.y - limits.min.y;
        return {
            x: point.x * (w / 5) + limits.min.x + ((2.18 / 5) * w),
            y: point.y * (h / 10) + limits.min.y
        };
    };
    return BarnsleyViewport;
})();
var RenderingEngine = (function () {
    function RenderingEngine(canvas) {
        this.canvas = canvas;
        this.drawPoint = function (p) {
            this.drawLine(p.x, p.y, p.x + 1, p.y);
        };
        this.context = canvas.getContext('2d');
    }
    RenderingEngine.prototype.clear = function () {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    };
    ;
    RenderingEngine.prototype.setColor = function (color) {
        this.context.strokeStyle = color;
    };
    RenderingEngine.prototype.drawLine = function (x1, y1, x2, y2) {
        this.context.beginPath();
        this.context.moveTo(x1, this.canvas.height - y1);
        this.context.lineTo(x2, this.canvas.height - y2);
        this.context.closePath();
        this.context.stroke();
    };
    ;
    RenderingEngine.prototype.drawMarker = function (x, y) {
        this.drawLine(x - 10, y, x + 10, y);
        this.drawLine(x, y - 10, x, y + 10);
    };
    ;
    RenderingEngine.prototype.drawFrame = function (x1, y1, x2, y2, moving) {
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
    ;
    return RenderingEngine;
})();
var App = (function () {
    function App() {
    }
    App.prototype.init = function () {
        var _this = this;
        this.model = new BarnsleyFern();
        var canvas = document.getElementById('target');
        this.engine = new RenderingEngine(canvas);
        this.viewport = new BarnsleyViewport(canvas.width, canvas.height);
        var that = this;
        canvas.addEventListener('click', function (e) {
            var picked = 0;
            var nx = e.pageX - canvas.offsetLeft;
            var ny = _this.engine.canvas.height - (e.pageY - canvas.offsetTop);
            if ((picked = that.viewport.pickPoint(nx, ny)) != -1)
                that.viewport.moving = picked;
            else {
                that.viewport.points[that.viewport.moving].x = nx;
                that.viewport.points[that.viewport.moving].y = ny;
                _this.engine.clear();
            }
        });
        return this;
    };
    App.prototype.run = function () {
        var that = this;
        var iterate = function () {
            that.engine.setColor("#0f0");
            for (var i = 0; i < 100; i++) {
                that.engine.drawPoint(that.viewport.project(that.model.iterate()));
            }
            that.engine.drawFrame(that.viewport.points[0].x, that.viewport.points[0].y, that.viewport.points[1].x, that.viewport.points[1].y, that.viewport.moving);
            setTimeout(iterate, 33);
        };
        this.engine.clear();
        iterate();
    };
    return App;
})();
window.onload = function () {
    new App()
        .init()
        .run();
};
//# sourceMappingURL=app.js.map