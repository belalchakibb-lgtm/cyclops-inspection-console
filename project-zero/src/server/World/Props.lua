--[[
	Props
	Reusable, low-part-count environment props built from primitives.
	Every function takes a CFrame (position + facing) and a parent.
	Props are original designs built from basic parts (no external assets).
]]

local Builder = require(script.Parent:WaitForChild("Builder"))

local M = Enum.Material
local rgb = Color3.fromRGB

local Props = {}

local function p(model, cf, size, material, color, extra)
	local props = { CFrame = cf, Size = size, Material = material, Color = color }
	if extra then
		for k, v in pairs(extra) do
			props[k] = v
		end
	end
	return Builder.part(props, model)
end

function Props.bed(cf, parent)
	local m = Builder.model("HospitalBed", parent)
	p(m, cf * CFrame.new(0, 1.6, 0), Vector3.new(4, 0.6, 8), M.Metal, rgb(170, 175, 180))
	p(m, cf * CFrame.new(0, 2.2, 0), Vector3.new(3.6, 0.6, 7.6), M.Fabric, rgb(215, 225, 230))
	p(m, cf * CFrame.new(0, 2.6, -3), Vector3.new(2.6, 0.5, 1.4), M.Fabric, rgb(240, 240, 240))
	p(m, cf * CFrame.new(0, 2.4, 1.2), Vector3.new(3.7, 0.25, 4.8), M.Fabric, rgb(140, 175, 195))
	for _, x in ipairs({ -1.7, 1.7 }) do
		for _, z in ipairs({ -3.6, 3.6 }) do
			p(m, cf * CFrame.new(x, 0.65, z), Vector3.new(0.3, 1.3, 0.3), M.Metal, rgb(120, 120, 125))
		end
	end
	p(m, cf * CFrame.new(0, 3.2, -3.9), Vector3.new(4, 2.6, 0.3), M.Metal, rgb(170, 175, 180))
	return m
end

function Props.desk(cf, parent, color)
	local m = Builder.model("Desk", parent)
	p(m, cf * CFrame.new(0, 3, 0), Vector3.new(7, 0.4, 3.4), M.WoodPlanks, color or rgb(110, 85, 60))
	for _, x in ipairs({ -3.2, 3.2 }) do
		p(m, cf * CFrame.new(x, 1.4, 0), Vector3.new(0.4, 2.8, 3.2), M.Wood, rgb(80, 60, 45))
	end
	return m
end

function Props.counter(cf, length, parent)
	local m = Builder.model("Counter", parent)
	p(m, cf * CFrame.new(0, 1.5, 0), Vector3.new(length, 3, 2.5), M.SmoothPlastic, rgb(190, 195, 200))
	p(m, cf * CFrame.new(0, 3.1, 0), Vector3.new(length + 0.4, 0.2, 2.9), M.Marble, rgb(225, 225, 220))
	return m
end

function Props.chair(cf, parent, toppled)
	local m = Builder.model("Chair", parent)
	local base = toppled and (cf * CFrame.Angles(0, 0, math.rad(90)) * CFrame.new(-0.6, 0, 0)) or cf
	p(m, base * CFrame.new(0, 1.8, 0), Vector3.new(2, 0.3, 2), M.Fabric, rgb(60, 70, 80))
	p(m, base * CFrame.new(0, 3, 0.9), Vector3.new(2, 2.2, 0.3), M.Fabric, rgb(60, 70, 80))
	p(m, base * CFrame.new(0, 0.85, 0), Vector3.new(0.3, 1.7, 0.3), M.Metal, rgb(90, 90, 95))
	return m
end

function Props.cabinet(cf, parent, height)
	local h = height or 6
	local m = Builder.model("Cabinet", parent)
	p(m, cf * CFrame.new(0, h / 2, 0), Vector3.new(3, h, 2), M.Metal, rgb(120, 130, 135))
	for i = 1, 3 do
		p(m, cf * CFrame.new(0, h * i / 4, -1.05), Vector3.new(1, 0.2, 0.1), M.Metal, rgb(60, 60, 60))
	end
	return m
