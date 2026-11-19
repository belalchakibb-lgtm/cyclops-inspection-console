--[[
	DataService
	Persistent player profiles using DataStoreService.
	- UpdateAsync everywhere (no blind overwrites)
	- Session locking so two servers never overwrite each other
	- Retries with exponential backoff
	- Autosave + save on leave + BindToClose
	- Falls back to an in-memory profile when DataStores are unavailable
	  (e.g. Studio without "Enable Studio Access to API Services") and tells
	  the player their progress will not be saved.
]]

local DataStoreService = game:GetService("DataStoreService")
local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Util = require(Shared:WaitForChild("Util"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))

local DataService = {}

local TEMPLATE = {
	schema = 1,
	chapters = {
		ch1 = { completed = false, checkpointStage = 1, bestTime = 0, completions = 0 },
	},
	highestChapter = 1,
	documents = {},
	achievements = {},
	cosmetics = {
		owned = { light_default = true, gear_none = true, title_none = true, emote_wave = true, emote_point = true },
		equipped = { light = Cosmetics.Defaults.light, gear = Cosmetics.Defaults.gear, title = Cosmetics.Defaults.title },
	},
	storyFlags = {},
	stats = { zombiesDefeated = 0, deaths = 0, revives = 0, playTime = 0 },
	daily = { lastDay = 0, streak = 0 },
	settings = { graphics = "Auto", music = 0.6, sfx = 0.8, subtitles = true, cameraShake = true, tutorials = true },
	hintsSeen = {},
	endings = {},
	purchases = {},
}

local store = nil
local useMemory = false
local profiles = {} -- [player] = data
local loadedCallbacks = {}
local jobId = game.JobId ~= "" and game.JobId or ("studio-" .. tostring(math.random(1, 1e9)))

local function withRetries(fn)
	local delay = 1
	local lastErr
	for attempt = 1, Config.Data.MaxRetries do
		local ok, result = pcall(fn)
		if ok then
			return true, result
		end
		lastErr = result
		if attempt < Config.Data.MaxRetries then
			task.wait(delay)
			delay = delay * 2
		end
	end
	return false, lastErr
end

local function keyFor(player)
	return "u_" .. player.UserId
end

function DataService.init(services)
	DataService.Services = services
	local ok, result = pcall(function()
		return DataStoreService:GetDataStore(Config.Data.ProfileStore)
	end)
	if ok then
		store = result
	else
		useMemory = true
		warn("[DataService] DataStores unavailable - using in-memory profiles. (" .. tostring(result) .. ")")
	end
end

function DataService.isMemoryMode()
	return useMemory
end

function DataService.onLoaded(callback)
	table.insert(loadedCallbacks, callback)
	for player, data in pairs(profiles) do
		task.spawn(callback, player, data)
	end
end

function DataService.get(player)
	return profiles[player]
end

-- Waits (bounded) for a player's profile.
function DataService.waitFor(player, timeout)
	local deadline = os.clock() + (timeout or 20)
	while not profiles[player] and player.Parent and os.clock() < deadline do
		task.wait(0.1)
	end
	return profiles[player]
end

local function loadProfile(player)
	if useMemory then
		return Util.deepCopy(TEMPLATE), true
	end
	local key = keyFor(player)
	local loaded
	for attempt = 1, 5 do
		local lockedByOther = false
		local ok, err = withRetries(function()
			store:UpdateAsync(key, function(old)
				local data = old or Util.deepCopy(TEMPLATE)
				local lock = data.lock
				if lock and lock.job ~= jobId and os.time() - (lock.time or 0) < Config.Data.SessionLockTimeout and attempt < 5 then
					lockedByOther = true
					return nil -- do not write; another server still owns this profile
				end
				data.lock = { job = jobId, time = os.time() }
				loaded = data
				return data
			end)
		end)
		if not ok then
			warn("[DataService] Load failed for " .. player.Name .. ": " .. tostring(err))
			return nil, false
		end
		if not lockedByOther and loaded then
			return loaded, true
		end
		task.wait(3) -- previous server is probably still saving
	end
	return loaded, loaded ~= nil
end

function DataService.save(player, release)
	local data = profiles[player]
	if not data or useMemory then
		return true
	end
	local key = keyFor(player)
	local ok, err = withRetries(function()
		store:UpdateAsync(key, function(old)
			if old and old.lock and old.lock.job ~= jobId then
				-- Another server took over the session; never clobber it.
				return nil
			end
			data.lock = (not release) and { job = jobId, time = os.time() } or nil
			return data
		end)
	end)
	if not ok then
		warn("[DataService] Save failed for " .. player.Name .. ": " .. tostring(err))
	end
	return ok
end

local function onPlayerAdded(player)
	local data, ok = loadProfile(player)
	if not player.Parent then
		return
	end
	if (not ok or not data) and RunService:IsStudio() then
		-- Studio without API access: keep testing with a temporary profile.
		warn("[DataService] Studio has no DataStore access - progress will not be saved this session.")
		useMemory = true
		data, ok = Util.deepCopy(TEMPLATE), true
	end
	if not ok or not data then
		-- Do not risk overwriting good data with a fresh template.
		player:Kick("PROJECT: ZERO could not load your save data. Please rejoin in a moment.")
		return
	end
	Util.reconcile(data, TEMPLATE)
	profiles[player] = data
	player:SetAttribute("ProfileLoaded", true)
	for _, cb in ipairs(loadedCallbacks) do
		task.spawn(cb, player, data)
	end
end

function DataService.start()
	Players.PlayerAdded:Connect(onPlayerAdded)
	for _, p in ipairs(Players:GetPlayers()) do
		task.spawn(onPlayerAdded, p)
	end

	Players.PlayerRemoving:Connect(function(player)
		if profiles[player] then
			DataService.save(player, true)
			profiles[player] = nil
		end
	end)

	task.spawn(function()
		while true do
			task.wait(Config.Data.AutosaveInterval)
			for player in pairs(profiles) do
				if player.Parent then
					task.spawn(DataService.save, player, false)
				end
			end
		end
	end)

	game:BindToClose(function()
		if useMemory then
			return
		end
		local pending = 0
		for player in pairs(profiles) do
			pending = pending + 1
			task.spawn(function()
				DataService.save(player, true)
				pending = pending - 1
			end)
		end
		local deadline = os.clock() + 25
		while pending > 0 and os.clock() < deadline do
			task.wait(0.2)
		end
	end)
end

return DataService
