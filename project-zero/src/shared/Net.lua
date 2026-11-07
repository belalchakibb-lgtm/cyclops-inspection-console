--[[
	Net
	Creates (server) and resolves (client) every RemoteEvent in one place.
	Server handlers are wrapped with a per-player rate limiter and pcall so a
	malicious or buggy client can never crash a service.
]]

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local RunService = game:GetService("RunService")

local Net = {}

-- Client -> Server
Net.ClientToServer = {
	"RequestPlay", -- (mode: "continue" | "new")
	"SetSprint", -- (bool)
	"ToggleFlashlight", -- ()
	"UseItem", -- (itemId)
	"DialogueChoice", -- (choiceIndex)
	"KeypadSubmit", -- (doorId, code)
	"EquipCosmetic", -- (cosmeticId)
	"ClaimDaily", -- ()
	"CinematicDone", -- (cinematicId)
	"SaveSettings", -- (settingsTable)
	"ReturnToMenu", -- ()
	"BuyProduct", -- (productKey)
}

-- Server -> Client
Net.ServerToClient = {
	"ProfileSync", -- (snapshot)
	"Objective", -- (text, position?, stage)
	"Notify", -- (text, kind)
	"Hint", -- (hintId)
	"DialogueShow", -- (node payload)
	"DialogueClose", -- ()
	"PlayCinematic", -- (id)
	"KeypadOpen", -- (doorId)
	"KeypadResult", -- (ok)
	"ReadDocument", -- (docId, text)
	"ChapterComplete", -- (summary)
	"BossBar", -- (name, fraction | nil)
	"PartyInventory", -- ({ itemId = count })
	"ShowMenu", -- ()
	"Shake", -- (intensity, duration)
}

local FOLDER_NAME = "Remotes"

local function getFolder()
	if RunService:IsServer() then
		local folder = ReplicatedStorage:FindFirstChild(FOLDER_NAME)
		if not folder then
			folder = Instance.new("Folder")
			folder.Name = FOLDER_NAME
			folder.Parent = ReplicatedStorage
		end
		return folder
	end
	return ReplicatedStorage:WaitForChild(FOLDER_NAME)
end

function Net.init()
	assert(RunService:IsServer(), "Net.init is server only")
	local folder = getFolder()
	local all = {}
	for _, n in ipairs(Net.ClientToServer) do
		table.insert(all, n)
	end
	for _, n in ipairs(Net.ServerToClient) do
		table.insert(all, n)
	end
	for _, name in ipairs(all) do
		if not folder:FindFirstChild(name) then
			local remote = Instance.new("RemoteEvent")
			remote.Name = name
			remote.Parent = folder
		end
	end
end

local cache = {}
function Net.get(name)
	local remote = cache[name]
	if remote then
		return remote
	end
	local folder = getFolder()
	remote = folder:WaitForChild(name, 30)
	assert(remote, "Missing remote: " .. tostring(name))
	cache[name] = remote
	return remote
end

-- Server: connect with rate limiting. maxPerSecond defaults to 8.
function Net.on(name, handler, maxPerSecond)
	local limit = maxPerSecond or 8
	local buckets = {}
	local remote = Net.get(name)
	remote.OnServerEvent:Connect(function(player, ...)
		local now = os.clock()
		local bucket = buckets[player]
		if not bucket or now - bucket.start >= 1 then
			bucket = { start = now, count = 0 }
			buckets[player] = bucket
		end
		bucket.count = bucket.count + 1
		if bucket.count > limit then
			return
		end
		local ok, err = pcall(handler, player, ...)
		if not ok then
			warn(("[Net] %s handler error for %s: %s"):format(name, player.Name, tostring(err)))
		end
	end)
	game:GetService("Players").PlayerRemoving:Connect(function(player)
		buckets[player] = nil
	end)
end

function Net.fire(name, player, ...)
	Net.get(name):FireClient(player, ...)
end

function Net.fireAll(name, ...)
	Net.get(name):FireAllClients(...)
end

return Net
