--[[
	InventoryService
	- Personal consumables (bandages, medkits) per player, per chapter run
	- Shared party key items (keycards, fuses) so any co-op member can use them
	All mutations happen here on the server; clients only receive snapshots.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Items = require(Shared:WaitForChild("Items"))
local Net = require(Shared:WaitForChild("Net"))

local InventoryService = {}
local Services

local personal = {} -- [player] = { itemId = count }
local party = {} -- { itemId = count }

function InventoryService.getPersonal(player)
	return personal[player] or {}
end

function InventoryService.getParty()
	return party
end

function InventoryService.add(player, itemId, count)
	local def = Items[itemId]
	local inv = personal[player]
	if not def or not inv then
		return false
	end
	local current = inv[itemId] or 0
	local maxStack = def.maxStack or 99
	if current >= maxStack then
		Net.fire("Notify", player, def.name .. ": you can't carry more.", "info")
		return false
	end
	inv[itemId] = math.min(maxStack, current + (count or 1))
	Services.sync(player)
	return true
end

function InventoryService.addParty(itemId)
	party[itemId] = (party[itemId] or 0) + 1
	Net.fireAll("PartyInventory", party)
end

function InventoryService.hasParty(itemId)
	return (party[itemId] or 0) > 0
end

function InventoryService.consumeParty(itemId)
	if (party[itemId] or 0) <= 0 then
		return false
	end
	party[itemId] = party[itemId] - 1
	if party[itemId] <= 0 then
		party[itemId] = nil
	end
	Net.fireAll("PartyInventory", party)
	return true
end

function InventoryService.resetSession()
	party = {}
	for player in pairs(personal) do
		personal[player] = {}
	end
	Net.fireAll("PartyInventory", party)
end

function InventoryService.resetPlayer(player)
	personal[player] = {}
end

local function useItem(player, itemId)
	if type(itemId) ~= "string" then
		return
	end
	local def = Items[itemId]
	local inv = personal[player]
	if not def or not inv or def.kind ~= "consumable" or (inv[itemId] or 0) <= 0 then
		return
	end
	local character, humanoid = Services.Player.getParts(player)
	if not character or humanoid.Health <= 0 or character:GetAttribute("Downed") then
		return
	end
	if humanoid.Health >= humanoid.MaxHealth then
		Net.fire("Notify", player, "You're already at full health.", "info")
		return
	end
	if def.heal and Services.Player.heal(player, def.heal) then
		inv[itemId] = inv[itemId] - 1
		Net.fire("Notify", player, "Used " .. def.name .. " (+" .. def.heal .. " health)", "good")
		Services.sync(player)
	end
end

function InventoryService.init(services)
	Services = services
end

function InventoryService.start()
	local function added(player)
		personal[player] = {}
	end
	Players.PlayerAdded:Connect(added)
	for _, p in ipairs(Players:GetPlayers()) do
		added(p)
	end
	Players.PlayerRemoving:Connect(function(player)
		personal[player] = nil
	end)
	Net.on("UseItem", useItem, 4)
end

return InventoryService
