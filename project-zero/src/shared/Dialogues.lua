--[[
	Dialogues
	Each dialogue: { start = nodeId, nodes = { [id] = node } }
	node fields:
	  speaker, text
	  choices = { { text, next, trust = number?, flag = string? } }  (player picks)
	  next    = nodeId  (single "Continue" button)
	  event   = string  (server mission hook fired when the node is reached)
	  A node with neither choices nor next ends the conversation.
	Choices change persistent story flags that later chapters and the
	endings read (e.g. mayaTrust, toldMayaAboutWristband).
]]

local Dialogues = {}

Dialogues.maya_intro = {
	start = "a1",
	nodes = {
		a1 = {
			speaker = "Maya",
			text = "Stop. Right there. Show me your arms - slowly. Are you bitten?",
			choices = {
				{ text = "I'm not bitten. I just woke up in St. Aurelia.", next = "a2", trust = 1 },
				{ text = "Lower the bat. If I were one of them, you'd know.", next = "a2b" },
				{ text = "(Show her the hospital wristband.)", next = "a3", trust = 2, flag = "showedWristband" },
			},
		},
		a2 = {
			speaker = "Maya",
			text = "Woke up? Nobody has 'woken up' in that hospital for two weeks. The whole east side went dark on day three.",
			next = "a4",
		},
		a2b = {
			speaker = "Maya",
			text = "...Fair. They don't talk back. Sorry. You learn to swing first out here.",
			next = "a4",
		},
		a3 = {
			speaker = "Maya",
			text = "SUBJECT 00... That's a Helix tag. I've seen those - on the people they took off the street before everything went wrong.",
			next = "a4",
		},
		a4 = {
			speaker = "Maya",
			text = "I'm Maya. Paramedic, before. I've been trying to reach Shelter EAGLE-3 through the Line 4 subway, but the gate is dead.",
			choices = {
				{ text = "What happened to this city?", next = "b1" },
				{ text = "What does 'Helix' have to do with any of this?", next = "b2", trust = 1 },
				{ text = "How do we get the gate open?", next = "c1" },
			},
		},
		b1 = {
			speaker = "Maya",
			text = "A fever. Then rage. Then... that. The news called it a virus. But it started in one district - right around Helix Dynamics.",
			next = "c0",
		},
		b2 = {
			speaker = "Maya",
			text = "Helix ran a 'miracle' cell trial. Two weeks later, half their volunteers were in my ambulance. None of them were sick the way the news said.",
			next = "c0",
		},
		c0 = {
			speaker = "Maya",
			text = "Look - talk later. Right now we need power for the subway gate.",
			next = "c1",
		},
		c1 = {
			speaker = "Maya",
			text = "The generator by the subway needs a fuse. Precinct 9, up the street - the armory keeps spares. The armory door runs on an old breaker panel.",
			choices = {
				{ text = "I'll get the fuse. Stay hidden.", next = "d1", trust = 1 },
				{ text = "Why don't you get it yourself?", next = "d2", trust = -1 },
			},
		},
		d1 = {
			speaker = "Maya",
			text = "Thank you. I'll meet you at the subway. And... watch for the big ones. They don't go down easy.",
			event = "maya_done",
		},
		d2 = {
			speaker = "Maya",
			text = "Because something huge has been circling that station all week, and I have one bat and one knee that works. Your turn, hero.",
			event = "maya_done",
		},
	},
}

Dialogues.maya_repeat = {
	start = "r1",
	nodes = {
		r1 = {
			speaker = "Maya",
			text = "Precinct 9 is up Kessler Street. Get the fuse from the armory and meet me at the subway generator.",
		},
	},
}

Dialogues.maya_gate = {
	start = "g1",
	nodes = {
		g1 = {
			speaker = "Maya",
			text = "You actually did it. The gate's open. EAGLE-3 is north through the tunnels - stay close.",
		},
	},
}

return Dialogues
