--[[
	State - client-side mirror of the server snapshot + simple signals.
	The client never decides game outcomes; it only renders this state.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Net = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Net"))

local State = {
	profile = nil,
	party = {},
	objective = nil,
	inMenu = true,
	inCinematic = false,
	modalOpen = false,
}

local listeners = {}

function State.on(event, callback)
	listeners[event] = listeners[event] or {}
	table.insert(listeners[event], callback)
end

function State.emit(event, ...)
	for _, cb in ipairs(listeners[event] or {}) do
		task.spawn(cb, ...)
	end
end

function State.init()
	Net.get("ProfileSync").OnClientEvent:Connect(function(snapshot)
		State.profile = snapshot
		State.party = snapshot.party or {}
		State.emit("profile", snapshot)
	end)
	Net.get("PartyInventory").OnClientEvent:Connect(function(party)
		State.party = party or {}
		State.emit("party", State.party)
	end)
	Net.get("Objective").OnClientEvent:Connect(function(text, target, stage)
		State.objective = { text = text, target = target, stage = stage }
		State.emit("objective", State.objective)
	end)
end

function State.setting(key, default)
	local p = State.profile
	if p and p.settings and p.settings[key] ~= nil then
		return p.settings[key]
	end
	return default
end

return State
