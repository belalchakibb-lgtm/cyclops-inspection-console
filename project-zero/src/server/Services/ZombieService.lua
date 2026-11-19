--[[
	ZombieService
	Spawning, AI and combat for all infected.

	Performance design (mobile friendly):
	- One shared AI loop (no script per zombie), ticking every Config.Zombies.TickRate
	- Rigs are built once per type and cloned
	- Pathfinding only when the direct route is blocked, throttled per zombie
	- Server network ownership (no jitter), zombie-zombie collisions disabled
	- Population cap scales with party size; far zombies despawn

	Behaviour: idle/wander -> detect (sight with line-of-sight, hearing for
	sprinting players, flashlight attraction) -> chase (direct or path) ->
	attack with wind-up -> lose interest when the target escapes.
]]

local Players = game:GetService("Players")
local PathfindingService = game:GetService("PathfindingService")
local PhysicsService = game:GetService("PhysicsService")
local CollectionService = game:GetService("CollectionService")
local TweenService = game:GetService("TweenService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local ZombieTypes = require(Shared:WaitForChild("ZombieTypes"))
local Layout = require(Shared:WaitForChild("Layout"))
local Net = require(Shared:WaitForChild("Net"))

local ZombieService = {}
local Services

local ZC = Config.Zombies
local templates = {}
local zombies = {} -- [model] = state
local folder
local stage = 0
local activeRegions = {}
local fixedSpawned = {}
local killedCallbacks = {}
local lastAmbientSpawn = 0
local enabled = false

local rayParams = RaycastParams.new()
rayParams.FilterType = Enum.RaycastFilterType.Exclude
rayParams.IgnoreWater = true

-- Rig construction --------------------------------------------------------------------------
local function addEyes(model, def)
	local head = model:FindFirstChild("Head")
	if not head then
		return
	end
	local face = head:FindFirstChildOfClass("Decal")
	if face then
		face:Destroy()
	end
	local s = head.Size.Y / 1.2
	for _, x in ipairs({ -0.22, 0.22 }) do
		local eye = Instance.new("Part")
		eye.Name = "Eye"
		eye.Shape = Enum.PartType.Ball
		eye.Size = Vector3.new(0.22, 0.22, 0.22) * s
		eye.Material = Enum.Material.Neon
		eye.Color = def.eyes
		eye.CanCollide = false
		eye.CanQuery = false
		eye.CanTouch = false
		eye.Massless = true
		eye.CastShadow = false
		eye.CFrame = head.CFrame * CFrame.new(x * s, 0.12 * s, -0.55 * s)
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = head
		weld.Part1 = eye
		weld.Parent = eye
		eye.Parent = model
	end
	local mouth = Instance.new("Part")
	mouth.Name = "Mouth"
	mouth.Size = Vector3.new(0.5, 0.12, 0.05) * s
	mouth.Color = Color3.fromRGB(25, 15, 15)
	mouth.Material = Enum.Material.SmoothPlastic
	mouth.CanCollide = false
	mouth.CanQuery = false
	mouth.Massless = true
	mouth.CFrame = head.CFrame * CFrame.new(0, -0.25 * s, -0.6 * s)
	local w = Instance.new("WeldConstraint")
	w.Part0 = head
	w.Part1 = mouth
	w.Parent = mouth
	mouth.Parent = model
end

local function addDetails(model, typeName, def)
	local torso = model:FindFirstChild("UpperTorso") or model:FindFirstChild("Torso")
	if not torso then
		return
	end
	if def.glow then
		local light = Instance.new("PointLight")
		light.Color = def.glow
		light.Range = typeName == "Warden" and 18 or 10
		light.Brightness = 1.5
		light.Parent = torso
		local att = Instance.new("Attachment")
		att.Parent = torso
		local pe = Instance.new("ParticleEmitter")
		pe.Texture = "rbxasset://textures/particles/smoke_main.dds"
		pe.Color = ColorSequence.new(def.glow)
		pe.LightEmission = 0.6
		pe.Transparency = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.7), NumberSequenceKeypoint.new(1, 1) })
		pe.Size = NumberSequence.new(1.2, 2.5)
		pe.Rate = 6
		pe.Lifetime = NumberRange.new(1, 1.6)
		pe.Speed = NumberRange.new(0.5, 1.5)
		pe.Parent = att
		CollectionService:AddTag(pe, "OptionalParticle")
	end
	if typeName == "Warden" then
		-- riot armour plates (old hospital security)
		local function plate(cf, size)
			local p = Instance.new("Part")
			p.Name = "Armor"
			p.Size = size
			p.Material = Enum.Material.DiamondPlate
			p.Color = Color3.fromRGB(45, 50, 60)
			p.CanCollide = false
			p.Massless = true
			p.CFrame = torso.CFrame * cf
			local w = Instance.new("WeldConstraint")
			w.Part0 = torso
			w.Part1 = p
			w.Parent = p
			p.Parent = model
		end
		local sx, sy = torso.Size.X, torso.Size.Y
		plate(CFrame.new(0, 0, -torso.Size.Z / 2 - 0.1), Vector3.new(sx * 0.9, sy * 0.8, 0.3))
		plate(CFrame.new(-sx * 0.55, sy * 0.45, 0), Vector3.new(sx * 0.4, 0.4, torso.Size.Z * 1.2))
		plate(CFrame.new(sx * 0.55, sy * 0.45, 0), Vector3.new(sx * 0.4, 0.4, torso.Size.Z * 1.2))
	end
