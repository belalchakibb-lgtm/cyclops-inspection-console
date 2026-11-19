--[[
	HUD - in-game interface: health & stamina, mission objective with a
	world waypoint, party key items, toasts, tutorial hints, boss bar,
	downed/death overlays and the BAG / MAP / MENU buttons.
	Layout keeps the bottom-left (thumbstick) and bottom-right (jump +
	action buttons) clear for touch devices.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))
local Items = require(Shared:WaitForChild("Items"))
local Chapters = require(Shared:WaitForChild("Chapters"))

local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local HUD = {}
local player = Players.LocalPlayer
local T = UI.Theme

local gui, root
local healthFill, healthText, staminaFill, staminaFrame
local objectiveLabel, objectiveFrame, partyRow
local toastHolder, hintFrame, hintLabel
local bossFrame, bossFill, bossName
local downedLabel, deathLabel
local waypointPart, waypointGui, waypointText

local callbacks = {}
function HUD.onButton(name, cb)
	callbacks[name] = cb
end

local function bar(parent, pos, color, height)
	local frame = UI.new("Frame", {
		Size = UDim2.new(1, 0, 0, height),
		Position = pos,
		BackgroundColor3 = Color3.fromRGB(20, 20, 22),
		BackgroundTransparency = 0.2,
		BorderSizePixel = 0,
		Parent = parent,
	})
	UI.corner(height / 2).Parent = frame
	local fill = UI.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = color, BorderSizePixel = 0, Parent = frame })
	UI.corner(height / 2).Parent = fill
	return frame, fill
end

-- Toasts ------------------------------------------------------------------------------------
local KIND_COLORS = {
	good = T.Good,
	bad = T.Danger,
	info = T.Info,
	reward = T.Accent,
	achievement = T.Accent,
	checkpoint = Color3.fromRGB(180, 180, 180),
}

function HUD.toast(text, kind)
	local color = KIND_COLORS[kind] or T.Text
	local frame = UI.panel({
		Size = UDim2.new(1, 0, 0, 40),
		BackgroundTransparency = 0.2,
		Parent = toastHolder,
	})
	UI.new("Frame", { Size = UDim2.new(0, 5, 1, -12), Position = UDim2.fromOffset(8, 6), BackgroundColor3 = color, BorderSizePixel = 0, Parent = frame })
	local prefix = kind == "achievement" and "ACHIEVEMENT  " or ""
	UI.label({
		Size = UDim2.new(1, -30, 1, 0),
		Position = UDim2.fromOffset(22, 0),
		Text = prefix .. text,
		TextSize = 17,
		Font = kind == "achievement" and T.FontBold or T.Font,
		TextColor3 = kind == "achievement" and color or T.Text,
		Parent = frame,
	})
	task.delay(kind == "achievement" and 5 or 3.5, function()
		UI.tween(frame, 0.4, { BackgroundTransparency = 1 })
		for _, d in ipairs(frame:GetDescendants()) do
			if d:IsA("TextLabel") then
				UI.tween(d, 0.4, { TextTransparency = 1 })
			elseif d:IsA("Frame") then
				UI.tween(d, 0.4, { BackgroundTransparency = 1 })
			elseif d:IsA("UIStroke") then
				UI.tween(d, 0.4, { Transparency = 1 })
			end
		end
		task.wait(0.45)
		frame:Destroy()
	end)
end

-- Hints ------------------------------------------------------------------------------------------
function HUD.hint(hintId)
	local def = Chapters.Hints[hintId]
	if not def then
		return
	end
	hintLabel.Text = UI.isTouch() and def.touch or def.pc
	hintFrame.Visible = true
	local token = {}
	HUD._hintToken = token
	task.delay(11, function()
		if HUD._hintToken == token then
			hintFrame.Visible = false
		end
	end)
end

-- Objective / waypoint ------------------------------------------------------------------------------
local function setObjective(obj)
	if not obj then
		objectiveFrame.Visible = false
		return
	end
	objectiveFrame.Visible = true
	objectiveLabel.Text = obj.text
	objectiveFrame.BackgroundColor3 = T.Accent
	UI.tween(objectiveFrame, 0.8, { BackgroundColor3 = T.Panel })
	if obj.target then
		waypointPart.Position = obj.target + Vector3.new(0, 4, 0)
		waypointGui.Enabled = true
	else
		waypointGui.Enabled = false
	end
end

