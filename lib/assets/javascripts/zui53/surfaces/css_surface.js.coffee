class window.CSSSurface
  constructor: (@node)->
    
  apply: (panX, panY, scale)=>
    matrix = "matrix(#{scale}, 0.0, 0.0, #{scale}, #{panX}, #{panY})"
    # single = "translate(#{pX}px, #{pY}px) scale(#{scale}, #{scale})"
    # console.log @node, matrix
    $(@node).css("-webkit-transform", matrix)
    # $(@surface).css("-moz-transform", single)
    # $(@surface).css("transform", matrix)