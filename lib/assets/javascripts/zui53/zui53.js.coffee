#= require ./helper
#= require ./tools/pan_tool
#= require ./tools/zoom_tool
#= require ./surfaces/svg_surface
#= require ./surfaces/css_surface

namespace 'ZUI53', (exports)->
  class exports.Viewport
    constructor: (vp)->
      @min_scale = null
      @max_scale = null
      
      @viewport = @styleViewport(vp)
      @surfaces = []
    
      # Offset Matrix, this should change in future, if viewport HTML-Element changes position
      @updateOffset()
      
      @reset()
    
      $(vp).scroll (e)=>
        # If the browser automatically scrolls our viewport, we translate the scroll into a pan and
        # reset the scroll. Otherwise MouseFocused Zooming and @clientToSurface is broken.
        # This happens when the user types into a contenteditable element and the carat moves outside
        # of the viewport.
        jVP = $(@viewport)
        @panBy( -jVP.scrollLeft(), -jVP.scrollTop() )
        jVP.scrollTop(0).scrollLeft(0)
      
      @toolset = new ZUI53.Tools.Set( new ZUI53.Tools.Zoom(@) )
    
    styleViewport: (vp)->
      $(vp).css({
        'position': 'relative',
        'overflow': 'hidden',
        'width': '100%', 
        'height': '100%'
      })
      vp
    
    updateOffset: ()=>
      @vpOffset = $(@viewport).offset()
      @vpOffM = $M([
        [1, 0, @vpOffset.left],
        [0, 1, @vpOffset.top],
        [0, 0, 1]
      ])
    
    reset: ()=>
      @zoomPos = 0
      @scale = 1.0
      # Base Transformation Matrix for Scale/Pan and Point-Calculation
      @surfaceM = $M([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ])
      @updateSurface()
    
    addSurface: (surface)=>
      @surfaces.push surface
      @addLimits(surface.limits())
      
    addLimits: (limits)=>
      return unless limits
      if @min_scale || @max_scale
        @min_scale = Math.max(limits[0], @min_scale) if limits[0]
        @max_scale = Math.min(limits[1], @max_scale) if limits[1]
      else
        @min_scale = limits[0]
        @max_scale = limits[1]
      # console.log "LIMITS: #{@min_scale}, #{@max_scale}"
  
    clientToSurface: (x, y)=>
      v = $V([x, y, 1])
      sV = @surfaceM.inverse().multiply( @updateOffset().inverse().multiply(v) )
      
    layerToSurface: (x, y)=>
      v = $V([x, y, 1])
      sV = @surfaceM.inverse().multiply( v )
    
    surfaceToClient: (v)=>
      @updateOffset().multiply( @surfaceM.multiply(v) )
      
    surfaceToLayer: (v)=>
      @surfaceM.multiply(v)
  
    updateSurface: ()=>
      v = @getPanAndScale()
      for node in @surfaces
        node.apply(v[0], v[1], v[2])
      
      return true

    panBy: (x, y)=>
      @translateSurface(x, y)
      @updateSurface()
  
    zoomBy: (byF, clientX, clientY)=>
      newScale = @_pos_to_scale(@zoomPos + byF)
      @zoomSet(newScale, clientX, clientY)
  
    zoomSet: (newScale, clientX, clientY)=>
      newScale = @fitToLimits(newScale)
      @zoomPos = @_scale_to_pos(newScale)
      if newScale != @scale
        sf = @clientToSurface(clientX, clientY)
        scaleBy = newScale/@scale

        @surfaceM = @_scaleMatrix(@surfaceM, scaleBy)
        @scale = newScale
      
        c = @surfaceToClient(sf)
        dX = clientX - c.e(1)
        dY = clientY - c.e(2)
        @translateSurface(dX, dY)
      
      @updateSurface()
      
    # zoomByO: (byF, offsetX, offsetY)=>
    #   # @zoomPos += byF
    #   newScale = @_pos_to_scale(@zoomPos + byF)
    #   @zoomSetO(newScale, offsetX, offsetY)
    # 
    # zoomSetO: (newScale, offsetX, offsetY)=>
    #   newScale = @fitToLimits(newScale)
    #   @zoomPos = @_scale_to_pos(newScale)
    #   if newScale != @scale
    #     sf = @layerToSurface(offsetX, offsetY)
    #     scaleBy = newScale/@scale
    # 
    #     @surfaceM = @_scaleMatrix(@surfaceM, scaleBy)
    #     @scale = newScale
    # 
    #     c = @surfaceToLayer(sf)
    #     dX = offsetX - c.e(1)
    #     dY = offsetY - c.e(2)
    #     @translateSurface(dX, dY)
    # 
    #   @updateSurface()      
    
  
    fitToLimits: (s)=>
      # console.log "Try Scale: #{s}"
      if @min_scale && s < @min_scale
        s = @min_scale 
      else if @max_scale && s > @max_scale
        s = @max_scale 
      return s
  
    translateSurface: (x, y)=>
      @surfaceM = @_translateMatrix(@surfaceM, x, y)
    
    _translateMatrix: (m, x, y)->
      m.add( $M([
        [0, 0, x],
        [0, 0, y],
        [0, 0, 0]
      ]))
    
    _scaleMatrix: (m, s)->
      return m.multiply( $M([
        [s, 0, 0],
        [0, s, 0],
        [0, 0, 1]
      ]))
    
    _pos_to_scale: (pos)->
      Math.exp(pos)
    
    _scale_to_pos: (s)->
      Math.log(s)
    
    avp: ()=>
      @updateOffset()
      min = @clientToSurface(@vpOffset.left, @vpOffset.top)
      max = @clientToSurface(@vpOffset.left + $(@viewport).width(), @vpOffset.top + $(@viewport).height())
    
      del = max.subtract(min)
    
      return {
        x: min.e(1), 
        y: min.e(2),
        width: del.e(1),
        height: del.e(2)
      }
    
    _boundsCenter: (b)->
      return {
        x: (b.x + b.width/2),
        y: (b.y + b.height/2)
      }

    showBounds: (evp)=>
      if evp.width == 0 or evp.height == 0
        return
      
      avp = @avp()
      s = Math.min(avp.width/evp.width, avp.height/evp.height)

      # Expand
      exp = 50/s  #expand 50px, just a constant at the moment, should be variable
      evp.x -= exp
      evp.y -= exp
      evp.width += 2*exp
      evp.height += 2*exp
      s = Math.min(avp.width/evp.width, avp.height/evp.height)
      
      s = @fitToLimits(s)
      eC = @_boundsCenter(evp)
      aC = @_boundsCenter(avp)
      
      @setPanAndScale(-eC.x*s, -eC.y*s, s)
      @translateSurface( $(@viewport).width()/2, $(@viewport).height()/2) # Center

      @updateSurface()
    
    getPanAndScale: ()=>
      [@surfaceM.e(1, 3), @surfaceM.e(2, 3), @surfaceM.e(1, 1)]
    
    setPanAndScale: (panX, panY, scale)=>
      @surfaceM = $M([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ])

      @translateSurface(panX, panY)
      @surfaceM = @_scaleMatrix(@surfaceM, scale)
      @scale = scale
      @zoomPos = @_scale_to_pos(scale)
      
    getTransformString: ()=>
      @getPanAndScale().join(',')
      
    setTransformString: (str)=>
      return unless str
      v = str.split(',')
      console.log v.length
      # return unless v.length == 3
      panX = (Number) v[0]
      panY = (Number) v[1]
      scale = (Number) v[2]
      @setPanAndScale(panX, panY, scale)
      @updateSurface()
    
    
    
