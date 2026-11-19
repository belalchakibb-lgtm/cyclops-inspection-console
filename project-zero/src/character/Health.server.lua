--[[
	Replaces Roblox's default "Health" character script, which regenerates
	health quickly. PROJECT: ZERO handles healing on the server instead
	(slow passive regen up to a cap + bandages/medkits in PlayerService).
	Keeping this script (even though it does nothing) is what disables the
	default one: Roblox only inserts its own Health script when none exists.
]]
