namespace 'ZUI53.Surfaces', (exports)->
  class exports.Canvas
    constructor : (id = 'canvas', @render)->
      @canvas = document.getElementById(id)
      @parent = $(@canvas).parent()
      @ctx    = @canvas.getContext('2d')

      $(window).resize @resize
      @panX = @panY = 0
      @scale = 1
      @resize()

    resize : ()=>
      @w = @parent.width()
      @h = @parent.height()
      @canvas.width = @w
      @canvas.height = @h
      @apply(@panX, @panY, @scale)

    limits : ->
      null

    apply : (@panX, @panY, @scale)=>
      @ctx.clearRect(0, 0, @w, @h)
      @ctx.save()
      @ctx.translate(@panX, @panY)
      @ctx.scale(@scale, @scale)
      @render(@ctx)
      @ctx.restore()
