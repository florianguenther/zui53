namespace 'ZUI53.Surfaces', (exports)->
  class exports.SVG
    constructor: (@node)->
      # console.log @node
      # $(@node).css({
      #   'position': 'absolute',
      #   'width': '100%',
      #   'height': '100%'
      # })
      
    limits: ()->
      [0.0001, 20000] #20000
    
    apply: (panX, panY, scale)=>
      singleSVG = "translate(#{panX}, #{panY}) scale(#{scale}, #{scale})"
      $(@node).attr("transform", singleSVG)