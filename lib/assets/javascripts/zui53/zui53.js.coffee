
class PanController
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
    

class ZoomController
  constructor: (zui)->
    @vp = zui
    @eventDispatcher = zui.viewport #window
    
  attach: ()=>
    $(@eventDispatcher).mousewheel @zoom
    
  zoom: (e)=>
    # console.log e.clientX, e.clientY
    delta = e.wheelDelta || (e.detail * -1)
    f = 0.05
    if delta < 0
      f *= -1
      
    @vp.doZoom(f, e.clientX, e.clientY)
    
    e.stopImmediatePropagation()
    e.preventDefault()

class Surface
  constructor: (@node)->    

class SVGSurface extends Surface
  apply: (panX, panY, scale)=>
    singleSVG = "translate(#{panX}, #{panY}) scale(#{scale}, #{scale})"
    $(@node).attr("transform", singleSVG)
    
class CSSSurface extends Surface
  apply: (panX, panY, scale)=>
    matrix = "matrix(#{scale}, 0.0, 0.0, #{scale}, #{panX}, #{panY})"
    # single = "translate(#{pX}px, #{pY}px) scale(#{scale}, #{scale})"
    # console.log @node, matrix
    $(@node).css("-webkit-transform", matrix)
    # $(@surface).css("-moz-transform", single)
    # $(@surface).css("transform", matrix)
    
class window.Background extends Surface
  constructor: (@node, @size)->
  
  apply: (panX, panY, scale)=>
    # m = scale % 1
    
    s = scale * @size
    
    # console.log s, scale, m
    
    $(@node).css({"-webkit-background-size": "#{s}px #{s}px", "background-position": "#{panX}px #{panY}px"})
    

class window.ZUI
  constructor: (vp)->
    @zoomPos = 0
    @scale = 1.0
    
    @viewport = vp
    @surfaces = []
    
    @vpOffset = $(vp).offset()
    
    @vpOffM = $M([
      [1, 0, @vpOffset.left],
      [0, 1, @vpOffset.top],
      [0, 0, 1]
    ])
    
    @surfaceM = $M([
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1]
    ])
    
    $(vp).scroll (e)=>
      # If the browser automatically scrolls our viewport, we translate the scroll into a pan and
      # reset the scroll. Otherwise MouseFocused Zooming and @clientToSurface is broken.
      # This happens when the user types into a contenteditable element and the carat moves outside
      # of the viewport.
      jVP = $(@viewport)
      @panBy( -jVP.scrollLeft(), -jVP.scrollTop() )
      jVP.scrollTop(0).scrollLeft(0)
  
  enableController: ()=>
    # (new PanOnSpacebarController(@)).attach()
    @zoom = new ZoomController(@)
    @zoom.attach()
  
  addSVGSurface: (svg)=>
    @addSurface( new SVGSurface(svg) )
    
  addCSSSurface: (css)=>
    @addSurface( new CSSSurface(css) )
    
  addSurface: (surface)=>
    @surfaces.push surface
  
  clientToSurface: (x, y)=>
    v = $V([x, y, 1])
    sV = @surfaceM.inverse().multiply( @vpOffM.inverse().multiply(v) )
    
  surfaceToClient: (v)=>
    @vpOffM.multiply( @surfaceM.multiply(v) )
  
  updateSurface: ()=>
    pX = @surfaceM.e(1, 3)
    pY = @surfaceM.e(2, 3)
    @scale = @surfaceM.e(1, 1)
    
    for node in @surfaces
      node.apply(pX, pY, @scale)

  panBy: (x, y)=>
    @translateSurface(x, y)
    @updateSurface()
  
  doZoom: (byF, clientX, clientY)=>
    sf = @clientToSurface(clientX, clientY)
    
    @zoomPos += byF
    
    newScale = Math.exp(@zoomPos)
    if newScale != @scale
      scaleBy = newScale/@scale

      @surfaceM = @surfaceM.multiply( $M([
              [scaleBy, 0, 0],
              [0, scaleBy, 0],
              [0, 0, 1]
            ]))
      @scale = newScale
      
      c = @surfaceToClient(sf)
      dX = clientX - c.e(1)
      dY = clientY - c.e(2)
      @translateSurface(dX, dY)
      
    @updateSurface()
    
  translateSurface: (x, y)=>
    @surfaceM = @surfaceM.add( $M([
      [0, 0, x],
      [0, 0, y],
      [0, 0, 0]
    ]))

    
