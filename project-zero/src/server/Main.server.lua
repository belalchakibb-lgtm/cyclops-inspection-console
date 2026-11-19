--[[
	PROJECT: ZERO - server bootstrap.
	Builds the world, then initialises and starts every service in a fixed
	order. Services talk to each other through the shared 'Services' table
	(no circular requires).
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Players = game:GetService("Players")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))
local Config = require(Shared:WaitForChild("Config"))
local Util = require(Shared:WaitForChild("Util"))

local ServerRoot = script.Parent
local ServicesFolder = ServerRoot:WaitForChild("Services")
local World = ServerRoot:WaitForChild("World")

Players.CharacterAutoLoads = false
Net.init()

local Services = {
	Data = require(ServicesFolder:WaitForChild("DataService")),
	Environment = require(ServicesFolder:WaitForChild("EnvironmentService")),
	Interaction = require(ServicesFolder:WaitForChild("InteractionService")),
	Player = require(ServicesFolder:WaitForChild("PlayerService")),
	Combat = require(ServicesFolder:WaitForChild("CombatService")),
	Inventory = require(ServicesFolder:WaitForChild("InventoryService")),
	Zombies = require(ServicesFolder:WaitForChild("ZombieService")),
	Dialogue = require(ServicesFolder:WaitForChild("DialogueService")),
	Cinematic = require(ServicesFolder:WaitForChild("CinematicService")),
	Rewards = require(ServicesFolder:WaitForChild("RewardService")),
	Monetization = require(ServicesFolder:WaitForChild("MonetizationService")),
	Mission = require(ServicesFolder:WaitForChild("MissionService")),
}

-- Snapshot of everything a client needs to render menus and HUD.
function Services.sync(player)
	local profile = Services.Data.get(player)
	if not profile or not player.Parent then
		return
	end
	local pSession = Services.Player.getSession(player)
	local equipment = {}
	if pSession then
		for id in pairs(pSession.equipment) do
			equipment[id] = true
		end
	end
	Net.fire("ProfileSync", player, {
		chapters = profile.chapters,
		highestChapter = profile.highestChapter,
		documents = profile.documents,
		achievements = profile.achievements,
		cosmetics = profile.cosmetics,
		storyFlags = profile.storyFlags,
		stats = profile.stats,
		daily = profile.daily,
		dailyAvailable = profile.daily.lastDay ~= Util.dayNumber(),
		settings = profile.settings,
		equipment = equipment,
		inventory = Services.Inventory.getPersonal(player),
		party = Services.Inventory.getParty(),
		code = Services.Mission.getCode(),
		stage = Services.Mission.getStage(),
		vip = player:GetAttribute("VIP") == true,
		memoryMode = Services.Data.isMemoryMode(),
		catalog = Services.Monetization.catalog(),
		version = Config.Version,
	})
end

local order = { "Data", "Environment", "Interaction", "Player", "Combat", "Inventory", "Zombies", "Dialogue", "Cinematic", "Rewards", "Monetization", "Mission" }

for _, name in ipairs(order) do
	local service = Services[name]
	if service.init then
		service.init(Services)
	end
end

local WorldBuilder = require(World:WaitForChild("WorldBuilder"))
local worldRefs = WorldBuilder.build()

for _, name in ipairs(order) do
	local service = Services[name]
	if service.start then
		local ok, err = pcall(service.start, worldRefs)
		if not ok then
			warn(("[Main] %s failed to start: %s"):format(name, tostring(err)))
		end
	end
end

-- First sync once a profile loads (menu needs it).
Services.Data.onLoaded(function(player)
	Services.sync(player)
	Net.fire("ShowMenu", player)
end)

print("[PROJECT: ZERO] Server ready - " .. Config.Version)
