--[[
	Input - gameplay controls for keyboard, gamepad and touch.
	ContextActionService creates native touch buttons (RUN, LIGHT) next
	to the jump button on phones/tablets. Bindings only exist while the
	player is in gameplay (not in menus or cinematics).
	PC: Shift = sprint, F = flashlight, Tab = bag, M = map.
]]

local ContextActionService = game:GetService("ContextActionService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Net = require(ReplicatedStorage:WaitForChild("Shared"):WaitForChild("Net"))
local State = require(script.Parent:WaitForChild("State"))

local Input = {}
local bound = false
local sprintToggled = false
local handlers = {}

function Input.on(action, cb)
	handlers[action] = cb
end

local function setSprint(on)
	Net.get("SetSprint"):FireServer(on)
end

local function onSprint(_, state, input)
	if input.UserInputType == Enum.UserInputType.Touch then
		if state == Enum.UserInputState.Begin then
			sprintToggled = not sprintToggled
			setSprint(sprintToggled)
			ContextActionService:SetTitle("PZ_Sprint", sprintToggled and "WALK" or "RUN")
		end
		return Enum.ContextActionResult.Sink
	end
	if state == Enum.UserInputState.Begin then
		setSprint(true)
	elseif state == Enum.UserInputState.End or state == Enum.UserInputState.Cancel then
		setSprint(false)
	end
	return Enum.ContextActionResult.Sink
end

local function onLight(_, state)
	if state == Enum.UserInputState.Begin then
		Net.get("ToggleFlashlight"):FireServer()
	end
	return Enum.ContextActionResult.Sink
end

local function onBag(_, state)
	if state == Enum.UserInputState.Begin and handlers.bag then
		handlers.bag()
	end
	return Enum.ContextActionResult.Sink
end

local function onMap(_, state)
	if state == Enum.UserInputState.Begin and handlers.map then
		handlers.map()
	end
	return Enum.ContextActionResult.Sink
end

local function bind()
	if bound then
		return
	end
	bound = true
	ContextActionService:BindAction("PZ_Sprint", onSprint, true, Enum.KeyCode.LeftShift, Enum.KeyCode.ButtonL3)
	ContextActionService:SetTitle("PZ_Sprint", sprintToggled and "WALK" or "RUN")
	ContextActionService:SetPosition("PZ_Sprint", UDim2.new(1, -190, 1, -105))
	ContextActionService:BindAction("PZ_Light", onLight, true, Enum.KeyCode.F, Enum.KeyCode.ButtonY)
	ContextActionService:SetTitle("PZ_Light", "LIGHT")
	ContextActionService:SetPosition("PZ_Light", UDim2.new(1, -150, 1, -170))
	ContextActionService:BindAction("PZ_Bag", onBag, false, Enum.KeyCode.Tab, Enum.KeyCode.ButtonSelect)
	ContextActionService:BindAction("PZ_Map", onMap, false, Enum.KeyCode.M)
end

local function unbind()
	if not bound then
		return
	end
	bound = false
	for _, name in ipairs({ "PZ_Sprint", "PZ_Light", "PZ_Bag", "PZ_Map" }) do
		ContextActionService:UnbindAction(name)
	end
	if sprintToggled then
		sprintToggled = false
	end
	setSprint(false)
end

local function refresh()
	if State.inMenu or State.inCinematic or State.modalOpen then
		unbind()
	else
		bind()
	end
end

function Input.refresh()
	refresh()
end

function Input.init()
	State.on("menu", refresh)
	State.on("cinematic", refresh)
	State.on("modal", refresh)
end

return Input
