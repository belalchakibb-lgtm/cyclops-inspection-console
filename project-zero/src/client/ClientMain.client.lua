--[[
	PROJECT: ZERO - client bootstrap.
	Initialises every client controller and wires their buttons together.
	The client only presents state; all game rules run on the server.
]]

local Controllers = script.Parent:WaitForChild("Controllers")

local State = require(Controllers:WaitForChild("State"))
local Effects = require(Controllers:WaitForChild("Effects"))
local Cinematic = require(Controllers:WaitForChild("Cinematic"))
local HUD = require(Controllers:WaitForChild("HUD"))
local Input = require(Controllers:WaitForChild("Input"))
local Dialogue = require(Controllers:WaitForChild("Dialogue"))
local Keypad = require(Controllers:WaitForChild("Keypad"))
local Inventory = require(Controllers:WaitForChild("Inventory"))
local MapUI = require(Controllers:WaitForChild("MapUI"))
local Menu = require(Controllers:WaitForChild("Menu"))

State.init()
Effects.init()
Cinematic.init()
HUD.init()
Input.init()
Dialogue.init()
Keypad.init()
Inventory.init()
MapUI.init()
Menu.init()

HUD.onButton("BAG", function()
	Inventory.toggle()
end)
HUD.onButton("MAP", MapUI.toggle)
HUD.onButton("MENU", Menu.openPause)
Input.on("bag", Inventory.toggle)
Input.on("map", MapUI.toggle)
Menu.setInventoryOpener(function()
	Inventory.open("STYLE")
end)

Input.refresh()
