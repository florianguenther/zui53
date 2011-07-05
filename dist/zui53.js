(function() {
  var PanController, Viewport, ZoomController;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  PanController = (function() {
    function PanController(viewport, html) {
      this.pan = __bind(this.pan, this);
      this.stop = __bind(this.stop, this);
      this.start = __bind(this.start, this);
      this.attach = __bind(this.attach, this);      this.vp = viewport;
      this.vpHtml = html;
    }
    PanController.prototype.attach = function() {
      console.log('attaching pan');
      return window.addEventListener('mousedown', this.start, false);
    };
    PanController.prototype.start = function(e) {
      if (e.target === this.vpHtml) {
        this.startX = e.layerX;
        this.startY = e.layerY;
        console.log('start panning');
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
    function ZoomController(viewport) {
      this.zoom = __bind(this.zoom, this);
      this.attach = __bind(this.attach, this);      this.vp = viewport;
    }
    ZoomController.prototype.attach = function() {
      return $(window).mousewheel(this.zoom);
    };
    ZoomController.prototype.zoom = function(e) {
      var f;
      f = 0.05;
      if (e.wheelDelta < 0) {
        f *= -1;
      }
      return this.vp.doZoom(f, e.clientX, e.clientY);
    };
    return ZoomController;
  })();
  Viewport = (function() {
    function Viewport() {
      this.translateSurface = __bind(this.translateSurface, this);
      this.doZoom = __bind(this.doZoom, this);
      this.panBy = __bind(this.panBy, this);
      this.updateSurface = __bind(this.updateSurface, this);
      this.surfaceToClient = __bind(this.surfaceToClient, this);
      this.clientToSurface = __bind(this.clientToSurface, this);      this.zoomPos = 0.0;
      this.scale = 1.0;
      this.viewport = $('#viewport')[0];
      this.surface = $('#viewport .surface')[0];
      this.vpOffset = $(this.viewport).offset();
      this.vpOffM = $M([[1, 0, this.vpOffset.left], [0, 1, this.vpOffset.top], [0, 0, 1]]);
      this.surfaceM = $M([[1, 0, 0], [0, 1, 0], [0, 0, 1]]);
      console.log("OFFSET", this.vpOffM);
      console.log("init pan", this.surface);
      this.pan = new PanController(this, this.viewport);
      this.pan.attach();
      this.zoom = new ZoomController(this);
      this.zoom.attach();
    }
    Viewport.prototype.clientToSurface = function(x, y) {
      var sV, v;
      v = $V([x, y, 1]);
      return sV = this.surfaceM.inverse().multiply(this.vpOffM.inverse().multiply(v));
    };
    Viewport.prototype.surfaceToClient = function(v) {
      return this.vpOffM.multiply(this.surfaceM.multiply(v));
    };
    Viewport.prototype.updateSurface = function() {
      var matrix, pX, pY, scale;
      pX = this.surfaceM.e(1, 3);
      pY = this.surfaceM.e(2, 3);
      scale = this.surfaceM.e(1, 1);
      matrix = "matrix(" + scale + ", 0.0, 0.0, " + scale + ", " + pX + ", " + pY + ")";
      return $(this.surface).css("-webkit-transform", matrix);
    };
    Viewport.prototype.panBy = function(x, y) {
      this.translateSurface(x, y);
      return this.updateSurface();
    };
    Viewport.prototype.doZoom = function(byF, clientX, clientY) {
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
    Viewport.prototype.translateSurface = function(x, y) {
      return this.surfaceM = this.surfaceM.add($M([[0, 0, x], [0, 0, y], [0, 0, 0]]));
    };
    return Viewport;
  })();
  jQuery(function() {
    console.log("Ready");
    return window.zui53 = new Viewport();
  });
}).call(this);
