--[[
	MissionService - Chapter 1 "The Outbreak" story controller.

	The whole server shares one story session (co-op party of up to 4).
	- Stages advance on shared story events and are broadcast to everyone.
	- Each stage is a checkpoint saved to every participant's profile.
	- Joining mid-session, dying or resuming from a save restores the
	  world to the current stage (doors, key items, equipment), so one
	  player's actions can never soft-lock another player.
	- Personal collectibles (documents, equipment) are per player;
	  key items (keycard, fuse) are shared by the party.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Layout = require(Shared:WaitForChild("Layout"))
local Chapters = require(Shared:WaitForChild("Chapters"))
local Documents = require(Shared:WaitForChild("Documents"))
local Items = require(Shared:WaitForChild("Items"))
local Cinematics = require(Shared:WaitForChild("Cinematics"))
local Net = require(Shared:WaitForChild("Net"))

local World = script.Parent.Parent:WaitForChild("World")
local Doors = require(World:WaitForChild("Doors"))
local Pickups = require(World:WaitForChild("Pickups"))

local MissionService = {}
local Services
local refs

local P = Layout.Points
local STAGES = Chapters.Chapter1
local IDX = Chapters.Chapter1Index

local session = {
	running = false,
	stage = 0,
	startedAt = 0,
	code = "0000",
	breakers = { false, false, false },
	keypadFails = 0,
	participants = {}, -- [player] = { kills = 0 }
	completing = false,
}

local pickupFolder
local maya

-- Utility ------------------------------------------------------------------------------------
local function participants()
	local list = {}
	for player in pairs(session.participants) do
		if player.Parent then
			table.insert(list, player)
		end
	end
	return list
end

local function notifyAll(text, kind)
	for _, p in ipairs(participants()) do
		Net.fire("Notify", p, text, kind)
	end
end

local function sendObjective(player)
	local stage = STAGES[session.stage]
	if stage then
		Net.fire("Objective", player, stage.text, stage.target, session.stage)
	end
end

local function sendHint(player, hintId)
	local profile = Services.Data.get(player)
	if not hintId or not profile or profile.hintsSeen[hintId] or not profile.settings.tutorials then
		return
	end
	profile.hintsSeen[hintId] = true
	Net.fire("Hint", player, hintId)
end

local function checkpointPosition()
	local stage = STAGES[session.stage] or STAGES[1]
	local cp = Layout.Checkpoints[stage.checkpoint] or Layout.Checkpoints[1]
	return cp.position
end

local function grantStageEquipment(player)
	local stage = STAGES[session.stage]
	if not stage then
		return
	end
	for _, id in ipairs(stage.grants) do
		Services.Player.grantEquipment(player, id, true)
	end
end

function MissionService.getCode()
	return session.running and session.code or nil
end

function MissionService.getStage()
	return session.running and session.stage or 0
end

-- Maya NPC ----------------------------------------------------------------------------------------
local function buildMaya()
	local model
	local ok = pcall(function()
		local desc = Instance.new("HumanoidDescription")
		local skin = Color3.fromRGB(198, 140, 105)
		desc.HeadColor = skin
		desc.LeftArmColor = skin
		desc.RightArmColor = skin
		desc.TorsoColor = Color3.fromRGB(35, 50, 85) -- paramedic jacket
		desc.LeftLegColor = Color3.fromRGB(40, 40, 45)
		desc.RightLegColor = Color3.fromRGB(40, 40, 45)
		model = Players:CreateHumanoidModelFromDescription(desc, Enum.HumanoidRigType.R15)
	end)
	if not ok or not model then
		model = Instance.new("Model")
		local root = Instance.new("Part")
		root.Name = "HumanoidRootPart"
		root.Size = Vector3.new(2, 5, 1)
		root.Color = Color3.fromRGB(35, 50, 85)
		root.Parent = model
		local head = Instance.new("Part")
		head.Name = "Head"
		head.Size = Vector3.new(1.2, 1.2, 1.2)
		head.Color = Color3.fromRGB(198, 140, 105)
		head.CFrame = root.CFrame * CFrame.new(0, 3.1, 0)
		local w = Instance.new("WeldConstraint")
		w.Part0 = root
		w.Part1 = head
		w.Parent = head
		head.Parent = model
		Instance.new("Humanoid").Parent = model
		model.PrimaryPart = root
	end
	model.Name = "Maya"
	local humanoid = model:FindFirstChildOfClass("Humanoid")
	humanoid.DisplayName = "Maya"
	humanoid.DisplayDistanceType = Enum.HumanoidDisplayDistanceType.Viewer
	humanoid.NameDisplayDistance = 40
	humanoid.HealthDisplayType = Enum.HumanoidHealthDisplayType.AlwaysOff
	local root = model:FindFirstChild("HumanoidRootPart")
	root.Anchored = true
	-- red headband + bat (her weapon)
	local head = model:FindFirstChild("Head")
	if head then
		local band = Instance.new("Part")
		band.Name = "Headband"
		band.Size = Vector3.new(head.Size.X * 1.05, 0.25, head.Size.Z * 1.05)
		band.Color = Color3.fromRGB(190, 30, 30)
		band.CanCollide = false
		band.Massless = true
		band.CFrame = head.CFrame * CFrame.new(0, 0.25, 0)
		local w = Instance.new("WeldConstraint")
		w.Part0 = head
		w.Part1 = band
		w.Parent = band
		band.Parent = model
	end
	local hand = model:FindFirstChild("RightHand") or root
	local bat = Instance.new("Part")
	bat.Name = "Bat"
	bat.Size = Vector3.new(0.35, 3.6, 0.35)
	bat.Material = Enum.Material.Wood
	bat.Color = Color3.fromRGB(150, 110, 70)
	bat.CanCollide = false
	bat.Massless = true
	bat.CFrame = hand.CFrame * CFrame.new(0, -1.4, 0)
	local bw = Instance.new("WeldConstraint")
	bw.Part0 = hand
	bw.Part1 = bat
	bw.Parent = bat
	bat.Parent = model

	model.Parent = workspace:FindFirstChild("Interactables") or workspace
	local prompt = Services.Interaction.add(root, { action = "Talk", object = "Maya", distance = 10 }, function(player)
		MissionService.talkToMaya(player)
	end)
	prompt.Name = "TalkPrompt"
	return model
end

local function placeMaya(position, faceTowards)
	if not maya then
		return
	end
	local h = 3
	local hum = maya:FindFirstChildOfClass("Humanoid")
	if hum and hum.RigType == Enum.HumanoidRigType.R15 then
		h = hum.HipHeight + (maya:FindFirstChild("HumanoidRootPart").Size.Y / 2)
	end
	local pos = position + Vector3.new(0, h + 0.2, 0)
	maya:PivotTo(CFrame.lookAt(pos, Vector3.new(faceTowards.X, pos.Y, faceTowards.Z)))
end

-- Pickups ----------------------------------------------------------------------------------------------
local PICKUPS = {
	{ id = "flashlight", style = "flashlight", pos = P.Flashlight, kind = "equip" },
	{ id = "pipe", style = "pipe", pos = P.Pipe, kind = "equip" },
	{ id = "axe", style = "axe", pos = P.FireAxe, kind = "equip" },
	{ id = "patient_log", style = "document", pos = P.PatientLog, kind = "doc" },
	{ id = "shift_note", style = "document", pos = P.ShiftNote, kind = "doc" },
	{ id = "maintenance_memo", style = "document", pos = P.MaintenanceMemo, kind = "doc" },
	{ id = "evac_order", style = "document", pos = P.EvacOrder, kind = "doc" },
	{ id = "rf_01", style = "research", pos = P.ResearchFile1, kind = "doc" },
	{ id = "rf_02", style = "research", pos = P.ResearchFile2, kind = "doc" },
	{ id = "rf_03", style = "research", pos = P.ResearchFile3, kind = "doc" },
	{ id = "rf_04", style = "research", pos = P.ResearchFile4, kind = "doc" },
	{ id = "rf_05", style = "research", pos = P.ResearchFile5, kind = "doc" },
	{ id = "keycard_hospital", style = "keycard", pos = P.Keycard, kind = "party", removeFrom = 5 },
	{ id = "fuse", style = "fuse", pos = P.Fuse, kind = "party", removeFrom = 8 },
	{ id = "bandage_a", item = "bandage", style = "bandage", pos = P.Bandage1, kind = "consumable" },
	{ id = "bandage_b", item = "bandage", style = "bandage", pos = P.Bandage2, kind = "consumable" },
	{ id = "medkit_a", item = "medkit", style = "medkit", pos = P.Medkit1, kind = "consumable" },
}

local onStoryEvent -- forward declaration

local function readDocument(player, docId)
	local doc = Documents[docId]
	if not doc then
		return
	end
	local text = doc.text:gsub("{CODE}", session.code)
	Net.fire("ReadDocument", player, docId, doc.title, text)
end

local function createPickup(def)
	local model, main = Pickups.create(def.style, def.pos, pickupFolder, true)
	local objectName
	if def.kind == "doc" then
		objectName = Documents[def.id].title
	else
		local item = Items[def.item or def.id]
		objectName = item and item.name or def.id
	end
	local action = def.kind == "doc" and "Read" or "Take"
	Services.Interaction.add(main, { action = action, object = objectName, distance = 9, id = def.id, kind = def.kind }, function(player)
		if def.kind == "equip" then
			if Services.Player.grantEquipment(player, def.id) then
				Net.fire("Notify", player, "Picked up: " .. objectName, "good")
				onStoryEvent("got_" .. def.id, player)
			else
				Net.fire("Notify", player, "You already have the " .. objectName .. ".", "info")
			end
		elseif def.kind == "doc" then
			local isNew = Services.Rewards.collectDocument(player, def.id)
			readDocument(player, def.id)
			if isNew and Documents[def.id].kind == "research" then
				Net.fire("Notify", player, "Research file collected!", "reward")
			end
			onStoryEvent("doc_" .. def.id, player)
		elseif def.kind == "party" then
			Services.Inventory.addParty(def.id)
			model:Destroy()
			notifyAll(player.DisplayName .. " found the " .. objectName .. ".", "good")
			onStoryEvent("got_" .. def.id, player)
		elseif def.kind == "consumable" then
			if Services.Inventory.add(player, def.item, 1) then
				Net.fire("Notify", player, "Picked up: " .. objectName, "good")
				model:Destroy()
			end
		end
	end)
	return model
end

local function setupPickups(stageIndex)
	pickupFolder:ClearAllChildren()
	for _, def in ipairs(PICKUPS) do
		if not def.removeFrom or stageIndex < def.removeFrom then
			createPickup(def)
		end
	end
end

local dropCounter = 0
local function dropConsumable(itemId, position)
	dropCounter = dropCounter + 1
	local style = itemId == "medkit" and "medkit" or "bandage"
	local ground = position - Vector3.new(0, 2.6, 0)
	createPickup({ id = "drop_" .. dropCounter, item = itemId, style = style, pos = Vector3.new(ground.X, math.max(0.4, ground.Y), ground.Z), kind = "consumable" })
end

-- World state ----------------------------------------------------------------------------------------------
local function setLight(part, on)
	if part then
		part.Color = on and Color3.fromRGB(60, 255, 120) or Color3.fromRGB(255, 40, 40)
	end
end

local function setBreakerVisual(i, on)
	local lever = refs.city.breakerLevers[i]
	if lever then
		lever.Color = on and Color3.fromRGB(60, 220, 90) or Color3.fromRGB(200, 40, 40)
		local base = CFrame.new(P.BreakerPanel + Vector3.new(0.45, -0.6, (i - 2) * 1.8))
		lever.CFrame = on and (base * CFrame.new(0, 1.2, 0)) or base
	end
end

local function applyWorldState(stageIndex)
	for _, door in pairs(Doors.all()) do
		door:close()
	end
	if stageIndex >= 5 then
		Doors.get("security"):open(true)
	end
	if stageIndex >= 6 then
		Doors.get("lobby"):open(true)
	end
	if stageIndex >= 8 then
		Doors.get("armory"):open(true)
	end
	if stageIndex >= 10 then
		Doors.get("subway_gate"):open(true)
	end
	refs.hospital.chains.Transparency = stageIndex >= 6 and 1 or 0
	setLight(refs.hospital.keypad.Parent:FindFirstChild("KeypadLight"), stageIndex >= 5)
	setLight(refs.hospital.reader.Parent:FindFirstChild("ReaderLight"), stageIndex >= 6)
	setLight(refs.city.generatorLight, stageIndex >= 9)
	session.breakers = { false, false, false }
	for i = 1, 3 do
		setBreakerVisual(i, stageIndex >= 8 and i ~= 2)
	end
	local secretPrompt = refs.secretPrompt
	if secretPrompt then
		secretPrompt.Enabled = true
	end
	if stageIndex == 5 then
		Services.Inventory.addParty("keycard_hospital")
	elseif stageIndex == 8 then
		Services.Inventory.addParty("fuse")
	end
	if stageIndex >= 10 then
		placeMaya(P.MayaSubway, P.BossSpawn)
	else
		placeMaya(P.MayaSpot, P.Pharmacy)
	end
end

-- Stage flow ------------------------------------------------------------------------------------------------
local function spawnBoss()
	if Services.Zombies.countBosses() == 0 and session.stage == IDX.boss then
		Services.Zombies.spawn("Warden", P.BossSpawn, { aggro = true })
	end
end

local function advance(stageIndex)
	if not session.running or stageIndex <= session.stage then
		return
	end
	session.stage = stageIndex
	Services.Zombies.setStage(stageIndex)
	local stage = STAGES[stageIndex]
	for _, player in ipairs(participants()) do
		local profile = Services.Data.get(player)
		if profile then
			profile.chapters.ch1.checkpointStage = stageIndex
		end
		grantStageEquipment(player)
		sendObjective(player)
		sendHint(player, stage.hint)
		Services.sync(player)
	end
	notifyAll("Checkpoint reached", "checkpoint")
end

local function completeChapter()
	if session.completing then
		return
	end
	session.completing = true
	local elapsed = os.clock() - session.startedAt
	Services.Cinematic.play(participants(), "escape")
	for _, player in ipairs(participants()) do
		local profile = Services.Data.get(player)
		local pSession = Services.Player.getSession(player)
		if profile then
			local ch = profile.chapters.ch1
			ch.completed = true
			ch.completions = (ch.completions or 0) + 1
			ch.checkpointStage = 1
			if ch.bestTime == 0 or elapsed < ch.bestTime then
				ch.bestTime = math.floor(elapsed)
			end
			profile.highestChapter = math.max(profile.highestChapter, 2)
			profile.storyFlags.ch1Complete = true
			Services.Rewards.unlock(player, "chapter1")
			if pSession and not pSession.wentDown then
				Services.Rewards.unlock(player, "untouchable1")
			end
			if elapsed < 15 * 60 then
				Services.Rewards.unlock(player, "speedrunner1")
			end
			task.spawn(Services.Data.save, player, false)
		end
	end
	local length = Services.Cinematic.length("escape")
	task.delay(length + 0.5, function()
		for _, player in ipairs(participants()) do
			local profile = Services.Data.get(player)
			local found = 0
			if profile then
				for _, id in ipairs(Documents.ResearchChapter1) do
					if profile.documents[id] then
						found = found + 1
					end
				end
			end
			local data = session.participants[player]
			Net.fire("ChapterComplete", player, {
				chapter = 1,
				title = "The Outbreak",
				time = math.floor(elapsed),
				kills = data and data.kills or 0,
				files = found,
				filesTotal = #Documents.ResearchChapter1,
				trust = profile and profile.storyFlags.mayaTrust or 0,
			})
		end
		MissionService.endSession()
	end)
end

-- Story events ---------------------------------------------------------------------------------------------
onStoryEvent = function(event, player)
	local stage = session.stage
	if event == "got_flashlight" and stage == IDX.find_light then
		advance(IDX.find_weapon)
	elseif event == "got_pipe" and stage == IDX.find_weapon then
		advance(IDX.find_code)
		-- the first infected hears the noise from the corridor
		task.delay(1.5, function()
			Services.Zombies.spawn("Normal", Vector3.new(104, 0, 30), { aggro = true })
		end)
	elseif event == "doc_shift_note" and stage == IDX.find_code then
		advance(IDX.security)
	elseif event == "got_keycard_hospital" and stage == IDX.security then
		advance(IDX.lobby)
	elseif event == "got_fuse" and stage == IDX.fuse then
		advance(IDX.generator)
	elseif event == "got_axe" then
		Services.Rewards.unlock(player, "heavy_hitter")
	elseif event == "doc_cctv_log" then
		Net.fire("Shake", player, 0.2, 0.4)
	end
end

function MissionService.talkToMaya(player)
	if Services.Dialogue.isTalking(player) then
		return
	end
	Services.Rewards.unlock(player, "first_contact")
	if session.stage == IDX.survivor then
		Services.Cinematic.play({ player }, "meet_maya")
		task.delay(Services.Cinematic.length("meet_maya"), function()
			if player.Parent then
				Services.Dialogue.begin(player, "maya_intro")
			end
		end)
	elseif session.stage >= IDX.escape then
		Services.Dialogue.begin(player, "maya_gate")
	elseif session.stage > IDX.survivor then
		Services.Dialogue.begin(player, "maya_repeat")
	else
		Net.fire("Notify", player, "Maya is hiding. She doesn't trust you yet.", "info")
	end
end

-- Puzzles / interactables ---------------------------------------------------------------------------------------
local function setupInteractables()
	-- Security keypad
	Services.Interaction.add(refs.hospital.keypad, { action = "Enter Code", object = "Security Keypad", distance = 8 }, function(player)
		if Doors.get("security").isOpen then
			return
		end
		Net.fire("KeypadOpen", player, "security")
	end)

	Net.on("KeypadSubmit", function(player, doorId, code)
		if doorId ~= "security" or type(code) ~= "string" or #code ~= 4 or not session.running then
			return
		end
		local _, _, root = Services.Player.getParts(player)
		if not root or (root.Position - refs.hospital.keypad.Position).Magnitude > 16 then
			return
		end
		if Doors.get("security").isOpen then
			Net.fire("KeypadResult", player, true)
			return
		end
		if code == session.code then
			Doors.get("security"):open()
			setLight(refs.hospital.keypad.Parent:FindFirstChild("KeypadLight"), true)
			Net.fire("KeypadResult", player, true)
			Services.Rewards.unlock(player, "code_breaker")
			notifyAll("The security office is open.", "good")
			if session.stage < IDX.security then
				advance(IDX.security)
			end
		else
			session.keypadFails = session.keypadFails + 1
			Net.fire("KeypadResult", player, false)
		end
	end, 3)

	-- CCTV terminal
	Services.Interaction.add(refs.hospital.cctvScreen, { action = "View Footage", object = "CCTV Terminal", distance = 8, id = "cctv_log", kind = "doc" }, function(player)
		Services.Rewards.collectDocument(player, "cctv_log")
		readDocument(player, "cctv_log")
		onStoryEvent("doc_cctv_log", player)
	end)

	-- Lobby keycard reader
	Services.Interaction.add(refs.hospital.reader, { action = "Use Keycard", object = "Lobby Doors", distance = 8 }, function(player)
		if Doors.get("lobby").isOpen then
			return
		end
		if not Services.Inventory.hasParty("keycard_hospital") then
			Net.fire("Notify", player, "Requires a Security Keycard.", "info")
			return
		end
		Services.Inventory.consumeParty("keycard_hospital")
		Doors.get("lobby"):open()
		refs.hospital.chains.Transparency = 1
		setLight(refs.hospital.reader.Parent:FindFirstChild("ReaderLight"), true)
		Services.Cinematic.play(participants(), "lobby_open")
		advance(IDX.survivor)
	end)

	-- Secret bookshelf
	local shelf = Doors.get("secret_shelf")
	refs.secretPrompt = Services.Interaction.add(shelf.panels[1].part, { action = "Pull the red book", object = "Bookshelf", distance = 7, hold = 0.6 }, function(player)
		if shelf.isOpen then
			return
		end
		shelf:open()
		refs.secretPrompt.Enabled = false
		Services.Rewards.unlock(player, "secret_keeper")
		Net.fire("Notify", player, "A hidden room!", "reward")
	end)

	-- Breaker puzzle (correct: 1 and 3 up, 2 down - see the maintenance memo)
	for i, lever in ipairs(refs.city.breakerLevers) do
		Services.Interaction.add(lever, { action = "Flip", object = "Breaker " .. i, distance = 8 }, function(player)
			if Doors.get("armory").isOpen then
				return
			end
			session.breakers[i] = not session.breakers[i]
			setBreakerVisual(i, session.breakers[i])
			local b = session.breakers
			if b[2] then
				Net.fire("Notify", player, "An alarm buzzes from the cell block... breaker 2 trips back down.", "bad")
				task.delay(0.8, function()
					session.breakers[2] = false
					setBreakerVisual(2, false)
				end)
			elseif b[1] and b[3] then
				Doors.get("armory"):open()
				Services.Rewards.unlock(player, "electrician")
				notifyAll("Power restored - the armory door slides open.", "good")
			end
		end)
	end

	-- Generator
	local generator = refs.city.generatorLight
	Services.Interaction.add(generator, { action = "Install Fuse", object = "Generator", distance = 10 }, function(player)
		if session.stage ~= IDX.generator then
			if session.stage < IDX.generator then
				Net.fire("Notify", player, "The generator is missing a fuse.", "info")
			end
			return
		end
		if not Services.Inventory.consumeParty("fuse") then
			Net.fire("Notify", player, "You need a fuse from the police armory.", "info")
			return
		end
		setLight(generator, true)
		advance(IDX.boss)
		Services.Cinematic.play(participants(), "boss_reveal")
		task.delay(Services.Cinematic.length("boss_reveal") - 1, spawnBoss)
	end)
end

-- Session lifecycle ------------------------------------------------------------------------------------------
local function startSession(stageIndex)
	session.running = true
	session.completing = false
	session.stage = stageIndex
	session.startedAt = os.clock()
	session.code = string.format("%04d", math.random(1000, 9999))
	session.keypadFails = 0
	Services.Inventory.resetSession()
	setupPickups(stageIndex)
	Services.Zombies.clearAll()
	Services.Zombies.skipFixedBefore(stageIndex)
	applyWorldState(stageIndex)
	Services.Zombies.setEnabled(true)
	Services.Zombies.setStage(stageIndex)
	if stageIndex == IDX.boss then
		task.delay(4, spawnBoss)
	end
	print(("[Mission] Chapter 1 session started at stage %d (%s)"):format(stageIndex, STAGES[stageIndex].key))
end

function MissionService.endSession()
	session.running = false
	session.completing = false
	session.stage = 0
	Services.Zombies.setEnabled(false)
	Services.Zombies.clearAll()
	for player in pairs(session.participants) do
		if player.Parent then
			Services.Player.clearEquipment(player)
			Services.Player.despawn(player)
			Services.Inventory.resetPlayer(player)
			Services.sync(player)
		end
	end
	session.participants = {}
end

local function joinSession(player, isNewRun)
	session.participants[player] = { kills = 0 }
	local pSession = Services.Player.getSession(player)
	if pSession then
		pSession.wentDown = false
	end
	Services.Player.spawn(player, checkpointPosition())
	grantStageEquipment(player)
	sendObjective(player)
	Net.fire("PartyInventory", player, Services.Inventory.getParty())
	if session.stage == IDX.find_light and isNewRun then
		Services.Cinematic.play({ player }, "intro")
		Services.Rewards.unlock(player, "wake_up")
	end
	sendHint(player, "move")
	sendHint(player, STAGES[session.stage].hint)
	task.delay(25, function()
		if player.Parent then
			sendHint(player, "inventory")
		end
	end)
	Services.sync(player)
end

local function onRequestPlay(player, mode)
	if mode ~= "continue" and mode ~= "new" then
		return
	end
	local profile = Services.Data.get(player)
	if not profile or session.participants[player] or session.completing then
		return
	end
	local isNewRun = false
	if not session.running then
		local stageIndex = 1
		if mode == "continue" then
			stageIndex = math.clamp(math.floor(tonumber(profile.chapters.ch1.checkpointStage) or 1), 1, #STAGES)
		else
			profile.chapters.ch1.checkpointStage = 1
		end
		isNewRun = stageIndex == 1
		startSession(stageIndex)
	end
	joinSession(player, isNewRun)
end

function MissionService.respawn(player)
	if session.running and session.participants[player] then
		Services.Player.spawn(player, checkpointPosition())
		grantStageEquipment(player)
		sendObjective(player)
	else
		Services.Player.despawn(player)
		Net.fire("ShowMenu", player)
	end
end

local function leaveSession(player)
	if not session.participants[player] then
		return
	end
	session.participants[player] = nil
	if session.running and #participants() == 0 then
		MissionService.endSession()
	end
end

-- Escape trigger --------------------------------------------------------------------------------------------
local escapeAccumulator = 0
local function escapeCheck(dt)
	escapeAccumulator = escapeAccumulator + dt
	if escapeAccumulator < 0.5 then
		return
	end
	escapeAccumulator = 0
	if not session.running or session.stage ~= IDX.escape or session.completing then
		return
	end
	for _, player in ipairs(participants()) do
		local _, humanoid, root = Services.Player.getParts(player)
		if root and humanoid.Health > 0 then
			local flat = Vector3.new(root.Position.X - P.EscapeZone.X, 0, root.Position.Z - P.EscapeZone.Z)
			if flat.Magnitude < 7 then
				completeChapter()
				return
			end
		end
	end
end

function MissionService.init(services)
	Services = services
end

function MissionService.start(worldRefs)
	refs = worldRefs
	pickupFolder = Instance.new("Folder")
	pickupFolder.Name = "Pickups"
	pickupFolder.Parent = worldRefs.interactables
	maya = buildMaya()
	setupInteractables()
	applyWorldState(1)

	Services.Dialogue.onEvent(function(player, event)
		if event == "maya_done" and session.stage == IDX.survivor then
			advance(IDX.fuse)
		end
	end)

	Services.Zombies.onKilled(function(typeName, killer, position, def)
		if killer and killer.Parent then
			Services.Rewards.addStat(killer, "zombiesDefeated", 1)
			local data = session.participants[killer]
			if data then
				data.kills = data.kills + 1
			end
		end
		if not session.running then
			return
		end
		if def.boss then
			dropConsumable("medkit", position)
			if session.stage == IDX.boss then
				for _, p in ipairs(participants()) do
					Services.Rewards.unlock(p, "warden_down")
				end
				Doors.get("subway_gate"):open()
				placeMaya(P.MayaSubway, P.BossSpawn)
				notifyAll("The Warden is down! The subway gate is open.", "good")
				advance(IDX.escape)
			end
		elseif math.random() < (typeName == "Heavy" and 0.5 or 0.1) then
			dropConsumable("bandage", position)
		end
	end)

	Net.on("RequestPlay", onRequestPlay, 2)
	Net.on("ReturnToMenu", function(player)
		if session.participants[player] then
			leaveSession(player)
			Services.Player.clearEquipment(player)
			Services.Player.despawn(player)
			Services.Inventory.resetPlayer(player)
			Services.sync(player)
			Net.fire("ShowMenu", player)
		end
	end, 2)
	Players.PlayerRemoving:Connect(leaveSession)
	RunService.Heartbeat:Connect(escapeCheck)

	-- sanity check: every cinematic referenced by the mission exists
	for _, id in ipairs({ "intro", "lobby_open", "meet_maya", "boss_reveal", "escape" }) do
		assert(Cinematics[id], "Missing cinematic " .. id)
	end
end

return MissionService
