--[[
	Cosmetics (purely visual - never gameplay power)
	category:
	  light  - flashlight beam colour
	  gear   - survival gear attached to the character (backpack styles)
	  title  - name tag shown above the head
	  emote  - cosmetic animation
	source: default | daily | achievement | vip | product
]]

local Cosmetics = {
	-- Flashlight beams
	light_default = { category = "light", name = "Standard Beam", source = "default", color = Color3.fromRGB(255, 244, 214) },
	light_warm = { category = "light", name = "Warm Beam", source = "daily", color = Color3.fromRGB(255, 205, 150) },
	light_amber = { category = "light", name = "Amber Beam", source = "daily", color = Color3.fromRGB(255, 170, 60) },
	light_violet = { category = "light", name = "Violet Beam", source = "daily", color = Color3.fromRGB(190, 150, 255) },
	light_gold = { category = "light", name = "VIP Gold Beam", source = "vip", color = Color3.fromRGB(255, 215, 90) },
	light_toxic = { category = "light", name = "Toxic Beam", source = "product", color = Color3.fromRGB(150, 255, 120) },
	light_ice = { category = "light", name = "Ice Beam", source = "product", color = Color3.fromRGB(140, 220, 255) },
	light_archivist = { category = "light", name = "Archivist Beam", source = "achievement", color = Color3.fromRGB(120, 255, 230) },

	-- Gear (backpack styles)
	gear_none = { category = "gear", name = "No Gear", source = "default", style = "none" },
	gear_scout = { category = "gear", name = "Scout Pack", source = "daily", style = "pack", color = Color3.fromRGB(85, 95, 60), accent = Color3.fromRGB(40, 40, 40) },
	gear_medic = { category = "gear", name = "Medic Pack", source = "daily", style = "pack", color = Color3.fromRGB(230, 230, 230), accent = Color3.fromRGB(200, 30, 30) },
	gear_survivor = { category = "gear", name = "Survivor Pack", source = "achievement", style = "pack", color = Color3.fromRGB(110, 70, 40), accent = Color3.fromRGB(200, 160, 60) },
	gear_vip = { category = "gear", name = "VIP Expedition Pack", source = "vip", style = "pack", color = Color3.fromRGB(25, 25, 30), accent = Color3.fromRGB(255, 205, 70) },
	gear_hazmat = { category = "gear", name = "Hazmat Tank", source = "product", style = "tank", color = Color3.fromRGB(240, 200, 30), accent = Color3.fromRGB(30, 30, 30) },
	gear_tactical = { category = "gear", name = "Tactical Rig", source = "product", style = "pack", color = Color3.fromRGB(35, 40, 50), accent = Color3.fromRGB(120, 200, 255) },

	-- Titles
	title_none = { category = "title", name = "No Title", source = "default", text = "" },
	title_scavenger = { category = "title", name = "Scavenger", source = "daily", text = "SCAVENGER", color = Color3.fromRGB(200, 200, 200) },
	title_nightwalker = { category = "title", name = "Nightwalker", source = "daily", text = "NIGHTWALKER", color = Color3.fromRGB(170, 150, 255) },
	title_survivor = { category = "title", name = "Survivor", source = "achievement", text = "SURVIVOR", color = Color3.fromRGB(120, 255, 140) },
	title_untouchable = { category = "title", name = "Untouchable", source = "achievement", text = "UNTOUCHABLE", color = Color3.fromRGB(120, 220, 255) },
	title_vip = { category = "title", name = "VIP", source = "vip", text = "VIP", color = Color3.fromRGB(255, 215, 90) },
	title_ghost = { category = "title", name = "Ghost", source = "product", text = "GHOST", color = Color3.fromRGB(160, 220, 255) },

	-- Emotes
	emote_wave = { category = "emote", name = "Wave", source = "default", anim = "wave" },
	emote_point = { category = "emote", name = "Point", source = "default", anim = "point" },
	emote_cheer = { category = "emote", name = "Cheer", source = "product", anim = "cheer" },
	emote_dance = { category = "emote", name = "Dance", source = "product", anim = "dance" },
}

Cosmetics.Defaults = {
	light = "light_default",
	gear = "gear_none",
	title = "title_none",
}

Cosmetics.VipItems = { "light_gold", "gear_vip", "title_vip" }

Cosmetics.Categories = { "light", "gear", "title", "emote" }

Cosmetics.CategoryNames = {
	light = "Flashlight",
	gear = "Gear",
	title = "Titles",
	emote = "Emotes",
}

return Cosmetics
