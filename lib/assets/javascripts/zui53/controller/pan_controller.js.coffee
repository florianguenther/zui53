class window.PanController
  constructor: (zui)->
    @vp = zui
    @eventDispatcher = zui.viewport #window
  
  attach: ()=>
    console.log "Attaching PAN"
    @enablePan()
    
  enablePan: ()=>
    $(@eventDispatcher).bind 'mousedown', @start
    # @eventDispatcher.addEventListener 'mousedown', @start, true
    
  detach: ()=>
    @disablePan()
    
  disablePan: ()=>
    $(@eventDispatcher).unbind 'mousedown', @start
    
  start: (e)=>
    console.log "Start panning"
    if e.target == @eventDispatcher
      
      $(@vp).trigger('pan.start', [])
      
      @startX = e.layerX
      @startY = e.layerY
      # console.log 'start panning'
      window.addEventListener 'mousemove', @pan, true
      window.addEventListener 'mouseup', @stop, true
      
      console.log "STOP EVENT"
      e.stopImmediatePropagation()
      # e.preventDefault()
    else
      console.log "not correct target", e.target, @eventDispatcher
    
  stop: (e)=>
    console.log 'stop panning'
    window.removeEventListener 'mousemove', @pan, true
    window.removeEventListener 'mouseup', @stop, true
    $(@vp).trigger('pan.stop', [])
    
  pan: (e)=>
    dX = e.layerX - @startX 
    dY = e.layerY - @startY 
    # console.log "pan: #{dX}, #{dY}"
    @startX = e.layerX
    @startY = e.layerY
    
    @vp.panBy(dX, dY)
    
class PanOnSpacebarController extends PanController
  constructor: (zui)->
    super
    
  attach: ()=>
    console.log "Attach SpacePan"
    $(window).unbind 'keyup', @disablePan
    $(window).bind 'keydown', @enablePan
      
  enablePan: ()=>
    # super.@attach()
    super
    @detach()
    
  disablePan: ()=>
    super
    @attach()
    
  detach: ()=>
    console.log "Detach SpacePan"
    $(window).unbind 'keydown', @enablePan
    $(window).bind 'keyup', @disablePan