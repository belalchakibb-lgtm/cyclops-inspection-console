--[[
	Effects - local-only presentation:
	- flickering lights (CollectionService tag "FlickerLight")
	- camera shake on hits / boss slams
	- scalable graphics quality (Auto / Low / Medium / High)
	- low-health screen edge glow
	- ambient audio + music (IDs in Config.Sounds; empty = silent)
	- hides pickup prompts for things this player already owns
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local Lighting = game:GetService("Lighting")
local CollectionService = game:GetService("CollectionService")
local SoundService = game:GetService("SoundService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Net = require(Shared:WaitForChild("Net"))

local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local Effects = {}
local player = Players.LocalPlayer

-- Flicker -------------------------------------------------------------------------------
local flickers = {}
local function registerFlicker(part)
	if not part:IsA("BasePart") then
		return
	end
	flickers[part] = { color = part.Color, next = 0 }
end

local function flickerStep()
	local camera = workspace.CurrentCamera
	local camPos = camera and camera.CFrame.Position or Vector3.zero
	local now = os.clock()
	for part, data in pairs(flickers) do
		if not part.Parent then
			flickers[part] = nil
		elseif now >= data.next and (part.Position - camPos).Magnitude < 180 then
			local on = math.random() > 0.35
			data.next = now + (on and math.random(3, 25) / 10 or math.random(1, 3) / 20)
			part.Color = on and data.color or data.color:Lerp(Color3.new(0, 0, 0), 0.85)
			for _, child in ipairs(part:GetChildren()) do
				if child:IsA("Light") then
					child.Enabled = on
				end
			end
		end
	end
end

-- Camera shake -----------------------------------------------------------------------------
local shakeIntensity, shakeUntil = 0, 0
function Effects.shake(intensity, duration)
	if not State.setting("cameraShake", true) then
		return
	end
	shakeIntensity = math.max(shakeIntensity, intensity)
	shakeUntil = math.max(shakeUntil, os.clock() + duration)
end

local function shakeStep()
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if not humanoid then
		return
	end
	if os.clock() < shakeUntil then
		local i = shakeIntensity * 0.6
		humanoid.CameraOffset = Vector3.new((math.random() - 0.5) * i, (math.random() - 0.5) * i, 0)
	elseif humanoid.CameraOffset ~= Vector3.zero then
		humanoid.CameraOffset = Vector3.zero
		shakeIntensity = 0
	end
end

-- Graphics quality -------------------------------------------------------------------------------
function Effects.applyGraphics(level)
	if level == "Auto" or level == nil then
		level = UI.isTouch() and "Medium" or "High"
	end
	local low = level == "Low"
	local high = level == "High"
	Lighting.GlobalShadows = not low
	local bloom = Lighting:FindFirstChild("PZ_Bloom")
	if bloom then
		bloom.Enabled = not low
	end
	local rays = Lighting:FindFirstChild("PZ_SunRays")
	if rays then
		rays.Enabled = high
	end
	local dof = Lighting:FindFirstChild("PZ_DOF")
	if dof then
		dof.Enabled = high
	end
	local atmosphere = Lighting:FindFirstChild("PZ_Atmosphere")
	if atmosphere then
		atmosphere.Density = low and 0.38 or 0.42
	end
	for _, pe in ipairs(CollectionService:GetTagged("OptionalParticle")) do
		if pe:IsA("ParticleEmitter") then
			pe.Enabled = not low
		end
	end
	Effects.level = level
end

-- Low health glow --------------------------------------------------------------------------------
local edgeFrames = {}
local function buildHealthGlow()
	local gui = UI.screen("PZ_HealthGlow", 0, true)
	local function edge(size, pos, rotation)
		local f = UI.new("Frame", {
			Size = size,
			Position = pos,
			BackgroundColor3 = Color3.fromRGB(180, 0, 0),
			BorderSizePixel = 0,
			BackgroundTransparency = 1,
			Parent = gui,
		})
		UI.new("UIGradient", {
			Rotation = rotation,
			Transparency = NumberSequence.new(0, 1),
			Parent = f,
		})
		table.insert(edgeFrames, f)
	end
	edge(UDim2.new(0.25, 0, 1, 0), UDim2.fromScale(0, 0), 0)
	edge(UDim2.new(0.25, 0, 1, 0), UDim2.fromScale(0.75, 0), 180)
	edge(UDim2.new(1, 0, 0.25, 0), UDim2.fromScale(0, 0), 90)
	edge(UDim2.new(1, 0, 0.25, 0), UDim2.fromScale(0, 0.75), 270)
end

local function healthGlowStep()
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	local t = 1
	if humanoid and humanoid.Health > 0 then
		local frac = humanoid.Health / humanoid.MaxHealth
		if frac < 0.4 or character:GetAttribute("Downed") then
			local pulse = (math.sin(os.clock() * 4) + 1) * 0.08
			t = 0.35 + frac + pulse
		end
	end
	for _, f in ipairs(edgeFrames) do
		f.BackgroundTransparency = math.clamp(t, 0, 1)
	end
end

-- Audio -----------------------------------------------------------------------------------------------
local music, ambient
local function makeSound(name, id)
	local s = Instance.new("Sound")
	s.Name = name
	s.SoundId = id or ""
	s.Looped = true
	s.Volume = 0
	s.Parent = SoundService
	return s
end

function Effects.setMusic(trackKey)
	local id = Config.Sounds[trackKey] or ""
	if id == "" then
		music:Stop()
		return
	end
	if music.SoundId ~= id then
		music.SoundId = id
	end
	if not music.IsPlaying then
		music:Play()
	end
end

local function audioStep()
	local volMusic = State.setting("music", 0.6)
	local volSfx = State.setting("sfx", 0.8)
	music.Volume = 0.35 * volMusic
	SoundService.AmbientReverb = Enum.ReverbType.Hallway
	local character = player.Character
	local root = character and character:FindFirstChild("HumanoidRootPart")
	local key = "AmbientCity"
	if root and root.Position.X >= 0 and root.Position.X <= 120 and root.Position.Z >= 0 and root.Position.Z <= 80 then
		key = "AmbientHospital"
	end
	local id = Config.Sounds[key] or ""
	if id ~= "" then
		if ambient.SoundId ~= id then
			ambient.SoundId = id
			ambient:Play()
		end
		ambient.Volume = 0.4 * volSfx
	else
		ambient:Stop()
	end
end

-- Pickup prompt filtering -------------------------------------------------------------------------------
local function filterPrompt(prompt)
	if not prompt:IsA("ProximityPrompt") then
		return
	end
	local id = prompt:GetAttribute("PickupId")
	local kind = prompt:GetAttribute("PickupKind")
	local profile = State.profile
	if not id or not profile then
		return
	end
	local owned = false
	if kind == "doc" then
		owned = profile.documents and profile.documents[id] == true
		-- story-critical notes stay readable (the keypad code changes each run)
		if id == "shift_note" then
			owned = false
		end
	elseif kind == "equip" then
		owned = profile.equipment and profile.equipment[id] == true
	end
	prompt.Enabled = not owned
end

local function filterAllPrompts()
	local folder = workspace:FindFirstChild("Interactables")
	if folder then
		for _, d in ipairs(folder:GetDescendants()) do
			filterPrompt(d)
		end
	end
	local world = workspace:FindFirstChild("World")
	if world then
		for _, d in ipairs(world:GetDescendants()) do
			if d:IsA("ProximityPrompt") then
				filterPrompt(d)
			end
		end
	end
end

function Effects.init()
	music = makeSound("PZ_Music")
	ambient = makeSound("PZ_Ambient")
	buildHealthGlow()

	for _, part in ipairs(CollectionService:GetTagged("FlickerLight")) do
		registerFlicker(part)
	end
	CollectionService:GetInstanceAddedSignal("FlickerLight"):Connect(registerFlicker)
	CollectionService:GetInstanceAddedSignal("OptionalParticle"):Connect(function(pe)
		if Effects.level == "Low" and pe:IsA("ParticleEmitter") then
			pe.Enabled = false
		end
	end)

	Net.get("Shake").OnClientEvent:Connect(function(intensity, duration)
		Effects.shake(intensity or 0.3, duration or 0.25)
	end)

	State.on("profile", function(profile)
		Effects.applyGraphics(profile.settings and profile.settings.graphics)
		filterAllPrompts()
	end)
	workspace.DescendantAdded:Connect(function(d)
		if d:IsA("ProximityPrompt") then
			task.defer(filterPrompt, d)
		end
	end)

	local accum = 0
	RunService.RenderStepped:Connect(function(dt)
		shakeStep()
		healthGlowStep()
		accum = accum + dt
		if accum > 0.1 then
			accum = 0
			flickerStep()
		end
	end)
	task.spawn(function()
		while true do
			task.wait(1)
			audioStep()
		end
	end)
	Effects.applyGraphics("Auto")
end

return Effects
