
class window.Tool
  constructor: ()->
    @set = null
    @group = null
    
  attach: ()=>
    @group.attach(@) if @group
    
  detach: ()=>
    
    
  makeExclusive: ()=>
    @set.exclusive(@) if @set
    @attach()
    
  makeUnexclusive: ()=>
    @set.unexclusive() if @set

class window.ToolsetGroup
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

class window.Toolset
  constructor: (@default_tool)->
    @groups = [ new ToolsetGroup() ]
    
    @default_tool.set = @
    @default_tool.attach() if @default_tool
    
  add: (tool)=>
    @groups[0].add(tool)
    tool.set = @
    
  exclusive: (tool)=>
    console.log 'Make Exclusive'
    for g in @groups
      g.requestExclusive(tool)
      
    @default_tool.detach() if @default_tool != tool and @default_tool
    
  unexclusive: ()=>
    for g in @groups
      g.requestUnexclusive()
      
    @default_tool.attach() if @default_tool
    console.log 'Make UN-Exclusive'