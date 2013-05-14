#= require ./toolset

#- start on first move
#- cancle event on detach while moving

namespace 'ZUI53.Tools', (exports)->
  class exports.Default extends exports.Base
    constructor: (zui)->
      super
      @vp = zui
      @eventDispatcher = zui.viewport #window
      
    # trigger : (event, args...)->
    #   console.log "Event: #{event}", args
  
    attach: ()=>
      super
      console.log "Attaching PAN"
      # $('body').addClass('pan')
      $(@eventDispatcher).bind 'mousedown', @start
      $(@eventDispatcher).bind 'touchstart', @touch_start
  
    detach: ()=>
      console.log "Detach PAN.."
      # $('body').removeClass('pan')
    
      @touch_stop(null)
    
      $(@eventDispatcher).unbind 'mousedown', @start
      $(@eventDispatcher).unbind 'touchstart', @touch_start
      super
    
    start: (e)=>
      if @disabled
        return

      # console.log "start panning"
      $('body').addClass('panning')
  
      @_start_with(e.clientX, e.clientY)
  
      $(@eventDispatcher).bind 'mousemove', @pan
      $(@eventDispatcher).bind 'mouseup', @stop

      @stopEvent(e)
      
    pan: (e)=>
      @_pan_with(e.clientX, e.clientY)

    stop: (e)=>
      # console.log "stop panning"
      $('body').removeClass('panning')

      $(@eventDispatcher).unbind 'mousemove', @pan
      $(@eventDispatcher).unbind 'mouseup', @stop

      $(@eventDispatcher).unbind 'touchmove', @touch_move
      $(@eventDispatcher).unbind 'touchend', @touch_stop
      
      @stopEvent(e)
      @_stop_with(e.clientX, e.clientY)
      
    touch_start: (e)=>
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
    
      @moveHook @points(x, y)
      
    _start_with: (x, y)=>
      @startX = x
      @startY = y
      @startHook @points(x, y)
      
    _stop_with: (x, y)=>
      @stopHook @points(x, y)
      
      
    points: (x, y)=>
      point = @vp.clientToSurface(x, y)
            
      {
        viewport: {x: x, y: y}
        surface: {x: point.e(1), y: point.e(2)}
      }
      
    moveHook: ->
    startHook: ->
    stopHook: ->
      
      
