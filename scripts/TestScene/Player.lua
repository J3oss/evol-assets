-- this.on_collisionenter = function(other)
  -- other.position = other.position + Vec3:new(3.2, 0, 0)
-- end

this.on_update = function ()
  rb = this:getComponent(Rigidbody)
  if Input.getKeyDown(Input.KeyCode.Space) then
    rb:addForce(Vec3:new(0, 100, 0))
  end
  if Input.getKeyDown(Input.KeyCode.D) then
    rb:addForce(Vec3:new(10, 0, 0))
  end
  if Input.getKeyDown(Input.KeyCode.A) then
    rb:addForce(Vec3:new(-10, 0, 0))
  end
  if Input.getKeyDown(Input.KeyCode.W) then
    rb:addForce(Vec3:new(0, 0, -10))
  end
  if Input.getKeyDown(Input.KeyCode.S) then
    rb:addForce(Vec3:new(0, 0, 10))
  end
end
