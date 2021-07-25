this.on_init = function()
  this.angles = Vec3:new()
  this.mouse_sens = 0.01
end

function clamp(min, max, val)
  if val < min then
    return min
  elseif val > max then
    return max
  else
    return val
  end
end

this.on_update = function()
  local deltaMouseMovement = Input.getDeltaMousePos()
  this.angles.x = clamp(-1.57, 1.57, this.angles.x - deltaMouseMovement.y * this.mouse_sens)
  print(this.angles.x)
  this.eulerAngles = this.angles

  if Input.getKeyJustPressed(Input.KeyCode.O) then
    box = loadPrefab("prefabs://BrainStem.pf")
    box.position = this.worldPosition + (this.forward * 2)
    boxBody = box:getComponent(Rigidbody)
    boxBody:addForce(this.forward * 3000)
  end
end
