--[[
	PlayerService
	Server-authoritative player state: spawning, health, sprint stamina,
	flashlight, equipment, downed/revive (co-op), cosmetics visuals.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Net = require(Shared:WaitForChild("Net"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))

local PlayerService = {}
local Services

local sessions = {} -- [player] = session table
local PC = Config.Player

local function newSession()
	return {
		sprintRequested = false,
		sprinting = false,
		stamina = PC.MaxStamina,
		lastSprintAt = 0,
		lastDamageAt = 0,
		equipment = {},
		flashlightOn = false,
		wentDown = false,
		playing = false,
	}
end

function PlayerService.getSession(player)
	return sessions[player]
end

local function getParts(player)
	local character = player.Character
	if not character then
		return nil
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or not root then
		return nil
	end
	return character, humanoid, root
end
PlayerService.getParts = getParts

function PlayerService.isAlive(player)
	local character, humanoid = getParts(player)
	return character ~= nil and humanoid.Health > 0
end

function PlayerService.isActive(player)
	local character, humanoid = getParts(player)
	return character ~= nil and humanoid.Health > 0 and not character:GetAttribute("Downed")
end

-- Cosmetics visuals -------------------------------------------------------------
local function torsoOf(character)
	return character:FindFirstChild("UpperTorso") or character:FindFirstChild("Torso")
end

local function weldPart(parentPart, offset, props, model)
	local part = Instance.new("Part")
	part.CanCollide = false
	part.CanQuery = false
	part.CanTouch = false
	part.Massless = true
	part.CastShadow = false
	part.TopSurface = Enum.SurfaceType.Smooth
	part.BottomSurface = Enum.SurfaceType.Smooth
	for k, v in pairs(props) do
		part[k] = v
	end
	part.CFrame = parentPart.CFrame * offset
	local weld = Instance.new("WeldConstraint")
	weld.Part0 = parentPart
	weld.Part1 = part
	weld.Parent = part
	part.Parent = model
	return part
end

function PlayerService.applyCosmetics(player)
	local character = player.Character
	local profile = Services.Data.get(player)
	if not character or not profile then
		return
	end
	local equipped = profile.cosmetics.equipped
	-- flashlight colour
	local head = character:FindFirstChild("Head")
	local light = head and head:FindFirstChild("Flashlight")
	local lightDef = Cosmetics[equipped.light] or Cosmetics.light_default
	if light then
		light.Color = lightDef.color
	end
	-- gear
	local old = character:FindFirstChild("CosmeticGear")
	if old then
		old:Destroy()
	end
	local gearDef = Cosmetics[equipped.gear]
	local torso = torsoOf(character)
	if gearDef and gearDef.style ~= "none" and torso then
		local model = Instance.new("Model")
		model.Name = "CosmeticGear"
		if gearDef.style == "pack" then
			weldPart(torso, CFrame.new(0, 0, 0.95), { Size = Vector3.new(1.7, 2, 0.9), Material = Enum.Material.Fabric, Color = gearDef.color }, model)
			weldPart(torso, CFrame.new(0, -0.55, 1.42), { Size = Vector3.new(1.3, 0.7, 0.2), Material = Enum.Material.Fabric, Color = gearDef.accent }, model)
			weldPart(torso, CFrame.new(0, 1.05, 0.9), { Size = Vector3.new(1.5, 0.35, 0.7), Material = Enum.Material.Fabric, Color = gearDef.accent }, model)
		elseif gearDef.style == "tank" then
			for _, x in ipairs({ -0.45, 0.45 }) do
				weldPart(torso, CFrame.new(x, 0, 0.95) * CFrame.Angles(0, 0, math.rad(90)), { Shape = Enum.PartType.Cylinder, Size = Vector3.new(2.2, 0.8, 0.8), Material = Enum.Material.Metal, Color = gearDef.color }, model)
			end
			weldPart(torso, CFrame.new(0, 1.1, 0.95), { Size = Vector3.new(1.4, 0.25, 0.4), Material = Enum.Material.Metal, Color = gearDef.accent }, model)
		end
		model.Parent = character
	end
	-- title
	if head then
		local oldTag = head:FindFirstChild("TitleTag")
		if oldTag then
			oldTag:Destroy()
		end
		local titleDef = Cosmetics[equipped.title]
		if titleDef and titleDef.text and titleDef.text ~= "" then
			local bb = Instance.new("BillboardGui")
			bb.Name = "TitleTag"
			bb.Size = UDim2.fromOffset(160, 22)
			bb.StudsOffset = Vector3.new(0, 2.6, 0)
			bb.MaxDistance = 60
			bb.LightInfluence = 0
			local label = Instance.new("TextLabel")
			label.Size = UDim2.fromScale(1, 1)
			label.BackgroundTransparency = 1
			label.Font = Enum.Font.GothamBlack
			label.TextScaled = true
			label.TextColor3 = titleDef.color or Color3.new(1, 1, 1)
			label.TextStrokeTransparency = 0.4
			label.Text = titleDef.text
			label.Parent = bb
			bb.Parent = head
		end
	end
end

-- Flashlight -------------------------------------------------------------------------
local function ensureFlashlight(player)
	local character = player.Character
	local head = character and character:FindFirstChild("Head")
	if not head or head:FindFirstChild("Flashlight") then
		return
	end
	local light = Instance.new("SpotLight")
	light.Name = "Flashlight"
	light.Face = Enum.NormalId.Front
	light.Range = 48
	light.Angle = 55
	light.Brightness = 3.2
	light.Shadows = true
	light.Enabled = false
	light.Parent = head
	local s = sessions[player]
	if s and s.flashlightOn then
		light.Enabled = true
	end
	PlayerService.applyCosmetics(player)
end

function PlayerService.setFlashlight(player, on)
	local s = sessions[player]
	local character = player.Character
	local head = character and character:FindFirstChild("Head")
	local light = head and head:FindFirstChild("Flashlight")
	if not s or not light then
		return
	end
	s.flashlightOn = on
	light.Enabled = on
	character:SetAttribute("LightOn", on)
end

-- Equipment ------------------------------------------------------------------------------
function PlayerService.hasEquipment(player, id)
	local s = sessions[player]
	return s ~= nil and s.equipment[id] == true
end

function PlayerService.grantEquipment(player, id, silent)
	local s = sessions[player]
	if not s then
		return false
	end
	if s.equipment[id] then
		return false
	end
	s.equipment[id] = true
	if id == "flashlight" then
		ensureFlashlight(player)
		PlayerService.setFlashlight(player, true)
	elseif Config.Weapons[id] then
		Services.Combat.giveWeapon(player, id)
	end
	if not silent then
		Services.sync(player)
	end
	return true
end

function PlayerService.clearEquipment(player)
	local s = sessions[player]
	if s then
		s.equipment = {}
		s.flashlightOn = false
	end
end

-- Spawning ---------------------------------------------------------------------------------
function PlayerService.spawn(player, position)
	local s = sessions[player]
	if not s or not player.Parent then
		return
	end
	s.playing = true
	s.stamina = PC.MaxStamina
	player:LoadCharacter()
	local character = player.Character
	if character and position then
		character:PivotTo(CFrame.new(position + Vector3.new(math.random(-2, 2), 0, math.random(-2, 2))))
	end
end

function PlayerService.despawn(player)
	local s = sessions[player]
	if s then
		s.playing = false
	end
	if player.Character then
		player.Character:Destroy()
		player.Character = nil
	end
end

-- Damage / downed / revive ----------------------------------------------------------------------
local function removeRevivePrompt(character)
	local root = character and character:FindFirstChild("HumanoidRootPart")
	local prompt = root and root:FindFirstChild("RevivePrompt")
	if prompt then
		prompt:Destroy()
	end
	local hl = character and character:FindFirstChild("DownedHighlight")
	if hl then
		hl:Destroy()
	end
end

local function activeTeammates(except)
	local n = 0
	for _, other in ipairs(Players:GetPlayers()) do
		if other ~= except and PlayerService.isActive(other) then
			n = n + 1
		end
	end
	return n
end

function PlayerService.revive(player, reviver)
	local character, humanoid = getParts(player)
	if not character or not character:GetAttribute("Downed") then
		return
	end
	character:SetAttribute("Downed", false)
	removeRevivePrompt(character)
	humanoid.Health = math.max(humanoid.Health, 40)
	humanoid.WalkSpeed = PC.WalkSpeed
	Net.fire("Notify", player, (reviver and reviver.DisplayName or "Someone") .. " revived you!", "good")
	if reviver then
		Net.fire("Notify", reviver, "You revived " .. player.DisplayName .. ".", "good")
		Services.Rewards.addStat(reviver, "revives", 1)
		Services.Rewards.unlock(reviver, "team_player")
	end
end

local function down(player)
	local character, humanoid, root = getParts(player)
	local s = sessions[player]
	if not character or not s then
		return
	end
	s.wentDown = true
	character:SetAttribute("Downed", true)
	humanoid.Health = 15
	humanoid.WalkSpeed = PC.DownedSpeed
	s.sprinting = false

	local hl = Instance.new("Highlight")
	hl.Name = "DownedHighlight"
	hl.FillTransparency = 0.8
	hl.FillColor = Color3.fromRGB(255, 60, 60)
	hl.OutlineColor = Color3.fromRGB(255, 80, 80)
	hl.DepthMode = Enum.HighlightDepthMode.AlwaysOnTop
	hl.Parent = character

	local prompt = Instance.new("ProximityPrompt")
	prompt.Name = "RevivePrompt"
	prompt.ActionText = "Revive"
	prompt.ObjectText = player.DisplayName
	prompt.HoldDuration = PC.ReviveHoldTime
	prompt.MaxActivationDistance = 9
	prompt.RequiresLineOfSight = false
	prompt.KeyboardKeyCode = Enum.KeyCode.E
	prompt.Parent = root
	prompt.Triggered:Connect(function(reviver)
		if reviver ~= player and PlayerService.isActive(reviver) then
			local _, _, rRoot = getParts(reviver)
			if rRoot and (rRoot.Position - root.Position).Magnitude < 14 then
				PlayerService.revive(player, reviver)
			end
		end
	end)

	Net.fire("Notify", player, "You are down! A teammate can revive you.", "bad")
	for _, other in ipairs(Players:GetPlayers()) do
		if other ~= player then
			Net.fire("Notify", other, player.DisplayName .. " is down! Hold E / tap to revive.", "bad")
		end
	end

	local downedCharacter = character
	task.delay(PC.DownedDuration, function()
		if downedCharacter.Parent and downedCharacter:GetAttribute("Downed") then
			local h = downedCharacter:FindFirstChildOfClass("Humanoid")
			if h then
				h.Health = 0
			end
		end
	end)

	-- if nobody is left standing, the whole party falls
	if activeTeammates(nil) == 0 then
		for _, other in ipairs(Players:GetPlayers()) do
			local c, h = getParts(other)
			if c and c:GetAttribute("Downed") then
				h.Health = 0
			end
		end
	end
end

function PlayerService.damage(player, amount, attackerName)
	local character, humanoid = getParts(player)
	local s = sessions[player]
	if not character or not s or humanoid.Health <= 0 then
		return false
	end
	if character:GetAttribute("Downed") or player:GetAttribute("InCinematic") then
		return false
	end
	s.lastDamageAt = os.clock()
	local newHealth = humanoid.Health - amount
	if newHealth <= 0 then
		if activeTeammates(player) > 0 then
			down(player)
		else
			s.wentDown = true
			humanoid.Health = 0
		end
	else
		humanoid.Health = newHealth
	end
	Net.fire("Shake", player, math.clamp(amount / 30, 0.15, 0.8), 0.25)
	return true
end

function PlayerService.heal(player, amount)
	local _, humanoid = getParts(player)
	if humanoid and humanoid.Health > 0 then
		humanoid.Health = math.min(humanoid.MaxHealth, humanoid.Health + amount)
		return true
	end
	return false
end

function PlayerService.slow(player, seconds)
	local character, humanoid = getParts(player)
	if not character then
		return
	end
	character:SetAttribute("SlowUntil", os.clock() + seconds)
	humanoid.WalkSpeed = PC.WalkSpeed * 0.6
end

-- Character setup ---------------------------------------------------------------------------------------
local function onCharacterAdded(player, character)
	local humanoid = character:WaitForChild("Humanoid", 10)
	if not humanoid then
		return
	end
	local s = sessions[player]
	humanoid.MaxHealth = PC.MaxHealth
	humanoid.Health = PC.MaxHealth
	humanoid.WalkSpeed = PC.WalkSpeed
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.Viewer
	humanoid.HealthDisplayDistance = 0
	humanoid.NameDisplayDistance = 60
	character:SetAttribute("Downed", false)
	character:SetAttribute("LightOn", false)

	character:WaitForChild("Head", 10)
	if s then
		if s.equipment.flashlight then
			ensureFlashlight(player)
			PlayerService.setFlashlight(player, s.flashlightOn)
		end
		for id in pairs(s.equipment) do
			if Config.Weapons[id] then
				Services.Combat.giveWeapon(player, id)
			end
		end
	end
	PlayerService.applyCosmetics(player)

	humanoid.Died:Connect(function()
		removeRevivePrompt(character)
		if s then
			s.wentDown = true
		end
		Services.Rewards.addStat(player, "deaths", 1)
		task.delay(4, function()
			if player.Parent and player.Character == character then
				Services.Mission.respawn(player)
			end
		end)
	end)
end

-- Loop: stamina, sprint speed, passive regen ---------------------------------------------------------------
local accumulator = 0
local function tick(dt)
	for player, s in pairs(sessions) do
		local character, humanoid, root = getParts(player)
		if character and humanoid.Health > 0 then
			local downed = character:GetAttribute("Downed")
			local slowUntil = character:GetAttribute("SlowUntil")
			local slowed = slowUntil and os.clock() < slowUntil
			local v = root.AssemblyLinearVelocity
			local moving = Vector3.new(v.X, 0, v.Z).Magnitude > 2
			local canSprint = not downed and s.sprintRequested and moving
				and (s.sprinting and s.stamina > 0 or s.stamina >= PC.MinStaminaToSprint)
			s.sprinting = canSprint and true or false
			if s.sprinting then
				s.stamina = math.max(0, s.stamina - PC.SprintDrain * dt)
				s.lastSprintAt = os.clock()
			elseif os.clock() - s.lastSprintAt > PC.RegenDelay then
				s.stamina = math.min(PC.MaxStamina, s.stamina + PC.StaminaRegen * dt)
			end
			local speed
			if downed then
				speed = PC.DownedSpeed
			elseif s.sprinting then
				speed = PC.SprintSpeed
			else
				speed = PC.WalkSpeed
			end
			if slowed and not downed then
				speed = speed * 0.6
			end
			if humanoid.WalkSpeed ~= speed then
				humanoid.WalkSpeed = speed
			end
			character:SetAttribute("Sprinting", s.sprinting)
			local rounded = math.floor(s.stamina + 0.5)
			if player:GetAttribute("Stamina") ~= rounded then
				player:SetAttribute("Stamina", rounded)
			end
			-- passive regeneration (only a little - bandages do the rest)
			if not downed and os.clock() - s.lastDamageAt > 6 and humanoid.Health < PC.PassiveRegenCap then
				humanoid.Health = math.min(PC.PassiveRegenCap, humanoid.Health + PC.PassiveRegenRate * dt)
			end
		end
	end
end

function PlayerService.init(services)
	Services = services
end

function PlayerService.start()
	Players.CharacterAutoLoads = false

	local function onPlayerAdded(player)
		sessions[player] = newSession()
		player:SetAttribute("Stamina", PC.MaxStamina)
		player.CharacterAdded:Connect(function(character)
			onCharacterAdded(player, character)
		end)
	end
	Players.PlayerAdded:Connect(onPlayerAdded)
	for _, p in ipairs(Players:GetPlayers()) do
		onPlayerAdded(p)
	end
	Players.PlayerRemoving:Connect(function(player)
		sessions[player] = nil
	end)

	Net.on("SetSprint", function(player, on)
		local s = sessions[player]
		if s and type(on) == "boolean" then
			s.sprintRequested = on
		end
	end, 20)

	Net.on("ToggleFlashlight", function(player)
		local s = sessions[player]
		if s and s.equipment.flashlight then
			PlayerService.setFlashlight(player, not s.flashlightOn)
		end
	end, 6)

	RunService.Heartbeat:Connect(function(dt)
		accumulator = accumulator + dt
		if accumulator >= 0.1 then
			local step = accumulator
			accumulator = 0
			tick(step)
		end
	end)
end

return PlayerService
