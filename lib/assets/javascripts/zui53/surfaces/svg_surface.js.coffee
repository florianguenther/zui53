class window.SVGSurface
  constructor: (@node)->
    
  apply: (panX, panY, scale)=>
    singleSVG = "translate(#{panX}, #{panY}) scale(#{scale}, #{scale})"
    $(@node).attr("transform", singleSVG)