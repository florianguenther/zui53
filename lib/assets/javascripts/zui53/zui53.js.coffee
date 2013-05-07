#= require ./helper
#= require ./events
#= require ./tools/pan_tool
#= require ./tools/zoom_tool
#= require ./surfaces/svg_surface
#= require ./surfaces/css_surface
#= require ./surfaces/canvas_surface


# Affine Transform
# |x|   |sx 0  tx|   |x|
# |y| = |0  sy ty| * |y|
# |1|   |0  0  1 |   |1|

# class Matrix
#   constructor: (@columns...)->

class AffineTransform
  constructor: (x = 0, y = 0, s = 1)->
    @m = $M [
      [s, 0, x]
      [0, s, y]
      [0, 0, 1]
    ]
    
  @matrix: (x = 0, y = 0, s = 1)->
    (new @(x, y, s)).m
    
  translate: (dx, dy)->
    if dy is undefined
      dy = dx.y
      dx = dx.x
      
    @m = @m.add( $M [
      [0, 0, dx]
      [0, 0, dy]
      [0, 0, 0]
    ])
  
  scale: (s)->
    @m = @m.x( AffineTransform.matrix(0, 0, s) )
    
  scaleOver: (s, vX, vY)->
    if vY is undefined
      vY = vX.y
      vX = vX.x
      
    pB = @retransform(vX, vY)
    @scale(s)
    pA = @transform(pB)
    @translate( vX - pA.x, vY - pA.y)
  
  #################################################
    
  transform: (x, y)->
    @_transform(@m, x, y)
    
  
  # inverseTransform
  retransform: (x, y)->
    @_transform( @m.inverse(), x, y)
    # @_vectorToPoint( $V([x, y, 1]).x(@m) )
    # {
    #   x: ((x - @x()) / @s() )
    #   y: ((y - @y()) / @s() )
    # }
  
  _transform: (m, x, y)->
    if y is undefined
      y = x.y
      x = x.x
    @_vectorToPoint( m.multiply( $V([x, y, 1]))  )
  
  _vectorToPoint: (v)->
    # console.log "V:", v
    {
      x: v.e(1)
      y: v.e(2)
    }
  
  inspect: ->
    @toArray().join(', ')
    
  toHash: ->
    {
      x: @m.e(1, 3)
      y: @m.e(2, 3)
      s: @m.e(1, 1)
    }
    
  toArray: ->
    [
      @m.e(1, 3)
      @m.e(2, 3)
      @m.e(1, 1)
    ]
    
  x: ->
    @m.e(1, 3)
    
  y: ->
    @m.e(2, 3)
    
  pan: ->
    {
      x: @x()
      y: @y()
    }
    
  s: ->
    @m.e(1, 1)
    
  

@AffineTransform = AffineTransform  

