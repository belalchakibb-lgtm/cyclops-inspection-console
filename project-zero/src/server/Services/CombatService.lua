--[[
	CombatService
	Melee weapons as Tools. Tool.Activated fires on the server, so hit
	detection, cooldowns and damage are fully server-authoritative - the
	client only plays the swing animation (via the standard "toolanim" value).
]]

local CollectionService = game:GetService("CollectionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Debris = game:GetService("Debris")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))

local CombatService = {}
local Services

local lastSwing = {} -- [player] = os.clock()

local function playSound(parent, id, speed, volume)
	if not id or id == "" then
		return
	end
	local s = Instance.new("Sound")
	s.SoundId = id
	s.PlaybackSpeed = speed or 1
	s.Volume = volume or 0.7
	s.RollOffMaxDistance = 70
	s.Parent = parent
	s:Play()
	Debris:AddItem(s, 3)
end

local function buildTool(id)
	local def = Config.Weapons[id]
	local tool = Instance.new("Tool")
	tool.Name = def.name
	tool.CanBeDropped = false
	tool.RequiresHandle = true
	tool.ToolTip = def.name
	tool:SetAttribute("WeaponId", id)

	local handle = Instance.new("Part")
	handle.Name = "Handle"
	handle.Size = Vector3.new(0.35, 0.35, 4.2)
	handle.Material = id == "axe" and Enum.Material.Wood or Enum.Material.Metal
	handle.Color = id == "axe" and Color3.fromRGB(110, 75, 40) or def.color
	handle.CanCollide = false
	handle.Massless = true
	handle.TopSurface = Enum.SurfaceType.Smooth
	handle.BottomSurface = Enum.SurfaceType.Smooth
	handle.Parent = tool

	if id == "axe" then
		local head = Instance.new("Part")
		head.Name = "AxeHead"
		head.Size = Vector3.new(0.3, 1.5, 1.1)
		head.Material = Enum.Material.Metal
		head.Color = def.color
		head.CanCollide = false
		head.Massless = true
		head.CFrame = handle.CFrame * CFrame.new(0, 0.6, -1.8)
		local weld = Instance.new("WeldConstraint")
		weld.Part0 = handle
		weld.Part1 = head
		weld.Parent = head
		head.Parent = tool
	end

	-- Hold like a classic sword: the long axis points up out of the fist.
	tool.GripPos = Vector3.new(0, 0, -1.5)
	tool.GripForward = Vector3.new(-1, 0, 0)
	tool.GripRight = Vector3.new(0, 1, 0)
	tool.GripUp = Vector3.new(0, 0, 1)
	return tool
end

local function swing(player, tool, id)
	local def = Config.Weapons[id]
	local now = os.clock()
	if lastSwing[player] and now - lastSwing[player] < def.cooldown then
		return
	end
	lastSwing[player] = now

	local character, humanoid, root = Services.Player.getParts(player)
	if not character or humanoid.Health <= 0 or character:GetAttribute("Downed") or tool.Parent ~= character then
		return
	end

	-- Tell the default Animate script to play the slash animation.
	local anim = Instance.new("StringValue")
	anim.Name = "toolanim"
	anim.Value = "Slash"
	anim.Parent = tool
	Debris:AddItem(anim, 1)
	playSound(tool.Handle, Config.Sounds.Swing, id == "axe" and 0.8 or 1, 0.6)

	task.wait(0.15)
	if not root.Parent then
		return
	end
	local boxCF = root.CFrame * CFrame.new(0, 0, -(def.reach / 2 + 0.5))
	local params = OverlapParams.new()
	params.FilterType = Enum.RaycastFilterType.Include
	params.FilterDescendantsInstances = { workspace:FindFirstChild("Zombies") or workspace }
	local parts = workspace:GetPartBoundsInBox(boxCF, Vector3.new(def.width, 7, def.reach + 1), params)

	local hit = {}
	for _, part in ipairs(parts) do
		local model = part:FindFirstAncestorOfClass("Model")
		while model and not CollectionService:HasTag(model, "Zombie") do
			model = model.Parent and model.Parent:FindFirstAncestorOfClass("Model") or nil
		end
		if model and not hit[model] then
			hit[model] = true
			local dir = (model:GetPivot().Position - root.Position)
			dir = Vector3.new(dir.X, 0, dir.Z)
			if dir.Magnitude > 0.01 then
				dir = dir.Unit
			end
			Services.Zombies.damage(model, def.damage, player, dir * def.knockback)
		end
	end
	if next(hit) then
		playSound(tool.Handle, Config.Sounds.Hit, 0.7, 0.8)
	end
end

function CombatService.giveWeapon(player, id)
	if not Config.Weapons[id] then
		return
	end
	local backpack = player:FindFirstChildOfClass("Backpack")
	if not backpack then
		return
	end
	local name = Config.Weapons[id].name
	if backpack:FindFirstChild(name) or (player.Character and player.Character:FindFirstChild(name)) then
		return
	end
	local tool = buildTool(id)
	tool.Activated:Connect(function()
		swing(player, tool, id)
	end)
	tool.Parent = backpack
end

function CombatService.init(services)
	Services = services
end

function CombatService.start()
	game:GetService("Players").PlayerRemoving:Connect(function(player)
		lastSwing[player] = nil
	end)
end

return CombatService
