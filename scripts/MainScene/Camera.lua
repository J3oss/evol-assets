this.on_init = function()
  this.speed = 0.1
  this.angles = Vec3:new()
  this.mouse_sens = 0.01
end

this.on_update = function()
  local deltaMouseMovement = Input.getDeltaMousePos()
  this.angles.y = this.angles.y - deltaMouseMovement.x * this.mouse_sens
  this.eulerAngles = this.angles

  helper = this:getChild('RotationHelper')

  if Input.getKeyJustPressed(Input.KeyCode.Enter) then
    gotoScene('SideScene')
  end
  if Input.getKeyJustPressed(Input.KeyCode.T) then
    gotoScene('TestScene')
  end


  local pos = this.position
  if Input.getKeyDown(Input.KeyCode.Up) then
    pos = pos + helper.forward * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Down) then
    pos = pos - helper.forward * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Right) then
    pos = pos + helper.right * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Left) then
    pos = pos - helper.right * this.speed
  end

  this.position = pos
end
