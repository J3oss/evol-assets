this.on_init = function ()
  this.custom_eulerangles = Vec3:new()
  this.custom_angularvelocity = Vec3:new(0, 0.01, 0)
end

this.on_fixedupdate = function ()
  if Input.getKeyDown(Input.KeyCode.Left) then
    this.custom_eulerangles:add(Vec3:new(0,0.01,0))
  end
  if Input.getKeyDown(Input.KeyCode.Right) then
    this.custom_eulerangles:sub(Vec3:new(0,0.01,0))
  end
  this.eulerAngles = this.custom_eulerangles
end
