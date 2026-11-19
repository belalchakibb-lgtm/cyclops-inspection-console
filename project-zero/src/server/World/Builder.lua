--[[
	Builder
	Low-level helpers to build optimized, anchored geometry from code.
	All parts are anchored, use smooth surfaces and avoid unnecessary
	collision/touch/shadow work so mobile devices stay fast.
]]

local CollectionService = game:GetService("CollectionService")

local Builder = {}

local DEFAULT_PROPS = {
	Anchored = true,
	TopSurface = Enum.SurfaceType.Smooth,
	BottomSurface = Enum.SurfaceType.Smooth,
	CanTouch = false,
}

function Builder.part(props, parent)
	local className = props.ClassName or "Part"
	local p = Instance.new(className)
	for k, v in pairs(DEFAULT_PROPS) do
		p[k] = v
	end
	for k, v in pairs(props) do
		if k ~= "ClassName" and k ~= "Tags" then
			p[k] = v
		end
	end
	if props.Tags then
		for _, tag in ipairs(props.Tags) do
			CollectionService:AddTag(p, tag)
		end
	end
	p.Parent = parent
	return p
end

-- Box defined by min/max corners (axis aligned).
function Builder.box(minV, maxV, material, color, parent, extra)
	local size = maxV - minV
	local props = {
		Size = Vector3.new(math.abs(size.X), math.abs(size.Y), math.abs(size.Z)),
		CFrame = CFrame.new((minV + maxV) / 2),
		Material = material,
		Color = color,
	}
	if extra then
		for k, v in pairs(extra) do
			props[k] = v
		end
	end
	return Builder.part(props, parent)
end

function Builder.model(name, parent)
	local m = Instance.new("Model")
	m.Name = name
	m.Parent = parent
	return m
end

function Builder.folder(name, parent)
	local f = Instance.new("Folder")
	f.Name = name
	f.Parent = parent
	return f
end

--[[
	Axis-aligned wall with optional openings.
	axis "x": wall runs along X at constant z = 'at', from a to b.
	axis "z": wall runs along Z at constant x = 'at', from a to b.
	openings: { { center = number, width = number, height = number, sill = number? } }
	  sill > 0 makes a window (wall below and above the opening).
	window glass is added when opening.glass = true.
]]
function Builder.wall(axis, at, a, b, opts, parent)
	local height = opts.height or 14
	local thick = opts.thickness or 1
	local base = opts.base or 0
	local material = opts.material or Enum.Material.Concrete
	local color = opts.color or Color3.fromRGB(200, 200, 200)
	local openings = opts.openings or {}
	table.sort(openings, function(o1, o2)
		return o1.center < o2.center
	end)

	local lo, hi = math.min(a, b), math.max(a, b)

	local function seg(s0, s1, y0, y1)
		if s1 - s0 < 0.05 or y1 - y0 < 0.05 then
			return
		end
		local minV, maxV
		if axis == "x" then
			minV = Vector3.new(s0, base + y0, at - thick / 2)
			maxV = Vector3.new(s1, base + y1, at + thick / 2)
		else
			minV = Vector3.new(at - thick / 2, base + y0, s0)
			maxV = Vector3.new(at + thick / 2, base + y1, s1)
		end
		Builder.box(minV, maxV, material, color, parent)
	end

	local cursor = lo
	for _, o in ipairs(openings) do
		local o0 = o.center - o.width / 2
		local o1 = o.center + o.width / 2
		seg(cursor, o0, 0, height)
		local sill = o.sill or 0
		local top = sill + (o.height or 8)
		if sill > 0 then
			seg(o0, o1, 0, sill)
		end
		seg(o0, o1, top, height)
		if o.glass then
			local gMin, gMax
			if axis == "x" then
				gMin = Vector3.new(o0, base + sill, at - 0.1)
				gMax = Vector3.new(o1, base + top, at + 0.1)
			else
				gMin = Vector3.new(at - 0.1, base + sill, o0)
				gMax = Vector3.new(at + 0.1, base + top, o1)
			end
			-- Broken windows keep an invisible collider so players cannot
			-- climb out and skip story areas; boards make that readable.
			Builder.box(gMin, gMax, Enum.Material.Glass, Color3.fromRGB(120, 150, 160), parent, {
				Transparency = o.broken and 1 or 0.6,
				CanCollide = true,
				CastShadow = false,
			})
			if o.broken then
				local center = (gMin + gMax) / 2
				local span = o.width * 1.05
				local rot = axis == "x" and CFrame.new() or CFrame.Angles(0, math.rad(90), 0)
				for i, ang in ipairs({ 18, -14, 4 }) do
					Builder.part({
						Name = "Board",
						Size = Vector3.new(span, 0.7, 0.25),
						CFrame = CFrame.new(center + Vector3.new(0, (i - 2) * 1.4, 0)) * rot * CFrame.Angles(0, 0, math.rad(ang)) * CFrame.new(0, 0, -0.3),
						Material = Enum.Material.WoodPlanks,
						Color = Color3.fromRGB(110, 85, 55),
						CanCollide = false,
					}, parent)
				end
			end
		end
		cursor = o1
	end
	seg(cursor, hi, 0, height)
