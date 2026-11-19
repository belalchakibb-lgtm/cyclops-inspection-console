--[[
	Achievements. Rewards are cosmetic only.
]]

local Achievements = {
	wake_up = { name = "Wake-Up Call", description = "Wake up in Ward 3B.", order = 1 },
	first_takedown = { name = "First Takedown", description = "Stop your first infected.", order = 2 },
	code_breaker = { name = "Code Breaker", description = "Open the security office.", order = 3 },
	secret_keeper = { name = "Secret Keeper", description = "Find the hidden records room.", order = 4 },
	first_contact = { name = "First Contact", description = "Meet another survivor.", order = 5 },
	electrician = { name = "Electrician", description = "Solve the breaker puzzle.", order = 6 },
	warden_down = { name = "Lights Out, Warden", description = "Defeat the Warden.", order = 7 },
	chapter1 = { name = "The Outbreak", description = "Complete Chapter 1.", reward = "title_survivor", order = 8 },
	archivist1 = { name = "Archivist", description = "Collect every Chapter 1 research file.", reward = "light_archivist", order = 9 },
	untouchable1 = { name = "Untouchable", description = "Finish Chapter 1 without going down.", reward = "title_untouchable", order = 10 },
	heavy_hitter = { name = "Heavy Hitter", description = "Find the Fire Axe.", order = 11 },
	exterminator = { name = "Exterminator", description = "Stop 100 infected in total.", reward = "gear_survivor", order = 12 },
	speedrunner1 = { name = "Against the Clock", description = "Finish Chapter 1 in under 15 minutes.", order = 13 },
	team_player = { name = "No One Left Behind", description = "Revive a teammate.", order = 14 },
}

return Achievements
