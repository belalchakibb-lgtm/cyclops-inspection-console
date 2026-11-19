--[[
	CinematicService
	Tells clients to play a data-driven cinematic. While a player watches,
	they are flagged InCinematic: zombies ignore them and they take no
	damage. The flag clears when the client reports it finished/skipped,
	or automatically after the cinematic's length (exploit-safe timeout).
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Cinematics = require(Shared:WaitForChild("Cinematics"))
local Net = require(Shared:WaitForChild("Net"))

local CinematicService = {}

local playing = {} -- [player] = { id, token }

function CinematicService.length(id)
	local c = Cinematics[id]
	local total = 0
	if c then
		for _, shot in ipairs(c.shots) do
			total = total + (shot.duration or 0)
		end
	end
	return total
end

function CinematicService.play(players, id)
	if not Cinematics[id] then
		warn("[Cinematic] Unknown cinematic " .. tostring(id))
		return
	end
	local length = CinematicService.length(id)
	for _, player in ipairs(players) do
		local token = {}
		playing[player] = { id = id, token = token }
		player:SetAttribute("InCinematic", true)
		Net.fire("PlayCinematic", player, id)
		task.delay(length + 3, function()
			local current = playing[player]
			if current and current.token == token then
				playing[player] = nil
				if player.Parent then
					player:SetAttribute("InCinematic", false)
				end
			end
		end)
	end
end

function CinematicService.playAll(id)
	CinematicService.play(Players:GetPlayers(), id)
end

function CinematicService.init() end

function CinematicService.start()
	Net.on("CinematicDone", function(player, id)
		local current = playing[player]
		if current and current.id == id then
			playing[player] = nil
			player:SetAttribute("InCinematic", false)
		end
	end, 4)
	Players.PlayerRemoving:Connect(function(player)
		playing[player] = nil
	end)
end

return CinematicService
