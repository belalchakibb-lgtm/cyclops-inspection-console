--[[
	Chapters
	Chapter list for the CHAPTERS menu plus Chapter 1's mission stages.
	Only playable chapters set 'playable = true'. Chapters 2-5 are designed
	(see docs/STORY.md) but not built yet, and the menu says so honestly.
]]

local Layout = require(script.Parent:WaitForChild("Layout"))
local P = Layout.Points

local Chapters = {}

Chapters.List = {
	{ number = 1, id = "ch1", title = "The Outbreak", subtitle = "Escape St. Aurelia and the dead city.", playable = true },
	{ number = 2, id = "ch2", title = "The Survivors", subtitle = "Military Shelter EAGLE-3.", playable = false },
	{ number = 3, id = "ch3", title = "The Secret Lab", subtitle = "Helix Dynamics, Sublevel 4.", playable = false },
	{ number = 4, id = "ch4", title = "The Past", subtitle = "Ashford Bay, 2035.", playable = false },
	{ number = 5, id = "ch5", title = "Project Zero", subtitle = "The last day of the experiment.", playable = false },
}

-- Chapter 1 stages, in order. 'checkpoint' indexes Layout.Checkpoints.
-- 'grants' lists equipment every player must own from this stage on, so
-- late joiners and respawning players are never soft-locked.
Chapters.Chapter1 = {
	{ key = "find_light", text = "Search the nurse station for a light source", target = P.Flashlight, checkpoint = 1, grants = {}, hint = "move" },
	{ key = "find_weapon", text = "Find something to defend yourself in the storage room", target = P.Pipe, checkpoint = 1, grants = { "flashlight" }, hint = "flashlight" },
	{ key = "find_code", text = "The security office is locked. Search the Emergency Room for the code", target = P.ShiftNote, checkpoint = 2, grants = { "flashlight", "pipe" }, hint = "attack" },
	{ key = "security", text = "Enter the code at the Security Office and take the keycard", target = P.SecurityKeypad, checkpoint = 2, grants = { "flashlight", "pipe" } },
	{ key = "lobby", text = "Use the keycard on the lobby doors", target = P.LobbyReader, checkpoint = 2, grants = { "flashlight", "pipe" } },
	{ key = "survivor", text = "Follow the flare to the pharmacy", target = P.MayaSpot, checkpoint = 3, grants = { "flashlight", "pipe" }, hint = "sprint" },
	{ key = "fuse", text = "Get a fuse from the Precinct 9 armory", target = P.Fuse, checkpoint = 4, grants = { "flashlight", "pipe" } },
	{ key = "generator", text = "Install the fuse in the subway generator", target = P.Generator, checkpoint = 5, grants = { "flashlight", "pipe" } },
	{ key = "boss", text = "Defeat the Warden!", target = nil, checkpoint = 5, grants = { "flashlight", "pipe" } },
	{ key = "escape", text = "Enter the subway with Maya", target = P.EscapeZone, checkpoint = 5, grants = { "flashlight", "pipe" } },
}

Chapters.Chapter1Index = {}
for i, stage in ipairs(Chapters.Chapter1) do
	Chapters.Chapter1Index[stage.key] = i
end

-- Contextual tutorial hints (shown once per player, adapted to device on the client).
Chapters.Hints = {
	move = { pc = "WASD to move. Hold SHIFT to sprint. Press E near glowing objects to interact.", touch = "Use the left stick to move. Tap the prompts that appear near objects to interact." },
	flashlight = { pc = "Press F to toggle your flashlight. Light attracts the infected.", touch = "Tap the LIGHT button to toggle your flashlight. Light attracts the infected." },
	attack = { pc = "Equip the pipe with 1, then click to swing.", touch = "Tap the pipe in your hotbar, then tap the screen to swing." },
	sprint = { pc = "Sprinting is loud - the infected hear running footsteps. Press M for the map.", touch = "Tap RUN to sprint - but the infected hear running footsteps. Tap MAP to see where to go." },
	inventory = { pc = "Press TAB to open your inventory and read documents.", touch = "Tap the BAG button to open your inventory and read documents." },
}

return Chapters
