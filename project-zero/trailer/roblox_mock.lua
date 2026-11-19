-- Minimal Roblox API mock: just enough to run the World builder modules
-- outside Roblox and capture every part they create (for the trailer renderer).
local mt = {}

-- Vector3 -----------------------------------------------------------------
local V3 = {}
V3.__index = function(v, k)
	if k == "Magnitude" then return math.sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z) end
	if k == "Unit" then local m = math.sqrt(v.X * v.X + v.Y * v.Y + v.Z * v.Z); return Vector3.new(v.X / m, v.Y / m, v.Z / m) end
	return V3[k]
end
function V3.Lerp(a, b, t) return a + (b - a) * t end
V3.__add = function(a, b) return Vector3.new(a.X + b.X, a.Y + b.Y, a.Z + b.Z) end
V3.__sub = function(a, b) return Vector3.new(a.X - b.X, a.Y - b.Y, a.Z - b.Z) end
V3.__unm = function(a) return Vector3.new(-a.X, -a.Y, -a.Z) end
V3.__mul = function(a, b)
	if type(a) == "number" then return Vector3.new(a * b.X, a * b.Y, a * b.Z) end
	if type(b) == "number" then return Vector3.new(a.X * b, a.Y * b, a.Z * b) end
	return Vector3.new(a.X * b.X, a.Y * b.Y, a.Z * b.Z)
end
V3.__div = function(a, b)
	if type(b) == "number" then return Vector3.new(a.X / b, a.Y / b, a.Z / b) end
	return Vector3.new(a.X / b.X, a.Y / b.Y, a.Z / b.Z)
end
Vector3 = { new = function(x, y, z) return setmetatable({ X = x or 0, Y = y or 0, Z = z or 0, __v3 = true }, V3) end }
Vector3.zero = Vector3.new(0, 0, 0)

-- CFrame (position + row-major 3x3 rotation) --------------------------------
local CF = {}
CF.__index = function(c, k)
	if k == "Position" then return Vector3.new(c.x, c.y, c.z) end
	if k == "X" then return c.x end
	if k == "Y" then return c.y end
	if k == "Z" then return c.z end
	return CF[k]
end
local function mk(x, y, z, r) return setmetatable({ x = x, y = y, z = z, r = r }, CF) end
local I = { 1, 0, 0, 0, 1, 0, 0, 0, 1 }
local function mmul(a, b)
	local o = {}
	for i = 0, 2 do for j = 0, 2 do
		o[i * 3 + j + 1] = a[i * 3 + 1] * b[j + 1] + a[i * 3 + 2] * b[3 + j + 1] + a[i * 3 + 3] * b[6 + j + 1]
	end end
	return o
end
CF.__mul = function(a, b)
	local r = a.r
	if getmetatable(b) == V3 then
		return Vector3.new(a.x + r[1] * b.X + r[2] * b.Y + r[3] * b.Z, a.y + r[4] * b.X + r[5] * b.Y + r[6] * b.Z, a.z + r[7] * b.X + r[8] * b.Y + r[9] * b.Z)
	end
	local px = a.x + r[1] * b.x + r[2] * b.y + r[3] * b.z
	local py = a.y + r[4] * b.x + r[5] * b.y + r[6] * b.z
	local pz = a.z + r[7] * b.x + r[8] * b.y + r[9] * b.z
	return mk(px, py, pz, mmul(r, b.r))
end
CF.__add = function(a, v) return mk(a.x + v.X, a.y + v.Y, a.z + v.Z, a.r) end
CFrame = {}
CFrame.new = function(x, y, z)
	if type(x) == "table" then return mk(x.X, x.Y, x.Z, I) end
	return mk(x or 0, y or 0, z or 0, I)
