var MathHelper;
(function (MathHelper) {
    function distance(x1, y1, x2, y2) {
        var dx = x2 - x1;
        var dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    }
    MathHelper.distance = distance;
})(MathHelper || (MathHelper = {}));
var RenderingEngine = (function () {
    function RenderingEngine(canvas) {
        this.canvas = canvas;
        this.context = canvas.getContext('2d');
    }
    RenderingEngine.prototype.clear = function () {
        this.context.fillStyle = "white";
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    };
    ;
    RenderingEngine.prototype.setColor = function (color) {
        this.context.strokeStyle = color;
    };
    RenderingEngine.prototype.drawLine = function (x1, y1, x2, y2, pen) {
        this.context.beginPath();
        this.context.moveTo(x1, this.canvas.height - y1);
        this.context.lineTo(x2, this.canvas.height - y2);
        this.context.lineWidth = pen;
        this.context.lineCap = "round";
        this.context.stroke();
    };
    ;
    return RenderingEngine;
})();
var App = (function () {
    function App() {
    }
    App.prototype.init = function () {
        var canvas = document.getElementById('target');
        this.engine = new RenderingEngine(canvas);
        return this;
    };
    App.prototype.run = function () {
        var _this = this;
        var iterate = function () {
            _this.engine.clear();
            _this.drawTree(12, _this.engine.canvas.width / 2, 10, _this.engine.canvas.height / 8, Math.PI / 2, 12);
            setTimeout(iterate, 2000);
        };
        this.engine.clear();
        iterate();
    };
    App.prototype.drawTree = function (depth, x, y, length, theta, branchWidth) {
        if (depth < 0)
            return;
        var rand = Math.random;
        var maxAngle = Math.PI / 2;
        var x2 = x + length * Math.cos(theta);
        var y2 = y + length * Math.sin(theta);
        this.engine.setColor((depth <= 2) ?
            'rgb(0,' + Math.round(rand() * 64 + 128) + ',0)' :
            'rgb(' + Math.round(rand() * 64 + 64) + ',50,25)');
        this.engine.drawLine(x, y, x2, y2, branchWidth);
        var subBranches = rand() * 2 + 1;
        for (var i = 0; i < subBranches; i++) {
            this.drawTree(depth - 1, x2, y2, length * (0.7 + rand() * 0.3), theta + rand() * maxAngle - 0.5 * maxAngle, branchWidth * 0.7);
        }
    };
    ;
    return App;
})();
window.onload = function () {
    new App()
        .init()
        .run();
};
