--[[
	UI - tiny UI toolkit + theme for PROJECT: ZERO.
	Layouts are designed at 1280x720 and scaled by a UIScale that follows
	the screen size, so the same UI works on phones, tablets and PCs.
]]

local Players = game:GetService("Players")
local TweenService = game:GetService("TweenService")
local UserInputService = game:GetService("UserInputService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Config = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Config"))

local UI = {}

UI.Theme = {
	Background = Color3.fromRGB(10, 12, 14),
	Panel = Color3.fromRGB(18, 21, 24),
	PanelLight = Color3.fromRGB(30, 34, 38),
	Stroke = Color3.fromRGB(70, 76, 80),
	Text = Color3.fromRGB(232, 236, 238),
	SubText = Color3.fromRGB(150, 158, 162),
	Accent = Color3.fromRGB(255, 196, 64),
	Danger = Color3.fromRGB(230, 70, 60),
	Good = Color3.fromRGB(90, 220, 130),
	Info = Color3.fromRGB(120, 190, 255),
	Health = Color3.fromRGB(220, 60, 60),
	Stamina = Color3.fromRGB(240, 200, 80),
	Font = Enum.Font.Gotham,
	FontBold = Enum.Font.GothamBold,
	FontBlack = Enum.Font.GothamBlack,
}

local player = Players.LocalPlayer

function UI.isTouch()
	return UserInputService.TouchEnabled and not UserInputService.KeyboardEnabled
end

function UI.new(className, props, children)
	local inst = Instance.new(className)
	for k, v in pairs(props or {}) do
		if k ~= "Parent" then
			inst[k] = v
		end
	end
	for _, child in ipairs(children or {}) do
		child.Parent = inst
	end
	if props and props.Parent then
		inst.Parent = props.Parent
	end
	return inst
end

function UI.corner(radius)
	return UI.new("UICorner", { CornerRadius = UDim.new(0, radius or 10) })
end

function UI.stroke(color, thickness, transparency)
	return UI.new("UIStroke", {
		Color = color or UI.Theme.Stroke,
		Thickness = thickness or 1,
		Transparency = transparency or 0.3,
		ApplyStrokeMode = Enum.ApplyStrokeMode.Border,
	})
end

function UI.padding(px)
	return UI.new("UIPadding", {
		PaddingTop = UDim.new(0, px),
		PaddingBottom = UDim.new(0, px),
		PaddingLeft = UDim.new(0, px),
		PaddingRight = UDim.new(0, px),
	})
end

function UI.list(direction, gap, align)
	return UI.new("UIListLayout", {
		FillDirection = direction or Enum.FillDirection.Vertical,
		Padding = UDim.new(0, gap or 8),
		SortOrder = Enum.SortOrder.LayoutOrder,
		HorizontalAlignment = align or Enum.HorizontalAlignment.Left,
	})
end

-- ScreenGui with automatic scale for every device.
function UI.screen(name, displayOrder, fullscreen)
	local gui = UI.new("ScreenGui", {
		Name = name,
		ResetOnSpawn = false,
		DisplayOrder = displayOrder or 1,
		IgnoreGuiInset = fullscreen == true,
		ZIndexBehavior = Enum.ZIndexBehavior.Sibling,
	})
	if not fullscreen then
		pcall(function()
			gui.ScreenInsets = Enum.ScreenInsets.CoreUISafeInsets
		end)
	end
	local scale = UI.new("UIScale", { Parent = gui })
	local function update()
		local camera = workspace.CurrentCamera
		if not camera then
			return
		end
		local size = camera.ViewportSize
		local s = math.min(size.X / 1280, size.Y / 720)
		if UI.isTouch() then
			s = s * 1.12 -- slightly larger touch targets
		end
		scale.Scale = math.clamp(s, 0.5, 1.6)
	end
	update()
	workspace.CurrentCamera:GetPropertyChangedSignal("ViewportSize"):Connect(update)
	gui.Parent = player:WaitForChild("PlayerGui")
	return gui
end

-- Size of the visible area in "design pixels" (after UIScale).
function UI.designSize(gui)
	local scale = gui:FindFirstChildOfClass("UIScale")
	local s = scale and scale.Scale or 1
	local size = workspace.CurrentCamera.ViewportSize
	return size.X / s, size.Y / s
end

function UI.label(props)
	local defaults = {
		BackgroundTransparency = 1,
		Font = UI.Theme.Font,
		TextColor3 = UI.Theme.Text,
		TextSize = 18,
		TextWrapped = true,
		TextXAlignment = Enum.TextXAlignment.Left,
	}
	for k, v in pairs(props) do
		defaults[k] = v
	end
	return UI.new("TextLabel", defaults)
end

function UI.panel(props, children)
	local defaults = {
		BackgroundColor3 = UI.Theme.Panel,
		BackgroundTransparency = 0.12,
		BorderSizePixel = 0,
	}
	for k, v in pairs(props) do
		defaults[k] = v
	end
	local frame = UI.new("Frame", defaults, children)
	UI.corner(12).Parent = frame
	UI.stroke().Parent = frame
	return frame
