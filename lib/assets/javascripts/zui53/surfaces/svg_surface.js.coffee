namespace 'ZUI53.Surfaces', (exports)->
  class exports.SVG
    constructor: (@node)->
      # console.log @node
      # $(@node).css({
      #   'position': 'absolute',
      #   'width': '100%',
      #   'height': '100%'
      # })
    
    apply: (panX, panY, scale)=>
      singleSVG = "translate(#{panX}, #{panY}) scale(#{scale}, #{scale})"
      $(@node).attr("transform", singleSVG)