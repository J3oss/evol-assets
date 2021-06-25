this.on_init = function()
  this.speed = 2.1
  this.original_position = this.position
  this.angles = Vec3:new()
  this.mouse_sens = 0.01
  this.cursor_locked = false
end

this.toggleCursor = function()
    if this.cursor_locked then
      Input.unlockCursor()
    else
      Input.lockCursor()
    end
    this.cursor_locked = not this.cursor_locked
end

this.on_update = function()
  local deltaMouseMovement = Input.getDeltaMousePos()
  this.angles.y = this.angles.y - deltaMouseMovement.x * this.mouse_sens
  this.eulerAngles = this.angles

  helper = this:getChild('RotationHelper')

  if Input.getKeyJustPressed(Input.KeyCode.Enter) then
    gotoScene('SideScene')
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

  local mb0 = Input.getMouseButtonJustPressed(0)
  local mb1 = Input.getMouseButtonJustPressed(1)
  local mb2 = Input.getMouseButtonJustPressed(2)

  if mb0 or mb1 then
    hit = rayCast(this.worldPosition, helper.forward, 300)
    if(hit.hasHit) then
      local hitForce = 1000
      rb = hit.object:getComponent(Rigidbody)
      if mb0 then
        rb:addForce(hit.hitNormal * -hitForce)
      elseif mb1 then
        rb:addForce(hit.hitNormal * hitForce)
      end
    end
  end

  if mb2 then
    this.toggleCursor()
  end

  this.position = pos
end

