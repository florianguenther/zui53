#= require ./tools/pan_tool
#= require ./tools/zoom_tool
#= require ./surfaces/svg_surface
#= require ./surfaces/css_surface
  
# class window.Background
#   constructor: (@node, @size)->
#   
#   apply: (panX, panY, scale)=>
#     # m = scale % 1
#     s = scale * @size
#     # console.log s, scale, m
#     $(@node).css({"-webkit-background-size": "#{s}px #{s}px", "background-position": "#{panX}px #{panY}px"})
    

class window.ZUI
  constructor: (vp)->
    @zoomPos = 0
    @scale = 1.0
    
    @viewport = vp
    @surfaces = []
    
    # Offset Matrix, this should change in future, if viewport HTML-Element changes position
    vpOffset = $(vp).offset()
    @vpOffM = $M([
      [1, 0, vpOffset.left],
      [0, 1, vpOffset.top],
      [0, 0, 1]
    ])
    
    # Base Transformation Matrix for Scale/Pan and Point-Calculation
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
      
    @toolset = new window.Toolset( new ZoomTool(@) )
    # @enableController()
  
  # enableController: ()=>
  #   # (new PanOnSpacebarController(@)).attach()
  #   @zoom = new ZoomTool(@)
  #   @zoom.attach()
  
  # addSVGSurface: (svg)=>
  #   @addSurface( new window.SVGSurface(svg) )
  #   
  # addCSSSurface: (css)=>
  #   @addSurface( new window.CSSSurface(css) )
    
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

    
