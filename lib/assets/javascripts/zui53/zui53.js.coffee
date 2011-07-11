#= require ./controller/pan_controller
#= require ./controller/zoom_controller

class SVGSurface
  constructor: (@node)->
    
  apply: (panX, panY, scale)=>
    singleSVG = "translate(#{panX}, #{panY}) scale(#{scale}, #{scale})"
    $(@node).attr("transform", singleSVG)
    
class CSSSurface
  constructor: (@node)->
    
  apply: (panX, panY, scale)=>
    matrix = "matrix(#{scale}, 0.0, 0.0, #{scale}, #{panX}, #{panY})"
    # single = "translate(#{pX}px, #{pY}px) scale(#{scale}, #{scale})"
    # console.log @node, matrix
    $(@node).css("-webkit-transform", matrix)
    # $(@surface).css("-moz-transform", single)
    # $(@surface).css("transform", matrix)
    
class window.Background
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
      
    @enableController()
  
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
  
  zoomBy: (byF, clientX, clientY)=>
    @zoomPos += byF
    newScale = Math.exp(@zoomPos)
    @zoomSet(newScale, clientX, clientY)
  
  zoomSet: (newScale, clientX, clientY)=>
    # console.log "SET ZOOM: #{newScale}"
    if newScale != @scale
      sf = @clientToSurface(clientX, clientY)
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

    
