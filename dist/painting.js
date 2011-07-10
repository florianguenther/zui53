(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.Painting = (function() {
    function Painting(zui, paper) {
      this.stop = __bind(this.stop, this);
      this.move = __bind(this.move, this);
      this.start = __bind(this.start, this);
      this.disable = __bind(this.disable, this);
      this.enable = __bind(this.enable, this);      this.zui = zui;
      this.paper = paper;
      this.color = "#000000";
      this.enable();
      $(this.zui).bind('pan.start', this.disable);
      $(this.zui).bind('pan.stop', this.enable);
    }
    Painting.prototype.enable = function() {
      return $(this.zui.viewport).bind('mousedown', this.start);
    };
    Painting.prototype.disable = function() {
      return $(this.zui.viewport).unbind('mousedown', this.start);
    };
    Painting.prototype.start = function(e) {
      var point;
      console.log("START Painting");
      point = this.zui.clientToSurface(e.clientX, e.clientY);
      this.array = [];
      this.array[0] = ["M", point.e(1), point.e(2)];
      this.item = this.paper.path(this.array);
      this.item.attr({
        stroke: this.color,
        "stroke-width": 3 / this.zui.scale,
        "stroke-linejoin": "round",
        "stroke-linecap": "round"
      });
      $(this.zui.viewport).bind('mousemove', this.move);
      return $(this.zui.viewport).bind('mouseup', this.stop);
    };
    Painting.prototype.move = function(e) {
      var point;
      point = this.zui.clientToSurface(e.clientX, e.clientY);
      this.array.push(["L", point.e(1), point.e(2)]);
      return this.item.attr({
        path: this.array
      });
    };
    Painting.prototype.stop = function(e) {
      $(this.zui.viewport).unbind('mousemove', this.move);
      return $(this.zui.viewport).unbind('mouseup', this.stop);
    };
    return Painting;
  })();
}).call(this);
