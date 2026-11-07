--[[
	WorldBuilder
	Generates the full Chapter 1 map at server start. Building from code
	means the place file stays tiny, the map can be rebuilt/tweaked from
	text (no Studio modelling needed), and nothing references missing assets.
]]

local Builder = require(script.Parent:WaitForChild("Builder"))
local Hospital = require(script.Parent:WaitForChild("Hospital"))
local City = require(script.Parent:WaitForChild("City"))

local WorldBuilder = {}

function WorldBuilder.build()
	local existing = workspace:FindFirstChild("World")
	if existing then
		existing:Destroy()
	end
	local world = Builder.folder("World", workspace)
	local started = os.clock()
	local hospital = Hospital.build(world)
	local city = City.build(world)
	local zombies = Builder.folder("Zombies", workspace)
	local interactables = Builder.folder("Interactables", workspace)

	local count = 0
	for _, d in ipairs(world:GetDescendants()) do
		if d:IsA("BasePart") then
			count = count + 1
		end
	end
	print(("[WorldBuilder] Built Chapter 1 world: %d parts in %.2fs"):format(count, os.clock() - started))

	return {
		world = world,
		hospital = hospital,
		city = city,
		zombieFolder = zombies,
		interactables = interactables,
	}
end

return WorldBuilder
