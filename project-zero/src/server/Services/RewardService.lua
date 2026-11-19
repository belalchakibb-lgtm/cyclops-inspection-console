--[[
	RewardService
	Achievements, statistics, daily cosmetic rewards and cosmetic equipping.
	Everything here is cosmetic or informational - no power progression.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Achievements = require(Shared:WaitForChild("Achievements"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))
local Config = require(Shared:WaitForChild("Config"))
local Util = require(Shared:WaitForChild("Util"))
local Net = require(Shared:WaitForChild("Net"))

local RewardService = {}
local Services

function RewardService.grantCosmetic(player, cosmeticId, silent)
	local profile = Services.Data.get(player)
	local def = Cosmetics[cosmeticId]
	if not profile or not def then
		return false
	end
	if profile.cosmetics.owned[cosmeticId] then
		return false
	end
	profile.cosmetics.owned[cosmeticId] = true
	if not silent then
		Net.fire("Notify", player, "New cosmetic unlocked: " .. def.name, "reward")
	end
	return true
end

function RewardService.unlock(player, achievementId)
	local profile = Services.Data.get(player)
	local def = Achievements[achievementId]
	if not profile or not def or profile.achievements[achievementId] then
		return
	end
	profile.achievements[achievementId] = os.time()
	Net.fire("Notify", player, "Achievement: " .. def.name, "achievement")
	if def.reward then
		RewardService.grantCosmetic(player, def.reward)
	end
	Services.sync(player)
end

function RewardService.addStat(player, stat, amount)
	local profile = Services.Data.get(player)
	if not profile then
		return
	end
	profile.stats[stat] = (profile.stats[stat] or 0) + amount
	if stat == "zombiesDefeated" then
		RewardService.unlock(player, "first_takedown")
		if profile.stats.zombiesDefeated >= 100 then
			RewardService.unlock(player, "exterminator")
		end
	end
end

function RewardService.collectDocument(player, docId)
	local profile = Services.Data.get(player)
	if not profile or profile.documents[docId] then
		return false
	end
	profile.documents[docId] = true
	local Documents = require(Shared:WaitForChild("Documents"))
	local all = true
	for _, id in ipairs(Documents.ResearchChapter1) do
		if not profile.documents[id] then
			all = false
		end
	end
	if all then
		RewardService.unlock(player, "archivist1")
	end
	Services.sync(player)
	return true
end

-- Daily rewards: one claim per UTC day, streak advances on consecutive days.
local function claimDaily(player)
	local profile = Services.Data.get(player)
	if not profile then
		return
	end
	local today = Util.dayNumber()
	local daily = profile.daily
	if daily.lastDay == today then
		Net.fire("Notify", player, "Daily reward already claimed. Come back tomorrow!", "info")
		return
	end
	if daily.lastDay == today - 1 then
		daily.streak = daily.streak + 1
	else
		daily.streak = 1
	end
	daily.lastDay = today
	-- Give the first cosmetic in the rotation the player doesn't own yet.
	local list = Config.DailyRewards
	local granted = nil
	for i = 0, #list - 1 do
		local id = list[((daily.streak - 1 + i) % #list) + 1]
		if not profile.cosmetics.owned[id] then
			granted = id
			break
		end
	end
	if granted then
		RewardService.grantCosmetic(player, granted)
	else
		Net.fire("Notify", player, "Day " .. daily.streak .. " streak! You own every daily cosmetic.", "reward")
	end
	Services.sync(player)
end

local function equip(player, cosmeticId)
	local profile = Services.Data.get(player)
	local def = type(cosmeticId) == "string" and Cosmetics[cosmeticId]
	if not profile or not def or def.category == "emote" then
		return
	end
	if not profile.cosmetics.owned[cosmeticId] then
		return
	end
	profile.cosmetics.equipped[def.category] = cosmeticId
	Services.Player.applyCosmetics(player)
	Services.sync(player)
end

local SETTINGS_SCHEMA = {
	graphics = { "Auto", "Low", "Medium", "High" },
	music = "number",
	sfx = "number",
	subtitles = "boolean",
	cameraShake = "boolean",
	tutorials = "boolean",
}

local function saveSettings(player, incoming)
	local profile = Services.Data.get(player)
	if not profile or type(incoming) ~= "table" then
		return
	end
	for key, rule in pairs(SETTINGS_SCHEMA) do
		local v = incoming[key]
		if rule == "number" and type(v) == "number" and v == v then
			profile.settings[key] = math.clamp(v, 0, 1)
		elseif rule == "boolean" and type(v) == "boolean" then
			profile.settings[key] = v
		elseif type(rule) == "table" and type(v) == "string" and table.find(rule, v) then
			profile.settings[key] = v
		end
	end
end

function RewardService.init(services)
	Services = services
end

function RewardService.start()
	Net.on("ClaimDaily", claimDaily, 2)
	Net.on("EquipCosmetic", equip, 6)
	Net.on("SaveSettings", saveSettings, 3)
end

return RewardService