end

function Props.shelf(cf, parent, color)
	local m = Builder.model("Shelf", parent)
	local c = color or rgb(95, 70, 50)
	p(m, cf * CFrame.new(0, 4, 0.9), Vector3.new(6, 8, 0.3), M.Wood, c)
	for _, x in ipairs({ -2.9, 2.9 }) do
		p(m, cf * CFrame.new(x, 4, 0), Vector3.new(0.3, 8, 2), M.Wood, c)
	end
	for i = 0, 3 do
		p(m, cf * CFrame.new(0, 0.3 + i * 2.4, 0), Vector3.new(5.6, 0.25, 2), M.Wood, c)
		-- binders / boxes
		p(m, cf * CFrame.new(-1.2 + (i % 2) * 1.5, 1.1 + i * 2.4, 0), Vector3.new(2.2, 1.4, 1.4), M.Cardboard, rgb(170 - i * 15, 140, 100))
	end
	return m
end

function Props.gurney(cf, parent)
	local m = Builder.model("Gurney", parent)
	p(m, cf * CFrame.new(0, 2.4, 0), Vector3.new(2.6, 0.4, 6.5), M.Fabric, rgb(200, 210, 215))
	p(m, cf * CFrame.new(0, 2.1, 0), Vector3.new(2.4, 0.2, 6.3), M.Metal, rgb(160, 160, 165))
	p(m, cf * CFrame.new(0, 1.05, 0), Vector3.new(0.3, 2.1, 5), M.Metal, rgb(130, 130, 135))
	return m
end

-- Computer terminal with a glowing screen.
function Props.terminal(cf, parent, text)
	local m = Builder.model("Terminal", parent)
	p(m, cf * CFrame.new(0, 3.5, 0.3), Vector3.new(2.4, 0.2, 1.4), M.SmoothPlastic, rgb(40, 40, 45))
	local screen = p(m, cf * CFrame.new(0, 4.6, 0.6), Vector3.new(2.6, 1.8, 0.2), M.SmoothPlastic, rgb(15, 25, 20))
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.LightInfluence = 0
	gui.Brightness = 2
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	gui.PixelsPerStud = 50
	gui.Parent = screen
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundColor3 = rgb(5, 20, 12)
	label.TextColor3 = rgb(80, 255, 140)
	label.Font = Enum.Font.Code
	label.TextScaled = true
	label.Text = text or "> HELIX SECURE\n> ACCESS LOG"
	label.Parent = gui
	local light = Instance.new("SurfaceLight")
	light.Face = Enum.NormalId.Front
	light.Color = rgb(80, 255, 140)
	light.Brightness = 0.6
	light.Range = 6
	light.Parent = screen
	return m, screen
end

function Props.crate(cf, parent, size)
	local s = size or 3
	local m = Builder.model("Crate", parent)
	p(m, cf * CFrame.new(0, s / 2, 0), Vector3.new(s, s, s), M.WoodPlanks, rgb(130, 100, 65))
	return m
end

function Props.barrel(cf, parent, burning)
	local m = Builder.model(burning and "FireBarrel" or "Barrel", parent)
	local b = p(m, cf * CFrame.new(0, 1.9, 0) * CFrame.Angles(0, 0, math.rad(90)), Vector3.new(3.8, 2.6, 2.6), M.CorrodedMetal, rgb(90, 60, 40), { Shape = Enum.PartType.Cylinder })
	if burning then
		local fire = Instance.new("Fire")
		fire.Size = 5
		fire.Heat = 9
		fire.Color = rgb(255, 140, 40)
		fire.SecondaryColor = rgb(255, 60, 20)
		fire.Parent = b
		local light = Instance.new("PointLight")
		light.Color = rgb(255, 150, 70)
		light.Range = 22
		light.Brightness = 2
		light.Shadows = false
		light.Parent = b
	end
	return m
