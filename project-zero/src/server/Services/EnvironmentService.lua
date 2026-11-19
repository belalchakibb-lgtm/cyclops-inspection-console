--[[
	EnvironmentService
	Cinematic lighting: dusk sky, dense atmospheric haze, desaturated colour
	grading, bloom and sun rays. Clients scale these down locally on Low
	graphics (see SettingsController), so the server sets the High look.
]]

local Lighting = game:GetService("Lighting")

local EnvironmentService = {}

local function ensure(className, name)
	local obj = Lighting:FindFirstChild(name)
	if not obj then
		obj = Instance.new(className)
		obj.Name = name
		obj.Parent = Lighting
	end
	return obj
end

function EnvironmentService.init() end

function EnvironmentService.start()
	Lighting.ClockTime = 18.9
	Lighting.GeographicLatitude = 35
	Lighting.Brightness = 1.4
	Lighting.Ambient = Color3.fromRGB(38, 42, 48)
	Lighting.OutdoorAmbient = Color3.fromRGB(70, 74, 86)
	Lighting.EnvironmentDiffuseScale = 0.35
	Lighting.EnvironmentSpecularScale = 0.5
	Lighting.GlobalShadows = true
	Lighting.ShadowSoftness = 0.25
	Lighting.ExposureCompensation = -0.1
	Lighting.FogEnd = 100000 -- Atmosphere handles fog

	local atmosphere = ensure("Atmosphere", "PZ_Atmosphere")
	atmosphere.Density = 0.42
	atmosphere.Offset = 0.15
	atmosphere.Color = Color3.fromRGB(150, 155, 165)
	atmosphere.Decay = Color3.fromRGB(75, 70, 80)
	atmosphere.Glare = 0.25
	atmosphere.Haze = 2.2

	local cc = ensure("ColorCorrectionEffect", "PZ_Grade")
	cc.Saturation = -0.28
	cc.Contrast = 0.14
	cc.Brightness = 0.02
	cc.TintColor = Color3.fromRGB(228, 236, 240)

	local bloom = ensure("BloomEffect", "PZ_Bloom")
	bloom.Intensity = 0.55
	bloom.Size = 26
	bloom.Threshold = 1.5

	local rays = ensure("SunRaysEffect", "PZ_SunRays")
	rays.Intensity = 0.05
	rays.Spread = 0.6

	local dof = ensure("DepthOfFieldEffect", "PZ_DOF")
	dof.Enabled = false -- enabled by clients on High graphics / during cinematics
	dof.FarIntensity = 0.25
	dof.FocusDistance = 25
	dof.InFocusRadius = 30
	dof.NearIntensity = 0

	-- Overcast sky made from built-in Roblox sky textures.
	local sky = Lighting:FindFirstChildOfClass("Sky")
	if not sky then
		sky = Instance.new("Sky")
		sky.Parent = Lighting
	end
	sky.Name = "PZ_Sky"
	sky.CelestialBodiesShown = true
	sky.StarCount = 1500
	sky.SunAngularSize = 14
	sky.MoonAngularSize = 9
end

return EnvironmentService
