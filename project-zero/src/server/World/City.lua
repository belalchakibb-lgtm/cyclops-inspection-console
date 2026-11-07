--[[
	City - the destroyed streets of Ashford Bay around the hospital:
	hospital plaza, Harbor Avenue, Kessler Street, pharmacy, Police
	Precinct 9, collapsed offices, an alley and the Line 4 subway plaza.
]]

local Layout = require(game:GetService("ReplicatedStorage"):WaitForChild("Shared"):WaitForChild("Layout"))
local Builder = require(script.Parent:WaitForChild("Builder"))
local Props = require(script.Parent:WaitForChild("Props"))
local Doors = require(script.Parent:WaitForChild("Doors"))

local M = Enum.Material
local rgb = Color3.fromRGB
local V = Vector3.new

local City = {}

local ASPHALT = rgb(42, 42, 46)
local SIDEWALK = rgb(110, 108, 104)

-- Solid ruined block with dark windows on the given faces. Cheap: 1 body part + window strips.
local function ruinedBlock(minX, minZ, maxX, maxZ, height, color, parent, rng)
	local m = Builder.model("Ruin", parent)
	Builder.box(V(minX, 0, minZ), V(maxX, height, maxZ), M.Concrete, color, m)
	-- broken roofline chunks
	for _ = 1, 3 do
		local w = rng:NextNumber(4, 10)
		local x = rng:NextNumber(minX + w / 2, math.max(minX + w / 2, maxX - w / 2))
		local z = rng:NextNumber(minZ + 2, math.max(minZ + 2, maxZ - 2))
		local h = rng:NextNumber(2, 6)
		Builder.part({
			Size = V(w, h, rng:NextNumber(3, 8)),
			CFrame = CFrame.new(x, height + h / 2 - 0.5, z) * CFrame.Angles(rng:NextNumber(-0.3, 0.3), 0, rng:NextNumber(-0.3, 0.3)),
			Material = M.Concrete,
			Color = color:Lerp(rgb(40, 40, 40), 0.3),
		}, m)
	end
	-- window rows on all four faces (dark glass, a few lit for life)
	local floors = math.floor(height / 8)
	for f = 0, floors - 1 do
		local y = 4 + f * 8
		local function strip(cf, len)
			local lit = rng:NextNumber() < 0.08
			Builder.part({
				Size = V(len, 2.6, 0.2),
				CFrame = cf,
				Material = lit and M.Neon or M.Glass,
				Color = lit and rgb(255, 190, 110) or rgb(20, 24, 28),
				CanCollide = false,
				CastShadow = false,
			}, m)
		end
		strip(CFrame.new((minX + maxX) / 2, y, minZ - 0.1), (maxX - minX) - 4)
		strip(CFrame.new((minX + maxX) / 2, y, maxZ + 0.1), (maxX - minX) - 4)
		strip(CFrame.new(minX - 0.1, y, (minZ + maxZ) / 2) * CFrame.Angles(0, math.rad(90), 0), (maxZ - minZ) - 4)
		strip(CFrame.new(maxX + 0.1, y, (minZ + maxZ) / 2) * CFrame.Angles(0, math.rad(90), 0), (maxZ - minZ) - 4)
	end
	return m
end

-- Enterable building shell with walls, roof and given doorway openings.
local function shell(name, minX, minZ, maxX, maxZ, height, color, openings, parent)
	local m = Builder.model(name, parent)
	local opts = { height = height, thickness = 1, material = M.Brick, color = color }
	opts.openings = openings.south or {}
	Builder.wall("x", minZ, minX, maxX, opts, m)
	opts.openings = openings.north or {}
	Builder.wall("x", maxZ, minX, maxX, opts, m)
	opts.openings = openings.west or {}
	Builder.wall("z", minX, minZ, maxZ, opts, m)
	opts.openings = openings.east or {}
	Builder.wall("z", maxX, minZ, maxZ, opts, m)
	Builder.box(V(minX, 0, minZ), V(maxX, 0.2, maxZ), M.WoodPlanks, rgb(90, 75, 60), m)
	Builder.box(V(minX - 0.5, height, minZ - 0.5), V(maxX + 0.5, height + 1, maxZ + 0.5), M.Concrete, color:Lerp(rgb(30, 30, 30), 0.4), m)
	return m
end

