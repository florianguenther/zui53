
class window.Painting
  constructor: (zui, paper, @color = "#000000")->
    @zui = zui
    @paper = paper
    
    # @color = "#000000"
    
    # @enable()
    
    # $(@zui).bind 'pan.start', @disable
    # $(@zui).bind 'pan.stop', @enable
    
    @use_capture = true
    
  enable: ()=>
    $(@zui.viewport).bind 'mousedown', @start
    # window.addEventListener 'mousedown', @start, true
    @zui.viewport.addEventListener 'touchstart', @touch_start, @use_capture
    
  disable: ()=>
    $(@zui.viewport).unbind 'mousedown', @start
    @zui.viewport.removeEventListener 'touchstart', @touch_start, @use_capture
    
  _internal_start: (x, y)=>
    point = @zui.clientToSurface(x, y)
    
    @array = []
    @array[0] = ["M", point.e(1), point.e(2)];
    @item = @paper.path(@array);
    @item.attr({
      stroke: @color,
      "stroke-width": (3 / @zui.scale),
      "stroke-linejoin": "round",
      "stroke-linecap": "round"
    });
    
  _internal_move: (x, y)=>
    point = @zui.clientToSurface(x, y)
    
    @array.push ["L", point.e(1), point.e(2)];

    @item.attr({path: @array});
    
  start: (e)=>
    # console.log "START Painting"
    @_internal_start(e.clientX, e.clientY)
    
    $(@zui.viewport).bind 'mousemove', @move
    $(@zui.viewport).bind 'mouseup', @stop
    
  move: (e)=>
    @_internal_move(e.clientX, e.clientY)
    
  stop: (e)=>
    $(@zui.viewport).unbind 'mousemove', @move
    $(@zui.viewport).unbind 'mouseup', @stop
    
  touch_start: (e)=>
    if e.targetTouches.length > 1
      return
      
    e.preventDefault()
    t = e.targetTouches[0]
    
    @_internal_start(t.clientX, t.clientY)
    
    @zui.viewport.addEventListener 'touchmove', @touch_move, @use_capture
    @zui.viewport.addEventListener 'touchend', @touch_stop, @use_capture
    @zui.viewport.addEventListener 'gesturestart', @touch_stop, @use_capture
    
  touch_move: (e)=>
    console.log "MOVE: #{e.targetTouches.length}"
    if e.targetTouches.length > 1
      @touch_stop(e)
      return
    # console.log 'touch painting move'
    t = e.targetTouches[0]
    @_internal_move(t.clientX, t.clientY)
    
  touch_stop: (e)=>
    # console.log 'touch painting stop'
    @zui.viewport.removeEventListener 'touchmove', @touch_move, @use_capture
    @zui.viewport.removeEventListener 'touchend', @touch_stop, @use_capture
    @zui.viewport.removeEventListener 'gesturestart', @touch_stop, @use_capture
    
  # smooth: ()=>
  #       # // This code is based on the work by Oleg V. Polikarpotchkin,
  #       # // http://ov-p.spaces.live.com/blog/cns!39D56F0C7A08D703!147.entry
  #       # // It was extended to support closed paths by averaging overlapping
  #       # // beginnings and ends. The result of this approach is very close to
  #       # // Polikarpotchkin's closed curve solution, but reuses the same
  #       # // algorithm as for open paths, and is probably executing faster as
  #       # // well, so it is preferred.
  #       segments = @array
  #       size = segments.length
  #       n = size
  #       # // Add overlapping ends for averaging handles in closed paths
  #       overlap = 0
  # 
  #       if size <= 2
  #         return
  # 
  #       # if (this._closed) {
  #       #   // Overlap up to 4 points since averaging beziers affect the 4
  #       #   // neighboring points
  #       #   overlap = Math.min(size, 4);
  #       #   n += Math.min(size, overlap) * 2;
  #       # } else {
  #       #   overlap = 0;
  #       # }
  #       
  #       knots = []
  #       for (var i = 0; i < size; i++)
  #         knots[i + overlap] = segments[i]._point;
  #         
  #       # if (this._closed) {
  #       #   # // If we're averaging, add the 4 last points again at the
  #       #   # // beginning, and the 4 first ones at the end.
  #       #   for (var i = 0; i < overlap; i++) {
  #       #     knots[i] = segments[i + size - overlap]._point;
  #       #     knots[i + size + overlap] = segments[i]._point;
  #       #   }
  #       # } else {
  #         n--
  #       # }
  #       
  #       # // Calculate first Bezier control points
  #       # // Right hand side vector
  #       rhs = []
  # 
  #       # // Set right hand side X values
  #       for (var i = 1; i < n - 1; i++)
  #         rhs[i] = 4 * knots[i]._x + 2 * knots[i + 1]._x;
  #       rhs[0] = knots[0]._x + 2 * knots[1]._x;
  #       rhs[n - 1] = 3 * knots[n - 1]._x;
  #       
  #       # // Get first control points X-values
  #       x = getFirstControlPoints(rhs)
  # 
  #       # // Set right hand side Y values
  #       for (var i = 1; i < n - 1; i++)
  #         rhs[i] = 4 * knots[i]._y + 2 * knots[i + 1]._y;
  #       rhs[0] = knots[0]._y + 2 * knots[1]._y;
  #       rhs[n - 1] = 3 * knots[n - 1]._y;
  #       
  #       # // Get first control points Y-values
  #       y = getFirstControlPoints(rhs)
  # 
  #       # if (this._closed) {
  #       #   // Do the actual averaging simply by linearly fading between the
  #       #   // overlapping values.
  #       #   for (var i = 0, j = size; i < overlap; i++, j++) {
  #       #     var f1 = (i / overlap);
  #       #     var f2 = 1 - f1;
  #       #     // Beginning
  #       #     x[j] = x[i] * f1 + x[j] * f2;
  #       #     y[j] = y[i] * f1 + y[j] * f2;
  #       #     // End
  #       #     var ie = i + overlap, je = j + overlap;
  #       #     x[je] = x[ie] * f2 + x[je] * f1;
  #       #     y[je] = y[ie] * f2 + y[je] * f1;
  #       #   }
  #       #   n--;
  #       # }
  #       
  #       handleIn = null
  #       # // Now set the calculated handles
  #       for (var i = overlap; i <= n - overlap; i++) {
  #         var segment = segments[i - overlap];
  #         if (handleIn)
  #           segment.setHandleIn(handleIn.subtract(segment._point));
  #         if (i < n) {
  #           segment.setHandleOut(
  #               new Point(x[i], y[i]).subtract(segment._point));
  #           if (i < n - 1)
  #             handleIn = new Point(
  #                 2 * knots[i + 1]._x - x[i + 1],
  #                 2 * knots[i + 1]._y - y[i + 1]);
  #           else
  #             handleIn = new Point(
  #                 (knots[n]._x + x[n - 1]) / 2,
  #                 (knots[n]._y + y[n - 1]) / 2);
  #         }
  #       }
  #       # if (this._closed && handleIn) {
  #       #   var segment = this._segments[0];
  #       #   segment.setHandleIn(handleIn.subtract(segment._point));
  #       # }
  #     