end

-- Ceiling lamp (neon panel + light). Flickering lamps are animated on the client.
function Builder.lamp(position, opts, parent)
	opts = opts or {}
	local lamp = Builder.part({
		Name = "Lamp",
		Size = opts.size or Vector3.new(4, 0.3, 1.2),
		CFrame = CFrame.new(position),
		Material = Enum.Material.Neon,
		Color = opts.color or Color3.fromRGB(220, 235, 255),
		CanCollide = false,
		CastShadow = false,
		Tags = opts.flicker and { "FlickerLight" } or nil,
	}, parent)
	local light = Instance.new("PointLight")
	light.Range = opts.range or 22
	light.Brightness = opts.brightness or 1.2
	light.Color = opts.color or Color3.fromRGB(220, 235, 255)
	light.Shadows = opts.shadows == true
	light.Parent = lamp
	return lamp
end

-- Simple floating label used for room signs.
function Builder.sign(text, cf, size, parent, color)
	local board = Builder.part({
		Name = "Sign",
		Size = size or Vector3.new(6, 1.4, 0.2),
		CFrame = cf,
		Material = Enum.Material.SmoothPlastic,
		Color = Color3.fromRGB(30, 40, 45),
		CanCollide = false,
	}, parent)
	local gui = Instance.new("SurfaceGui")
	gui.Face = Enum.NormalId.Front
	gui.SizingMode = Enum.SurfaceGuiSizingMode.PixelsPerStud
	gui.PixelsPerStud = 40
	gui.LightInfluence = 0.4
	gui.Parent = board
	local label = Instance.new("TextLabel")
	label.Size = UDim2.fromScale(1, 1)
	label.BackgroundTransparency = 1
	label.Text = text
	label.TextScaled = true
	label.Font = Enum.Font.GothamBold
	label.TextColor3 = color or Color3.fromRGB(200, 230, 220)
	label.Parent = gui
	return board
end

-- Makes a part shine softly so players can spot interactables.
function Builder.glint(part, color)
	local att = Instance.new("Attachment")
	att.Parent = part
	local pe = Instance.new("ParticleEmitter")
	pe.Name = "Glint"
	pe.Texture = "rbxasset://textures/particles/sparkles_main.dds"
	pe.Rate = 2
	pe.Lifetime = NumberRange.new(0.6, 1)
	pe.Speed = NumberRange.new(0.2)
	pe.Size = NumberSequence.new({ NumberSequenceKeypoint.new(0, 0.25), NumberSequenceKeypoint.new(1, 0) })
	pe.Color = ColorSequence.new(color or Color3.fromRGB(255, 240, 180))
	pe.LightEmission = 1
	pe.Parent = att
	CollectionService:AddTag(pe, "OptionalParticle")
	return pe
end

return Builder