function City.build(parent)
	local root = Builder.model("City", parent)
	local ground = Builder.folder("Ground", root)
	local buildings = Builder.folder("Buildings", root)
	local props = Builder.folder("Props", root)
	local rng = Random.new(1337)
	local B = Layout.WorldBounds

	-- Ground -----------------------------------------------------------------------
	Builder.box(V(B.minX - 30, -4, B.minZ - 30), V(B.maxX + 30, 0, B.maxZ + 30), M.Concrete, SIDEWALK, ground)
	Builder.box(V(0, 0, 80), V(120, 0.1, 100), M.Pavement, rgb(125, 122, 118), ground) -- plaza
	Builder.box(V(-60, 0, 100), V(220, 0.12, 124), M.Asphalt, ASPHALT, ground) -- Harbor Ave
	Builder.box(V(90, 0, 124), V(110, 0.12, 244), M.Asphalt, ASPHALT, ground) -- Kessler St
	Builder.box(V(60, 0, 240), V(150, 0.1, 304), M.Pavement, rgb(105, 100, 95), ground) -- subway plaza
	-- lane markings
	for x = -55, 215, 12 do
		Builder.box(V(x, 0.12, 111.7), V(x + 5, 0.16, 112.3), M.SmoothPlastic, rgb(200, 180, 90), ground, { CanCollide = false })
	end
	for z = 128, 236, 12 do
		Builder.box(V(99.7, 0.12, z), V(100.3, 0.16, z + 5), M.SmoothPlastic, rgb(200, 180, 90), ground, { CanCollide = false })
	end
	-- cracks / patches
	for _ = 1, 26 do
		local x = rng:NextNumber(-55, 215)
		local z = rng:NextNumber(101, 123)
		Builder.part({
			Size = V(rng:NextNumber(3, 9), 0.05, rng:NextNumber(0.4, 1.2)),
			CFrame = CFrame.new(x, 0.15, z) * CFrame.Angles(0, rng:NextNumber(0, math.pi), 0),
			Material = M.Slate,
			Color = rgb(28, 28, 30),
			CanCollide = false,
		}, ground)
	end

	-- Invisible world boundary -----------------------------------------------------------
	local function boundary(minV, maxV)
		Builder.box(minV, maxV, M.SmoothPlastic, rgb(0, 0, 0), ground, { Transparency = 1, CastShadow = false, Name = "Boundary" })
	end
	boundary(V(B.minX - 2, 0, B.minZ), V(B.minX, 80, B.maxZ))
	boundary(V(B.maxX, 0, B.minZ), V(B.maxX + 2, 80, B.maxZ))
	boundary(V(B.minX, 0, B.minZ - 2), V(B.maxX, 80, B.minZ))
	boundary(V(B.minX, 0, B.maxZ), V(B.maxX, 80, B.maxZ + 2))

	-- Ruined city blocks (frame the playable streets) --------------------------------------
	local blocks = {
		{ -60, 0, -5, 95, 42 },
		{ 125, 0, 225, 95, 50 },
		{ -60, 130, -12, 180, 38 },
		{ -60, 190, 2, 240, 46 },
		{ 22, 192, 85, 236, 34 },
		{ 170, 130, 225, 185, 40 },
		{ 205, 190, 225, 240, 30 },
		{ -60, 250, 55, 304, 52 },
		{ 155, 250, 225, 304, 44 },
		{ 0, -10, 120, -2, 20 },
	}
	for i, b in ipairs(blocks) do
		local shade = 95 + (i * 13) % 40
		ruinedBlock(b[1], b[2], b[3], b[4], b[5], rgb(shade, shade - 6, shade - 12), buildings, rng)
	end

	-- Hospital plaza -------------------------------------------------------------------------
	for _, x in ipairs({ 20, 40, 90, 110 }) do
		Builder.box(V(x - 4, 0, 86), V(x + 4, 1.4, 94), M.Brick, rgb(100, 70, 60), props) -- planters
		Props.deadTree(CFrame.new(x, 1.4, 90), props, rng)
	end
	Props.policeBarrier(CFrame.new(54, 0.1, 97), props)
	Props.policeBarrier(CFrame.new(78, 0.1, 97) * CFrame.Angles(0, math.rad(15), 0), props)
	Props.barrel(CFrame.new(66, 0.1, 94), props, true)
	Props.bench(CFrame.new(30, 0.1, 82) * CFrame.Angles(0, math.pi, 0), props)

	-- Harbor Avenue ---------------------------------------------------------------------------
	Props.ambulance(CFrame.new(Layout.Points.Ambulance) * CFrame.Angles(0, math.rad(80), 0), props)
	local cars = {
		{ -30, 108, 20, rgb(40, 60, 120) }, { 0, 117, -70, rgb(150, 150, 150) }, { 35, 106, 95, rgb(120, 30, 30) },
		{ 128, 118, 10, rgb(30, 90, 60) }, { 160, 107, 75, rgb(200, 180, 60) }, { 196, 116, 110, rgb(60, 60, 70) },
		{ 96, 140, 5, rgb(110, 40, 40) }, { 104, 175, -8, rgb(170, 170, 175) }, { 95, 205, 20, rgb(40, 40, 45) },
		{ 75, 258, 60, rgb(90, 100, 120) }, { 135, 262, -30, rgb(120, 100, 70) },
	}
	for _, c in ipairs(cars) do
		Props.car(CFrame.new(c[1], 0.12, c[2]) * CFrame.Angles(0, math.rad(c[3]), 0), props, c[4], true)
	end
	Props.barricade(CFrame.new(-50, 0.1, 112) * CFrame.Angles(0, math.rad(90), 0), props)
	Props.barricade(CFrame.new(214, 0.1, 112) * CFrame.Angles(0, math.rad(90), 0), props)
	for _, pos in ipairs({ V(-20, 0, 120), V(55, 0, 121), V(140, 0, 102), V(185, 0, 121), V(112, 0, 160), V(88, 0, 196), V(112, 0, 228) }) do
		Props.debris(CFrame.new(pos), props, rng, 5)
	end
	for _, pos in ipairs({ V(10, 0, 126), V(150, 0, 126), V(88, 0, 170), V(112, 0, 190) }) do
		Props.trashBags(CFrame.new(pos), props, rng)
	end
	Props.barrel(CFrame.new(-8, 0.1, 104), props, true)
	Props.barrel(CFrame.new(150, 0.1, 121), props, true)
	Props.barrel(CFrame.new(112, 0.1, 214), props, true)
	Props.trafficLight(CFrame.new(88, 0.1, 126), props)
	Props.trafficLight(CFrame.new(112, 0.1, 98) * CFrame.Angles(0, math.pi, 0), props)

	-- Street lamps
	local lampModes = { "on", "off", "flicker", "on", "off", "on", "flicker", "off" }
	local li = 0
	for x = -45, 205, 30 do
		li = li + 1
		Props.streetLamp(CFrame.new(x, 0, 99) * CFrame.Angles(0, math.pi, 0), props, lampModes[(li % #lampModes) + 1])
		Props.streetLamp(CFrame.new(x + 15, 0, 125), props, lampModes[((li + 3) % #lampModes) + 1])
	end
	for z = 140, 230, 30 do
		li = li + 1
		Props.streetLamp(CFrame.new(88, 0, z) * CFrame.Angles(0, math.rad(-90), 0), props, lampModes[(li % #lampModes) + 1])
		Props.streetLamp(CFrame.new(112, 0, z + 15) * CFrame.Angles(0, math.rad(90), 0), props, lampModes[((li + 2) % #lampModes) + 1])
	end

	-- Pharmacy (Maya's hideout) -------------------------------------------------------------------
	local pharm = shell("Pharmacy", 130, 135, 165, 170, 16, rgb(120, 140, 120), {
		west = { { center = 152, width = 6, height = 9 }, { center = 142, width = 6, height = 4, sill = 3, glass = true, broken = true } },
	}, buildings)
	Builder.sign("PHARMACY +", CFrame.new(129.3, 12, 152) * CFrame.Angles(0, math.rad(90), 0), V(12, 2, 0.3), pharm, rgb(120, 255, 140))
	for i = 0, 2 do
		Props.shelf(CFrame.new(140 + i * 8, 0.2, 166), pharm, rgb(200, 200, 200))
	end
	Props.counter(CFrame.new(158, 0.2, 145), 10, pharm)
	Props.crate(CFrame.new(134, 0.2, 160), pharm)
	Builder.lamp(V(148, 15.6, 152), { range = 24, brightness = 0.9, color = rgb(255, 230, 190) }, pharm)
	-- rooftop flare
	local flare = Builder.part({
		Name = "Flare",
		Size = V(0.5, 1.2, 0.5),
		CFrame = CFrame.new(150, 17.6, 150),
		Material = M.Neon,
		Color = rgb(255, 50, 40),
		CanCollide = false,
	}, pharm)
	local flareLight = Instance.new("PointLight")
	flareLight.Color = rgb(255, 60, 40)
	flareLight.Range = 40
	flareLight.Brightness = 3
	flareLight.Parent = flare
	local smoke = Instance.new("Smoke")
	smoke.Color = rgb(255, 90, 80)
	smoke.Opacity = 0.25
	smoke.RiseVelocity = 8
	smoke.Size = 3
	smoke.Parent = flare

	-- Police Precinct 9 ----------------------------------------------------------------------------
	local police = shell("Precinct9", 20, 140, 70, 185, 16, rgb(70, 80, 105), {
		east = { { center = 162, width = 8, height = 10 }, { center = 148, width = 8, height = 4, sill = 4, glass = true } },
		north = { { center = 45, width = 8, height = 4, sill = 5, glass = true } },
	}, buildings)
	Builder.sign("POLICE - PRECINCT 9", CFrame.new(70.7, 12.5, 162) * CFrame.Angles(0, math.rad(-90), 0), V(16, 2, 0.3), police, rgb(150, 190, 255))
	Builder.wall("x", 165, 20, 70, { height = 16, thickness = 1, material = M.Brick, color = rgb(80, 85, 95), openings = { { center = 45, width = 6, height = 9 } } }, police)
	Doors.create("armory", CFrame.new(45, 0.2, 165), 6, 9, { color = rgb(60, 60, 65), label = "ARMORY", labelSide = -1, labelColor = rgb(255, 200, 80) }, police)
	Props.desk(CFrame.new(36, 0.2, 146), police)
	Props.desk(CFrame.new(58, 0.2, 146), police)
	Props.chair(CFrame.new(36, 0.2, 150) * CFrame.Angles(0, math.pi, 0), police, true)
	Props.cabinet(CFrame.new(24, 0.2, 162), police)
	Props.cabinet(CFrame.new(66, 0.2, 143), police)
	Props.desk(CFrame.new(45, 0.2, 180), police, rgb(70, 70, 75))
	Props.desk(CFrame.new(30, 0.2, 180), police, rgb(70, 70, 75))
	for i = 0, 3 do
		Props.cabinet(CFrame.new(56 + i * 3.2, 0.2, 182), police, 7)
	end
	Props.crate(CFrame.new(24, 0.2, 170), police)
	Builder.lamp(V(45, 15.6, 152), { range = 26, brightness = 0.7, flicker = true }, police)
	Builder.lamp(V(45, 15.6, 176), { range = 18, brightness = 0.5, color = rgb(255, 80, 60) }, police)
	-- breaker panel (west wall, faces east)
	local panel = Builder.part({
		Name = "BreakerPanel",
		Size = V(0.4, 4, 6),
		CFrame = CFrame.new(Layout.Points.BreakerPanel),
		Material = M.DiamondPlate,
		Color = rgb(110, 115, 120),
	}, police)
	local levers = {}
	for i = 1, 3 do
		local lever = Builder.part({
			Name = "Breaker" .. i,
			Size = V(0.6, 1.2, 0.5),
			CFrame = CFrame.new(Layout.Points.BreakerPanel + V(0.45, -0.6, (i - 2) * 1.8)),
			Material = M.SmoothPlastic,
			Color = rgb(200, 40, 40),
		}, police)
		Builder.sign(tostring(i), CFrame.new(Layout.Points.BreakerPanel + V(0.25, 1.2, (i - 2) * 1.8)) * CFrame.Angles(0, math.rad(-90), 0), V(0.8, 0.8, 0.1), police)
		levers[i] = lever
	end

	-- Alley (research file 3) ------------------------------------------------------------------------
	Props.dumpster(CFrame.new(8, 0, 214) * CFrame.Angles(0, math.rad(90), 0), props)
	Props.trashBags(CFrame.new(16, 0, 220), props, rng)
	Props.crate(CFrame.new(14, 0, 226), props, 1)
	Builder.lamp(V(12, 9, 230), { range = 14, brightness = 0.6, flicker = true, color = rgb(255, 200, 140) }, props)

	-- Collapsed offices (optional Fire Axe) ------------------------------------------------------------
	local ruins = shell("CollapsedOffices", 130, 190, 200, 235, 14, rgb(130, 115, 100), {
		west = { { center = 212, width = 10, height = 10 } },
		south = { { center = 150, width = 6, height = 8 }, { center = 180, width = 12, height = 6, sill = 3 } },
	}, buildings)
	Props.desk(CFrame.new(185, 0.2, 228), ruins)
	Props.desk(CFrame.new(150, 0.2, 220), ruins)
	Props.cabinet(CFrame.new(195, 0.2, 200), ruins)
	Props.debris(CFrame.new(165, 0.2, 210), ruins, rng, 8)
	Props.debris(CFrame.new(140, 0.2, 228), ruins, rng, 6)
	Props.chair(CFrame.new(185, 0.2, 224), ruins, true)
	Builder.lamp(V(185, 13.6, 226), { range = 14, brightness = 0.5, flicker = true }, ruins)

	-- Newsstand (research file 4)
	Props.kiosk(CFrame.new(126, 0, 210) * CFrame.Angles(0, math.rad(90), 0), props)
	Props.crate(CFrame.new(120, 0, 210), props, 3)
	-- medical bag behind the ambulance (research file 2)
	Props.crate(CFrame.new(84, 0.12, 113.6), props, 1)

	-- Subway plaza ---------------------------------------------------------------------------------------
	local subway = Builder.model("Line4Subway", buildings)
	Builder.wall("x", 300, 70, 130, { height = 16, thickness = 2, material = M.Concrete, color = rgb(85, 80, 75), openings = { { center = 100, width = 16, height = 10 } } }, subway)
	Builder.box(V(70, 16, 296), V(130, 18, 304), M.Concrete, rgb(70, 66, 62), subway)
	Builder.sign("LINE 4  -  ASHFORD CENTRAL", CFrame.new(100, 12.5, 298.8), V(22, 2, 0.3), subway, rgb(255, 210, 90))
	Doors.create("subway_gate", CFrame.new(100, 0.1, 300), 16, 10, { style = "shutter", color = rgb(110, 105, 95), material = M.CorrodedMetal, thickness = 0.8 }, subway)
	-- tunnel interior behind the gate (descending stairs into darkness)
	Builder.box(V(90, 0, 301), V(110, 0.2, 312), M.Concrete, rgb(60, 60, 60), subway)
	for i = 0, 4 do
		Builder.box(V(92, -0.6 - i * 0.6, 304 + i * 1.6), V(108, 0.1 - i * 0.6, 305.6 + i * 1.6), M.Concrete, rgb(80, 80, 80), subway)
	end
	Builder.box(V(90, 0, 301), V(91, 12, 312), M.Concrete, rgb(60, 60, 60), subway)
	Builder.box(V(109, 0, 301), V(110, 12, 312), M.Concrete, rgb(60, 60, 60), subway)
	Builder.box(V(90, 10, 301), V(110, 12, 312), M.Concrete, rgb(50, 50, 50), subway)
	Builder.lamp(V(100, 9.6, 306), { range = 16, brightness = 0.6, color = rgb(255, 200, 120), flicker = true }, subway)
	-- generator
	local generator = Builder.model("Generator", subway)
	Builder.box(V(124, 0.1, 278), V(132, 5, 286), M.DiamondPlate, rgb(170, 140, 40), generator)
	Builder.box(V(125, 5, 279), V(131, 6.5, 285), M.Metal, rgb(60, 60, 60), generator)
	local genLight = Builder.part({
		Name = "GeneratorLight",
		Size = V(0.3, 1, 3),
		CFrame = CFrame.new(123.8, 3.5, 282),
		Material = M.Neon,
		Color = rgb(255, 40, 40),
		CanCollide = false,
	}, generator)
	-- ticket booth (research file 5)
	local booth = Builder.model("TicketBooth", subway)
	Builder.box(V(76, 0.1, 283), V(84, 0.6, 291), M.Concrete, rgb(90, 90, 90), booth)
	Builder.box(V(76, 0.6, 290.5), V(84, 9, 291), M.Metal, rgb(60, 70, 80), booth)
	Builder.box(V(76, 0.6, 283), V(76.5, 9, 291), M.Metal, rgb(60, 70, 80), booth)
	Builder.box(V(83.5, 0.6, 283), V(84, 9, 291), M.Metal, rgb(60, 70, 80), booth)
	Builder.box(V(76, 9, 283), V(84, 9.6, 291), M.Metal, rgb(50, 55, 60), booth)
	Props.desk(CFrame.new(80, 0.3, 287), booth, rgb(80, 80, 85))
	Builder.sign("TICKETS", CFrame.new(80, 8.3, 282.8), V(5, 1, 0.2), booth, rgb(255, 220, 120))
	-- arena cover
	for _, pos in ipairs({ V(80, 0, 262), V(120, 0, 262), V(90, 0, 280), V(112, 0, 278), V(70, 0, 275), V(135, 0, 250) }) do
		Builder.box(pos - V(3, 0, 0.8), pos + V(3, 3, 0.8), M.Concrete, rgb(150, 145, 140), props)
	end
	Props.barrel(CFrame.new(70, 0.1, 290), props, true)
	Props.barrel(CFrame.new(140, 0.1, 270), props, true)
	Props.streetLamp(CFrame.new(64, 0, 250) * CFrame.Angles(0, math.rad(-90), 0), props, "flicker")
	Props.streetLamp(CFrame.new(146, 0, 290) * CFrame.Angles(0, math.rad(90), 0), props, "on")

	return {
		root = root,
		breakerLevers = levers,
		breakerPanel = panel,
		generatorLight = genLight,
		flare = flare,
	}
end

return City
