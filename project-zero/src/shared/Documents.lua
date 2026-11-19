--[[
	Documents
	Story documents advance or explain the plot. Research files are hidden
	collectibles that reward exploration and reveal the deeper mystery.
	Text uses "{CODE}" which the server replaces with the session's random
	security code, so the keypad puzzle changes every playthrough.
]]

local Documents = {
	patient_log = {
		chapter = 1,
		kind = "story",
		title = "Ward 3B - Patient Log",
		text = "PATIENT: UNKNOWN (wristband: SUBJECT 00)\n"
			.. "TRANSFERRED FROM: Helix Dynamics, Sublevel 4\n\n"
			.. "Day 1 - Patient arrived sedated. Helix staff insisted on no identification.\n"
			.. "Day 9 - Vitals impossible. Cell renewal rate 400% above baseline.\n"
			.. "Day 12 - Helix courier collected blood samples. Again.\n"
			.. "Day 14 - The city is in lockdown. Staff evacuating. Orders say: DO NOT WAKE THE SUBJECT.\n\n"
			.. "Why would they leave the one patient they cared about?",
	},
	shift_note = {
		chapter = 1,
		kind = "story",
		title = "Crumpled Shift Note",
		text = "Dana -\n\nSecurity changed the office code again because of the Helix people.\n"
			.. "New code is {CODE}. Memorise it and BURN this note.\n\n"
			.. "If the ER gets worse, take the keycard from the security office and get out through the lobby.\n\n- R.",
	},
	cctv_log = {
		chapter = 1,
		kind = "story",
		title = "CCTV Log - Camera 07, 03:14",
		text = "03:14 - Four figures in white hazmat suits enter Ward 3B. Suits bear the Helix Dynamics double-spiral logo.\n"
			.. "03:16 - One figure places a small black cube on the patient's chest. The camera feed distorts.\n"
			.. "03:17 - Feed restored. The cube is gone. The patient's heart monitor shows two overlapping heartbeats.\n"
			.. "03:20 - Figures leave. One says: 'Zero is stable. Tell Voss it worked.'\n\n"
			.. "[END OF RECORDING]",
	},
	evac_order = {
		chapter = 1,
		kind = "story",
		title = "Evacuation Order 7",
		text = "ASHFORD BAY EMERGENCY AUTHORITY\n\n"
			.. "All civilians are to report to Line 4 subway evacuation trains.\n"
			.. "Military Shelter EAGLE-3 will accept survivors until further notice.\n\n"
			.. "Handwritten at the bottom: 'The trains never came. The shelter is still out there. Follow the tunnels north.'",
	},
	maintenance_memo = {
		chapter = 1,
		kind = "story",
		title = "Maintenance Memo",
		text = "To all officers:\n\nThe armory door runs on the old breaker panel.\n"
			.. "If the power trips, reset ONLY breakers 1 and 3. Breaker 2 feeds the cells and will lock everything down.\n\n"
			.. "- Facilities",
	},

	-- Hidden research files (collectibles) --------------------------------
	rf_01 = {
		chapter = 1,
		kind = "research",
		title = "Research File 01 - Cell Renewal Trial",
		text = "HELIX DYNAMICS - INTERNAL\n\nProject lead: Dr. Elias Voss\n\n"
			.. "Goal: a compound that repairs any damaged human cell. Phase 1 results are miraculous: wounds closing in minutes.\n\n"
			.. "Side effect noted in 3% of volunteers: aggression, loss of speech, fever. Board decision: continue.",
	},
	rf_02 = {
		chapter = 1,
		kind = "research",
		title = "Research File 02 - Voss's Journal",
		text = "The compound alone is not enough. It needs a template - cells from a body that never ages.\n\n"
			.. "The Cube gives us that. It does not belong to this year. I do not fully understand where it came from.\n\n"
			.. "Note to self: stop telling the board where the Cube came from. They laughed.",
	},
	rf_03 = {
		chapter = 1,
		kind = "research",
		title = "Research File 03 - Transfer Order",
		text = "TRANSFER ORDER - SUBJECT 00\nFrom: Sublevel 4\nTo: St. Aurelia, Ward 3B (secure)\n\n"
			.. "Reason: Subject must be kept away from the Cube until the timeline stabilises.\n"
			.. "Authorised: E. Voss\n\nWhy does a transfer order mention a 'timeline'?",
	},
	rf_04 = {
		chapter = 1,
		kind = "research",
		title = "Research File 04 - Newspaper Clipping, 2035",
		text = "ASHFORD BAY HERALD, MAY 2035\n\nLOCAL SCIENTIST PROMISES 'END OF DISEASE'\n\n"
			.. "Dr. Elias Voss of Helix Dynamics unveiled Project ZERO yesterday. 'In two years,' Voss said, "
			.. "'nobody in this city will ever be sick again.'\n\nThe clipping is circled in red. Someone wrote: 'TWO YEARS. EXACTLY.'",
	},
	rf_05 = {
		chapter = 1,
		kind = "research",
		title = "Research File 05 - Unsent Message",
		text = "If you're reading this, you made it out of the hospital. Good.\n\n"
			.. "You won't remember me, but I remember you. You've done this before.\n\n"
			.. "Find the Cube. Go back. And this time, do NOT trust the man in the white coat.\n\n- Z",
	},
}

-- Ordered lists for UI
Documents.Order = { "patient_log", "shift_note", "cctv_log", "evac_order", "maintenance_memo", "rf_01", "rf_02", "rf_03", "rf_04", "rf_05" }
Documents.ResearchChapter1 = { "rf_01", "rf_02", "rf_03", "rf_04", "rf_05" }

return Documents
