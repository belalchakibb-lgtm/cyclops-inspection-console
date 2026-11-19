--[[
	Inventory - BAG screen with four tabs:
	  ITEMS  consumables (use), equipment and shared party key items
	  FILES  story documents and hidden research files (readable)
	  STYLE  cosmetics (equip) and emotes (play)
	  AWARDS achievements
	Also hosts the document reader used when a file is picked up.
]]

local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Net = require(Shared:WaitForChild("Net"))
local Items = require(Shared:WaitForChild("Items"))
local Documents = require(Shared:WaitForChild("Documents"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))
local Achievements = require(Shared:WaitForChild("Achievements"))
local Config = require(Shared:WaitForChild("Config"))

local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local Inventory = {}
local T = UI.Theme
local player = Players.LocalPlayer

local gui, overlay, body, content, tabButtons
local readerOverlay, readerTitle, readerText
local currentTab = "ITEMS"

local function clear()
	for _, c in ipairs(content:GetChildren()) do
		if not c:IsA("UIListLayout") then
			c:Destroy()
		end
	end
end

local function row(height, order)
	local f = UI.panel({ Size = UDim2.new(1, -10, 0, height or 64), BackgroundColor3 = T.PanelLight, BackgroundTransparency = 0.2, LayoutOrder = order or 0, Parent = content })
	UI.padding(10).Parent = f
	return f
end

local function header(text, order)
	UI.label({ Size = UDim2.new(1, 0, 0, 26), Text = text, Font = T.FontBlack, TextSize = 15, TextColor3 = T.Accent, LayoutOrder = order, Parent = content })
end

function Inventory.read(title, text)
	readerTitle.Text = title
	readerText.Text = text
	readerOverlay.Visible = true
	State.modalOpen = true
	State.emit("modal", true)
end

local function docText(id)
	local doc = Documents[id]
	local profile = State.profile
	local code = profile and profile.code or "????"
	return (doc.text:gsub("{CODE}", code or "????"))
end

local function playEmote(cosmeticId)
	local def = Cosmetics[cosmeticId]
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	local animator = humanoid and humanoid:FindFirstChildOfClass("Animator")
	local animId = def and Config.Animations.Emotes[def.anim]
	if not animator or not animId then
		return
	end
	local anim = Instance.new("Animation")
	anim.AnimationId = animId
	local ok, track = pcall(function()
		return animator:LoadAnimation(anim)
	end)
	if ok and track then
		track.Priority = Enum.AnimationPriority.Action
		track:Play()
	end
end

local renderers = {}

renderers.ITEMS = function(profile)
	local order = 0
	local function nextOrder()
		order = order + 1
		return order
	end
	header("SUPPLIES", nextOrder())
	local any = false
	for id, count in pairs(profile.inventory or {}) do
		local def = Items[id]
		if def and count > 0 then
			any = true
			local r = row(64, nextOrder())
			UI.label({ Size = UDim2.new(1, -120, 0, 22), Text = def.name .. "  x" .. count, Font = T.FontBold, Parent = r })
			UI.label({ Size = UDim2.new(1, -120, 0, 20), Position = UDim2.fromOffset(0, 22), Text = def.description, TextSize = 14, TextColor3 = T.SubText, Parent = r })
			UI.button({ Text = "USE", Size = UDim2.fromOffset(100, 40), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Style = "primary", Parent = r }, function()
				Net.get("UseItem"):FireServer(id)
			end)
		end
	end
	if not any then
		UI.label({ Size = UDim2.new(1, 0, 0, 24), Text = "No supplies. Search rooms for bandages and medkits.", TextColor3 = T.SubText, TextSize = 15, LayoutOrder = nextOrder(), Parent = content })
	end
	header("EQUIPMENT", nextOrder())
	for id in pairs(profile.equipment or {}) do
		local def = Items[id]
		if def then
			local r = row(56, nextOrder())
			UI.label({ Size = UDim2.new(1, 0, 0, 20), Text = def.name, Font = T.FontBold, Parent = r })
			UI.label({ Size = UDim2.new(1, 0, 0, 18), Position = UDim2.fromOffset(0, 20), Text = def.description, TextSize = 14, TextColor3 = T.SubText, Parent = r })
		end
	end
	header("PARTY KEY ITEMS (shared with your team)", nextOrder())
	local anyKey = false
	for id, count in pairs(State.party or {}) do
		local def = Items[id]
		if def and count > 0 then
			anyKey = true
			local r = row(56, nextOrder())
			UI.label({ Size = UDim2.new(1, 0, 0, 20), Text = def.name, Font = T.FontBold, TextColor3 = def.color, Parent = r })
			UI.label({ Size = UDim2.new(1, 0, 0, 18), Position = UDim2.fromOffset(0, 20), Text = def.description, TextSize = 14, TextColor3 = T.SubText, Parent = r })
		end
	end
	if not anyKey then
		UI.label({ Size = UDim2.new(1, 0, 0, 24), Text = "None.", TextColor3 = T.SubText, TextSize = 15, LayoutOrder = nextOrder(), Parent = content })
	end
