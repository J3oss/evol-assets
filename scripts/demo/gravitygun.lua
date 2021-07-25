-- Parameters
this.held = nil 
this.held_distance = 0
this.rigidness = 0.2
this.distance_change_speed = 0.1
this.speed_factor = 5.0

-- this.on_init = function()
-- end

this.vec_mag = function(v)
  return (v.x^2 + v.y^2 + v.z^2) ^0.5
end

this.vec_lerp = function(v1,v2,t)
  return v1 * (1-t) + v2 * (t)
end

this.check_inputs = function()
  if Input.getMouseButtonJustPressed(0) then
    hit = rayCast(this.worldPosition, this.forward, 3000)
    if(hit.hasHit) then
      this.held = hit.object
      this.held_distance = this.vec_mag(hit.object.worldPosition - this.worldPosition)
    end
  end

  if Input.getMouseButtonJustReleased(0) then
    this.held = nil
  end

  if Input.getMouseButtonDown(3) then
    this.held_distance = this.held_distance + this.distance_change_speed
  end

  if Input.getMouseButtonDown(4) then
    this.held_distance = this.held_distance - this.distance_change_speed
  end
end

this.on_update = function()
  this.check_inputs()

  if this.held then
    target_position = this.worldPosition + this.forward * this.held_distance
    -- this.held.position = this.vec_lerp(this.held.position, target_position, this.rigidness)
    rb = this.held:getComponent(Rigidbody)
    rb:setVelocity((target_position - this.held.worldPosition) * this.speed_factor)
  end
end