end

-- Wrecked car. 'wreck' tilts it and darkens the paint.
function Props.car(cf, parent, color, wreck)
	local m = Builder.model("Car", parent)
	local base = wreck and (cf * CFrame.Angles(math.rad(4), 0, math.rad(6))) or cf
	local paint = color or rgb(120, 30, 30)
	if wreck then
		paint = paint:Lerp(rgb(40, 35, 30), 0.45)
	end
	p(m, base * CFrame.new(0, 1.9, 0), Vector3.new(6, 1.8, 12), M.SmoothPlastic, paint)
	p(m, base * CFrame.new(0, 3.5, 0.5), Vector3.new(5.4, 1.6, 6), M.SmoothPlastic, paint)
	p(m, base * CFrame.new(0, 3.5, -2.55), Vector3.new(5, 1.4, 0.1), M.Glass, rgb(40, 50, 55), { Transparency = 0.3 })
	for _, x in ipairs({ -2.8, 2.8 }) do
		for _, z in ipairs({ -3.8, 3.8 }) do
			p(m, base * CFrame.new(x, 1, z) * CFrame.Angles(0, 0, math.rad(90)), Vector3.new(1, 2.2, 2.2), M.Rubber, rgb(25, 25, 25), { Shape = Enum.PartType.Cylinder })
		end
	end
	p(m, base * CFrame.new(-2, 2, -6.05), Vector3.new(1, 0.6, 0.1), M.Neon, wreck and rgb(60, 60, 50) or rgb(255, 250, 220))
	p(m, base * CFrame.new(2, 2, -6.05), Vector3.new(1, 0.6, 0.1), M.Neon, wreck and rgb(60, 60, 50) or rgb(255, 250, 220))
	return m
end

function Props.ambulance(cf, parent)
	local m = Builder.model("Ambulance", parent)
	local base = cf * CFrame.Angles(0, 0, math.rad(3))
	p(m, base * CFrame.new(0, 4, 2), Vector3.new(7, 6, 10), M.SmoothPlastic, rgb(225, 225, 220))
	p(m, base * CFrame.new(0, 3, -5), Vector3.new(6.6, 4, 4.5), M.SmoothPlastic, rgb(225, 225, 220))
	p(m, base * CFrame.new(0, 4.5, -7.3), Vector3.new(6, 1.6, 0.1), M.Glass, rgb(40, 50, 60), { Transparency = 0.3 })
	p(m, base * CFrame.new(3.55, 4.5, 2), Vector3.new(0.1, 1.2, 8), M.SmoothPlastic, rgb(200, 40, 40))
	p(m, base * CFrame.new(-3.55, 4.5, 2), Vector3.new(0.1, 1.2, 8), M.SmoothPlastic, rgb(200, 40, 40))
	local beacon = p(m, base * CFrame.new(0, 7.2, -2.5), Vector3.new(3, 0.5, 0.8), M.Neon, rgb(255, 40, 40), { Tags = { "FlickerLight" } })
	local l = Instance.new("PointLight")
	l.Color = rgb(255, 40, 40)
	l.Range = 14
	l.Brightness = 1.5
	l.Parent = beacon
	-- open rear doors (one hanging)
	p(m, base * CFrame.new(-1.75, 4, 7.1), Vector3.new(3.4, 5.6, 0.2), M.SmoothPlastic, rgb(220, 220, 215))
	p(m, base * CFrame.new(3.3, 4, 8.4) * CFrame.Angles(0, math.rad(70), 0), Vector3.new(3.4, 5.6, 0.2), M.SmoothPlastic, rgb(220, 220, 215))
	for _, x in ipairs({ -3.2, 3.2 }) do
		for _, z in ipairs({ -4.5, 4.5 }) do
			p(m, base * CFrame.new(x, 1.1, z) * CFrame.Angles(0, 0, math.rad(90)), Vector3.new(1.1, 2.3, 2.3), M.Rubber, rgb(25, 25, 25), { Shape = Enum.PartType.Cylinder })
		end
	end
	return m
