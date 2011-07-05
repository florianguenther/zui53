
class PanController
  constructor: (viewport, html)->
    @vp = viewport
    @vpHtml = html
  
  attach: ()=>
    console.log 'attaching pan'
    window.addEventListener 'mousedown', @start, false
    
  start: (e)=>
    # console.log e.target, @vp
    if e.target == @vpHtml
      @startX = e.layerX
      @startY = e.layerY
      console.log 'start panning'
      window.addEventListener 'mousemove', @pan, true
      window.addEventListener 'mouseup', @stop, true
    
  stop: (e)=>
    console.log 'stop panning'
    window.removeEventListener 'mousemove', @pan, true
    window.removeEventListener 'mouseup', @stop, true
    
  pan: (e)=>
    dX = e.layerX - @startX 
    dY = e.layerY - @startY 
    
    @startX = e.layerX
    @startY = e.layerY
    
    # console.log "pan: #{dX}, #{dY}"
    @vp.panBy(dX, dY)

class ZoomController
  constructor: (viewport)->
    @vp = viewport
    
  attach: ()=>
    $(window).mousewheel @zoom
    
  zoom: (e)=>
    # console.log e.wheelDelta
    f = 0.05
    if e.wheelDelta < 0
      f *= -1
      
    @vp.doZoom(f, e.clientX, e.clientY)
    

class Viewport
  constructor: ()->
    @zoomPos = 0.0
    @scale = 1.0
    # @pX = 0
    # @pY = 0
    
    @viewport = $('#viewport')[0]
    @surface = $('#viewport .surface')[0]
    
    @vpOffset = $(@viewport).offset()
    
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
    
    console.log "OFFSET", @vpOffM
    
    console.log "init pan", @surface
    @pan = new PanController(@, @viewport)
    @pan.attach()
    
    @zoom = new ZoomController(@)
    @zoom.attach()
    
    # window.addEventListener 'mousemove', (e)=>
    #   # console.log "#{e.clientX}, #{e.clientY}" #, e.target
    #   # console.log e
    #   console.log "Client", e.clientX, e.clientY
    #   p = @clientToSurface(e.clientX, e.clientY)
    #   console.log p.e(1), p.e(2), p.e(3)
    # , true
  
  clientToSurface: (x, y)=>
    v = $V([x, y, 1])
    sV = @surfaceM.inverse().multiply( @vpOffM.inverse().multiply(v) )
    
  surfaceToClient: (v)=>
    @vpOffM.multiply( @surfaceM.multiply(v) )
  
  updateSurface: ()=>
    pX = @surfaceM.e(1, 3)
    pY = @surfaceM.e(2, 3)
    scale = @surfaceM.e(1, 1)
    
    matrix = "matrix(#{scale}, 0.0, 0.0, #{scale}, #{pX}, #{pY})"
    $(@surface).css("-webkit-transform", matrix)
  
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
    
  # zoomIn: (byF)=>
  #   # @scale *= byF
  #   @zoomPos += byF
  #   @updateSurface()
  #   
  # zoomOut: (byF)=>
  #   # @scale /= byF
  #   @zoomPos -= byF
  #   @updateSurface()
    

jQuery ()->
  console.log "Ready"
  window.zui53 = new Viewport()