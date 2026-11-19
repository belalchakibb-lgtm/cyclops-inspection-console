--[[
	Config
	Global tunables for PROJECT: ZERO. Everything a designer may want to
	tweak lives here so gameplay code never hard-codes numbers.
]]

local Config = {}

Config.GameName = "PROJECT: ZERO"
Config.Version = "0.1.0 (Chapter 1)"
Config.MaxPartySize = 4

-- Persistence --------------------------------------------------------------
Config.Data = {
	ProfileStore = "ProjectZero_Profiles_v1",
	PurchaseStore = "ProjectZero_Purchases_v1",
	AutosaveInterval = 120,
	SessionLockTimeout = 600, -- seconds before a stale session lock is ignored
	MaxRetries = 4,
}

-- Player -------------------------------------------------------------------
Config.Player = {
	MaxHealth = 100,
	WalkSpeed = 12,
	SprintSpeed = 21,
	DownedSpeed = 3,
	MaxStamina = 100,
	SprintDrain = 20, -- per second
	StaminaRegen = 16, -- per second
	RegenDelay = 1.1,
	MinStaminaToSprint = 12,
	DownedDuration = 30, -- seconds a downed player waits for a revive
	ReviveHoldTime = 3,
	PassiveRegenCap = 35, -- health slowly regenerates up to this value
	PassiveRegenRate = 1.5, -- per second, after 6 seconds without damage
}

-- Weapons (server authoritative) ---------------------------------------------
Config.Weapons = {
	pipe = { name = "Steel Pipe", damage = 34, cooldown = 0.65, reach = 6, width = 5, knockback = 22, color = Color3.fromRGB(120, 125, 130) },
	axe = { name = "Fire Axe", damage = 58, cooldown = 0.85, reach = 6.5, width = 6, knockback = 30, color = Color3.fromRGB(170, 30, 30) },
}

-- Sounds. Built-in rbxasset sounds ship with every Roblox client, so these
-- always load. Replace any entry with an rbxassetid:// from the Creator Store
-- (Toolbox > Audio) for higher quality audio; empty strings are skipped safely.
Config.Sounds = {
	Swing = "rbxasset://sounds/swordslash.wav",
	Hit = "rbxasset://sounds/swordlunge.wav",
	ZombieGroan = "rbxasset://sounds/uuhhh.mp3",
	Pickup = "rbxasset://sounds/electronicpingshort.wav",
	UiClick = "rbxasset://sounds/electronicpingshort.wav",
	Door = "rbxasset://sounds/action_jump.mp3",
	Footstep = "rbxasset://sounds/action_footsteps_plastic.mp3",
	-- Optional: paste Creator Store audio IDs below (e.g. "rbxassetid://123").
	AmbientHospital = "",
	AmbientCity = "",
	MusicMenu = "",
	MusicTension = "",
	MusicBoss = "",
}

-- Animations. These IDs belong to Roblox's own animation packages and load in
-- every experience.
Config.Animations = {
	ZombieIdle = "rbxassetid://616158929",
	ZombieWalk = "rbxassetid://616168032",
	ZombieRun = "rbxassetid://616163682",
	Emotes = {
		wave = "rbxassetid://507770239",
		point = "rbxassetid://507770453",
		cheer = "rbxassetid://507770677",
		dance = "rbxassetid://507771019",
	},
}

-- Monetization ---------------------------------------------------------------
-- IDs are created on create.roblox.com (see docs/PUBLISHING.md). An ID of 0
-- means "not configured yet": the shop hides that item and nothing can be sold.
Config.Monetization = {
	VipGamePassId = 0,
	-- Developer products grant cosmetics only. Never story or power.
	Products = {
		{ key = "bundle_hazmat", productId = 0, cosmetics = { "gear_hazmat", "light_toxic" }, name = "Hazmat Bundle", price = 99 },
		{ key = "bundle_nightops", productId = 0, cosmetics = { "gear_tactical", "light_ice", "title_ghost" }, name = "Night Ops Bundle", price = 149 },
		{ key = "emote_pack", productId = 0, cosmetics = { "emote_dance", "emote_cheer" }, name = "Survivor Emotes", price = 49 },
	},
}

-- Zombies --------------------------------------------------------------------
Config.Zombies = {
	TickRate = 0.15, -- AI update interval (seconds)
	PathRecomputeInterval = 1.2,
	MaxActiveBase = 8,
	MaxActivePerPlayer = 3,
	DespawnDistance = 260,
	AmbientRespawnDelay = 6,
	MutatedChance = 0.06,
	FastChance = 0.3,
}

-- Daily rewards rotate through these cosmetics (see Cosmetics.lua).
Config.DailyRewards = { "light_warm", "title_scavenger", "gear_scout", "light_amber", "title_nightwalker", "gear_medic", "light_violet" }

return Config
