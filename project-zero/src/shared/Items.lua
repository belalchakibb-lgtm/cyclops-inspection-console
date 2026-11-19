--[[
	Items
	kind:
	  "consumable" - stackable, used from the inventory (server validated)
	  "equipment"  - given as gear (flashlight / weapons)
	  "key"        - shared party story items (keycards, fuses)
]]

local Items = {
	bandage = {
		name = "Bandage",
		kind = "consumable",
		heal = 30,
		maxStack = 5,
		description = "Clean gauze. Restores 30 health.",
		color = Color3.fromRGB(235, 235, 225),
	},
	medkit = {
		name = "Field Medkit",
		kind = "consumable",
		heal = 75,
		maxStack = 3,
		description = "Military issue. Restores 75 health.",
		color = Color3.fromRGB(200, 40, 40),
	},
	flashlight = {
		name = "Flashlight",
		kind = "equipment",
		description = "A heavy torch from the nurse station. Press F (or the light button) to toggle.",
		color = Color3.fromRGB(240, 220, 120),
	},
	pipe = {
		name = "Steel Pipe",
		kind = "equipment",
		description = "Not elegant. Very effective.",
		color = Color3.fromRGB(130, 135, 140),
	},
	axe = {
		name = "Fire Axe",
		kind = "equipment",
		description = "Heavier and stronger than the pipe.",
		color = Color3.fromRGB(180, 30, 30),
	},
	keycard_hospital = {
		name = "Security Keycard",
		kind = "key",
		description = "St. Aurelia security clearance. Opens the lobby doors.",
		color = Color3.fromRGB(80, 160, 255),
	},
	fuse = {
		name = "Industrial Fuse",
		kind = "key",
		description = "Fits the Line 4 subway generator.",
		color = Color3.fromRGB(255, 170, 40),
	},
}

return Items