end

local function buildFallbackRig(def)
	-- Used only if Roblox's avatar service is unavailable: a simple block rig.
	local model = Instance.new("Model")
	local h = def.scale.height
	local w = def.scale.width
	local root = Instance.new("Part")
	root.Name = "HumanoidRootPart"
	root.Size = Vector3.new(2 * w, 2 * h, 1 * w)
	root.Transparency = 1
	root.CanCollide = false
	root.Parent = model
	local function limb(name, size, offset, color)
		local p = Instance.new("Part")
		p.Name = name
		p.Size = size
		p.Color = color
		p.CFrame = root.CFrame * offset
		p.CanCollide = name == "Torso"
		local wc = Instance.new("WeldConstraint")
		wc.Part0 = root
		wc.Part1 = p
		wc.Parent = p
		p.Parent = model
	end
	limb("Torso", Vector3.new(2 * w, 2 * h, 1 * w), CFrame.new(), def.shirt)
	limb("Head", Vector3.new(1.2, 1.2, 1.2) * def.scale.head, CFrame.new(0, 1.6 * h, 0), def.skin)
	limb("Left Arm", Vector3.new(1 * w, 2 * h, 1 * w), CFrame.new(-1.5 * w, 0.3 * h, -0.8) * CFrame.Angles(math.rad(80), 0, 0), def.skin)
	limb("Right Arm", Vector3.new(1 * w, 2 * h, 1 * w), CFrame.new(1.5 * w, 0.3 * h, -0.8) * CFrame.Angles(math.rad(80), 0, 0), def.skin)
	limb("Left Leg", Vector3.new(1 * w, 2 * h, 1 * w), CFrame.new(-0.5 * w, -2 * h, 0), def.pants)
	limb("Right Leg", Vector3.new(1 * w, 2 * h, 1 * w), CFrame.new(0.5 * w, -2 * h, 0), def.pants)
	local hum = Instance.new("Humanoid")
	hum.HipHeight = 2 * h
	hum.Parent = model
	model.PrimaryPart = root
	return model
end

local function buildTemplate(typeName)
	local def = ZombieTypes[typeName]
	local model
	local ok, err = pcall(function()
		local desc = Instance.new("HumanoidDescription")
		desc.HeadColor = def.skin
		desc.LeftArmColor = def.skin
		desc.RightArmColor = def.skin
		desc.TorsoColor = def.shirt
		desc.LeftLegColor = def.pants
		desc.RightLegColor = def.pants
		-- Avatar scales are limited by Roblox, so build a normal-sized rig with a
		-- thinner/thicker build and then scale the whole model uniformly.
		desc.HeightScale = 1
		desc.WidthScale = math.clamp(def.scale.width / def.scale.height, 0.7, 1)
		desc.DepthScale = math.clamp(def.scale.depth / def.scale.height, 0.7, 1)
		desc.HeadScale = 1
		desc.BodyTypeScale = 0
		desc.ProportionScale = 0
		model = Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)
		if math.abs(def.scale.height - 1) > 0.01 then
			model:ScaleTo(def.scale.height)
		end
	end)
	if not ok or not model then
		warn("[ZombieService] Avatar rig unavailable, using block rig for " .. typeName .. ": " .. tostring(err))
		model = buildFallbackRig(def)
	end
	model.Name = def.displayName
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.None
	humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff
	humanoid.BreakJointsOnDeath = false
	humanoid.RequiresNeck = false
	humanoid.MaxHealth = def.health
	humanoid.Health = def.health
	humanoid.WalkSpeed = def.walkSpeed
	if not humanoid:FindFirstChildOfClass("Animator") then
		Instance.new("Animator").Parent = humanoid
	end
	addEyes(model, def)
	addDetails(model, typeName, def)
	for _, d in ipairs(model:GetDescendants()) do
		if d:IsA("BasePart") then
			d.CollisionGroup = "Zombies"
			d.CastShadow = d.Name ~= "Eye"
		end
	end
	CollectionService:AddTag(model, "Zombie")
	return model
