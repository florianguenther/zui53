#= require 'tools/toolset'

namespace 'ZUI53.Tools', (exports)->
  class exports.Zoom extends exports.Base
    constructor: (zui)->
      @vp = zui
      @eventDispatcher = zui.viewport
      @use_capture = true # on event handling
    
      @t1 = null
      @t2 = null
    
      @touch = {
        touches: [],
        touch_ids: []
      }
    
    attach: ()=>
      $(@eventDispatcher).mousewheel @zoom
      @eventDispatcher.addEventListener 'gesturestart', @gesture_start, @use_capture
    
      @eventDispatcher.addEventListener 'MozTouchDown', @moz_touch_down, @use_capture
    
      @eventDispatcher.addEventListener 'MozTouchUp', @moz_touch_up, @use_capture
  
    detach: ()=>
      $(@eventDispatcher).unmousewheel @zoom
      @eventDispatcher.removeEventListener 'gesturestart', @gesture_start, @use_capture
  
  
  
    fetch_touch: (e, value)=>
      if @t1 and @t1.streamId == e.streamId
        @t1 = value || e
      else
        @t2 = value || e
      
      @update_moz_touch()
    
    update_moz_touch: ()=>
      if @t1 and @t2
        # calc midpoint
        console.log 'two'
        try
          mp = @find_midpoint( {touches: [@t1, @t2]} )
          console.log mp
        catch e
          console.log e
        
      else if @t1 or @t2
        # remove
        console.log 'only one'
      
      
    create_touch_index: (streamId)=>
      i = @touch.touch_ids.indexOf(streamId)
      if i < 0
        i = @touch.touch_ids.length
        @touch.touch_ids[i] = streamId
      
      return i
      
    moz_touch_down: (e)=>
      # @last_moz_touch = null
      console.log 'touch down', e.streamId
      # @touch.touches["t_#{e.streamId}"] = e
      # @fetch_touch(e)
      # @touch.touches.push(e)
    
      @touch_df = null
    
      try
        i = @create_touch_index(e.streamId)
        @touch.touches[i] = e
    
        if @touch.touches.length == 2
          @_internal_gesture_start()
          @eventDispatcher.addEventListener 'MozTouchMove', @moz_touch_move, @use_capture
      catch e
        console.log e
    
    moz_touch_move: (e)=>
      i = @create_touch_index(e.streamId)
      @touch.touches[i] = e
    
      @touch_move(@touch)
      # @last_touch_p = @find_midpoint(@touch)
    
      d = @find_distance(@touch)
      if @touch_df
        s = @touch_df * d
        @gesture_move({scale: s})
      else
        @touch_df = 1/d
    
    
      console.log d
    
      # p1 = $V([e.clientX, e.clientY, 1])
      # console.log e.streamId, p1.e(1), p1.e(2)
      # 
      # if @last_moz_touch
      #   d = p1.subtract(@last_moz_touch)
      #   @vp.panBy(d.e(1), d.e(2))
      #   
      # @last_moz_touch = p1
    
      # @touch.touches["t_#{e.streamId}"] = e
      # console.log @touch.touches
      # @fetch_touch(e)
    
    moz_touch_up: (e)=>
      console.log 'touch up', e.streamId
      # @touch.touches["t_#{e.streamId}"] = null
      # @fetch_touch(e, null)
      # @touch.touches.pop()
    
      i = @touch.touch_ids.indexOf(e.streamId)
      if i > 0
        console.log "Removed: #{i}"
        if @touch.touches.length == 2
          @_internal_gesture_end()
          @eventDispatcher.removeEventListener 'MozTouchMove', @moz_touch_move, @use_capture
        # remove
        @touch.touches.splice(i, 1)
        @touch.touch_ids.splice(i, 1)
      
  
  
  
  
  
    zoom: (e)=>
      delta = e.wheelDelta || (e.detail * -1)
      f = 0.05
      if delta < 0
        f *= -1
      
      @vp.zoomBy(f, e.clientX, e.clientY)
    
      e.stopImmediatePropagation()
      e.preventDefault()
  
    gesture_start: (e)=>
      @_internal_gesture_start()
      @eventDispatcher.addEventListener 'gesturechange', @gesture_move, @use_capture
      @eventDispatcher.addEventListener 'gestureend', @gesture_end, @use_capture
      @eventDispatcher.addEventListener 'touchmove', @touch_move, @use_capture
      e.preventDefault()
    
    gesture_move: (e)=>
      # console.log "Gesture Move"
      if @last_touch_p
        @vp.zoomSet( @start_scale * e.scale, @last_touch_p.e(1), @last_touch_p.e(2))
    
    gesture_end: (e)=>
      @eventDispatcher.removeEventListener 'touchmove', @touch_move, @use_capture
      @eventDispatcher.removeEventListener 'gesturechange', @gesture_move, @use_capture
      @eventDispatcher.removeEventListener 'gestureend', @gesture_end, @use_capture
      @_internal_gesture_end()
    
    _internal_gesture_start: ()=>
      console.log "Gesture Start"
      @makeExclusive()
      @last_touch_p = null
      @start_scale = @vp.scale
    
    _internal_gesture_end: ()=>
      @makeUnexclusive()
      console.log "Gesture End"
    
  
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
    
    find_distance: (e)=>
      t1 = e.touches[0] #e.targetTouches[0]
      t2 = e.touches[1] #e.targetTouches[1]
      p1 = $V([t1.clientX, t1.clientY, 1])
      p2 = $V([t2.clientX, t2.clientY, 1])

      # d = p2.subtract(p1) #.multiply(0.5)
      #     d.length()
      p2.distanceFrom(p1)