#= require ./toolset

class window.ZoomTool extends window.Tool
  constructor: (zui)->
    @vp = zui
    @eventDispatcher = zui.viewport
    @use_capture = true # on event handling
    
  attach: ()=>
    $(@eventDispatcher).mousewheel @zoom
    # @eventDispatcher.addEventListener 'touchstart', @touch_start, @use_capture
    @eventDispatcher.addEventListener 'gesturestart', @gesture_start, @use_capture
  
  detach: ()=>
    $(@eventDispatcher).unmousewheel @zoom
    # @eventDispatcher.removeEventListener 'touchstart', @touch_start, @use_capture
    @eventDispatcher.removeEventListener 'gesturestart', @gesture_start, @use_capture
   
  zoom: (e)=>
    delta = e.wheelDelta || (e.detail * -1)
    f = 0.05
    if delta < 0
      f *= -1
      
    @vp.zoomBy(f, e.clientX, e.clientY)
    
    e.stopImmediatePropagation()
    e.preventDefault()
  
  gesture_start: (e)=>
    console.log "Gesture Start"
    @makeExclusive()
    @last_touch_p = null
    
    @start_scale = @vp.scale
    @eventDispatcher.addEventListener 'gesturechange', @gesture_move, @use_capture
    @eventDispatcher.addEventListener 'gestureend', @gesture_end, @use_capture
    
    @eventDispatcher.addEventListener 'touchmove', @touch_move, @use_capture
    
    e.preventDefault()
    
  gesture_move: (e)=>
    # console.log "Gesture Move"
    if @last_touch_p
      @vp.zoomSet( @start_scale * e.scale, @last_touch_p.e(1), @last_touch_p.e(2))
    
  gesture_end: (e)=>
    console.log "Gesture End"
    @eventDispatcher.removeEventListener 'touchmove', @touch_move, @use_capture
    
    @eventDispatcher.removeEventListener 'gesturechange', @gesture_move, @use_capture
    @eventDispatcher.removeEventListener 'gestureend', @gesture_end, @use_capture
    
    @makeUnexclusive()
  
  # touch_start: (e)=>
  #   console.log "Touch Start"
  #   # console.log "T Start: #{e.targetTouches.length}"
  #   if e.targetTouches.length != 2
  #     return
  #     
  #   # @makeExclusive()
  #   e.preventDefault()
  #   
  #   # @eventDispatcher.addEventListener 'touchmove', @touch_move, @use_capture
  #   # @eventDispatcher.addEventListener 'touchend', @touch_end, @use_capture
  #   
  #   @last_touch_p = @find_midpoint(e)

  touch_move: (e)=>
    # console.log "Touch Move: #{e.targetTouches.length}, #{e.touches.length}"
    if @last_touch_p
      new_touch_p = @find_midpoint(e)
      d = new_touch_p.subtract(@last_touch_p)
      @last_touch_p = new_touch_p
      @vp.panBy(d.e(1), d.e(2))
    else
      @last_touch_p = @find_midpoint(e)

    
  # touch_end: (e)=>
  #   @eventDispatcher.removeEventListener 'touchmove', @touch_move, @use_capture
  #   @eventDispatcher.removeEventListener 'touchend', @touch_end, @use_capture
    
    # @makeUnexclusive()
    
  # Some Helper
  
  find_midpoint: (e)=>
    t1 = e.touches[0] #e.targetTouches[0]
    t2 = e.touches[1] #e.targetTouches[1]
    p1 = $V([t1.clientX, t1.clientY, 1])
    p2 = $V([t2.clientX, t2.clientY, 1])

    d = p2.subtract(p1).multiply(0.5)
    p = p1.add(d)