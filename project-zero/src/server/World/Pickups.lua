--[[
	Pickups - visual models for collectible objects. Each returns the main
	part, which carries the ProximityPrompt.
]]

local Builder = require(script.Parent:WaitForChild("Builder"))

local M = Enum.Material
local rgb = Color3.fromRGB
local V = Vector3.new

local Pickups = {}

local STYLES = {
	document = function(pos, parent)
		local paper = Builder.part({ Name = "Document", Size = V(1.1, 0.06, 1.5), CFrame = CFrame.new(pos) * CFrame.Angles(0, math.rad(15), 0), Material = M.SmoothPlastic, Color = rgb(235, 232, 215), CanCollide = false }, parent)
		Builder.part({ Name = "Ink", Size = V(0.8, 0.02, 0.9), CFrame = paper.CFrame * CFrame.new(0, 0.04, -0.1), Material = M.SmoothPlastic, Color = rgb(150, 150, 150), CanCollide = false }, parent)
		return paper
	end,
	research = function(pos, parent)
		local folder = Builder.part({ Name = "ResearchFile", Size = V(1.2, 0.15, 1.6), CFrame = CFrame.new(pos) * CFrame.Angles(0, math.rad(-20), 0), Material = M.SmoothPlastic, Color = rgb(200, 50, 50), CanCollide = false }, parent)
		Builder.part({ Name = "Stamp", Size = V(0.6, 0.02, 0.3), CFrame = folder.CFrame * CFrame.new(0, 0.085, -0.4), Material = M.Neon, Color = rgb(255, 230, 80), CanCollide = false }, parent)
		local light = Instance.new("PointLight")
		light.Color = rgb(255, 120, 90)
		light.Range = 6
		light.Brightness = 0.8
		light.Parent = folder
		return folder
	end,
	flashlight = function(pos, parent)
		return Builder.part({ Name = "FlashlightPickup", Shape = Enum.PartType.Cylinder, Size = V(1.6, 0.5, 0.5), CFrame = CFrame.new(pos + V(0, 0.05, 0)), Material = M.Metal, Color = rgb(40, 40, 45), CanCollide = false }, parent)
	end,
	pipe = function(pos, parent)
		return Builder.part({ Name = "PipePickup", Shape = Enum.PartType.Cylinder, Size = V(4.4, 0.4, 0.4), CFrame = CFrame.new(pos) * CFrame.Angles(0, math.rad(25), 0), Material = M.Metal, Color = rgb(130, 135, 140), CanCollide = false }, parent)
	end,
	axe = function(pos, parent)
		local handle = Builder.part({ Name = "AxePickup", Size = V(4, 0.35, 0.35), CFrame = CFrame.new(pos), Material = M.Wood, Color = rgb(110, 75, 40), CanCollide = false }, parent)
		Builder.part({ Name = "AxeHead", Size = V(0.4, 0.3, 1.4), CFrame = handle.CFrame * CFrame.new(1.8, 0, 0.4), Material = M.Metal, Color = rgb(180, 30, 30), CanCollide = false }, parent)
		return handle
	end,
	keycard = function(pos, parent)
		return Builder.part({ Name = "KeycardPickup", Size = V(0.7, 0.05, 1.1), CFrame = CFrame.new(pos), Material = M.SmoothPlastic, Color = rgb(80, 160, 255), CanCollide = false }, parent)
	end,
	fuse = function(pos, parent)
		return Builder.part({ Name = "FusePickup", Shape = Enum.PartType.Cylinder, Size = V(1.2, 0.6, 0.6), CFrame = CFrame.new(pos + V(0, 0.1, 0)), Material = M.Neon, Color = rgb(255, 170, 40), CanCollide = false }, parent)
	end,
	bandage = function(pos, parent)
		return Builder.part({ Name = "BandagePickup", Size = V(0.8, 0.4, 0.8), CFrame = CFrame.new(pos), Material = M.Fabric, Color = rgb(240, 240, 230), CanCollide = false }, parent)
	end,
	medkit = function(pos, parent)
		local box = Builder.part({ Name = "MedkitPickup", Size = V(1.4, 0.7, 1), CFrame = CFrame.new(pos + V(0, 0.1, 0)), Material = M.SmoothPlastic, Color = rgb(200, 40, 40), CanCollide = false }, parent)
		Builder.part({ Name = "Cross", Size = V(0.6, 0.72, 0.15), CFrame = box.CFrame, Material = M.SmoothPlastic, Color = rgb(255, 255, 255), CanCollide = false }, parent)
		return box
	end,
}

function Pickups.create(style, position, parent, withGlint)
	local model = Builder.model("Pickup_" .. style, parent)
	local make = STYLES[style] or STYLES.document
	local main = make(position, model)
	model.PrimaryPart = main
	if withGlint ~= false then
		Builder.glint(main)
	end
	return model, main
end

return Pickups