namespace 'ZUI53', (exports)->
  class exports.Viewport
    constructor: (vp)->
      if typeof vp == 'string'
        vp = document.getElementById(vp)
        
      @min_scale = null
      @max_scale = null
      
      @viewport = vp
      @$viewport = $(vp)
      
      @transform = new AffineTransform()
      
      @surfaces = []
    
      # Offset Matrix, this should change in future, if viewport HTML-Element changes position
      # @updateOffset()
      
      # @reset()
      # $(vp).scroll (e)=>
      #   # If the browser automatically scrolls our viewport, we translate the scroll into a pan and
      #   # reset the scroll. Otherwise MouseFocused Zooming and @clientToSurface is broken.
      #   # This happens when the user types into a contenteditable element and the carat moves outside
      #   # of the viewport.
      #   jVP = $(@viewport)
      #   @panBy( -jVP.scrollLeft(), -jVP.scrollTop() )
      #   jVP.scrollTop(0).scrollLeft(0)
      
      @toolset = new ZUI53.Tools.Set( new ZUI53.Tools.Zoom(@) )
    
    log: ->
      console.log arguments
    
    # styleViewport: (vp)->
    #   # $(vp).css({
    #   #   'position': 'relative',
    #   #   'overflow': 'hidden',
    #   #   'width': '100%', 
    #   #   'height': '100%'
    #   # })
    #   vp
    
    # updateOffset: ()=>
    #   @vpOffset = $(@viewport).offset()
    #   
    #   @vpOffset.left -= (Number) $(window.document).scrollLeft()
    #   @vpOffset.top  -= (Number) $(window.document).scrollTop()
    #   
    #   @vpOffM = $M([
    #     [1, 0, @vpOffset.left],
    #     [0, 1, @vpOffset.top],
    #     [0, 0, 1]
    #   ])
    # 
    #   return @vpOffM
    
    # reset: ()=>
    #   @zoomPos = 0
    #   @scale = 1.0
    #   # Base Transformation Matrix for Scale/Pan and Point-Calculation
    #   @surfaceM = $M([
    #     [1, 0, 0],
    #     [0, 1, 0],
    #     [0, 0, 1]
    #   ])
    #   @updateSurface()
    
    addSurface: (surface)=>
      @surfaces.push surface
      # @addLimits(surface.limits())
    #   
    # removeSurface: (surface)=>
    #   i = @surfaces.indexOf(surface)
    #   @surfaces.splice(i, 1) if i >= 0
      
    # addLimits: (limits)=>
    #   return unless limits
    #   if @min_scale || @max_scale
    #     @min_scale = Math.max(limits[0], @min_scale) if limits[0]
    #     @max_scale = Math.min(limits[1], @max_scale) if limits[1]
    #   else
    #     @min_scale = limits[0]
    #     @max_scale = limits[1]
    #   # console.log "LIMITS: #{@min_scale}, #{@max_scale}"
  
    updateSurface: ()=>
      # console.log "ZUI53: updating surfaces"
      v = @getPanAndScale()
      for node in @surfaces
        node.apply(v.x, v.y, v.s)
      
      return true    
    
  
    # fitToLimits: (s)=>
    #   # console.log "Try Scale: #{s}"
    #   if @min_scale && s < @min_scale
    #     s = @min_scale 
    #   else if @max_scale && s > @max_scale
    #     s = @max_scale 
    #   return s

    
    _pos_to_scale: (pos)->
      Math.exp(pos)
    
    _scale_to_pos: (s)->
      Math.log(s)
    
    # avp: ()=>
    #   @updateOffset()
    #   min = @clientToSurface(@vpOffset.left, @vpOffset.top)
    #   max = @clientToSurface(@vpOffset.left + $(@viewport).width(), @vpOffset.top + $(@viewport).height())
    # 
    #   del = max.subtract(min)
    # 
    #   return {
    #     x: min.e(1), 
    #     y: min.e(2),
    #     width: del.e(1),
    #     height: del.e(2)
    #   }
    
    _rect_center: (b)->
      {
        x: (b.x + b.width/2)
        y: (b.y + b.height/2)
      }
    
    # showBounds: (evp)=>
    #   if evp.width == 0 or evp.height == 0
    #     return
    #   
    #   avp = @avp()
    #   s = Math.min(avp.width/evp.width, avp.height/evp.height)
    # 
    #   # Expand
    #   exp = 0 #50/s  #expand 50px, just a constant at the moment, should be variable
    #   evp.x -= exp
    #   evp.y -= exp
    #   evp.width += 2*exp
    #   evp.height += 2*exp
    #   s = Math.min(avp.width/evp.width, avp.height/evp.height)
    #   
    #   s = @fitToLimits(s)
    #   eC = @_boundsCenter(evp)
    #   aC = @_boundsCenter(avp)
    #   
    #   pX = -eC.x*s
    #   pY = -eC.y*s
    #   
    #   @setPanAndScale(pX, pY, s)
    #   @translateSurface( $(@viewport).width()/2, $(@viewport).height()/2) # Center
    #   
    #   @updateSurface()
    # 

    # setPanAndScale: (panX, panY, scale)=>
    #   @surfaceM = $M([
    #     [1, 0, 0],
    #     [0, 1, 0],
    #     [0, 0, 1]
    #   ])
    # 
    #   @translateSurface(panX, panY)
    #   @surfaceM = @_scaleMatrix(@surfaceM, scale)
    #   @scale = scale
    #   @zoomPos = @_scale_to_pos(scale)
    #   
    # getTransformString: ()=>
    #   @getPanAndScale().join(',')
    #   
    # setTransformString: (str)=>
    #   return unless str
    #   v = str.split(',')
    #   # console.log v.length
    #   # return unless v.length == 3
    #   panX = (Number) v[0]
    #   panY = (Number) v[1]
    #   scale = (Number) v[2]
    #   @setPanAndScale(panX, panY, scale)
    #   @updateSurface()
      
      
    #########################################################################################
    # Public Interface
    #########################################################################################
    # Surface = Objects Coordinate Space to be scaled
    # Viewport = Not-Scaled DOM-Node Coordinate Space
    
    on: (eventName, callback)->
      
    off: (eventName, callback = null)->
    
    ########################## Manupulate Surface, Scale, Pan
    panBy: (dX, dY)->
      @transform.translate(dX, dY)
      @updateSurface()
    
    scaleBy: (sFactor, viewportX, viewportY)->
      @transform.scaleOver(1 + sFactor, viewportX, viewportY)
      @updateSurface()
    
    setScale: (s, viewportX, viewportY)->
      # s = @fitToLimits(s)
      currentScale = @transform.s()
      return if s == currentScale
      
      scaleBy = s/currentScale
      @transform.scaleOver(scaleBy, viewportX, viewportY)
      
      @updateSurface()
    
    setPan: (x, y)->
      
    setPanAndScale: (x, y, s)->
        
    panAndScaleBy: (dX, dY, sFactor)->
      
    setScaleLimits: (min, max)->
      
      
    ######################### Getters
    
    getPan: ->
      @transform.pan()
      
    getScale: ->
      @transform.s()
      
    getPanAndScale: ->
      @transform.toHash()
    
    ########################## Point Translations  
    
    viewportToSurface: (x, y)->
      if y is undefined
        y = x.y
        x = x.x
        
      @transform.retransform(x, y)
      
    surfaceToViewport: (x, y)->
      if y is undefined
        y = x.y
        x = x.x
        
      @transform.transform(x, y)
    
    ##########################
      
    getVisibleSurfaceRect: ->
      # returns the visible area in SurfaceCoordinates
      # if node is given, rect of the node in SurfaceCoordinates will be returned, otherwise whole visible area
      from = @viewportToSurface(0, 0)
      to   = @viewportToSurface( @$viewport.width(), @$viewport.height() )
      
      from.width  = to.x - from.x
      from.height = to.y - from.y
      
      return from
      
    setVisibleSurfaceRect: (evp)->
      # pan and scale so that the given rect in surface coordinates is visible
      return if evp.width == 0 or evp.height == 0
      
      viewWidth   = @$viewport.width()
      viewHeight  = @$viewport.height()
      
      newS = Math.min(viewWidth/evp.width, viewHeight/evp.height)
    
      eC = @_rect_center(evp)
    
      pX = -eC.x*newS
      pY = -eC.y*newS
    
      @transform = new AffineTransform(pX, pY, newS)
      @transform.translate( viewWidth/2, viewHeight/2) # Center

      
      @updateSurface()
      
    viewportCenter: ->
      {
        x: @$viewport.width()/2
        y: @$viewport.height()/2
      }
      
    surfaceCenter: ->
      @viewportToSurface @viewportCenter()
    
    
    
    
    
    
    
    
    
    
    
    
    
    
