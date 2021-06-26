this.on_init = function()
  this.angles = Vec3:new()
  this.mouse_sens = 0.01
end

this.on_update = function()
  local deltaMouseMovement = Input.getDeltaMousePos()
  this.angles.x = this.angles.x - deltaMouseMovement.y * this.mouse_sens
  this.eulerAngles = this.angles
end
