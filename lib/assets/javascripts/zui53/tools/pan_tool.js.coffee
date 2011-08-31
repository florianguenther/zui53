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
      @eventDispatcher.addEventListener 'touchstart', @touch_start, true
  
    detach: ()=>
      # console.log "Detach PAN.."
      $('body').removeClass('pan')
    
      @touch_stop(null)
    
      $(@eventDispatcher).unbind 'mousedown', @start
      @eventDispatcher.removeEventListener 'touchstart', @touch_start, true
    
    start: (e)=>
      # console.log "start panning"
      $('body').addClass('panning')
  
      @_start_with(e.screenX, e.screenY)
  
      window.addEventListener 'mousemove', @pan, true
      window.addEventListener 'mouseup', @stop, true

      e.preventDefault() 
      
    pan: (e)=>
      @_pan_with(e.screenX, e.screenY)

    stop: (e)=>
      # console.log "stop panning"
      $('body').removeClass('panning')

      window.removeEventListener 'mousemove', @pan, true
      window.removeEventListener 'mouseup', @stop, true

      window.removeEventListener 'touchmove', @pan, true
      window.removeEventListener 'touchstop', @stop, true
      
    touch_start: (e)=>
      # console.log "start panning (touch)"
      @_start_with(e.touches[0].clientX, e.touches[0].clientY)
      @eventDispatcher.addEventListener 'touchmove', @touch_move, true
      @eventDispatcher.addEventListener 'touchstop', @touch_stop, true
      e.preventDefault()
  
    touch_move: (e)=>
      @_pan_with(e.touches[0].clientX, e.touches[0].clientY)
    
    touch_stop: (e)=>
      @eventDispatcher.removeEventListener 'touchmove', @touch_move, true
      @eventDispatcher.removeEventListener 'touchstop', @touch_stop, true
  
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
