--[[
	Keypad - 4-digit code entry for locked doors. Big touch-friendly keys.
	The server checks the code; the client only collects digits.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Net"))
local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local Keypad = {}
local T = UI.Theme

local gui, overlay, display
local entered = ""
local currentDoor = nil

local function refresh(color)
	local shown = entered .. string.rep("_", 4 - #entered)
	display.Text = shown:gsub(".", "%0 ")
	display.TextColor3 = color or T.Text
end

local function close()
	overlay.Visible = false
	State.modalOpen = false
	State.emit("modal", false)
end

local function press(key)
	if key == "C" then
		entered = ""
	elseif key == "OK" then
		if #entered == 4 and currentDoor then
			Net.get("KeypadSubmit"):FireServer(currentDoor, entered)
		end
		return
	elseif #entered < 4 then
		entered = entered .. key
	end
	refresh()
end

function Keypad.init()
	gui = UI.screen("PZ_Keypad", 25)
	local body
	overlay, body = UI.modal(gui, "SECURITY KEYPAD", 360, 470, function()
		State.modalOpen = false
		State.emit("modal", false)
	end)
	display = UI.label({
		Size = UDim2.new(1, 0, 0, 56),
		BackgroundTransparency = 0,
		BackgroundColor3 = Color3.fromRGB(8, 20, 12),
		Font = Enum.Font.Code,
		TextSize = 34,
		TextXAlignment = Enum.TextXAlignment.Center,
		Parent = body,
	})
	UI.corner(8).Parent = display
	local grid = UI.new("Frame", { Size = UDim2.new(1, 0, 1, -66), Position = UDim2.fromOffset(0, 66), BackgroundTransparency = 1, Parent = body })
	UI.new("UIGridLayout", { CellSize = UDim2.new(0.31, 0, 0, 70), CellPadding = UDim2.new(0.035, 0, 0, 8), SortOrder = Enum.SortOrder.LayoutOrder, Parent = grid })
	local keys = { "1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK" }
	for i, k in ipairs(keys) do
		UI.button({ Text = k, LayoutOrder = i, TextSize = 26, Style = k == "OK" and "primary" or (k == "C" and "danger" or "secondary"), Parent = grid }, function()
			press(k)
		end)
	end

	Net.get("KeypadOpen").OnClientEvent:Connect(function(doorId)
		currentDoor = doorId
		entered = ""
		refresh()
		overlay.Visible = true
		State.modalOpen = true
		State.emit("modal", true)
	end)
	Net.get("KeypadResult").OnClientEvent:Connect(function(ok)
		if ok then
			refresh(T.Good)
			task.wait(0.6)
			close()
		else
			refresh(T.Danger)
			task.wait(0.6)
			entered = ""
			refresh()
		end
	end)
end

return Keypad