end

renderers.FILES = function(profile)
	local found = 0
	for i, id in ipairs(Documents.Order) do
		local doc = Documents[id]
		local owned = profile.documents and profile.documents[id]
		if doc.kind == "research" and owned then
			found = found + 1
		end
		local r = row(56, i + 1)
		local label = owned and doc.title or (doc.kind == "research" and "??? Hidden research file" or "??? Not found yet")
		UI.label({ Size = UDim2.new(1, -120, 1, 0), Text = label, Font = owned and T.FontBold or T.Font, TextColor3 = owned and (doc.kind == "research" and T.Accent or T.Text) or T.SubText, Parent = r })
		if owned then
			UI.button({ Text = "READ", Size = UDim2.fromOffset(100, 38), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Parent = r }, function()
				Inventory.read(doc.title, docText(id))
			end)
		end
	end
	header(("RESEARCH FILES FOUND: %d / %d"):format(found, #Documents.ResearchChapter1), 1)
end

renderers.STYLE = function(profile)
	local order = 0
	local owned = profile.cosmetics and profile.cosmetics.owned or {}
	local equipped = profile.cosmetics and profile.cosmetics.equipped or {}
	for _, category in ipairs(Cosmetics.Categories) do
		order = order + 1
		header(string.upper(Cosmetics.CategoryNames[category]), order)
		local ids = {}
		for id, def in pairs(Cosmetics) do
			if type(def) == "table" and def.category == category then
				table.insert(ids, id)
			end
		end
		table.sort(ids)
		for _, id in ipairs(ids) do
			local def = Cosmetics[id]
			order = order + 1
			local r = row(52, order)
			local has = owned[id] == true
			local sourceText = ({ default = "Default", daily = "Daily reward", achievement = "Achievement reward", vip = "VIP", product = "Shop" })[def.source] or ""
			UI.label({ Size = UDim2.new(1, -130, 0, 20), Text = def.name, Font = T.FontBold, TextColor3 = has and (def.color or T.Text) or T.SubText, Parent = r })
			UI.label({ Size = UDim2.new(1, -130, 0, 16), Position = UDim2.fromOffset(0, 20), Text = has and sourceText or ("Locked - " .. sourceText), TextSize = 13, TextColor3 = T.SubText, Parent = r })
			if has then
				local isEquipped = equipped[category] == id
				if category == "emote" then
					UI.button({ Text = "PLAY", Size = UDim2.fromOffset(110, 36), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Parent = r }, function()
						playEmote(id)
					end)
				else
					UI.button({ Text = isEquipped and "EQUIPPED" or "EQUIP", Size = UDim2.fromOffset(110, 36), Position = UDim2.new(1, 0, 0.5, 0), AnchorPoint = Vector2.new(1, 0.5), Style = isEquipped and "ghost" or "primary", Parent = r }, function()
						Net.get("EquipCosmetic"):FireServer(id)
					end)
				end
			end
		end
	end
end

renderers.AWARDS = function(profile)
	local ids = {}
	for id in pairs(Achievements) do
		table.insert(ids, id)
	end
	table.sort(ids, function(a, b)
		return Achievements[a].order < Achievements[b].order
	end)
	local got = 0
	for i, id in ipairs(ids) do
		local def = Achievements[id]
		local has = profile.achievements and profile.achievements[id] ~= nil
		if has then
			got = got + 1
		end
		local r = row(56, i + 1)
		UI.label({ Size = UDim2.new(1, 0, 0, 20), Text = (has and "[X] " or "[  ] ") .. def.name, Font = T.FontBold, TextColor3 = has and T.Accent or T.SubText, Parent = r })
		local rewardText = def.reward and Cosmetics[def.reward] and ("  - Reward: " .. Cosmetics[def.reward].name) or ""
		UI.label({ Size = UDim2.new(1, 0, 0, 18), Position = UDim2.fromOffset(0, 20), Text = def.description .. rewardText, TextSize = 14, TextColor3 = T.SubText, Parent = r })
	end
	header(("ACHIEVEMENTS: %d / %d"):format(got, #ids), 1)
end

local function render()
	if not overlay.Visible or not State.profile then
		return
	end
	clear()
	for name, btn in pairs(tabButtons) do
		btn.BackgroundColor3 = name == currentTab and T.Accent or T.PanelLight
		btn.TextColor3 = name == currentTab and Color3.fromRGB(20, 20, 20) or T.Text
	end
	renderers[currentTab](State.profile)
end

function Inventory.open(tab)
	currentTab = tab or currentTab
	overlay.Visible = true
	State.modalOpen = true
	State.emit("modal", true)
	render()
end

function Inventory.close()
	overlay.Visible = false
	State.modalOpen = false
	State.emit("modal", false)
end

function Inventory.toggle()
	if overlay.Visible then
		Inventory.close()
	else
		Inventory.open()
	end
end

function Inventory.init()
	gui = UI.screen("PZ_Inventory", 45)
	overlay, body = UI.modal(gui, "BAG", 820, 560, function()
		State.modalOpen = false
		State.emit("modal", false)
	end)
	local tabs = UI.new("Frame", { Size = UDim2.new(1, 0, 0, 44), BackgroundTransparency = 1, Parent = body })
	UI.list(Enum.FillDirection.Horizontal, 8).Parent = tabs
	tabButtons = {}
	for i, name in ipairs({ "ITEMS", "FILES", "STYLE", "AWARDS" }) do
		tabButtons[name] = UI.button({ Text = name, Size = UDim2.fromOffset(130, 40), LayoutOrder = i, Parent = tabs }, function()
			currentTab = name
			render()
		end)
	end
	content = UI.scroll({ Size = UDim2.new(1, 0, 1, -54), Position = UDim2.fromOffset(0, 54), Parent = body })
	UI.list(Enum.FillDirection.Vertical, 6).Parent = content

	-- document reader
	local readerBody
	readerOverlay, readerBody = UI.modal(gui, "DOCUMENT", 700, 520, function()
		if not overlay.Visible then
			State.modalOpen = false
			State.emit("modal", false)
		end
	end)
	readerOverlay.ZIndex = 20
	readerTitle = UI.label({ Size = UDim2.new(1, 0, 0, 30), Font = T.FontBlack, TextSize = 20, Parent = readerBody })
	local scroll = UI.scroll({ Size = UDim2.new(1, 0, 1, -40), Position = UDim2.fromOffset(0, 40), Parent = readerBody })
	readerText = UI.label({ Size = UDim2.new(1, -16, 0, 0), AutomaticSize = Enum.AutomaticSize.Y, Font = Enum.Font.SourceSans, TextSize = 21, TextYAlignment = Enum.TextYAlignment.Top, TextColor3 = Color3.fromRGB(225, 220, 205), Parent = scroll })

	State.on("profile", render)
	State.on("party", render)
	Net.get("ReadDocument").OnClientEvent:Connect(function(_, title, text)
		Inventory.read(title, text)
	end)
end

return Inventory
