--[[
	Util - small shared helpers.
]]

local Util = {}

function Util.deepCopy(value)
	if type(value) ~= "table" then
		return value
	end
	local copy = {}
	for k, v in pairs(value) do
		copy[Util.deepCopy(k)] = Util.deepCopy(v)
	end
	return copy
end

-- Fill missing keys in 'target' from 'template' (used for profile migration).
function Util.reconcile(target, template)
	for k, v in pairs(template) do
		if target[k] == nil then
			target[k] = Util.deepCopy(v)
		elseif type(v) == "table" and type(target[k]) == "table" then
			Util.reconcile(target[k], v)
		end
	end
	return target
end

function Util.formatTime(seconds)
	seconds = math.max(0, math.floor(seconds or 0))
	local m = math.floor(seconds / 60)
	local s = seconds % 60
	return string.format("%d:%02d", m, s)
end

function Util.countKeys(t)
	local n = 0
	if t then
		for _ in pairs(t) do
			n = n + 1
		end
	end
	return n
end

-- UTC day number, used for daily rewards.
function Util.dayNumber(unixTime)
	return math.floor((unixTime or os.time()) / 86400)
end

function Util.flatDistance(a, b)
	local dx, dz = a.X - b.X, a.Z - b.Z
	return math.sqrt(dx * dx + dz * dz)
end

return Util
