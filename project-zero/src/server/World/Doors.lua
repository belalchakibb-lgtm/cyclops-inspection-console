--[[
	Doors
	Server-owned doors with a registry so missions can open/close/reset them.
	style:
	  "slide"  - one panel slides sideways
	  "double" - two panels slide apart
	  "shutter"- panel rises into the ceiling (subway gate)
	cf: CFrame at the bottom-centre of the opening; local X runs along the wall.
]]

local TweenService = game:GetService("TweenService")

local Builder = require(script.Parent:WaitForChild("Builder"))

local Doors = {}
local registry = {}

local Door = {}
Door.__index = Door

local TWEEN = TweenInfo.new(1.1, Enum.EasingStyle.Quad, Enum.EasingDirection.InOut)

function Doors.create(id, cf, width, height, opts, parent)
	opts = opts or {}
	local style = opts.style or "slide"
	local model = Builder.model("Door_" .. id, parent)
	local color = opts.color or Color3.fromRGB(150, 160, 165)
	local material = opts.material or Enum.Material.Metal
	local thick = opts.thickness or 0.6

	local self = setmetatable({
		id = id,
		model = model,
		isOpen = false,
		panels = {},
	}, Door)

	local function makePanel(localOffset, w, openOffset)
		local closedCF = cf * CFrame.new(localOffset.X, height / 2, 0)
		local part = Builder.part({
			Name = "Panel",
			Size = Vector3.new(w, height, thick),
			CFrame = closedCF,
			Material = material,
			Color = color,
		}, model)
		-- window strip for readability
		if opts.window then
			local glass = Builder.part({
				Name = "Window",
				Size = Vector3.new(math.max(0.5, w * 0.4), height * 0.25, thick + 0.05),
				CFrame = closedCF * CFrame.new(0, height * 0.18, 0),
				Material = Enum.Material.Glass,
				Color = Color3.fromRGB(80, 110, 120),
				Transparency = 0.4,
				Anchored = false,
				CanCollide = false,
				Massless = true,
			}, model)
			local weld = Instance.new("WeldConstraint")
			weld.Part0 = part
			weld.Part1 = glass
			weld.Parent = part
		end
		table.insert(self.panels, {
			part = part,
			closed = closedCF,
			open = closedCF * CFrame.new(openOffset),
		})
	end

	if style == "double" then
		makePanel(Vector3.new(-width / 4, 0, 0), width / 2, Vector3.new(-width / 2 + 0.3, 0, 0))
		makePanel(Vector3.new(width / 4, 0, 0), width / 2, Vector3.new(width / 2 - 0.3, 0, 0))
	elseif style == "shutter" then
		makePanel(Vector3.new(0, 0, 0), width, Vector3.new(0, height - 0.8, 0))
	else
		makePanel(Vector3.new(0, 0, 0), width, Vector3.new(width - 0.3, 0, 0))
	end

	if opts.label then
		-- labelSide = 1 puts the sign on the door's local +Z side, -1 on the -Z side.
		local side = opts.labelSide or 1
		local signCF = cf * CFrame.new(0, height + 0.9, side * 0.65)
		if side > 0 then
			signCF = signCF * CFrame.Angles(0, math.pi, 0)
		end
		Builder.sign(opts.label, signCF, Vector3.new(math.min(width, 8), 1.1, 0.15), model, opts.labelColor)
	end

	registry[id] = self
	return self
end

function Door:open(instant)
	if self.isOpen then
		return
	end
	self.isOpen = true
	for _, panel in ipairs(self.panels) do
		if instant then
			panel.part.CFrame = panel.open
		else
			TweenService:Create(panel.part, TWEEN, { CFrame = panel.open }):Play()
		end
	end
	if not instant then
		local snd = Instance.new("Sound")
		snd.SoundId = "rbxasset://sounds/action_jump.mp3"
		snd.PlaybackSpeed = 0.45
		snd.Volume = 0.8
		snd.RollOffMaxDistance = 80
		snd.Parent = self.panels[1].part
		snd:Play()
		game:GetService("Debris"):AddItem(snd, 3)
	end
end

function Door:close()
	if not self.isOpen then
		return
	end
	self.isOpen = false
	for _, panel in ipairs(self.panels) do
		panel.part.CFrame = panel.closed
	end
end

function Doors.get(id)
	return registry[id]
end

function Doors.all()
	return registry
end

return Doors
