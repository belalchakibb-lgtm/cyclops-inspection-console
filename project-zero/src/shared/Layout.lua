--[[
	Layout
	Single source of truth for Chapter 1 world coordinates.
	Used by the server world builder, the mission system, the cinematic
	system and the client map, so positions never drift out of sync.

	World axes: X = east/west, Z = north/south (north = +Z), Y = up.
	Ground top surface is at Y = 0.
]]

local Layout = {}

Layout.WorldBounds = { minX = -70, maxX = 230, minZ = -10, maxZ = 312 }

-- Map zones (rectangles on the X/Z plane). Drawn on the in-game map.
Layout.Zones = {
	{ id = "hospital", name = "St. Aurelia Medical", minX = 0, maxX = 120, minZ = 0, maxZ = 80, color = Color3.fromRGB(150, 175, 190) },
	{ id = "plaza", name = "Hospital Plaza", minX = 0, maxX = 120, minZ = 80, maxZ = 100, color = Color3.fromRGB(90, 90, 95) },
	{ id = "harbor", name = "Harbor Avenue", minX = -60, maxX = 220, minZ = 100, maxZ = 124, color = Color3.fromRGB(60, 60, 64) },
	{ id = "kessler", name = "Kessler Street", minX = 90, maxX = 110, minZ = 124, maxZ = 240, color = Color3.fromRGB(60, 60, 64) },
	{ id = "pharmacy", name = "Pharmacy", minX = 130, maxX = 165, minZ = 135, maxZ = 170, color = Color3.fromRGB(110, 170, 120) },
	{ id = "police", name = "Police Precinct 9", minX = 20, maxX = 70, minZ = 140, maxZ = 185, color = Color3.fromRGB(90, 120, 200) },
	{ id = "ruins", name = "Collapsed Offices", minX = 130, maxX = 200, minZ = 190, maxZ = 235, color = Color3.fromRGB(120, 100, 90) },
	{ id = "subway", name = "Line 4 Subway", minX = 60, maxX = 150, minZ = 240, maxZ = 304, color = Color3.fromRGB(200, 160, 80) },
}

-- Hospital interior room rectangles (used by the builder and map).
Layout.Hospital = {
	minX = 0, maxX = 120, minZ = 0, maxZ = 80,
	wallHeight = 14,
	corridor = { minZ = 25, maxZ = 35 },
	rooms = {
		ward = { minX = 0, maxX = 30, minZ = 0, maxZ = 25, doorX = 15 },
		nurse = { minX = 30, maxX = 55, minZ = 0, maxZ = 25, doorX = 42.5 },
		storage = { minX = 55, maxX = 75, minZ = 0, maxZ = 25, doorX = 65 },
		security = { minX = 75, maxX = 100, minZ = 0, maxZ = 25, doorX = 87.5 },
		janitor = { minX = 100, maxX = 120, minZ = 0, maxZ = 25, doorX = 110 },
		er = { minX = 0, maxX = 40, minZ = 35, maxZ = 80, doorX = 20 },
		lobby = { minX = 40, maxX = 90, minZ = 35, maxZ = 80, doorX = 65 },
		records = { minX = 90, maxX = 120, minZ = 35, maxZ = 80, doorX = 100 },
		hidden = { minX = 110, maxX = 120, minZ = 65, maxZ = 80 },
	},
}

