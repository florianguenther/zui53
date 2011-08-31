#= require ./helper
#= require ./tools/pan_tool
#= require ./tools/zoom_tool
#= require ./surfaces/svg_surface
#= require ./surfaces/css_surface

namespace 'ZUI53', (exports)->
  class exports.Viewport
    constructor: (vp)->
      @zoomPos = 0
      @scale = 1.0

      @viewport = @styleViewport(vp)
      @surfaces = []
    
      # Offset Matrix, this should change in future, if viewport HTML-Element changes position
      @vpOffset = $(vp).offset()
      @vpOffM = $M([
        [1, 0, @vpOffset.left],
        [0, 1, @vpOffset.top],
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
      
      @toolset = new ZUI53.Tools.Set( new ZUI53.Tools.Zoom(@) )
    
    styleViewport: (vp)->
      $(vp).css({
        'position': 'relative',
        'overflow': 'hidden',
        'width': '100%', 
        'height': '100%'
      })
      vp
      
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
      newScale = @_pos_to_scale(@zoomPos)
      @zoomSet(newScale, clientX, clientY)
  
    zoomSet: (newScale, clientX, clientY)=>
      # console.log "SET ZOOM: #{newScale}"
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
      exp = 50/s
      evp.x -= exp
      evp.y -= exp
      evp.width += 2*exp
      evp.height += 2*exp
      s = Math.min(avp.width/evp.width, avp.height/evp.height)
    
      @surfaceM = $M([
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ])
    
      eC = @_boundsCenter(evp)
      aC = @_boundsCenter(avp)
    
      @translateSurface(-eC.x*s, -eC.y*s)
      @surfaceM = @_scaleMatrix(@surfaceM, s)
    
      @translateSurface( $(@viewport).width()/2, $(@viewport).height()/2)
    
      @zoomPos = @_scale_to_pos(s)
      @updateSurface()
    
    
    
    
