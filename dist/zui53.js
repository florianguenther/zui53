(function() {
  var CSSNode, PanController, SVGNode, SurfaceNode, ZoomController;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }, __hasProp = Object.prototype.hasOwnProperty, __extends = function(child, parent) {
    for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
    function ctor() { this.constructor = child; }
    ctor.prototype = parent.prototype;
    child.prototype = new ctor;
    child.__super__ = parent.prototype;
    return child;
  };
  PanController = (function() {
    function PanController(zui, html) {
      this.pan = __bind(this.pan, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.attach = __bind(this.attach, this);      this.vp = zui;
      this.vpHtml = html;
      this.eventDispatcher = zui.viewport;
    }
    PanController.prototype.attach = function() {
      console.log('attaching pan');
      return $(this.eventDispatcher).mousedown(this.start);
    };
    PanController.prototype.start = function(e) {
      if (e.target === this.vpHtml) {
        this.startX = e.layerX;
        this.startY = e.layerY;
        window.addEventListener('mousemove', this.pan, true);
        return window.addEventListener('mouseup', this.stop, true);
      }
    };
    PanController.prototype.stop = function(e) {
      console.log('stop panning');
      window.removeEventListener('mousemove', this.pan, true);
      return window.removeEventListener('mouseup', this.stop, true);
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
  SurfaceNode = (function() {
    function SurfaceNode(node) {
      this.node = node;
    }
    return SurfaceNode;
  })();
  SVGNode = (function() {
    __extends(SVGNode, SurfaceNode);
    function SVGNode() {
      this.apply = __bind(this.apply, this);
      SVGNode.__super__.constructor.apply(this, arguments);
    }
    SVGNode.prototype.apply = function(panX, panY, scale) {
      var singleSVG;
      singleSVG = "translate(" + panX + ", " + panY + ") scale(" + scale + ", " + scale + ")";
      return $(this.node).attr("transform", singleSVG);
    };
    return SVGNode;
  })();
  CSSNode = (function() {
    __extends(CSSNode, SurfaceNode);
    function CSSNode() {
      this.apply = __bind(this.apply, this);
      CSSNode.__super__.constructor.apply(this, arguments);
    }
    CSSNode.prototype.apply = function(panX, panY, scale) {
      var matrix;
      matrix = "matrix(" + scale + ", 0.0, 0.0, " + scale + ", " + panX + ", " + panY + ")";
      return $(this.node).css("-webkit-transform", matrix);
    };
    return CSSNode;
  })();
  window.ZUI = (function() {
    function ZUI(vp) {
      this.translateSurface = __bind(this.translateSurface, this);
      this.doZoom = __bind(this.doZoom, this);
      this.panBy = __bind(this.panBy, this);
      this.updateSurface = __bind(this.updateSurface, this);
      this.surfaceToClient = __bind(this.surfaceToClient, this);
      this.clientToSurface = __bind(this.clientToSurface, this);
      this.addCSSNode = __bind(this.addCSSNode, this);
      this.addSVGNode = __bind(this.addSVGNode, this);      this.zoomPos = 0.0;
      this.scale = 1.0;
      this.viewport = vp;
      this.surfaces = [];
      this.vpOffset = $(vp).offset();
      this.vpOffM = $M([[1, 0, this.vpOffset.left], [0, 1, this.vpOffset.top], [0, 0, 1]]);
      this.surfaceM = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      console.log("OFFSET", this.vpOffM);
      this.zoom = new ZoomController(this);
      this.zoom.attach();
    }
    ZUI.prototype.addSVGNode = function(svg) {
      return this.surfaces.push(new SVGNode(svg));
    };
    ZUI.prototype.addCSSNode = function(css) {
      return this.surfaces.push(new CSSNode(css));
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