end

local clickSound
local function playClick()
	if not clickSound then
		clickSound = Instance.new("Sound")
		clickSound.SoundId = Config.Sounds.UiClick
		clickSound.Volume = 0.25
		clickSound.PlaybackSpeed = 1.4
		clickSound.Parent = game:GetService("SoundService")
	end
	clickSound:Play()
end

-- Button with hover/press feedback. style: "primary" | "secondary" | "danger" | "ghost"
function UI.button(props, onClick)
	local style = props.Style or "secondary"
	local colors = {
		primary = { UI.Theme.Accent, Color3.fromRGB(20, 20, 20) },
		secondary = { UI.Theme.PanelLight, UI.Theme.Text },
		danger = { UI.Theme.Danger, Color3.new(1, 1, 1) },
		ghost = { UI.Theme.Panel, UI.Theme.SubText },
	}
	local c = colors[style] or colors.secondary
	local btn = UI.new("TextButton", {
		Name = props.Name or "Button",
		Size = props.Size or UDim2.fromOffset(220, 48),
		Position = props.Position or UDim2.new(),
		AnchorPoint = props.AnchorPoint or Vector2.zero,
		BackgroundColor3 = c[1],
		BackgroundTransparency = style == "ghost" and 0.3 or 0,
		Text = props.Text or "",
		TextColor3 = c[2],
		Font = props.Font or UI.Theme.FontBold,
		TextSize = props.TextSize or 18,
		AutoButtonColor = false,
		LayoutOrder = props.LayoutOrder or 0,
		Visible = props.Visible ~= false,
		Parent = props.Parent,
	})
	UI.corner(10).Parent = btn
	if style ~= "primary" then
		UI.stroke(UI.Theme.Stroke, 1, 0.4).Parent = btn
	end
	local base = btn.BackgroundColor3
	btn.MouseEnter:Connect(function()
		TweenService:Create(btn, TweenInfo.new(0.12), { BackgroundColor3 = base:Lerp(Color3.new(1, 1, 1), 0.12) }):Play()
	end)
	btn.MouseLeave:Connect(function()
		TweenService:Create(btn, TweenInfo.new(0.12), { BackgroundColor3 = base }):Play()
	end)
	btn.Activated:Connect(function()
		playClick()
		if onClick then
			onClick(btn)
		end
	end)
	return btn
end

function UI.tween(inst, time, goal, style)
	local t = TweenService:Create(inst, TweenInfo.new(time, style or Enum.EasingStyle.Quad, Enum.EasingDirection.Out), goal)
	t:Play()
	return t
end

-- Modal overlay with a centred panel and a close button.
function UI.modal(gui, title, width, height, onClose)
	local overlay = UI.new("TextButton", {
		Name = "Overlay",
		Size = UDim2.fromScale(1, 1),
		BackgroundColor3 = Color3.new(0, 0, 0),
		BackgroundTransparency = 0.45,
		Text = "",
		AutoButtonColor = false,
		Visible = false,
		ZIndex = 10,
		Parent = gui,
	})
	local panel = UI.panel({
		Name = "Panel",
		Size = UDim2.fromOffset(width, height),
		Position = UDim2.fromScale(0.5, 0.5),
		AnchorPoint = Vector2.new(0.5, 0.5),
		ZIndex = 11,
		Parent = overlay,
	})
	UI.new("UISizeConstraint", { MaxSize = Vector2.new(width, height), Parent = panel })
	UI.label({
		Name = "Title",
		Text = title,
		Font = UI.Theme.FontBlack,
		TextSize = 26,
		Size = UDim2.new(1, -80, 0, 44),
		Position = UDim2.fromOffset(20, 10),
		TextColor3 = UI.Theme.Accent,
		ZIndex = 12,
		Parent = panel,
	})
	local close = UI.button({ Text = "X", Size = UDim2.fromOffset(44, 44), Position = UDim2.new(1, -54, 0, 10), Style = "ghost", Parent = panel }, function()
		overlay.Visible = false
		if onClose then
			onClose()
		end
	end)
	close.ZIndex = 12
	local body = UI.new("Frame", {
		Name = "Body",
		BackgroundTransparency = 1,
		Size = UDim2.new(1, -40, 1, -74),
		Position = UDim2.fromOffset(20, 62),
		ZIndex = 11,
		Parent = panel,
	})
	return overlay, body, panel
end

function UI.scroll(props)
	local defaults = {
		BackgroundTransparency = 1,
		BorderSizePixel = 0,
		ScrollBarThickness = 6,
		ScrollBarImageColor3 = UI.Theme.Accent,
		CanvasSize = UDim2.new(),
		AutomaticCanvasSize = Enum.AutomaticSize.Y,
		ScrollingDirection = Enum.ScrollingDirection.Y,
	}
	for k, v in pairs(props) do
		defaults[k] = v
	end
	return UI.new("ScrollingFrame", defaults)
end

return UI
