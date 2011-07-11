class window.ZoomController
  constructor: (zui)->
    @vp = zui
    @eventDispatcher = zui.viewport
    @use_capture = true # on event handling
    
  attach: ()=>
    $(@eventDispatcher).mousewheel @zoom
    @eventDispatcher.addEventListener 'touchstart', @touch_start, @use_capture
    @eventDispatcher.addEventListener 'gesturestart', @gesture_start, @use_capture
    
  zoom: (e)=>
    delta = e.wheelDelta || (e.detail * -1)
    f = 0.05
    if delta < 0
      f *= -1
      
    @vp.zoomBy(f, e.clientX, e.clientY)
    
    e.stopImmediatePropagation()
    e.preventDefault()
  
  gesture_start: (e)=>
    # e.preventDefault()
    @start_scale = @vp.scale
    @eventDispatcher.addEventListener 'gesturechange', @gesture_zoom, @use_capture
    @eventDispatcher.addEventListener 'gestureend', @gesture_end, @use_capture
    
  gesture_zoom: (e)=>
    @vp.zoomSet( @start_scale * e.scale, @last_touch_p.e(1), @last_touch_p.e(2))
    
  gesture_end: (e)=>
    @eventDispatcher.removeEventListener 'gesturechange', @gesture_zoom, @use_capture
    @eventDispatcher.removeEventListener 'gestureend', @gesture_end, @use_capture
  
  touch_start: (e)=>
    if e.targetTouches.length != 2
      return

    e.preventDefault()
    
    @eventDispatcher.addEventListener 'touchmove', @touch_pan, @use_capture
    @eventDispatcher.addEventListener 'touchend', @touch_end, @use_capture
    
    @last_touch_p = @find_midpoint(e)

  touch_pan: (e)=>
    new_touch_p = @find_midpoint(e)
    d = new_touch_p.subtract(@last_touch_p)
    @last_touch_p = new_touch_p
    @vp.panBy(d.e(1), d.e(2))
    
  find_midpoint: (e)=>
    t1 = e.targetTouches[0]
    t2 = e.targetTouches[1]
    p1 = $V([t1.clientX, t1.clientY, 1])
    p2 = $V([t2.clientX, t2.clientY, 1])
    
    d = p2.subtract(p1).multiply(0.5)
    p = p1.add(d)
    
    
  touch_end: (e)=>
    @eventDispatcher.removeEventListener 'touchmove', @touch_pan, @use_capture
    @eventDispatcher.removeEventListener 'touchend', @touch_end, @use_capture