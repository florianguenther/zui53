(function() {
  var CSSSurface, PanController, PanOnSpacebarController, SVGSurface, Surface, ZoomController;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  PanController = (function() {
    function PanController(zui) {
      this.pan = __bind(this.pan, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.disablePan = __bind(this.disablePan, this);
      this.detach = __bind(this.detach, this);
      this.enablePan = __bind(this.enablePan, this);
      this.attach = __bind(this.attach, this);      this.vp = zui;
      this.eventDispatcher = zui.viewport;
    }
    PanController.prototype.attach = function() {
      console.log("Attaching PAN");
      return this.enablePan();
    };
    PanController.prototype.enablePan = function() {
      return $(this.eventDispatcher).bind('mousedown', this.start);
    };
    PanController.prototype.detach = function() {
      return this.disablePan();
    };
    PanController.prototype.disablePan = function() {
      return $(this.eventDispatcher).unbind('mousedown', this.start);
    };
    PanController.prototype.start = function(e) {
      console.log("Start panning");
      if (e.target === this.eventDispatcher) {
        $(this.vp).trigger('pan.start', []);
        this.startX = e.layerX;
        this.startY = e.layerY;
        window.addEventListener('mousemove', this.pan, true);
        window.addEventListener('mouseup', this.stop, true);
        console.log("STOP EVENT");
        return e.stopImmediatePropagation();
      } else {
        return console.log("not correct target", e.target, this.eventDispatcher);
      }
    };
    PanController.prototype.stop = function(e) {
      console.log('stop panning');
      window.removeEventListener('mousemove', this.pan, true);
      window.removeEventListener('mouseup', this.stop, true);
      return $(this.vp).trigger('pan.stop', []);
    };
    PanController.prototype.pan = function(e) {
      var dX, dY;
      dX = e.layerX - this.startX;
      dY = e.layerY - this.startY;
      this.startX = e.layerX;
      this.startY = e.layerY;
      return this.vp.panBy(dX, dY);
    };
    return PanController;
  })();
  PanOnSpacebarController = (function() {
    __extends(PanOnSpacebarController, PanController);
    function PanOnSpacebarController(zui) {
      this.detach = __bind(this.detach, this);
      this.disablePan = __bind(this.disablePan, this);
      this.enablePan = __bind(this.enablePan, this);
      this.attach = __bind(this.attach, this);      PanOnSpacebarController.__super__.constructor.apply(this, arguments);
    }
    PanOnSpacebarController.prototype.attach = function() {
      console.log("Attach SpacePan");
      $(window).unbind('keyup', this.disablePan);
      return $(window).bind('keydown', this.enablePan);
    };
    PanOnSpacebarController.prototype.enablePan = function() {
      PanOnSpacebarController.__super__.enablePan.apply(this, arguments);
      return this.detach();
    };
    PanOnSpacebarController.prototype.disablePan = function() {
      PanOnSpacebarController.__super__.disablePan.apply(this, arguments);
      return this.attach();
    };
    PanOnSpacebarController.prototype.detach = function() {
      console.log("Detach SpacePan");
      $(window).unbind('keydown', this.enablePan);
      return $(window).bind('keyup', this.disablePan);
    };
    return PanOnSpacebarController;
  })();
  ZoomController = (function() {
    function ZoomController(zui) {
      this.zoom = __bind(this.zoom, this);
      this.attach = __bind(this.attach, this);      this.vp = zui;
      this.eventDispatcher = zui.viewport;
    }
    ZoomController.prototype.attach = function() {
      return $(this.eventDispatcher).mousewheel(this.zoom);
    };
    ZoomController.prototype.zoom = function(e) {
      var delta, f;
      delta = e.wheelDelta || (e.detail * -1);
      f = 0.05;
      if (delta < 0) {
        f *= -1;
      }
      this.vp.doZoom(f, e.clientX, e.clientY);
      e.stopImmediatePropagation();
      return e.preventDefault();
    };
    return ZoomController;
  })();
  Surface = (function() {
    function Surface(node) {
      this.node = node;
    }
    return Surface;
  })();
  SVGSurface = (function() {
    __extends(SVGSurface, Surface);
    function SVGSurface() {
      this.apply = __bind(this.apply, this);
      SVGSurface.__super__.constructor.apply(this, arguments);
    }
    SVGSurface.prototype.apply = function(panX, panY, scale) {
      var singleSVG;
      singleSVG = "translate(" + panX + ", " + panY + ") scale(" + scale + ", " + scale + ")";
      return $(this.node).attr("transform", singleSVG);
    };
    return SVGSurface;
  })();
  CSSSurface = (function() {
    __extends(CSSSurface, Surface);
    function CSSSurface() {
      this.apply = __bind(this.apply, this);
      CSSSurface.__super__.constructor.apply(this, arguments);
    }
    CSSSurface.prototype.apply = function(panX, panY, scale) {
      var matrix;
      matrix = "matrix(" + scale + ", 0.0, 0.0, " + scale + ", " + panX + ", " + panY + ")";
      return $(this.node).css("-webkit-transform", matrix);
    };
    return CSSSurface;
  })();
  window.Background = (function() {
    __extends(Background, Surface);
    function Background(node, size) {
      this.node = node;
      this.size = size;
      this.apply = __bind(this.apply, this);
    }
    Background.prototype.apply = function(panX, panY, scale) {
      var s;
      s = scale * this.size;
      return $(this.node).css({
        "-webkit-background-size": "" + s + "px " + s + "px",
        "background-position": "" + panX + "px " + panY + "px"
      });
    };
    return Background;
  })();
  window.ZUI = (function() {
    function ZUI(vp) {
      this.translateSurface = __bind(this.translateSurface, this);
      this.doZoom = __bind(this.doZoom, this);
      this.panBy = __bind(this.panBy, this);
      this.updateSurface = __bind(this.updateSurface, this);
      this.surfaceToClient = __bind(this.surfaceToClient, this);
      this.clientToSurface = __bind(this.clientToSurface, this);
      this.addSurface = __bind(this.addSurface, this);
      this.addCSSSurface = __bind(this.addCSSSurface, this);
      this.addSVGSurface = __bind(this.addSVGSurface, this);
      this.enableController = __bind(this.enableController, this);      this.zoomPos = 0;
      this.scale = 1.0;
      this.viewport = vp;
      this.surfaces = [];
      this.vpOffset = $(vp).offset();
      this.vpOffM = $M([[1, 0, this.vpOffset.left], [0, 1, this.vpOffset.top], [0, 0, 1]]);
      this.surfaceM = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      $(vp).scroll(__bind(function(e) {
        var jVP;
        jVP = $(this.viewport);
        this.panBy(-jVP.scrollLeft(), -jVP.scrollTop());
        return jVP.scrollTop(0).scrollLeft(0);
      }, this));
    }
    ZUI.prototype.enableController = function() {
      this.zoom = new ZoomController(this);
      return this.zoom.attach();
    };
    ZUI.prototype.addSVGSurface = function(svg) {
      return this.addSurface(new SVGSurface(svg));
    };
    ZUI.prototype.addCSSSurface = function(css) {
      return this.addSurface(new CSSSurface(css));
    };
    ZUI.prototype.addSurface = function(surface) {
      return this.surfaces.push(surface);
    };
    ZUI.prototype.clientToSurface = function(x, y) {
      var sV, v;
      v = $V([x, y, 1]);
      return sV = this.surfaceM.inverse().multiply(this.vpOffM.inverse().multiply(v));
    };
    ZUI.prototype.surfaceToClient = function(v) {
      return this.vpOffM.multiply(this.surfaceM.multiply(v));
    };
    ZUI.prototype.updateSurface = function() {
      var node, pX, pY, _i, _len, _ref, _results;
      pX = this.surfaceM.e(1, 3);
      pY = this.surfaceM.e(2, 3);
      this.scale = this.surfaceM.e(1, 1);
      _ref = this.surfaces;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        node = _ref[_i];
        _results.push(node.apply(pX, pY, this.scale));
      }
      return _results;
    };
    ZUI.prototype.panBy = function(x, y) {
      this.translateSurface(x, y);
      return this.updateSurface();
    };
    ZUI.prototype.doZoom = function(byF, clientX, clientY) {
      var c, dX, dY, newScale, scaleBy, sf;
      sf = this.clientToSurface(clientX, clientY);
      this.zoomPos += byF;
      newScale = Math.exp(this.zoomPos);
      if (newScale !== this.scale) {
        scaleBy = newScale / this.scale;
        this.surfaceM = this.surfaceM.multiply($M([[scaleBy, 0, 0], [0, scaleBy, 0], [0, 0, 1]]));
        this.scale = newScale;
        c = this.surfaceToClient(sf);
        dX = clientX - c.e(1);
        dY = clientY - c.e(2);
        this.translateSurface(dX, dY);
      }
      return this.updateSurface();
    };
    ZUI.prototype.translateSurface = function(x, y) {
      return this.surfaceM = this.surfaceM.add($M([[0, 0, x], [0, 0, y], [0, 0, 0]]));
    };
    return ZUI;
  })();
}).call(this);