local function setParty(party)
	for _, c in ipairs(partyRow:GetChildren()) do
		if c:IsA("Frame") then
			c:Destroy()
		end
	end
	for itemId, count in pairs(party or {}) do
		local def = Items[itemId]
		if def and count > 0 then
			local chip = UI.panel({ Size = UDim2.fromOffset(0, 28), AutomaticSize = Enum.AutomaticSize.X, BackgroundTransparency = 0.25, Parent = partyRow })
			UI.padding(6).Parent = chip
			UI.label({ Size = UDim2.fromOffset(0, 16), AutomaticSize = Enum.AutomaticSize.X, Text = "KEY: " .. def.name, TextSize = 14, TextColor3 = def.color, Font = T.FontBold, Parent = chip })
		end
	end
end

local function updateVisibility()
	root.Visible = not State.inMenu and not State.inCinematic
	waypointGui.Enabled = root.Visible and State.objective ~= nil and State.objective.target ~= nil
end

local function build()
	gui = UI.screen("PZ_HUD", 5)
	root = UI.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, Visible = false, Parent = gui })

	-- objective (top-left)
	objectiveFrame = UI.panel({ Size = UDim2.fromOffset(380, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.fromOffset(16, 16), Parent = root })
	UI.padding(12).Parent = objectiveFrame
	UI.list(Enum.FillDirection.Vertical, 4).Parent = objectiveFrame
	UI.label({ Size = UDim2.new(1, 0, 0, 16), Text = "OBJECTIVE", TextSize = 13, Font = T.FontBlack, TextColor3 = T.Accent, LayoutOrder = 1, Parent = objectiveFrame })
	objectiveLabel = UI.label({ Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, Text = "", TextSize = 18, Font = T.FontBold, LayoutOrder = 2, Parent = objectiveFrame })
	partyRow = UI.new("Frame", { Size = UDim2.fromOffset(380, 28), Position = UDim2.new(0, 16, 0, 110), BackgroundTransparency = 1, Parent = root })
	UI.list(Enum.FillDirection.Horizontal, 6).Parent = partyRow
	objectiveFrame:GetPropertyChangedSignal("AbsoluteSize"):Connect(function()
		local scale = gui:FindFirstChildOfClass("UIScale").Scale
		partyRow.Position = UDim2.fromOffset(16, 24 + objectiveFrame.AbsoluteSize.Y / scale)
	end)

	-- buttons (top-right)
	local buttons = UI.new("Frame", { Size = UDim2.fromOffset(250, 56), Position = UDim2.new(1, -16, 0, 16), AnchorPoint = Vector2.new(1, 0), BackgroundTransparency = 1, Parent = root })
	local layout = UI.list(Enum.FillDirection.Horizontal, 8, Enum.HorizontalAlignment.Right)
	layout.Parent = buttons
	for i, name in ipairs({ "BAG", "MAP", "MENU" }) do
		UI.button({ Text = name, Size = UDim2.fromOffset(76, 52), Style = "ghost", LayoutOrder = i, TextSize = 16, Parent = buttons }, function()
			if callbacks[name] then
				callbacks[name]()
			end
		end)
	end

	-- vitals (bottom-centre)
	local vitals = UI.new("Frame", { Size = UDim2.fromOffset(340, 44), Position = UDim2.new(0.5, 0, 1, -18), AnchorPoint = Vector2.new(0.5, 1), BackgroundTransparency = 1, Parent = root })
	local healthFrame
	healthFrame, healthFill = bar(vitals, UDim2.fromOffset(0, 0), T.Health, 18)
	healthText = UI.label({ Size = UDim2.fromScale(1, 1), Text = "100", TextSize = 13, Font = T.FontBold, TextXAlignment = Enum.TextXAlignment.Center, Parent = healthFrame })
	staminaFrame, staminaFill = bar(vitals, UDim2.fromOffset(0, 26), T.Stamina, 10)

	-- toasts (top-centre)
	toastHolder = UI.new("Frame", { Size = UDim2.fromOffset(420, 300), Position = UDim2.new(0.5, 0, 0, 96), AnchorPoint = Vector2.new(0.5, 0), BackgroundTransparency = 1, Parent = gui })
	UI.list(Enum.FillDirection.Vertical, 6, Enum.HorizontalAlignment.Center).Parent = toastHolder

	-- hint (centre, above vitals)
	hintFrame = UI.panel({ Size = UDim2.fromOffset(520, 0), AutomaticSize = Enum.AutomaticSize.Y, Position = UDim2.new(0.5, 0, 1, -90), AnchorPoint = Vector2.new(0.5, 1), Visible = false, Parent = root })
	UI.padding(12).Parent = hintFrame
	hintLabel = UI.label({ Size = UDim2.new(1, -90, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, TextSize = 17, Parent = hintFrame })
	UI.button({ Text = "OK", Size = UDim2.fromOffset(70, 36), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Style = "primary", Parent = hintFrame }, function()
		hintFrame.Visible = false
	end)

	-- boss bar (top-centre)
	bossFrame = UI.new("Frame", { Size = UDim2.fromOffset(460, 50), Position = UDim2.new(0.5, 0, 0, 20), AnchorPoint = Vector2.new(0.5, 0), BackgroundTransparency = 1, Visible = false, Parent = gui })
	bossName = UI.label({ Size = UDim2.new(1, 0, 0, 22), Text = "", TextSize = 18, Font = T.FontBlack, TextColor3 = T.Danger, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.5, Parent = bossFrame })
	local _, fill = bar(bossFrame, UDim2.fromOffset(0, 26), T.Danger, 14)
	bossFill = fill

	-- overlays
	downedLabel = UI.label({ Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromScale(0, 0.3), Text = "YOU ARE DOWN - hold on, a teammate can revive you", TextSize = 22, Font = T.FontBlack, TextColor3 = T.Danger, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.4, Visible = false, Parent = root })
	deathLabel = UI.label({ Size = UDim2.new(1, 0, 0, 40), Position = UDim2.fromScale(0, 0.4), Text = "YOU DIED - returning to the last checkpoint...", TextSize = 24, Font = T.FontBlack, TextColor3 = T.Danger, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.4, Visible = false, Parent = gui })

	-- waypoint marker (local-only part with an always-on-top billboard)
	waypointPart = Instance.new("Part")
	waypointPart.Name = "PZ_Waypoint"
	waypointPart.Anchored = true
	waypointPart.CanCollide = false
	waypointPart.CanQuery = false
	waypointPart.CanTouch = false
	waypointPart.Transparency = 1
	waypointPart.Size = Vector3.new(0.2, 0.2, 0.2)
	waypointPart.Parent = workspace.CurrentCamera
	waypointGui = UI.new("BillboardGui", {
		Size = UDim2.fromOffset(90, 44),
		AlwaysOnTop = true,
		LightInfluence = 0,
		Enabled = false,
		Adornee = waypointPart,
		ResetOnSpawn = false,
		Parent = player:WaitForChild("PlayerGui"),
	})
	UI.label({ Size = UDim2.new(1, 0, 0, 22), Text = "v", TextSize = 22, Font = T.FontBlack, TextColor3 = T.Accent, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.3, Parent = waypointGui })
	waypointText = UI.label({ Size = UDim2.new(1, 0, 0, 18), Position = UDim2.fromOffset(0, 22), Text = "", TextSize = 14, Font = T.FontBold, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.3, Parent = waypointGui })
end

local function step()
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		local frac = math.clamp(humanoid.Health / math.max(1, humanoid.MaxHealth), 0, 1)
		healthFill.Size = UDim2.fromScale(frac, 1)
		healthText.Text = tostring(math.ceil(humanoid.Health))
		downedLabel.Visible = character:GetAttribute("Downed") == true
		local rootPart = character:FindFirstChild("HumanoidRootPart")
		if rootPart and waypointGui.Enabled then
			local d = (waypointPart.Position - rootPart.Position).Magnitude
			waypointText.Text = string.format("%dm", math.floor(d / 3.5))
		end
	end
	local stamina = player:GetAttribute("Stamina") or 100
	staminaFill.Size = UDim2.fromScale(math.clamp(stamina / 100, 0, 1), 1)
	staminaFrame.Visible = stamina < 99.5
end

function HUD.init()
	build()
	State.on("objective", function(obj)
		setObjective(obj)
		updateVisibility()
	end)
	State.on("party", setParty)
	State.on("profile", function(p)
		setParty(p.party)
	end)
	State.on("menu", updateVisibility)
	State.on("cinematic", updateVisibility)

	Net.get("Notify").OnClientEvent:Connect(function(text, kind)
		HUD.toast(text, kind)
	end)
	Net.get("Hint").OnClientEvent:Connect(function(hintId)
		HUD.hint(hintId)
	end)
	Net.get("BossBar").OnClientEvent:Connect(function(name, fraction)
		if not name then
			bossFrame.Visible = false
			return
		end
		bossFrame.Visible = true
		bossName.Text = string.upper(name)
		UI.tween(bossFill, 0.2, { Size = UDim2.fromScale(math.clamp(fraction or 1, 0, 1), 1) })
	end)

	player.CharacterAdded:Connect(function(character)
		deathLabel.Visible = false
		local humanoid = character:WaitForChild("Humanoid", 10)
		if humanoid then
			humanoid.Died:Connect(function()
				if not State.inMenu then
					deathLabel.Visible = true
				end
			end)
		end
	end)
	State.on("menu", function()
		deathLabel.Visible = false
	end)

	RunService.Heartbeat:Connect(step)
end

return HUD