end
local function rx(a) local c, s = math.cos(a), math.sin(a); return { 1, 0, 0, 0, c, -s, 0, s, c } end
local function ry(a) local c, s = math.cos(a), math.sin(a); return { c, 0, s, 0, 1, 0, -s, 0, c } end
local function rz(a) local c, s = math.cos(a), math.sin(a); return { c, -s, 0, s, c, 0, 0, 0, 1 } end
CFrame.Angles = function(a, b, c) return mk(0, 0, 0, mmul(mmul(rx(a), ry(b)), rz(c))) end
CFrame.lookAt = function(p, t)
	local f = (t - p).Unit
	local right = Vector3.new(-f.Z, 0, f.X); local m = right.Magnitude
	right = Vector3.new(right.X / m, 0, right.Z / m)
	local up = Vector3.new(right.Y * -f.Z - right.Z * -f.Y, right.Z * -f.X - right.X * -f.Z, right.X * -f.Y - right.Y * -f.X)
	return mk(p.X, p.Y, p.Z, { right.X, up.X, -f.X, right.Y, up.Y, -f.Y, right.Z, up.Z, -f.Z })
end

Color3 = {
	fromRGB = function(r, g, b) return { R = r / 255, G = g / 255, B = b / 255, Lerp = function(s, o, t) return { R = s.R + (o.R - s.R) * t, G = s.G + (o.G - s.G) * t, B = s.B + (o.B - s.B) * t, Lerp = s.Lerp } end } end,
}
Color3.new = function(r, g, b) local c = Color3.fromRGB(0, 0, 0); c.R, c.G, c.B = r, g, b; return c end

local function enumProxy(prefix)
	return setmetatable({}, { __index = function(t, k) local v = prefix and (prefix .. "." .. k) or enumProxy(k); rawset(t, k, v); return v end })
end
Enum = enumProxy(nil)

UDim2 = { new = function() return {} end, fromScale = function() return {} end, fromOffset = function() return {} end }
NumberSequence = { new = function() return {} end }
NumberSequenceKeypoint = { new = function() return {} end }
ColorSequence = { new = function() return {} end }
NumberRange = { new = function() return {} end }
TweenInfo = { new = function() return {} end }

-- Random (deterministic LCG)
Random = { new = function(seed)
	local s = (seed or 1) % 2147483647
	local o = {}
	local function nxt() s = (s * 48271) % 2147483647; return s / 2147483647 end
	function o:NextNumber(a, b) a = a or 0; b = b or 1; return a + (b - a) * nxt() end
	function o:NextInteger(a, b) return math.floor(a + (b - a + 1) * nxt()) end
	return o
end }

math.clamp = function(x, a, b) return math.max(a, math.min(b, x)) end
table.find = function(t, v) for i, x in ipairs(t) do if x == v then return i end end end

-- Instances -------------------------------------------------------------------
ALL = {}
local Inst = {}
local function newInst(className)
	local o = { ClassName = className, Name = className, Children = {}, Props = {} }
	return setmetatable(o, Inst)
end
Inst.__index = function(o, k)
	local m = rawget(Inst, k)
	if m then return m end
	if k == "Parent" then return rawget(o, "_parent") end
	return o.Props[k]
end
Inst.__newindex = function(o, k, v)
	if k == "Parent" then
		local old = rawget(o, "_parent")
		if old then for i, c in ipairs(old.Children) do if c == o then table.remove(old.Children, i) break end end end
		rawset(o, "_parent", v)
		if v then table.insert(v.Children, o) end
		return
	end
	o.Props[k] = v
end
function Inst.FindFirstChild(o, n) for _, c in ipairs(o.Children) do if c.Props.Name == n or (c.Props.Name == nil and c.ClassName == n) then return c end end end
function Inst.GetChildren(o) local t = {} for i, c in ipairs(o.Children) do t[i] = c end return t end
function Inst.GetDescendants(o) local t = {} local function w(x) for _, c in ipairs(x.Children) do table.insert(t, c) w(c) end end w(o) return t end
function Inst.IsA(o, c) return o.ClassName == c or (c == "BasePart" and (o.ClassName == "Part" or o.ClassName == "WedgePart")) end
function Inst.Destroy(o) o.Parent = nil end
function Inst.ClearAllChildren(o) o.Children = {} end
Instance = { new = function(c) local o = newInst(c); table.insert(ALL, o); return o end }

local services = {}
game = { GetService = function(_, n)
	if not services[n] then
		local s = newInst(n)
		s.Props.Name = n
		s.AddTag = function() end
		s.Create = function() return { Play = function() end } end
		s.AddItem = function() end
		services[n] = s
	end
	return services[n]
end }
workspace = newInst("Workspace")
