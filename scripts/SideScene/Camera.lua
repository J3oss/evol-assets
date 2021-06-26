this.on_init = function()
  this.speed = 0.1
  this.original_position = this.position
  this.cursor_locked = false
end

this.on_fixedupdate = function()
  if Input.getKeyJustPressed(Input.KeyCode.Enter) then
    gotoScene('MainScene')
  end

  if Input.getKeyDown(Input.KeyCode.L) then
    if this.cursor_locked then
      Input.unlockCursor()
    else
      Input.lockCursor()
    end
    this.cursor_locked = not this.cursor_locked
  end

  if Input.getKeyDown(Input.KeyCode.Up) then
    this.position = this.position - Vec3:new(0, 0, 1) * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Down) then
    this.position = this.position + Vec3:new(0, 0, 1) * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Right) then
    this.position = this.position + Vec3:new(1, 0, 0) * this.speed
  end
  if Input.getKeyDown(Input.KeyCode.Left) then
    this.position = this.position - Vec3:new(1, 0, 0) * this.speed
  end
end