-- Named points of interest.
Layout.Points = {
	WardBed = Vector3.new(6, 0, 10),
	Flashlight = Vector3.new(44, 3.6, 6),
	PatientLog = Vector3.new(36, 3.6, 6),
	Pipe = Vector3.new(70, 3.6, 4),
	ShiftNote = Vector3.new(6, 3.6, 74),
	SecurityDoor = Vector3.new(87.5, 0, 25),
	SecurityKeypad = Vector3.new(92, 4.5, 25.7),
	CctvTerminal = Vector3.new(80, 3.6, 4),
	Keycard = Vector3.new(96, 3.6, 6),
	LobbyDoor = Vector3.new(65, 0, 80),
	LobbyReader = Vector3.new(73, 4.5, 79.3),
	SecretShelf = Vector3.new(110, 0, 72),
	ResearchFile1 = Vector3.new(116, 3.6, 76),
	Bandage1 = Vector3.new(112, 3.6, 4),
	Medkit1 = Vector3.new(30, 3.6, 70),

	Pharmacy = Vector3.new(130, 0, 152),
	MayaSpot = Vector3.new(147, 0, 152),
	PharmacyFlare = Vector3.new(150, 22, 150),
	Ambulance = Vector3.new(75, 0, 112),
	ResearchFile2 = Vector3.new(84, 1.25, 113.6),

	PoliceDoor = Vector3.new(70, 0, 162),
	BreakerPanel = Vector3.new(20.6, 5, 152),
	MaintenanceMemo = Vector3.new(36, 3.6, 146),
	EvacOrder = Vector3.new(58, 3.6, 146),
	ArmoryDoor = Vector3.new(45, 0, 165),
	Fuse = Vector3.new(45, 3.6, 180),
	Bandage2 = Vector3.new(30, 3.6, 180),
	ResearchFile3 = Vector3.new(14, 1.1, 226),
	FireAxe = Vector3.new(185, 3.6, 228),
	ResearchFile4 = Vector3.new(120, 3.15, 210),

	Generator = Vector3.new(128, 0, 282),
	SubwayGate = Vector3.new(100, 0, 300),
	TicketBooth = Vector3.new(80, 0, 286),
	ResearchFile5 = Vector3.new(80, 3.6, 287),
	BossSpawn = Vector3.new(100, 0, 262),
	EscapeZone = Vector3.new(100, 0, 303),
	MayaSubway = Vector3.new(108, 0, 292),
}

-- Respawn checkpoints, in story order.
Layout.Checkpoints = {
	{ id = 1, name = "Ward 3B", position = Vector3.new(14, 3, 12) },
	{ id = 2, name = "East Corridor", position = Vector3.new(20, 3, 30) },
	{ id = 3, name = "Hospital Plaza", position = Vector3.new(65, 3, 90) },
	{ id = 4, name = "Pharmacy", position = Vector3.new(120, 3, 152) },
	{ id = 5, name = "Kessler Street North", position = Vector3.new(100, 3, 232) },
}

-- Zombie spawn regions. "minStage" is the mission stage index from which the region is active.
Layout.SpawnRegions = {
	{ id = "er", center = Vector3.new(20, 0, 58), radius = 12, minStage = 3, maxStage = 5, fixed = { "Normal", "Normal", "Normal" } },
	{ id = "lobby", center = Vector3.new(65, 0, 60), radius = 14, minStage = 5, maxStage = 5, fixed = { "Normal", "Fast" } },
	{ id = "harbor_w", center = Vector3.new(10, 0, 112), radius = 22, minStage = 6, maxStage = 10, ambient = true },
	{ id = "harbor_e", center = Vector3.new(170, 0, 112), radius = 22, minStage = 6, maxStage = 10, ambient = true },
	{ id = "kessler_s", center = Vector3.new(100, 0, 150), radius = 14, minStage = 6, maxStage = 10, ambient = true },
	{ id = "kessler_n", center = Vector3.new(100, 0, 215), radius = 14, minStage = 7, maxStage = 10, ambient = true },
	{ id = "police", center = Vector3.new(45, 0, 152), radius = 10, minStage = 7, maxStage = 7, fixed = { "Heavy", "Normal" } },
	{ id = "ruins", center = Vector3.new(165, 0, 212), radius = 16, minStage = 6, maxStage = 10, fixed = { "Normal", "Fast", "Normal" } },
}

-- Camera used behind the main menu.
Layout.MenuCamera = {
	position = Vector3.new(150, 38, 60),
	lookAt = Vector3.new(80, 10, 130),
}

return Layout
