--[[
	Menu - main menu (PLAY, CHAPTERS, INVENTORY, SETTINGS, SHOP, DAILY,
	INVITE, CREDITS), pause menu, chapter-complete summary.
	A slow cinematic camera drifts over the ruined city behind the menu.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local SocialService = game:GetService("SocialService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))
local Layout = require(Shared:WaitForChild("Layout"))
local Chapters = require(Shared:WaitForChild("Chapters"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))
local Config = require(Shared:WaitForChild("Config"))
local Util = require(Shared:WaitForChild("Util"))

local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))
local Effects = require(script.Parent:WaitForChild("Effects"))

local Menu = {}
local T = UI.Theme
local player = Players.LocalPlayer

local gui, root, playPanel, continueButton, statusLabel, dailyButton
local chaptersOverlay, chaptersBody
local settingsOverlay, settingsBody
local shopOverlay, shopBody
local creditsOverlay
local pauseOverlay
local summaryOverlay, summaryBody
local openInventory -- set by ClientMain
local cameraConn

-- Menu camera ------------------------------------------------------------------------------
local function startCamera()
	if cameraConn then
		return
	end
	local camera = workspace.CurrentCamera
	camera.CameraType = Enum.CameraType.Scriptable
	camera.FieldOfView = 55
	local started = os.clock()
	cameraConn = RunService.RenderStepped:Connect(function()
		local t = os.clock() - started
		local base = Layout.MenuCamera.position
		local offset = Vector3.new(math.sin(t * 0.05) * 25, math.sin(t * 0.13) * 2, math.cos(t * 0.05) * 10)
		camera.CFrame = CFrame.lookAt(base + offset, Layout.MenuCamera.lookAt)
	end)
end

local function stopCamera()
	if cameraConn then
		cameraConn:Disconnect()
		cameraConn = nil
	end
	local camera = workspace.CurrentCamera
	camera.FieldOfView = 70
	camera.CameraType = Enum.CameraType.Custom
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		camera.CameraSubject = humanoid
	end
end

-- Visibility -----------------------------------------------------------------------------------
function Menu.show()
	State.inMenu = true
	State.emit("menu", true)
	root.Visible = true
	playPanel.Visible = false
	pauseOverlay.Visible = false
	startCamera()
	Effects.setMusic("MusicMenu")
end

function Menu.hide()
	State.inMenu = false
	State.emit("menu", false)
	root.Visible = false
	stopCamera()
	Effects.setMusic("MusicTension")
end

local function requestPlay(mode)
	Menu.hide()
	chaptersOverlay.Visible = false
	summaryOverlay.Visible = false
	Net.get("RequestPlay"):FireServer(mode)
	-- safety net: if the server could not start (e.g. chapter ending), return to menu
	task.delay(10, function()
		if not State.inMenu and not player.Character then
			Menu.show()
		end
	end)
end

local function refreshProfile(p)
	local ch = p.chapters and p.chapters.ch1
	local stage = ch and ch.checkpointStage or 1
	local cpName = "Ward 3B"
	local st = Chapters.Chapter1[stage]
	if st then
		cpName = Layout.Checkpoints[st.checkpoint].name
	end
	continueButton.Text = stage > 1 and ("CONTINUE  -  " .. cpName) or "START CHAPTER 1"
	local lines = {}
	if p.memoryMode then
		table.insert(lines, "Studio test mode: progress is NOT saved (enable API access to test saving).")
	end
	if ch and ch.completed then
		table.insert(lines, ("Chapter 1 complete x%d  |  Best time %s"):format(ch.completions or 1, Util.formatTime(ch.bestTime)))
	end
	table.insert(lines, Config.Version)
	statusLabel.Text = table.concat(lines, "\n")
	dailyButton.Text = p.dailyAvailable and "DAILY REWARD  (READY!)" or "DAILY REWARD"
	dailyButton.TextColor3 = p.dailyAvailable and T.Accent or T.Text
end

-- Sub screens --------------------------------------------------------------------------------------
local function buildChapters()
	chaptersOverlay, chaptersBody = UI.modal(gui, "CHAPTERS", 760, 560)
	local scroll = UI.scroll({ Size = UDim2.fromScale(1, 1), Parent = chaptersBody })
	UI.list(Enum.FillDirection.Vertical, 8).Parent = scroll
	for i, ch in ipairs(Chapters.List) do
		local card = UI.panel({ Size = UDim2.new(1, -10, 0, 84), BackgroundColor3 = T.PanelLight, LayoutOrder = i, Parent = scroll })
		UI.padding(12).Parent = card
		UI.label({ Size = UDim2.new(1, -170, 0, 26), Text = ("CHAPTER %d - %s"):format(ch.number, string.upper(ch.title)), Font = T.FontBlack, TextSize = 19, TextColor3 = ch.playable and T.Text or T.SubText, Parent = card })
		UI.label({ Size = UDim2.new(1, -170, 0, 22), Position = UDim2.fromOffset(0, 30), Text = ch.subtitle, TextSize = 15, TextColor3 = T.SubText, Parent = card })
		if ch.playable then
			UI.button({ Text = "PLAY", Size = UDim2.fromOffset(150, 46), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Style = "primary", Parent = card }, function()
				requestPlay("new")
			end)
		else
			UI.label({ Size = UDim2.fromOffset(150, 46), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Text = "IN DEVELOPMENT", TextSize = 14, Font = T.FontBold, TextColor3 = T.SubText, TextXAlignment = Enum.TextXAlignment.Center, Parent = card })
		end
	end
end

local settingsState = {}
local function buildSettings()
	settingsOverlay, settingsBody = UI.modal(gui, "SETTINGS", 640, 520, function()
		Net.get("SaveSettings"):FireServer(settingsState)
	end)
	local scroll = UI.scroll({ Size = UDim2.fromScale(1, 1), Parent = settingsBody })
	UI.list(Enum.FillDirection.Vertical, 8).Parent = scroll
	local rows = {}

	local function addRow(order, label, getText, onPress)
		local r = UI.panel({ Size = UDim2.new(1, -10, 0, 58), BackgroundColor3 = T.PanelLight, LayoutOrder = order, Parent = scroll })
		UI.padding(10).Parent = r
		UI.label({ Size = UDim2.new(0.5, 0, 1, 0), Text = label, Font = T.FontBold, Parent = r })
		local btn = UI.button({ Text = getText(), Size = UDim2.fromOffset(200, 40), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Parent = r }, function(b)
			onPress()
			b.Text = getText()
		end)
		table.insert(rows, function()
			btn.Text = getText()
		end)
	end

	local graphics = { "Auto", "Low", "Medium", "High" }
	addRow(1, "Graphics quality", function()
		return settingsState.graphics or "Auto"
	end, function()
		local i = table.find(graphics, settingsState.graphics or "Auto") or 1
		settingsState.graphics = graphics[(i % #graphics) + 1]
		Effects.applyGraphics(settingsState.graphics)
	end)
	local function volumeRow(order, key, label)
		addRow(order, label, function()
			return ("%d%%"):format(math.floor((settingsState[key] or 0) * 100 + 0.5))
		end, function()
			local v = (settingsState[key] or 0) + 0.2
			if v > 1.01 then
				v = 0
			end
			settingsState[key] = math.clamp(v, 0, 1)
			if State.profile then
				State.profile.settings[key] = settingsState[key]
			end
		end)
	end
	volumeRow(2, "music", "Music volume")
	volumeRow(3, "sfx", "Effects volume")
	local function toggleRow(order, key, label)
		addRow(order, label, function()
			return settingsState[key] and "ON" or "OFF"
		end, function()
			settingsState[key] = not settingsState[key]
			if State.profile then
				State.profile.settings[key] = settingsState[key]
			end
		end)
	end
	toggleRow(4, "subtitles", "Subtitles")
	toggleRow(5, "cameraShake", "Camera shake")
	toggleRow(6, "tutorials", "Tutorial hints")

	State.on("profile", function(p)
		if p.settings and not settingsOverlay.Visible then
			for k, v in pairs(p.settings) do
				settingsState[k] = v
			end
			for _, refresh in ipairs(rows) do
				refresh()
			end
		end
	end)
end

local function buildShop()
	shopOverlay, shopBody = UI.modal(gui, "SHOP - COSMETICS ONLY", 700, 540)
	local note = UI.label({ Size = UDim2.new(1, 0, 0, 40), Text = "Everything here is cosmetic. The full story, every chapter and all gameplay are free for everyone.", TextSize = 14, TextColor3 = T.SubText, Parent = shopBody })
	local scroll = UI.scroll({ Size = UDim2.new(1, 0, 1, -48), Position = UDim2.fromOffset(0, 48), Parent = shopBody })
	UI.list(Enum.FillDirection.Vertical, 8).Parent = scroll
	local function render(p)
		for _, c in ipairs(scroll:GetChildren()) do
			if c:IsA("Frame") then
				c:Destroy()
			end
		end
		local catalog = p.catalog or {}
		if #catalog == 0 then
			local empty = UI.panel({ Size = UDim2.new(1, -10, 0, 70), BackgroundColor3 = T.PanelLight, Parent = scroll })
			UI.padding(12).Parent = empty
			UI.label({ Size = UDim2.fromScale(1, 1), Text = "The shop is not open yet. (Developer: add Game Pass / Product IDs in Config.lua)", TextColor3 = T.SubText, Parent = empty })
			return
		end
		for i, item in ipairs(catalog) do
			local card = UI.panel({ Size = UDim2.new(1, -10, 0, 78), BackgroundColor3 = T.PanelLight, LayoutOrder = i, Parent = scroll })
			UI.padding(12).Parent = card
			UI.label({ Size = UDim2.new(1, -170, 0, 24), Text = item.name, Font = T.FontBlack, TextSize = 18, Parent = card })
			local names = {}
			for _, id in ipairs(item.cosmetics or {}) do
				table.insert(names, Cosmetics[id] and Cosmetics[id].name or id)
			end
			UI.label({ Size = UDim2.new(1, -170, 0, 30), Position = UDim2.fromOffset(0, 26), Text = table.concat(names, ", "), TextSize = 14, TextColor3 = T.SubText, Parent = card })
			local owned = item.gamepass and p.vip
			UI.button({
				Text = owned and "OWNED" or (item.gamepass and "GET VIP" or ("R$ " .. tostring(item.price or ""))),
				Size = UDim2.fromOffset(150, 44),
				Position = UDim2.new(1, 0, 0.5, 0),
				AnchorPoint = Vector2.new(1, 0.5),
				Style = owned and "ghost" or "primary",
				Parent = card,
			}, function()
				if not owned then
					Net.get("BuyProduct"):FireServer(item.key)
				end
			end)
		end
	end
	note.LayoutOrder = 0
	State.on("profile", render)
end

local function buildCredits()
	local body
	creditsOverlay, body = UI.modal(gui, "CREDITS", 600, 460)
	local scroll = UI.scroll({ Size = UDim2.fromScale(1, 1), Parent = body })
	UI.label({
		Size = UDim2.new(1, -12, 0, 0),
		AutomaticSize = Enum.AutomaticSize.Y,
		TextSize = 17,
		Text = "PROJECT: ZERO\n\nAn original story-driven survival adventure.\n\n"
			.. "Story, design, code and world: built procedurally from original code - no third-party models.\n"
			.. "Animations: Roblox standard animation packages.\n"
			.. "Sounds: Roblox built-in sound library.\n\n"
			.. "Characters: Maya Torres, Dr. Elias Voss, The Warden.\n\n"
			.. "Thank you for playing. Chapter 2 is in development.",
		Parent = scroll,
	})
end

local function buildPause()
	local body
	pauseOverlay, body = UI.modal(gui, "PAUSED", 400, 380, function()
		State.modalOpen = false
		State.emit("modal", false)
	end)
	pauseOverlay.ZIndex = 9
	UI.list(Enum.FillDirection.Vertical, 10, Enum.HorizontalAlignment.Center).Parent = body
	UI.button({ Text = "RESUME", Size = UDim2.new(1, 0, 0, 52), Style = "primary", LayoutOrder = 1, Parent = body }, function()
		pauseOverlay.Visible = false
		State.modalOpen = false
		State.emit("modal", false)
	end)
	UI.button({ Text = "SETTINGS", Size = UDim2.new(1, 0, 0, 52), LayoutOrder = 2, Parent = body }, function()
		settingsOverlay.Visible = true
	end)
	UI.button({ Text = "INVITE FRIENDS", Size = UDim2.new(1, 0, 0, 52), LayoutOrder = 3, Parent = body }, function()
		Menu.invite()
	end)
	UI.button({ Text = "QUIT TO MAIN MENU", Size = UDim2.new(1, 0, 0, 52), Style = "danger", LayoutOrder = 4, Parent = body }, function()
		pauseOverlay.Visible = false
		State.modalOpen = false
		State.emit("modal", false)
		Net.get("ReturnToMenu"):FireServer()
	end)
	-- pause overlay sits on its own gui so it can show during gameplay
end

local function buildSummary()
	summaryOverlay, summaryBody = UI.modal(gui, "CHAPTER COMPLETE", 620, 480, function()
		Menu.show()
	end)
	Net.get("ChapterComplete").OnClientEvent:Connect(function(s)
		for _, c in ipairs(summaryBody:GetChildren()) do
			c:Destroy()
		end
		UI.list(Enum.FillDirection.Vertical, 8).Parent = summaryBody
		local function line(text, color, order, size)
			UI.label({ Size = UDim2.new(1, 0, 0, size or 28), Text = text, TextSize = size and 22 or 18, Font = size and T.FontBlack or T.Font, TextColor3 = color or T.Text, LayoutOrder = order, Parent = summaryBody })
		end
		line(("CHAPTER %d: %s"):format(s.chapter, string.upper(s.title)), T.Accent, 1, 34)
		line("Time: " .. Util.formatTime(s.time), nil, 2)
		line("Infected stopped: " .. tostring(s.kills), nil, 3)
		line(("Research files: %d / %d"):format(s.files, s.filesTotal), nil, 4)
		local trustText = s.trust >= 3 and "Maya trusts you completely." or (s.trust >= 1 and "Maya trusts you." or "Maya is still wary of you.")
		line(trustText, T.SubText, 5)
		line("Your choices are saved and will matter in later chapters.", T.SubText, 6)
		local row = UI.new("Frame", { Size = UDim2.new(1, 0, 0, 56), BackgroundTransparency = 1, LayoutOrder = 7, Parent = summaryBody })
		UI.list(Enum.FillDirection.Horizontal, 10).Parent = row
		UI.button({ Text = "REPLAY CHAPTER", Size = UDim2.fromOffset(260, 52), Style = "primary", LayoutOrder = 1, Parent = row }, function()
			requestPlay("new")
		end)
		UI.button({ Text = "MAIN MENU", Size = UDim2.fromOffset(260, 52), LayoutOrder = 2, Parent = row }, function()
			summaryOverlay.Visible = false
			Menu.show()
		end)
		State.inMenu = true
		State.emit("menu", true)
		summaryOverlay.Visible = true
		startCamera()
	end)
end

function Menu.invite()
	local ok, canInvite = pcall(function()
		return SocialService:CanSendGameInviteAsync(player)
	end)
	if ok and canInvite then
		pcall(function()
			SocialService:PromptGameInvite(player)
		end)
	end
end

function Menu.openPause()
	pauseOverlay.Visible = true
	State.modalOpen = true
	State.emit("modal", true)
end

function Menu.setInventoryOpener(fn)
	openInventory = fn
end

local function build()
	gui = UI.screen("PZ_Menu", 40, true)
	root = UI.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundTransparency = 1, Visible = false, Parent = gui })
	local shade = UI.new("Frame", { Size = UDim2.fromScale(0.55, 1), BackgroundColor3 = Color3.new(0, 0, 0), BorderSizePixel = 0, Parent = root })
	UI.new("UIGradient", { Transparency = NumberSequence.new(0.1, 1), Parent = shade })

	local column = UI.new("Frame", { Size = UDim2.new(0, 360, 1, -60), Position = UDim2.fromOffset(60, 30), BackgroundTransparency = 1, Parent = root })
	UI.label({ Size = UDim2.new(1, 0, 0, 64), Text = "PROJECT: ZERO", Font = T.FontBlack, TextSize = 52, Parent = column })
	UI.label({ Size = UDim2.new(1, 0, 0, 24), Position = UDim2.fromOffset(2, 64), Text = "THE CURE WAS NEVER MEANT FOR THIS YEAR", TextSize = 13, Font = T.FontBold, TextColor3 = T.Accent, Parent = column })

	local buttons = UI.new("Frame", { Size = UDim2.new(1, 0, 1, -170), Position = UDim2.fromOffset(0, 110), BackgroundTransparency = 1, Parent = column })
	UI.list(Enum.FillDirection.Vertical, 6).Parent = buttons
	local function menuButton(order, text, style, cb)
		return UI.button({ Text = text, Size = UDim2.new(1, 0, 0, 42), Style = style, LayoutOrder = order, TextSize = 18, Parent = buttons }, cb)
	end
	menuButton(1, "PLAY", "primary", function()
		playPanel.Visible = not playPanel.Visible
	end)
	menuButton(2, "CHAPTERS", "secondary", function()
		chaptersOverlay.Visible = true
	end)
	menuButton(3, "INVENTORY", "secondary", function()
		if openInventory then
			openInventory()
		end
	end)
	menuButton(4, "SETTINGS", "secondary", function()
		settingsOverlay.Visible = true
	end)
	menuButton(5, "SHOP", "secondary", function()
		shopOverlay.Visible = true
	end)
	dailyButton = menuButton(6, "DAILY REWARD", "secondary", function()
		Net.get("ClaimDaily"):FireServer()
	end)
	menuButton(7, "INVITE FRIENDS", "secondary", Menu.invite)
	menuButton(8, "CREDITS", "ghost", function()
		creditsOverlay.Visible = true
	end)

	playPanel = UI.panel({ Size = UDim2.fromOffset(360, 130), Position = UDim2.new(0, 440, 0, 140), Visible = false, Parent = root })
	UI.padding(12).Parent = playPanel
	UI.list(Enum.FillDirection.Vertical, 8).Parent = playPanel
	continueButton = UI.button({ Text = "START CHAPTER 1", Size = UDim2.new(1, 0, 0, 48), Style = "primary", LayoutOrder = 1, Parent = playPanel }, function()
		requestPlay("continue")
	end)
	UI.button({ Text = "NEW GAME (restart Chapter 1)", Size = UDim2.new(1, 0, 0, 44), LayoutOrder = 2, Parent = playPanel }, function()
		requestPlay("new")
	end)

	statusLabel = UI.label({ Size = UDim2.new(0, 520, 0, 60), Position = UDim2.new(0, 60, 1, -20), AnchorPoint = Vector2.new(0, 1), TextSize = 13, TextColor3 = T.SubText, TextYAlignment = Enum.TextYAlignment.Bottom, Parent = root })

	buildChapters()
	buildSettings()
	buildShop()
	buildCredits()
	buildPause()
	buildSummary()
end

function Menu.init()
	build()
	State.on("profile", refreshProfile)
	Net.get("ShowMenu").OnClientEvent:Connect(function()
		if not summaryOverlay.Visible then
			Menu.show()
		end
	end)
	player.CharacterAdded:Connect(function()
		if not State.inMenu and not State.inCinematic then
			task.defer(function()
				if not State.inCinematic and not State.inMenu then
					stopCamera()
				end
			end)
		end
	end)
	-- show immediately (profile arrives shortly after)
	Menu.show()
end

return Menu