end

-- Helpers ---------------------------------------------------------------------------------------
local function playSound(parent, id, speed, volume)
	if not id or id == "" or not parent then
		return
	end
	local s = Instance.new("Sound")
	s.SoundId = id
	s.PlaybackSpeed = speed or 1
	s.Volume = volume or 0.6
	s.RollOffMinDistance = 8
	s.RollOffMaxDistance = 90
	s.Parent = parent
	s:Play()
	Debris:AddItem(s, 4)
end

local function groundAt(position)
	-- cast from just above the spawn point so indoor spawns don't land on roofs
	rayParams.FilterDescendantsInstances = { folder }
	local result = workspace:Raycast(position + Vector3.new(0, 3, 0), Vector3.new(0, -40, 0), rayParams)
	if result then
		return result.Position
	end
	return Vector3.new(position.X, 0, position.Z)
end

-- True when a zombie-sized box at 'position' does not overlap solid geometry.
local overlapParams = OverlapParams.new()
overlapParams.FilterType = Enum.RaycastFilterType.Exclude
local function isClear(position)
	overlapParams.FilterDescendantsInstances = { folder }
	local parts = workspace:GetPartBoundsInBox(CFrame.new(position + Vector3.new(0, 3.2, 0)), Vector3.new(2.5, 4, 2.5), overlapParams)
	for _, part in ipairs(parts) do
		if part.CanCollide then
			return false
		end
	end
	return true
end

-- Finds a free spot near 'center' (tries a few random points within 'radius').
local function findSpawnPoint(center, radius)
	for _ = 1, 8 do
		local angle = math.random() * math.pi * 2
		local candidate = center + Vector3.new(math.cos(angle), 0, math.sin(angle)) * math.random() * radius
		if isClear(candidate) then
			return candidate
		end
	end
	return isClear(center) and center or nil
end
ZombieService.findSpawnPoint = findSpawnPoint

local function hasLineOfSight(fromPos, toPos, ignore)
	rayParams.FilterDescendantsInstances = ignore
	local dir = toPos - fromPos
	local result = workspace:Raycast(fromPos, dir, rayParams)
	return result == nil
end

local function playerCharacters()
	local list = {}
	for _, player in ipairs(Players:GetPlayers()) do
		local character = player.Character
		local humanoid = character and character:FindFirstChildOfClass("Humanoid")
		local root = character and character:FindFirstChild("HumanoidRootPart")
		if humanoid and root and humanoid.Health > 0 and not character:GetAttribute("Downed") and not player:GetAttribute("InCinematic") then
			table.insert(list, { player = player, character = character, root = root })
		end
	end
	return list
end

local function countAlive(filter)
	local n = 0
	for _, z in pairs(zombies) do
		if not z.dead and (not filter or filter(z)) then
			n = n + 1
		end
	end
	return n
end

