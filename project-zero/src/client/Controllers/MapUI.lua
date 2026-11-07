--[[
	MapUI - full-screen tactical map drawn from shared Layout data:
	named zones, your position (arrow), teammates and the objective.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Layout = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Layout"))
local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local MapUI = {}
local T = UI.Theme
local player = Players.LocalPlayer

local gui, overlay, mapFrame, objectiveDot
local markers = {}
local B = Layout.WorldBounds

local function toMap(pos)
	local x = (pos.X - B.minX) / (B.maxX - B.minX)
	local y = 1 - (pos.Z - B.minZ) / (B.maxZ - B.minZ)
	return UDim2.fromScale(math.clamp(x, 0, 1), math.clamp(y, 0, 1))
end

local function marker(name, color, size)
	local m = UI.new("Frame", {
		Name = name,
		Size = UDim2.fromOffset(size, size),
		AnchorPoint = Vector2.new(0.5, 0.5),
		BackgroundColor3 = color,
		BorderSizePixel = 0,
		ZIndex = 5,
		Parent = mapFrame,
	})
	UI.corner(size).Parent = m
	UI.stroke(Color3.new(0, 0, 0), 2, 0).Parent = m
	return m
end

local function update()
	local seen = {}
	for _, p in ipairs(Players:GetPlayers()) do
		local character = p.Character
		local root = character and character:FindFirstChild("HumanoidRootPart")
		if root then
			seen[p] = true
			local m = markers[p]
			if not m then
				m = marker(p.Name, p == player and T.Accent or T.Info, p == player and 16 or 12)
				UI.label({ Size = UDim2.fromOffset(120, 16), Position = UDim2.new(0.5, 0, 0, -18), AnchorPoint = Vector2.new(0.5, 0), Text = p.DisplayName, TextSize = 12, Font = T.FontBold, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.3, ZIndex = 6, Parent = m })
				markers[p] = m
			end
			m.Position = toMap(root.Position)
			m.Rotation = -root.Orientation.Y
		end
	end
	for p, m in pairs(markers) do
		if not seen[p] then
			m:Destroy()
			markers[p] = nil
		end
	end
	local obj = State.objective
	if obj and obj.target then
		objectiveDot.Visible = true
		objectiveDot.Position = toMap(obj.target)
	else
		objectiveDot.Visible = false
	end
end

function MapUI.toggle()
	overlay.Visible = not overlay.Visible
	State.modalOpen = overlay.Visible
	State.emit("modal", overlay.Visible)
	if overlay.Visible then
		task.spawn(function()
			while overlay.Visible do
				update()
				task.wait(0.2)
			end
		end)
	end
end

function MapUI.init()
	gui = UI.screen("PZ_Map", 30)
	local body
	overlay, body = UI.modal(gui, "MAP - ASHFORD BAY", 640, 640, function()
		State.modalOpen = false
		State.emit("modal", false)
	end)
	mapFrame = UI.new("Frame", {
		Size = UDim2.fromScale(1, 1),
		BackgroundColor3 = Color3.fromRGB(14, 16, 18),
		BorderSizePixel = 0,
		Parent = body,
	})
	UI.new("UIAspectRatioConstraint", {
		AspectRatio = (B.maxX - B.minX) / (B.maxZ - B.minZ),
		Parent = mapFrame,
	})
	UI.corner(8).Parent = mapFrame
	for _, zone in ipairs(Layout.Zones) do
		local topLeft = toMap(Vector3.new(zone.minX, 0, zone.maxZ))
		local w = (zone.maxX - zone.minX) / (B.maxX - B.minX)
		local h = (zone.maxZ - zone.minZ) / (B.maxZ - B.minZ)
		local f = UI.new("Frame", {
			Position = topLeft,
			Size = UDim2.fromScale(w, h),
			BackgroundColor3 = zone.color,
			BackgroundTransparency = 0.45,
			BorderSizePixel = 0,
			ZIndex = 2,
			Parent = mapFrame,
		})
		UI.stroke(zone.color, 1, 0.2).Parent = f
		UI.label({ Size = UDim2.fromScale(1, 1), Text = zone.name, TextSize = 11, Font = T.FontBold, TextXAlignment = Enum.TextXAlignment.Center, TextColor3 = Color3.new(1, 1, 1), TextStrokeTransparency = 0.4, ZIndex = 3, Parent = f })
	end
	objectiveDot = marker("Objective", T.Danger, 14)
	UI.label({ Size = UDim2.fromOffset(90, 16), Position = UDim2.new(0.5, 0, 1, 2), AnchorPoint = Vector2.new(0.5, 0), Text = "OBJECTIVE", TextSize = 11, Font = T.FontBlack, TextColor3 = T.Danger, TextXAlignment = Enum.TextXAlignment.Center, TextStrokeTransparency = 0.3, ZIndex = 6, Parent = objectiveDot })
end

return MapUI
