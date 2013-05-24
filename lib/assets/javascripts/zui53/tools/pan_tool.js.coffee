#= require ./toolset

namespace 'ZUI53.Tools', (exports)->
  class exports.Pan extends exports.Base
    constructor: (zui)->
      @vp = zui
      @eventDispatcher = zui.viewport #window
  
    attach: ()=>
      # console.log "Attaching PAN"
      $('body').addClass('pan')
      $(@eventDispatcher).bind 'mousedown', @start
      $(@eventDispatcher).bind 'touchstart', @touch_start
  
    detach: ()=>
      # console.log "Detach PAN.."
      $('body').removeClass('pan')
    
      @touch_stop(null)
    
      $(@eventDispatcher).unbind 'mousedown', @start
      $(@eventDispatcher).unbind 'touchstart', @touch_start
    
    eventInSurface: (e)->
      for surface in @vp.surfaces
        if e.target == surface.node
          return true
      return e.target == @eventDispatcher

    start: (e)=>
      if @disabled
        return

      if e.shiftKey
        return;

      if not @eventInSurface(e)
        return

      # console.log "start panning"
      $('body').addClass('panning')
  
      @_start_with(e.screenX, e.screenY)
  
      $(@eventDispatcher).bind 'mousemove', @pan
      $(@eventDispatcher).bind 'mouseup', @stop

      @stopEvent(e)
      
    pan: (e)=>
      @_pan_with(e.screenX, e.screenY)

    stop: (e)=>
      # console.log "stop panning"
      $('body').removeClass('panning')

      $(@eventDispatcher).unbind 'mousemove', @pan
      $(@eventDispatcher).unbind 'mouseup', @stop

      $(@eventDispatcher).unbind 'touchmove', @touch_move
      $(@eventDispatcher).unbind 'touchend', @touch_stop
      
      @stopEvent(e)
      
    touch_start: (e)=>

      if not @eventInSurface(e)
        return

      # TODO: this will be fired 2 times - why?
      # console.log 'ZUI touch start'
      if @disabled
        return

      # console.log "start panning (touch)"
      @_start_with(e.originalEvent.touches[0].clientX, e.originalEvent.touches[0].clientY)
      $(@eventDispatcher).bind 'touchmove', @touch_move
      $(@eventDispatcher).bind 'touchend', @touch_stop
  
    touch_move: (e)=>
      if e.originalEvent.touches.length > 1
        @touch_stop()
      else
        x = e.originalEvent.touches[0].clientX
        y = e.originalEvent.touches[0].clientY
        @_pan_with(x, y)
        e.originalEvent.preventDefault()
    
    touch_stop: (e)=>
      # console.log 'ZUI touch stop'
      $(@eventDispatcher).unbind 'touchmove', @touch_move
      $(@eventDispatcher).unbind 'touchend', @touch_stop
  
    _pan_with: (x, y)=>
      # console.log "panning PAN Tool"
      dX = x - @startX 
      dY = y - @startY 
    
      @startX = x
      @startY = y
  
      @vp.panBy(dX, dY)
      
    _start_with: (x, y)=>
      @startX = x
      @startY = y
