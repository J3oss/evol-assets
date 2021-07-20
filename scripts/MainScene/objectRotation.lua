this.on_init = function()
  this.angles = Vec3:new()
end

this.on_update = function()
  rotationSpeed = 0.001
  this.angles.y = this.angles.y - rotationSpeed
  this.eulerAngles = this.angles
end
