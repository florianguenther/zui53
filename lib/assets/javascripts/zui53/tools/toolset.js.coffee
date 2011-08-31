namespace 'ZUI53.Tools', (exports)->
  class exports.Base
    constructor: ()->
      @set = null
      @group = null
      @attached = false
      # @exclusive = false
    
    attach: ()=>
      @group.attach(@) if @group
      @attached = true
    
    detach: ()=>
      @attached = false
      # if @exclusive
      # @makeUnexclusive()
    
    makeExclusive: ()=>
      # if @exclusive
      #   return  
      # @exclusive = true
      @set.exclusive(@) if @set
      @attach()
    
    makeUnexclusive: ()=>
      # if !@exclusive
      #   return
      # @exclusive = false
      @set.unexclusive() if @set
      
    stopEvent: (e)=>
      e.preventDefault()
      e.stopImmediatePropagation()
      false

  class exports.SetGroup
    constructor: ()->
      @tools = []
      @current = null
      @beforeExclusive = null
    
    add: (tool)=>
      tool.group = @
      @tools.push(tool)
      tool.attach() if @tools.length == 1
    
    attach: (tool)=>
      @current = tool
      for t in @tools
        t.detach() if t != tool
      
    requestExclusive: (tool)=>
      @current.detach() if @current and @current != tool
      @beforeExclusive = @current
    
    requestUnexclusive: ()=>
      @current = @beforeExclusive
      @current.attach() if @current

  class exports.Set
    constructor: (@default_tool)->
      @groups = [ new exports.SetGroup() ]
    
      @default_tool.set = @
      @default_tool.attach() if @default_tool
    
    add: (tool)=>
      @groups[0].add(tool)
      tool.set = @
    
    exclusive: (tool)=>
      # console.log 'Make Exclusive'
      for g in @groups
        g.requestExclusive(tool)
      
      @default_tool.detach() if @default_tool != tool and @default_tool
    
    unexclusive: ()=>
      for g in @groups
        g.requestUnexclusive()
      
      @default_tool.attach() if @default_tool
      # console.log 'Make UN-Exclusive'