end

-- Street lamp. mode: "on" | "flicker" | "off"
function Props.streetLamp(cf, parent, mode)
	local m = Builder.model("StreetLamp", parent)
	p(m, cf * CFrame.new(0, 7, 0), Vector3.new(0.6, 14, 0.6), M.Metal, rgb(50, 55, 60))
	p(m, cf * CFrame.new(0, 14, -1.5), Vector3.new(0.5, 0.5, 3.5), M.Metal, rgb(50, 55, 60))
	local head = p(m, cf * CFrame.new(0, 13.6, -3), Vector3.new(1.4, 0.4, 1.8), M.Neon, mode == "off" and rgb(50, 50, 45) or rgb(255, 210, 150), {
		CanCollide = false,
		Tags = mode == "flicker" and { "FlickerLight" } or nil,
	})
	if mode ~= "off" then
		local light = Instance.new("SpotLight")
		light.Face = Enum.NormalId.Bottom
		light.Angle = 110
		light.Range = 30
		light.Brightness = 2.2
		light.Color = rgb(255, 205, 150)
		light.Shadows = false
		light.Parent = head
	end
	return m
end

function Props.barricade(cf, parent)
	local m = Builder.model("Barricade", parent)
	for i = -1, 1 do
		p(m, cf * CFrame.new(i * 4, 2, 0) * CFrame.Angles(0, 0, math.rad(i * 8)), Vector3.new(4.2, 4, 0.5), M.WoodPlanks, rgb(120, 95, 60))
	end
	p(m, cf * CFrame.new(0, 3.2, -0.4), Vector3.new(13, 0.6, 0.4), M.Metal, rgb(200, 170, 40))
	return m
end

function Props.policeBarrier(cf, parent)
	local m = Builder.model("PoliceBarrier", parent)
	p(m, cf * CFrame.new(0, 2.6, 0), Vector3.new(8, 0.9, 0.3), M.SmoothPlastic, rgb(240, 240, 240))
	p(m, cf * CFrame.new(0, 2.6, -0.16), Vector3.new(7.8, 0.4, 0.05), M.SmoothPlastic, rgb(30, 60, 160))
	for _, x in ipairs({ -3.6, 3.6 }) do
		p(m, cf * CFrame.new(x, 1.3, 0), Vector3.new(0.3, 2.6, 1.6), M.Metal, rgb(90, 90, 90))
	end
	return m
end

function Props.debris(cf, parent, rng, count)
	local m = Builder.model("Debris", parent)
	rng = rng or Random.new(7)
	for _ = 1, count or 5 do
		local s = Vector3.new(rng:NextNumber(0.8, 3.5), rng:NextNumber(0.4, 1.6), rng:NextNumber(0.8, 3))
		local off = CFrame.new(rng:NextNumber(-4, 4), s.Y / 2 - 0.1, rng:NextNumber(-4, 4))
		local rot = CFrame.Angles(rng:NextNumber(-0.4, 0.4), rng:NextNumber(0, math.pi), rng:NextNumber(-0.4, 0.4))
		local shade = rng:NextInteger(85, 140)
		p(m, cf * off * rot, s, M.Concrete, rgb(shade, shade - 5, shade - 10))
	end
	return m
end

function Props.dumpster(cf, parent)
	local m = Builder.model("Dumpster", parent)
	p(m, cf * CFrame.new(0, 2.2, 0), Vector3.new(8, 4.4, 4.5), M.DiamondPlate, rgb(40, 80, 50))
	p(m, cf * CFrame.new(0, 4.6, 0.6) * CFrame.Angles(math.rad(-12), 0, 0), Vector3.new(8.2, 0.3, 4), M.Plastic, rgb(30, 30, 30))
	return m
end

