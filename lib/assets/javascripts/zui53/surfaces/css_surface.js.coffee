namespace 'ZUI53.Surfaces', (exports)->
  class exports.CSS
    constructor: (@node)->
      if typeof @node == 'string'
        @node = document.getElementById(@node)
        
      $(@node).transform({origin:['0','0']})
      $(@node).css({
        # '-webkit-transform-origin': '0 0',
        # '-moz-transform-origin': '0 0',
        # '-o-transform-origin': '0 0',
        # 'transform-origin': '0 0',
        'position': 'absolute'
      })

    limits: ()->
      null
    
    apply: (panX, panY, scale)=>
      m = [scale,0.0,0.0,scale,panX,panY]
      $(@node).transform({matrix: m})
      
      # matrix = "matrix(#{scale}, 0.0, 0.0, #{scale}, #{panX}, #{panY})"
      # single = "translate(#{pX}px, #{pY}px) scale(#{scale}, #{scale})"

      # $(@node).css("-webkit-transform", matrix)
      # $(@node).css({
      #   # "-moz-transform": matrix,
      #   # "-o-transform": matrix,
      #   # "transform": matrix,
      #   "-webkit-transform": matrix
      # })