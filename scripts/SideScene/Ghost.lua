this.on_collisionenter = function(other)
  print(other.name)
end

this.on_update = function ()
  local player = getObject('Player.Child')
  this.position = player.position + Vec3:new(0, 10, 0)
end