function Props.trashBags(cf, parent, rng)
	local m = Builder.model("TrashBags", parent)
	rng = rng or Random.new(3)
	for _ = 1, 4 do
		local s = rng:NextNumber(1.6, 2.6)
		p(m, cf * CFrame.new(rng:NextNumber(-2, 2), s / 2 - 0.2, rng:NextNumber(-2, 2)), Vector3.new(s, s, s), M.Plastic, rgb(25, 25, 28), { Shape = Enum.PartType.Ball })
	end
	return m
end

function Props.deadTree(cf, parent, rng)
	local m = Builder.model("DeadTree", parent)
	rng = rng or Random.new(11)
	local h = rng:NextNumber(10, 16)
	p(m, cf * CFrame.new(0, h / 2, 0), Vector3.new(1.4, h, 1.4), M.Wood, rgb(60, 45, 35))
	for i = 1, 4 do
		local y = h * (0.5 + i * 0.1)
		local ang = rng:NextNumber(0, math.pi * 2)
		local branch = cf * CFrame.new(0, y, 0) * CFrame.Angles(0, ang, 0) * CFrame.Angles(0, 0, math.rad(rng:NextNumber(35, 60))) * CFrame.new(0, 2.2, 0)
		p(m, branch, Vector3.new(0.5, 4.5, 0.5), M.Wood, rgb(60, 45, 35))
	end
	p(m, cf * CFrame.new(0, 0.2, 0), Vector3.new(4, 0.4, 4), M.Ground, rgb(50, 45, 35))
	return m
end

function Props.bench(cf, parent)
	local m = Builder.model("Bench", parent)
	p(m, cf * CFrame.new(0, 1.7, 0), Vector3.new(6, 0.3, 1.8), M.WoodPlanks, rgb(100, 75, 50))
	p(m, cf * CFrame.new(0, 2.8, 0.8), Vector3.new(6, 1.6, 0.25), M.WoodPlanks, rgb(100, 75, 50))
	for _, x in ipairs({ -2.6, 2.6 }) do
		p(m, cf * CFrame.new(x, 0.8, 0), Vector3.new(0.3, 1.6, 1.6), M.Metal, rgb(40, 40, 40))
	end
	return m
end

function Props.kiosk(cf, parent)
	local m = Builder.model("Newsstand", parent)
	p(m, cf * CFrame.new(0, 2.8, 0), Vector3.new(7, 5.6, 4), M.Metal, rgb(30, 80, 60))
	p(m, cf * CFrame.new(0, 5.9, -0.8), Vector3.new(8, 0.3, 6), M.Metal, rgb(25, 60, 45))
	p(m, cf * CFrame.new(0, 3, -2.05), Vector3.new(6, 0.4, 0.4), M.Wood, rgb(110, 85, 60))
	Builder.sign("NEWS", cf * CFrame.new(0, 6.6, -2) * CFrame.Angles(0, math.pi, 0), Vector3.new(4, 1, 0.2), m, rgb(255, 230, 150))
	return m
end

function Props.trafficLight(cf, parent)
	local m = Builder.model("TrafficLight", parent)
	p(m, cf * CFrame.new(0, 6, 0), Vector3.new(0.5, 12, 0.5), M.Metal, rgb(40, 40, 40))
	p(m, cf * CFrame.new(0, 11, -0.6), Vector3.new(1.2, 3.2, 1), M.Metal, rgb(30, 30, 30))
	p(m, cf * CFrame.new(0, 12, -1.15), Vector3.new(0.7, 0.7, 0.1), M.Neon, rgb(70, 20, 20))
	p(m, cf * CFrame.new(0, 11, -1.15), Vector3.new(0.7, 0.7, 0.1), M.Neon, rgb(255, 170, 30), { Tags = { "FlickerLight" } })
	p(m, cf * CFrame.new(0, 10, -1.15), Vector3.new(0.7, 0.7, 0.1), M.Neon, rgb(20, 60, 20))
	return m
end

return Props
