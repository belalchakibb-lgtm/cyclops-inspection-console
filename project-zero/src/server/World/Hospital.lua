--[[
	Hospital - St. Aurelia Medical Center (Chapter 1 start).
	Single-storey hospital with ward, nurse station, storage, security
	office, janitor closet, emergency room, lobby, records room and a
	hidden room behind a sliding bookshelf.
]]

local Layout = require(game:GetService("ReplicatedStorage"):WaitForChild("Shared"):WaitForChild("Layout"))
local Builder = require(script.Parent:WaitForChild("Builder"))
local Props = require(script.Parent:WaitForChild("Props"))
local Doors = require(script.Parent:WaitForChild("Doors"))

local M = Enum.Material
local rgb = Color3.fromRGB
local V = Vector3.new

local Hospital = {}

local WALL = rgb(176, 192, 186)
local WALL_DARK = rgb(120, 135, 130)
local EXTERIOR = rgb(150, 150, 145)

function Hospital.build(parent)
	local root = Builder.model("Hospital", parent)
	local structure = Builder.folder("Structure", root)
	local props = Builder.folder("Props", root)
	local lights = Builder.folder("Lights", root)
	local H = Layout.Hospital.wallHeight
	local rooms = Layout.Hospital.rooms
	local rng = Random.new(2037)

	-- Floor, ceiling, roof -------------------------------------------------
	Builder.box(V(0, 0, 0), V(120, 0.2, 80), M.Marble, rgb(196, 200, 192), structure)
	Builder.box(V(0, 0.2, 25), V(120, 0.25, 35), M.SmoothPlastic, rgb(150, 165, 160), structure) -- corridor runner
	Builder.box(V(0, H, 0), V(120, H + 1, 80), M.Concrete, rgb(170, 170, 168), structure, { CastShadow = true })
	Builder.box(V(-1, H + 1, -1), V(121, H + 2, 81), M.Concrete, rgb(90, 90, 92), structure)

	-- Exterior walls ---------------------------------------------------------
	local ext = { height = H, thickness = 1, material = M.Concrete, color = EXTERIOR }
	local function win(center, broken)
		return { center = center, width = 6, height = 5, sill = 4, glass = true, broken = broken }
	end
	ext.openings = { win(rooms.ward.doorX, true), win(rooms.nurse.doorX), win(rooms.storage.doorX), win(rooms.security.doorX), win(rooms.janitor.doorX) }
	Builder.wall("x", 0, 0, 120, ext, structure)
	ext.openings = { win(20, true), { center = 65, width = 12, height = 10 }, win(105) }
	Builder.wall("x", 80, 0, 120, ext, structure)
	ext.openings = { win(12), win(58, true) }
	Builder.wall("z", 0, 0, 80, ext, structure)
	ext.openings = { win(12), win(50) }
	Builder.wall("z", 120, 0, 80, ext, structure)

	-- Interior walls ---------------------------------------------------------
	local int = { height = H, thickness = 1, material = M.SmoothPlastic, color = WALL }
	local function door(center, width)
		return { center = center, width = width or 6, height = 9 }
	end
	int.openings = { door(rooms.ward.doorX), door(rooms.nurse.doorX), door(rooms.storage.doorX), door(rooms.security.doorX), door(rooms.janitor.doorX) }
	Builder.wall("x", 25, 0, 120, int, structure)
	int.openings = { door(rooms.er.doorX, 8), door(rooms.lobby.doorX, 16), door(rooms.records.doorX) }
	Builder.wall("x", 35, 0, 120, int, structure)
	int.openings = {}
	for _, x in ipairs({ 30, 55, 75, 100 }) do
		Builder.wall("z", x, 0, 25, int, structure)
	end
	Builder.wall("z", 40, 35, 80, int, structure)
	Builder.wall("z", 90, 35, 80, int, structure)
	-- hidden room walls
	Builder.wall("x", 65, 110, 120, { height = H, thickness = 1, material = M.SmoothPlastic, color = WALL_DARK }, structure)
	Builder.wall("z", 110, 65, 80, { height = H, thickness = 1, material = M.SmoothPlastic, color = WALL_DARK, openings = { { center = 72, width = 5, height = 8 } } }, structure)

	-- Wall trim (cheap detail): a darker band along the corridor
	Builder.box(V(0, 0.25, 25.5), V(120, 1.2, 25.7), M.SmoothPlastic, WALL_DARK, structure)
	Builder.box(V(0, 0.25, 34.3), V(120, 1.2, 34.5), M.SmoothPlastic, WALL_DARK, structure)

	-- Doors -----------------------------------------------------------------
	Doors.create("security", CFrame.new(rooms.security.doorX, 0.2, 25), 6, 9, {
		color = rgb(70, 80, 100), window = true, label = "SECURITY", labelSide = 1, labelColor = rgb(255, 120, 120),
	}, structure)
	Doors.create("lobby", CFrame.new(65, 0.2, 80), 12, 10, {
		style = "double", color = rgb(60, 70, 75), window = true,
	}, structure)
	-- Chains on the lobby doors (purely visual, removed when opened)
	local chains = Builder.part({
		Name = "LobbyChains",
		Size = V(3, 3, 0.4),
		CFrame = CFrame.new(65, 4.5, 79.4),
		Material = M.DiamondPlate,
		Color = rgb(90, 90, 90),
		CanCollide = false,
	}, structure)
	-- Secret bookshelf door
	local shelfDoor = Doors.create("secret_shelf", CFrame.new(109.6, 0.2, 72) * CFrame.Angles(0, math.rad(90), 0), 5, 8, {
		color = rgb(95, 70, 50), material = M.Wood, thickness = 1.2,
	}, structure)
	-- books on the shelf door so it looks like the other shelves
	for i = 0, 2 do
		Builder.part({
			Name = "Books",
			Size = V(0.6, 1.4, 4.4),
			CFrame = CFrame.new(108.75, 1.5 + i * 2.4, 72),
			Material = M.Cardboard,
			Color = rgb(150 - i * 20, 60 + i * 30, 50),
			Anchored = false,
			CanCollide = false,
			Massless = true,
		}, shelfDoor.model)
		local books = shelfDoor.model:FindFirstChild("Books", false)
		if books then
			local weld = Instance.new("WeldConstraint")
			weld.Part0 = shelfDoor.panels[1].part
			weld.Part1 = books
			weld.Parent = books
			books.Name = "BooksWelded"
		end
	end

	-- Lighting ---------------------------------------------------------------
	for x = 6, 114, 12 do
		Builder.lamp(V(x, H - 0.3, 30), { flicker = (x == 18 or x == 66 or x == 102), range = 20, brightness = 0.9 }, lights)
	end
	Builder.lamp(V(15, H - 0.3, 12), { flicker = true, range = 22, brightness = 0.8 }, lights) -- ward
	Builder.lamp(V(42.5, H - 0.3, 12), { range = 22, brightness = 0.9, color = rgb(255, 240, 210) }, lights)
	Builder.lamp(V(65, H - 0.3, 12), { flicker = true, range = 18, brightness = 0.6 }, lights)
	Builder.lamp(V(87.5, H - 0.3, 12), { range = 22, brightness = 1, shadows = true }, lights)
	Builder.lamp(V(20, H - 0.3, 58), { color = rgb(255, 40, 30), range = 30, brightness = 1.6, flicker = true }, lights) -- ER emergency
	Builder.lamp(V(65, H - 0.3, 58), { range = 26, brightness = 0.7, flicker = true }, lights)
	Builder.lamp(V(100, H - 0.3, 50), { range = 20, brightness = 0.5 }, lights)
	Builder.lamp(V(115, H - 0.3, 72), { color = rgb(120, 255, 200), range = 12, brightness = 0.8 }, lights) -- hidden room

	-- Ward 3B ----------------------------------------------------------------
	local bedCF = CFrame.new(Layout.Points.WardBed)
	Props.bed(bedCF, props)
	Props.bed(CFrame.new(24, 0, 10), props)
	local monitor = Props.terminal(CFrame.new(2.5, 0, 4) * CFrame.Angles(0, math.rad(-90), 0), props, "HR  --\nSUBJECT 00\n<CONNECTION LOST>")
	monitor.Name = "HeartMonitor"
	Builder.box(V(10, 0.2, 2), V(10.2, 9, 18), M.Fabric, rgb(150, 190, 200), props, { CanCollide = false, Transparency = 0.15 }) -- curtain
	Props.chair(CFrame.new(18, 0, 18), props, true)
	Props.cabinet(CFrame.new(28, 0, 3), props, 5)

	-- Nurse station ------------------------------------------------------------
	Props.counter(CFrame.new(42.5, 0.2, 6), 20, props)
	Props.chair(CFrame.new(40, 0.2, 2.5), props)
	Props.terminal(CFrame.new(48, 0.2, 5.6), props, "WARD 3B\nSTATUS: QUARANTINE")
	Props.cabinet(CFrame.new(32.5, 0.2, 22), props)
	Props.cabinet(CFrame.new(52.5, 0.2, 22), props)

	-- Storage -------------------------------------------------------------------
	Props.desk(CFrame.new(70, 0.2, 4), props, rgb(90, 90, 95))
	Props.shelf(CFrame.new(58.5, 0.2, 12) * CFrame.Angles(0, math.rad(90), 0), props, rgb(120, 125, 130))
	Props.crate(CFrame.new(60, 0.2, 20), props)
	Props.crate(CFrame.new(63, 0.2, 21), props, 2.4)
	Props.crate(CFrame.new(72, 0.2, 18), props)

	-- Security office ---------------------------------------------------------------
	Props.desk(CFrame.new(80, 0.2, 4), props, rgb(70, 75, 80))
	Props.desk(CFrame.new(96, 0.2, 6), props, rgb(70, 75, 80))
	Props.chair(CFrame.new(80, 0.2, 8) * CFrame.Angles(0, math.pi, 0), props)
	local _, cctvScreen = Props.terminal(CFrame.new(80, -0.1, 3.4) * CFrame.Angles(0, math.pi, 0), props, "CAM 07\n03:14\n[PLAYBACK READY]")
	for i = 0, 2 do
		Props.terminal(CFrame.new(78 + i * 3.5, 4, 1.2) * CFrame.Angles(0, math.pi, 0), props, "CAM 0" .. (i + 5) .. "\n[NO SIGNAL]")
	end
	Props.cabinet(CFrame.new(98, 0.2, 20), props)

	-- Janitor ---------------------------------------------------------------------
	Props.desk(CFrame.new(112, 0.2, 4), props, rgb(80, 80, 70))
	Props.barrel(CFrame.new(116, 0.2, 18), props, false)
	Props.shelf(CFrame.new(103, 0.2, 14) * CFrame.Angles(0, math.rad(-90), 0), props, rgb(110, 110, 100))

	-- Emergency room ----------------------------------------------------------------
	for i = 0, 2 do
		Props.gurney(CFrame.new(8 + i * 11, 0.2, 48) * CFrame.Angles(0, math.rad(rng:NextNumber(-20, 20)), 0), props)
		Builder.box(V(3 + i * 11, 0.2, 54), V(13 + i * 11, 9, 54.2), M.Fabric, rgb(140, 175, 185), props, { CanCollide = false, Transparency = 0.2 })
	end
	Props.desk(CFrame.new(6, 0.2, 74), props, rgb(200, 200, 195))
	Props.desk(CFrame.new(30, 0.2, 70), props, rgb(200, 200, 195))
	Props.cabinet(CFrame.new(38, 0.2, 76), props)
	Props.chair(CFrame.new(14, 0.2, 66), props, true)
	Props.debris(CFrame.new(25, 0.2, 60), props, rng, 4)

	-- Lobby -----------------------------------------------------------------------
	Props.counter(CFrame.new(52, 0.2, 60) * CFrame.Angles(0, math.rad(90), 0), 14, props)
	for i = 0, 3 do
		Props.chair(CFrame.new(70 + i * 3, 0.2, 48) * CFrame.Angles(0, math.pi, 0), props, i == 2)
		Props.chair(CFrame.new(70 + i * 3, 0.2, 66), props, i == 0)
	end
	for _, pos in ipairs({ V(48, 0.2, 42), V(82, 0.2, 42), V(48, 0.2, 74), V(82, 0.2, 74) }) do
		Builder.box(pos - V(1.2, 0, 1.2), pos + V(1.2, H - 0.2, 1.2), M.Concrete, rgb(185, 185, 180), structure)
	end
	Props.barricade(CFrame.new(56, 0.2, 76), props)
	Builder.sign("ST. AURELIA MEDICAL CENTER", CFrame.new(65, 12, 80.7) * CFrame.Angles(0, math.pi, 0), V(30, 2.2, 0.3), structure, rgb(220, 240, 235))
	Builder.sign("EXIT", CFrame.new(65, 11, 79.3), V(3, 1, 0.2), structure, rgb(80, 255, 120))
	-- keycard reader beside the lobby doors (faces into the lobby)
	local reader = Builder.part({
		Name = "KeycardReader",
		Size = V(1, 1.6, 0.3),
		CFrame = CFrame.new(Layout.Points.LobbyReader),
		Material = M.SmoothPlastic,
		Color = rgb(30, 30, 35),
	}, structure)
	Builder.part({
		Name = "ReaderLight",
		Size = V(0.6, 0.2, 0.1),
		CFrame = CFrame.new(Layout.Points.LobbyReader + V(0, 0.5, -0.2)),
		Material = M.Neon,
		Color = rgb(255, 40, 40),
		CanCollide = false,
	}, structure)

	-- Security keypad (corridor side)
	local keypad = Builder.part({
		Name = "Keypad",
		Size = V(1, 1.4, 0.3),
		CFrame = CFrame.new(Layout.Points.SecurityKeypad),
		Material = M.SmoothPlastic,
		Color = rgb(40, 40, 45),
	}, structure)
	Builder.part({
		Name = "KeypadLight",
		Size = V(0.6, 0.2, 0.1),
		CFrame = CFrame.new(Layout.Points.SecurityKeypad + V(0, 0.45, 0.2)),
		Material = M.Neon,
		Color = rgb(255, 40, 40),
		CanCollide = false,
	}, structure)

	-- Records room ------------------------------------------------------------------
	for row = 0, 2 do
		Props.shelf(CFrame.new(98 + row * 0.1, 0.2, 44 + row * 9), props)
	end
	Props.shelf(CFrame.new(108.4, 0.2, 60) * CFrame.Angles(0, math.rad(90), 0), props)
	Props.desk(CFrame.new(100, 0.2, 75), props)
	-- Hidden room
	Props.desk(CFrame.new(116, 0.2, 76), props, rgb(60, 50, 40))
	Props.terminal(CFrame.new(116, 0.2, 69) * CFrame.Angles(0, math.pi, 0), props, "PROJECT ZERO\nARCHIVE\n> SUBJECT 00\n> TIMELINE ?")

	return {
		root = root,
		keypad = keypad,
		reader = reader,
		chains = chains,
		cctvScreen = cctvScreen,
	}
end

return Hospital