-- Spawning ----------------------------------------------------------------------------------------
function ZombieService.spawn(typeName, position, opts)
	opts = opts or {}
	local def = ZombieTypes[typeName]
	local template = templates[typeName]
	if not def or not template then
		return nil
	end
	local model = template:Clone()
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	local root = model:FindFirstChild("HumanoidRootPart")
	local health = def.health
	if def.boss then
		health = math.floor(def.health * (1 + 0.6 * math.max(0, #Players:GetPlayers() - 1)))
	end
	humanoid.MaxHealth = health
	humanoid.Health = health
	local ground = groundAt(position)
	model:PivotTo(CFrame.new(ground + Vector3.new(0, 3 * def.scale.height, 0)) * CFrame.Angles(0, math.random() * math.pi * 2, 0))
	model.Parent = folder
	pcall(function()
		root:SetNetworkOwner(nil)
	end)

	local animator = humanoid:FindFirstChildOfClass("Animator")
	local tracks = {}
	if animator then
		for key, animId in pairs({ idle = Config.Animations.ZombieIdle, walk = Config.Animations.ZombieWalk, run = Config.Animations.ZombieRun }) do
			local anim = Instance.new("Animation")
			anim.AnimationId = animId
			local ok, track = pcall(function()
				return animator:LoadAnimation(anim)
			end)
			if ok and track then
				track.Looped = true
				tracks[key] = track
			end
		end
		if tracks.idle then
			tracks.idle:Play(0.3)
		end
	end

	local state = {
		model = model,
		humanoid = humanoid,
		root = root,
		typeName = typeName,
		def = def,
		home = ground,
		region = opts.region,
		ambient = opts.ambient,
		target = nil,
		lastSeen = 0,
		lastAttack = 0,
		lastSlam = os.clock(),
		lastSummon = os.clock(),
		nextWander = os.clock() + math.random(2, 6),
		nextGroan = os.clock() + math.random(3, 10),
		path = nil,
		pathIndex = 0,
		lastPath = 0,
		computing = false,
		lastPos = root.Position,
		lastMoveCheck = os.clock(),
		tracks = tracks,
		anim = "idle",
		attacking = false,
		lastAttacker = nil,
		dead = false,
	}
	zombies[model] = state

	humanoid.Died:Connect(function()
		ZombieService._onDeath(state)
	end)

	if opts.aggro then
		local list = playerCharacters()
		local best, bestDist = nil, math.huge
		for _, c in ipairs(list) do
			local d = (c.root.Position - root.Position).Magnitude
			if d < bestDist then
				best, bestDist = c, d
			end
		end
		if best then
			state.target = best.player
			state.lastSeen = os.clock()
		end
	end
	if def.boss then
		Net.fireAll("BossBar", def.displayName, 1)
	end
	return model
end

function ZombieService.onKilled(callback)
	table.insert(killedCallbacks, callback)
end

function ZombieService._onDeath(state)
	if state.dead then
		return
	end
	state.dead = true
	for _, track in pairs(state.tracks) do
		track:Stop(0.2)
	end
	playSound(state.root, Config.Sounds.ZombieGroan, state.def.groanPitch * 0.8, 0.8)
	if state.def.boss then
		Net.fireAll("BossBar", nil, nil)
	end
	for _, cb in ipairs(killedCallbacks) do
		task.spawn(cb, state.typeName, state.lastAttacker, state.root.Position, state.def)
	end
	-- Non-graphic defeat: collapse and fade out.
	local model = state.model
	local root = state.root
	pcall(function()
		root.AssemblyLinearVelocity = Vector3.zero
	end)
	task.delay(0.6, function()
		for _, d in ipairs(model:GetDescendants()) do
			if d:IsA("BasePart") then
				TweenService:Create(d, TweenInfo.new(1.2), { Transparency = 1 }):Play()
			elseif d:IsA("PointLight") then
				d.Enabled = false
			elseif d:IsA("ParticleEmitter") then
				d.Enabled = false
			end
		end
	end)
	task.delay(2, function()
		zombies[model] = nil
		model:Destroy()
	end)
end

function ZombieService.damage(model, amount, attacker, knock)
	local state = zombies[model]
	if not state or state.dead then
		return
	end
	state.lastAttacker = attacker
	state.humanoid:TakeDamage(amount)
	if attacker then
		state.target = attacker
		state.lastSeen = os.clock()
	end
	-- hit flash
	local hl = Instance.new("Highlight")
	hl.FillColor = Color3.new(1, 1, 1)
	hl.FillTransparency = 0.5
	hl.OutlineTransparency = 1
	hl.Parent = model
	Debris:AddItem(hl, 0.12)
	if knock and not state.dead then
		local resist = state.def.knockbackResist or 0
		local v = knock * (1 - resist)
		if v.Magnitude > 1 then
			state.root.AssemblyLinearVelocity = v + Vector3.new(0, 6 * (1 - resist), 0)
		end
	end
	if state.def.boss then
		Net.fireAll("BossBar", state.def.displayName, math.max(0, state.humanoid.Health / state.humanoid.MaxHealth))
	end
end

function ZombieService.clearAll()
	for model, state in pairs(zombies) do
		state.dead = true
		model:Destroy()
	end
	zombies = {}
	fixedSpawned = {}
	Net.fireAll("BossBar", nil, nil)
end

function ZombieService.setEnabled(on)
	enabled = on
end

function ZombieService.setStage(newStage)
	stage = newStage
	activeRegions = {}
	for _, region in ipairs(Layout.SpawnRegions) do
		if stage >= region.minStage and stage <= region.maxStage then
			table.insert(activeRegions, region)
			if region.fixed and not fixedSpawned[region.id] then
				fixedSpawned[region.id] = true
				for _, typeName in ipairs(region.fixed) do
					local point = findSpawnPoint(region.center, region.radius * 0.7)
					if point then
						ZombieService.spawn(typeName, point, { region = region.id })
					end
				end
			end
		end
	end
end

-- Mark fixed regions as already spawned (used when resuming from a later checkpoint).
function ZombieService.skipFixedBefore(stageIndex)
	for _, region in ipairs(Layout.SpawnRegions) do
		if region.fixed and region.maxStage < stageIndex then
			fixedSpawned[region.id] = true
		end
	end
end

function ZombieService.countBosses()
	return countAlive(function(z)
		return z.def.boss
	end)
end

local function ambientCap()
	return ZC.MaxActiveBase + ZC.MaxActivePerPlayer * #Players:GetPlayers()
end

local function trySpawnAmbient(chars)
	if os.clock() - lastAmbientSpawn < ZC.AmbientRespawnDelay or #chars == 0 then
		return
	end
	lastAmbientSpawn = os.clock()
	if countAlive() >= ambientCap() then
		return
	end
	local candidates = {}
	for _, region in ipairs(activeRegions) do
		if region.ambient then
			local nearest = math.huge
			for _, c in ipairs(chars) do
				nearest = math.min(nearest, (c.root.Position - region.center).Magnitude)
			end
			if nearest > 45 and nearest < 170 then
				table.insert(candidates, region)
			end
		end
	end
	if #candidates == 0 then
		return
	end
	local region = candidates[math.random(1, #candidates)]
	local typeName = "Normal"
	local roll = math.random()
	local mutatedAlive = countAlive(function(z)
		return z.typeName == "Mutated"
	end)
	if roll < ZC.MutatedChance and mutatedAlive == 0 and stage >= 7 then
		typeName = "Mutated"
	elseif roll < ZC.FastChance then
		typeName = "Fast"
	end
	local point = findSpawnPoint(region.center, region.radius)
	if point then
		ZombieService.spawn(typeName, point, { region = region.id, ambient = true })
	end
end

-- AI ------------------------------------------------------------------------------------------------
local function setAnim(state, name)
	if state.anim == name then
		return
	end
	state.anim = name
	for key, track in pairs(state.tracks) do
		if key == name then
			if not track.IsPlaying then
				track:Play(0.25)
			end
			track:AdjustSpeed(state.def.animSpeed or 1)
		elseif track.IsPlaying then
			track:Stop(0.25)
		end
	end
end

local function requestPath(state, goal)
	if state.computing or os.clock() - state.lastPath < ZC.PathRecomputeInterval then
		return
	end
	state.computing = true
	state.lastPath = os.clock()
	task.spawn(function()
		local scale = state.def.scale
		local path = PathfindingService:CreatePath({
			AgentRadius = 2 * scale.width,
			AgentHeight = 5 * scale.height,
			AgentCanJump = true,
			WaypointSpacing = 5,
		})
		local ok = pcall(function()
			path:ComputeAsync(state.root.Position, goal)
		end)
		state.computing = false
		if ok and path.Status == Enum.PathStatus.Success and not state.dead then
			state.path = path:GetWaypoints()
			state.pathIndex = 2
		else
			state.path = nil
		end
	end)
end

local function bossSlam(state, chars)
	local slam = state.def.slam
	state.attacking = true
	state.humanoid:MoveTo(state.root.Position)
	local center = state.root.Position - Vector3.new(0, 3 * state.def.scale.height - 0.2, 0)
	local ring = Instance.new("Part")
	ring.Name = "SlamWarning"
	ring.Shape = Enum.PartType.Cylinder
	ring.Anchored = true
	ring.CanCollide = false
	ring.CanQuery = false
	ring.Material = Enum.Material.Neon
	ring.Color = Color3.fromRGB(255, 40, 30)
	ring.Transparency = 0.5
	ring.Size = Vector3.new(0.2, 2, 2)
	ring.CFrame = CFrame.new(center) * CFrame.Angles(0, 0, math.rad(90))
	ring.Parent = workspace
	TweenService:Create(ring, TweenInfo.new(slam.windup), { Size = Vector3.new(0.2, slam.radius * 2, slam.radius * 2) }):Play()
	playSound(state.root, Config.Sounds.ZombieGroan, 0.2, 1)
	task.delay(slam.windup, function()
		ring:Destroy()
		state.attacking = false
		if state.dead then
			return
		end
		for _, c in ipairs(playerCharacters()) do
			if (c.root.Position - state.root.Position).Magnitude <= slam.radius then
				Services.Player.damage(c.player, slam.damage, "Warden")
			end
		end
		for _, p in ipairs(Players:GetPlayers()) do
			Net.fire("Shake", p, 0.9, 0.6)
		end
	end)
	state.lastSlam = os.clock()
end

local function attack(state, targetChar)
	state.attacking = true
	state.lastAttack = os.clock()
	local root = state.root
	local look = Vector3.new(targetChar.root.Position.X, root.Position.Y, targetChar.root.Position.Z)
	if (look - root.Position).Magnitude > 0.1 then
		root.CFrame = CFrame.lookAt(root.Position, look)
	end
	playSound(root, Config.Sounds.ZombieGroan, state.def.groanPitch * 1.2, 0.5)
	task.delay(0.35, function()
		state.attacking = false
		if state.dead or not targetChar.root.Parent then
			return
		end
		local dist = (targetChar.root.Position - root.Position).Magnitude
		if dist <= state.def.attack.reach + 2 then
			local hit = Services.Player.damage(targetChar.player, state.def.attack.damage, state.def.displayName)
			if hit and state.def.attack.slow then
				Services.Player.slow(targetChar.player, state.def.attack.slow)
			end
		end
	end)
end

local function findTarget(state, chars)
	local root = state.root
	local def = state.def
	local eye = root.Position + Vector3.new(0, 2 * def.scale.height, 0)
	local best, bestScore = nil, math.huge
	for _, c in ipairs(chars) do
		local dist = (c.root.Position - root.Position).Magnitude
		local sprinting = c.character:GetAttribute("Sprinting")
		local lightOn = c.character:GetAttribute("LightOn")
		local detected = false
		if dist <= def.hear * 0.35 then
			detected = true -- too close to miss
		elseif sprinting and dist <= def.hear then
			detected = true -- heard running footsteps
		elseif dist <= def.sight * (lightOn and 1.3 or 1) then
			detected = hasLineOfSight(eye, c.root.Position, { folder, c.character })
		end
		if detected and dist < bestScore then
			best, bestScore = c, dist
		end
	end
	return best
end

local function updateZombie(state, chars, byPlayer, now)
	local def = state.def
	local root = state.root
	local humanoid = state.humanoid
	if state.attacking then
		return
	end

	-- keep or drop current target
	local targetChar = state.target and byPlayer[state.target]
	if targetChar then
		local dist = (targetChar.root.Position - root.Position).Magnitude
		if dist > def.sight * 1.7 or now - state.lastSeen > 8 then
			targetChar = nil
			state.target = nil
		elseif dist < def.sight then
			state.lastSeen = now
		end
	end
	if not targetChar then
		local found = findTarget(state, chars)
		if found then
			targetChar = found
			state.target = found.player
			state.lastSeen = now
			playSound(root, Config.Sounds.ZombieGroan, def.groanPitch, 0.7)
		end
	end

	if now > state.nextGroan then
		state.nextGroan = now + math.random(8, 16)
		playSound(root, Config.Sounds.ZombieGroan, def.groanPitch * (0.9 + math.random() * 0.2), 0.35)
	end

	if not targetChar then
		-- wander around home
		humanoid.WalkSpeed = def.walkSpeed
		if now > state.nextWander then
			state.nextWander = now + math.random(5, 10)
			if not state.region or math.random() < 0.7 then
				local angle = math.random() * math.pi * 2
				local goal = state.home + Vector3.new(math.cos(angle), 0, math.sin(angle)) * math.random(3, 10)
				humanoid:MoveTo(goal)
				setAnim(state, "walk")
			end
		end
		if humanoid.MoveDirection.Magnitude < 0.1 and root.AssemblyLinearVelocity.Magnitude < 1 then
			setAnim(state, "idle")
		end
		return
	end

	-- chase
	humanoid.WalkSpeed = def.chaseSpeed
	setAnim(state, def.chaseSpeed >= 14 and "run" or "walk")
	local targetPos = targetChar.root.Position
	local dist = (targetPos - root.Position).Magnitude

	if def.slam and now - state.lastSlam > def.slam.cooldown and dist < def.slam.radius * 0.75 then
		bossSlam(state, chars)
		return
	end
	if def.boss and now - state.lastSummon > 22 and countAlive() < ambientCap() then
		state.lastSummon = now
		for i = 1, 2 do
			local point = findSpawnPoint(Vector3.new(root.Position.X, 0, root.Position.Z), 20)
			if point then
				ZombieService.spawn(i == 1 and "Normal" or "Fast", point, { aggro = true })
			end
		end
	end

	local reach = def.attack.reach + 1.2 * def.scale.width
	if dist <= reach and now - state.lastAttack >= def.attack.cooldown then
		attack(state, targetChar)
		return
	end

	local heightDiff = math.abs(targetPos.Y - root.Position.Y)
	local eye = root.Position + Vector3.new(0, 1.5, 0)
	local direct = heightDiff < 5 and hasLineOfSight(eye, targetPos, { folder, targetChar.character })
	if direct then
		state.path = nil
		humanoid:MoveTo(targetPos)
	else
		requestPath(state, targetPos)
		local waypoints = state.path
		if waypoints and waypoints[state.pathIndex] then
			local wp = waypoints[state.pathIndex]
			if (wp.Position - root.Position).Magnitude < 4 then
				state.pathIndex = state.pathIndex + 1
				wp = waypoints[state.pathIndex]
			end
			if wp then
				if wp.Action == Enum.PathWaypointAction.Jump then
					humanoid.Jump = true
				end
				humanoid:MoveTo(wp.Position)
			end
		else
			humanoid:MoveTo(targetPos)
		end
	end

	-- stuck detection
	if now - state.lastMoveCheck > 2 then
		if (root.Position - state.lastPos).Magnitude < 1.5 then
			humanoid.Jump = true
			state.lastPath = 0
		end
		state.lastPos = root.Position
		state.lastMoveCheck = now
	end
end

local function aiLoop()
	while true do
		task.wait(ZC.TickRate)
		if enabled then
			local chars = playerCharacters()
			local byPlayer = {}
			for _, c in ipairs(chars) do
				byPlayer[c.player] = c
			end
			local now = os.clock()
			for model, state in pairs(zombies) do
				if not state.dead and model.Parent then
					-- despawn far ambient zombies
					local nearest = math.huge
					for _, c in ipairs(chars) do
						nearest = math.min(nearest, (c.root.Position - state.root.Position).Magnitude)
					end
					if state.ambient and #chars > 0 and nearest > ZC.DespawnDistance then
						state.dead = true
						zombies[model] = nil
						model:Destroy()
					elseif state.root.Position.Y < -50 then
						state.humanoid.Health = 0
					else
						local ok, err = pcall(updateZombie, state, chars, byPlayer, now)
						if not ok then
							warn("[ZombieService] AI error: " .. tostring(err))
						end
					end
				end
			end
			trySpawnAmbient(chars)
		end
	end
end

function ZombieService.init(services)
	Services = services
	pcall(function()
		PhysicsService:RegisterCollisionGroup("Zombies")
	end)
	PhysicsService:CollisionGroupSetCollidable("Zombies", "Zombies", false)
end

function ZombieService.start(worldRefs)
	folder = worldRefs.zombieFolder
	local storage = Instance.new("Folder")
	storage.Name = "ZombieTemplates"
	storage.Parent = game:GetService("ServerStorage")
	for typeName in pairs(ZombieTypes) do
		local t = buildTemplate(typeName)
		t.Parent = storage
		templates[typeName] = t
	end
	task.spawn(aiLoop)
end

return ZombieService
