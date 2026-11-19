--[[
	DialogueService
	Server-driven branching dialogue. The server owns the conversation state,
	so a client can only pick choices that exist on its current node.
	Choices update persistent story flags (trust, secrets) used by later
	chapters and the endings.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Dialogues = require(Shared:WaitForChild("Dialogues"))
local Net = require(Shared:WaitForChild("Net"))

local DialogueService = {}
local Services

local active = {} -- [player] = { id, node }
local eventHandlers = {}

function DialogueService.onEvent(callback)
	table.insert(eventHandlers, callback)
end

local function sendNode(player, dialogueId, nodeId)
	local dialogue = Dialogues[dialogueId]
	local node = dialogue and dialogue.nodes[nodeId]
	if not node then
		active[player] = nil
		Net.fire("DialogueClose", player)
		return
	end
	active[player] = { id = dialogueId, node = nodeId }
	local choices = {}
	if node.choices then
		for i, c in ipairs(node.choices) do
			choices[i] = c.text
		end
	end
	Net.fire("DialogueShow", player, {
		speaker = node.speaker,
		text = node.text,
		choices = choices,
		final = node.choices == nil and node.next == nil,
	})
	if node.event then
		for _, cb in ipairs(eventHandlers) do
			task.spawn(cb, player, node.event, dialogueId)
		end
	end
end

function DialogueService.begin(player, dialogueId)
	local dialogue = Dialogues[dialogueId]
	if not dialogue then
		return
	end
	sendNode(player, dialogueId, dialogue.start)
end

function DialogueService.isTalking(player)
	return active[player] ~= nil
end

local function applyChoice(player, choice)
	local profile = Services.Data.get(player)
	if not profile then
		return
	end
	if choice.trust then
		profile.storyFlags.mayaTrust = (profile.storyFlags.mayaTrust or 0) + choice.trust
	end
	if choice.flag then
		profile.storyFlags[choice.flag] = true
	end
end

local function onChoice(player, index)
	local state = active[player]
	if not state or type(index) ~= "number" then
		return
	end
	local node = Dialogues[state.id].nodes[state.node]
	if node.choices then
		local choice = node.choices[math.floor(index)]
		if not choice then
			return
		end
		applyChoice(player, choice)
		sendNode(player, state.id, choice.next)
	elseif node.next then
		sendNode(player, state.id, node.next)
	else
		active[player] = nil
		Net.fire("DialogueClose", player)
	end
end

function DialogueService.init(services)
	Services = services
end

function DialogueService.start()
	Net.on("DialogueChoice", onChoice, 6)
	Players.PlayerRemoving:Connect(function(player)
		active[player] = nil
	end)
end

return DialogueService
