--[[
	Dialogue - conversation UI. The server sends one node at a time; the
	player taps a choice (or Continue) and the server answers with the next.
	Text types out for a cinematic feel; tapping the box completes it.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Net"))
local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local Dialogue = {}
local T = UI.Theme

local gui, box, speakerLabel, textLabel, choicesFrame
local typingToken

local function clearChoices()
	for _, c in ipairs(choicesFrame:GetChildren()) do
		if c:IsA("TextButton") then
			c:Destroy()
		end
	end
end

local function close()
	gui.Enabled = false
	State.modalOpen = false
	State.emit("modal", false)
end

local function show(node)
	gui.Enabled = true
	State.modalOpen = true
	State.emit("modal", true)
	speakerLabel.Text = string.upper(node.speaker or "")
	clearChoices()

	local token = {}
	typingToken = token
	local full = node.text or ""
	textLabel.Text = full
	textLabel.MaxVisibleGraphemes = 0
	task.spawn(function()
		for i = 1, #full do
			if typingToken ~= token then
				return
			end
			textLabel.MaxVisibleGraphemes = i
			task.wait(0.018)
		end
	end)

	local function addChoice(text, index, order)
		UI.button({
			Text = text,
			Size = UDim2.new(1, 0, 0, 46),
			Style = index == 0 and "primary" or "secondary",
			LayoutOrder = order,
			TextSize = 17,
			Parent = choicesFrame,
		}, function()
			typingToken = nil
			textLabel.MaxVisibleGraphemes = -1
			clearChoices()
			if node.final and index == 0 then
				close()
			end
			Net.get("DialogueChoice"):FireServer(index)
		end).TextWrapped = true
	end

	if node.choices and #node.choices > 0 then
		for i, text in ipairs(node.choices) do
			addChoice(text, i, i)
		end
	else
		addChoice(node.final and "Leave" or "Continue", 0, 1)
	end
end

function Dialogue.init()
	gui = UI.screen("PZ_Dialogue", 20)
	gui.Enabled = false
	box = UI.panel({
		Size = UDim2.fromOffset(760, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		Position = UDim2.new(0.5, 0, 1, -24),
		AnchorPoint = Vector2.new(0.5, 1),
		Parent = gui,
	})
	UI.padding(18).Parent = box
	UI.list(Enum.FillDirection.Vertical, 10).Parent = box
	speakerLabel = UI.label({ Size = UDim2.new(1, 0, 0, 22), Font = T.FontBlack, TextSize = 18, TextColor3 = T.Accent, LayoutOrder = 1, Parent = box })
	textLabel = UI.label({ Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, TextSize = 20, LayoutOrder = 2, Parent = box })
	choicesFrame = UI.new("Frame", { Size = UDim2.new(1, 0, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, BackgroundTransparency = 1, LayoutOrder = 3, Parent = box })
	UI.list(Enum.FillDirection.Vertical, 6).Parent = choicesFrame

	Net.get("DialogueShow").OnClientEvent:Connect(show)
	Net.get("DialogueClose").OnClientEvent:Connect(close)
end

return Dialogue
