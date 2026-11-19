--[[
	Cinematics
	Data-driven camera sequences played by the client CinematicController.
	Each shot:
	  duration        seconds
	  from / to       { pos = Vector3, look = Vector3 }  (camera glides from -> to)
	  fov             field of view (default 70)
	  black = true    black screen (used for title cards)
	  title           large centred text (title cards)
	  speaker / line  subtitle
	  shake           camera shake intensity (0 - 1)
	  flicker         flicker the screen like failing lights
	  fadeIn          fade from black at shot start
	All cinematics are skippable and kept short so they never drag gameplay.
]]

local Layout = require(script.Parent:WaitForChild("Layout"))
local P = Layout.Points

local V = Vector3.new

local Cinematics = {}

Cinematics.intro = {
	skippable = true,
	shots = {
		{ duration = 3.2, black = true, title = "2037" },
		{ duration = 4.2, black = true, title = "Fourteen months after the Helix Cell Renewal Trial,\nthe city of Ashford Bay went silent." },
		{
			duration = 6,
			fadeIn = true,
			from = { pos = V(230, 70, 30), look = V(100, 5, 170) },
			to = { pos = V(190, 55, 70), look = V(90, 5, 190) },
			fov = 60,
			speaker = "Radio",
			line = "...this is the Ashford Bay Emergency Authority. Evacuation trains have been suspended. Stay indoors...",
		},
		{
			duration = 5,
			from = { pos = V(110, 9, 30), look = V(10, 6, 30) },
			to = { pos = V(70, 8, 30), look = V(0, 6, 30) },
			fov = 65,
			flicker = true,
			speaker = "Radio",
			line = "...repeat: do not approach the infected. They are attracted to noise and light...",
		},
		{
			duration = 5.5,
			from = { pos = V(16, 12, 20), look = P.WardBed },
			to = { pos = V(10, 7, 14), look = P.WardBed },
			fov = 55,
			speaker = "Recording",
			line = "Subject Zero-Zero... vitals stable. Do not wake the subject. Repeat - do NOT wake the-",
		},
		{ duration = 1.6, black = true, shake = 0.6, speaker = "", line = "" },
		{
			duration = 3.4,
			fadeIn = true,
			from = { pos = V(6, 4, 13), look = V(14, 5, 20) },
			to = { pos = V(7, 5, 13), look = V(15, 5, 24) },
			fov = 70,
			shake = 0.15,
			speaker = "You",
			line = "...Where... am I?",
		},
	},
}

Cinematics.lobby_open = {
	skippable = true,
	shots = {
		{
			duration = 4.5,
			from = { pos = V(65, 8, 74), look = V(65, 6, 100) },
			to = { pos = V(65, 10, 90), look = V(90, 8, 150) },
			fov = 60,
			speaker = "You",
			line = "The whole city... it's gone quiet.",
		},
		{
			duration = 4,
			from = { pos = V(110, 30, 120), look = P.PharmacyFlare },
			to = { pos = V(122, 28, 128), look = P.PharmacyFlare },
			fov = 45,
			speaker = "You",
			line = "A flare. Someone's alive out there.",
		},
	},
}

Cinematics.meet_maya = {
	skippable = true,
	shots = {
		{
			duration = 3.2,
			from = { pos = V(136, 7, 146), look = V(147, 4, 152) },
			to = { pos = V(139, 6, 149), look = V(147, 4.5, 152) },
			fov = 50,
			shake = 0.1,
			speaker = "???",
			line = "Don't move. One more step and I swing.",
		},
	},
}

Cinematics.boss_reveal = {
	skippable = true,
	shots = {
		{
			duration = 2.8,
			from = { pos = V(128, 7, 270), look = V(128, 3, 282) },
			to = { pos = V(122, 8, 266), look = V(128, 4, 282) },
			fov = 60,
			speaker = "Generator",
			line = "*clunk* ...*whirrrr*",
		},
		{
			duration = 4.4,
			from = { pos = V(100, 6, 250), look = V(100, 8, 270) },
			to = { pos = V(100, 4, 254), look = V(100, 11, 266) },
			fov = 50,
			shake = 0.5,
			speaker = "Maya (radio)",
			line = "The noise - it's coming! That's the Warden! He used to run hospital security... stay away from his slam!",
		},
	},
}

Cinematics.escape = {
	skippable = true,
	shots = {
		{
			duration = 4.5,
			from = { pos = V(100, 8, 280), look = V(100, 2, 305) },
			to = { pos = V(100, 5, 292), look = V(100, -4, 320) },
			fov = 60,
			speaker = "Maya",
			line = "Into the tunnels. EAGLE-3 is three stations north - if it's still standing.",
		},
		{
			duration = 5,
			black = true,
			title = "Inside your pocket, something you don't remember taking:\na photo of you - standing beside Dr. Elias Voss.",
		},
		{ duration = 3.5, black = true, title = "CHAPTER 1 COMPLETE\nTHE OUTBREAK" },
	},
}

return Cinematics
