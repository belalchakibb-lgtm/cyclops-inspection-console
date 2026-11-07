--[[
	ZombieTypes
	Fictional infected variants. No gore: the infected are pale, glowing-eyed
	and ragged, built from coloured body parts.
	scale       - body proportion multiplier
	sight/hear  - detection radii (studs). Sprinting players are heard from 'hear'.
	attack      - damage per hit, 'reach' studs, 'cooldown' seconds
]]

local ZombieTypes = {
	Normal = {
		displayName = "Infected",
		health = 80,
		walkSpeed = 7,
		chaseSpeed = 11,
		sight = 55,
		hear = 34,
		attack = { damage = 12, reach = 4.5, cooldown = 1.3 },
		scale = { height = 1, width = 1, depth = 1, head = 1 },
		skin = Color3.fromRGB(150, 160, 140),
		shirt = Color3.fromRGB(150, 175, 190), -- hospital gowns / faded clothes
		pants = Color3.fromRGB(80, 85, 95),
		eyes = Color3.fromRGB(255, 240, 150),
		groanPitch = 0.55,
		animSpeed = 0.85,
		score = 1,
	},
	Fast = {
		displayName = "Runner",
		health = 55,
		walkSpeed = 9,
		chaseSpeed = 18,
		sight = 70,
		hear = 45,
		attack = { damage = 9, reach = 4.2, cooldown = 0.9 },
		scale = { height = 0.95, width = 0.85, depth = 0.85, head = 0.95 },
		skin = Color3.fromRGB(170, 160, 150),
		shirt = Color3.fromRGB(120, 40, 40),
		pants = Color3.fromRGB(50, 50, 60),
		eyes = Color3.fromRGB(255, 120, 60),
		groanPitch = 0.85,
		animSpeed = 1.25,
		score = 1,
	},
	Heavy = {
		displayName = "Brute",
		health = 260,
		walkSpeed = 6,
		chaseSpeed = 9,
		sight = 50,
		hear = 30,
		attack = { damage = 26, reach = 6, cooldown = 2.0 },
		scale = { height = 1.3, width = 1.45, depth = 1.3, head = 1.1 },
		skin = Color3.fromRGB(130, 140, 125),
		shirt = Color3.fromRGB(60, 70, 50),
		pants = Color3.fromRGB(45, 45, 45),
		eyes = Color3.fromRGB(255, 80, 60),
		groanPitch = 0.35,
		animSpeed = 0.7,
		score = 3,
		knockbackResist = 0.8,
	},
	Mutated = {
		displayName = "Mutated",
		health = 150,
		walkSpeed = 8,
		chaseSpeed = 14,
		sight = 65,
		hear = 45,
		attack = { damage = 16, reach = 5, cooldown = 1.2, slow = 3 },
		scale = { height = 1.1, width = 1.05, depth = 1.05, head = 1.15 },
		skin = Color3.fromRGB(90, 120, 130),
		shirt = Color3.fromRGB(30, 60, 70),
		pants = Color3.fromRGB(25, 35, 40),
		eyes = Color3.fromRGB(80, 255, 220),
		glow = Color3.fromRGB(60, 255, 200),
		groanPitch = 0.45,
		animSpeed = 1,
		score = 5,
		rare = true,
	},
	Warden = {
		displayName = "The Warden",
		boss = true,
		health = 1400, -- scaled by party size on spawn
		walkSpeed = 8,
		chaseSpeed = 12,
		sight = 120,
		hear = 120,
		attack = { damage = 24, reach = 7, cooldown = 1.8 },
		slam = { damage = 30, radius = 16, cooldown = 9, windup = 1.4 },
		scale = { height = 2.1, width = 2.2, depth = 1.9, head = 1.5 },
		skin = Color3.fromRGB(120, 125, 115),
		shirt = Color3.fromRGB(25, 30, 45), -- old security uniform
		pants = Color3.fromRGB(20, 22, 30),
		eyes = Color3.fromRGB(255, 50, 50),
		glow = Color3.fromRGB(255, 60, 40),
		groanPitch = 0.25,
		animSpeed = 0.75,
		score = 25,
		knockbackResist = 1,
	},
}

return ZombieTypes
