(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.Painting = (function() {
    function Painting(zui, paper) {
      this.stop = __bind(this.stop, this);
      this.move = __bind(this.move, this);
      this.start = __bind(this.start, this);      this.zui = zui;
      this.paper = paper;
      $(zui.viewport).mousedown(this.start);
    }
    Painting.prototype.start = function(e) {
      var point;
      console.log("start");
      point = this.zui.clientToSurface(e.clientX, e.clientY);
      this.array = [];
      this.array[0] = ["M", point.e(1), point.e(2)];
      this.item = this.paper.path(this.array);
      this.item.attr({
        stroke: "#000000",
        "stroke-width": 3 / this.zui.scale,
        "stroke-linejoin": "round",
        "stroke-linecap": "round"
      });
      $(this.zui.viewport).bind('mousemove', this.move);
      return $(this.zui.viewport).bind('mouseup', this.stop);
    };
    Painting.prototype.move = function(e) {
      var point;
      console.log("move");
      point = this.zui.clientToSurface(e.clientX, e.clientY);
      this.array.push(["L", point.e(1), point.e(2)]);
      return this.item.attr({
        path: this.array
      });
    };
    Painting.prototype.stop = function(e) {
      console.log("stop");
      $(this.zui.viewport).unbind('mousemove', this.move);
      return $(this.zui.viewport).unbind('mouseup', this.stop);
    };
    return Painting;
  })();
}).call(this);
