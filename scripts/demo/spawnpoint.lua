this.shootForce = 600


this.on_update = function()
  if Input.getKeyJustPressed(Input.KeyCode.P) then
    spawn = loadPrefab('prefabs://DamagedHelmet.pf')
    spawn.position = this.worldPosition
    rb = spawn:getComponent(Rigidbody)
    rb:addForce(Vec3:new(-1, -2, 1) * this.shootForce)
  end
end
