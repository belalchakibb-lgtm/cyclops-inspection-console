--[[
	Cinematic - plays data-driven camera sequences (shared/Cinematics.lua)
	with letterbox bars, subtitles, title cards, fades, flicker and shake.
	Every cinematic can be skipped; the server is told when it ends.
]]

local Players = game:GetService("Players")
local RunService = game:GetService("RunService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Cinematics = require(Shared:WaitForChild("Cinematics"))
local Net = require(Shared:WaitForChild("Net"))

local UI = require(script.Parent:WaitForChild("UI"))
local State = require(script.Parent:WaitForChild("State"))

local Cinematic = {}
local player = Players.LocalPlayer

local gui, topBar, bottomBar, black, title, subtitleFrame, speakerLabel, lineLabel, skipButton
local playingId = nil
local skipRequested = false

local function build()
	gui = UI.screen("PZ_Cinematic", 50, true)
	gui.Enabled = false
	topBar = UI.new("Frame", { Size = UDim2.new(1, 0, 0.11, 0), BackgroundColor3 = Color3.new(0, 0, 0), BorderSizePixel = 0, Parent = gui })
	bottomBar = UI.new("Frame", { Size = UDim2.new(1, 0, 0.11, 0), Position = UDim2.fromScale(0, 0.89), BackgroundColor3 = Color3.new(0, 0, 0), BorderSizePixel = 0, Parent = gui })
	black = UI.new("Frame", { Size = UDim2.fromScale(1, 1), BackgroundColor3 = Color3.new(0, 0, 0), BorderSizePixel = 0, BackgroundTransparency = 1, Parent = gui })
	title = UI.label({
		Size = UDim2.new(0.8, 0, 0.4, 0),
		Position = UDim2.fromScale(0.5, 0.5),
		AnchorPoint = Vector2.new(0.5, 0.5),
		Font = UI.Theme.FontBold,
		TextSize = 30,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextTransparency = 1,
		Parent = gui,
	})
	subtitleFrame = UI.new("Frame", {
		Size = UDim2.new(0.8, 0, 0, 90),
		Position = UDim2.new(0.5, 0, 0.87, 0),
		AnchorPoint = Vector2.new(0.5, 1),
		BackgroundTransparency = 1,
		Parent = gui,
	})
	speakerLabel = UI.label({
		Size = UDim2.new(1, 0, 0, 26),
		Font = UI.Theme.FontBlack,
		TextSize = 20,
		TextColor3 = UI.Theme.Accent,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextStrokeTransparency = 0.5,
		Parent = subtitleFrame,
	})
	lineLabel = UI.label({
		Size = UDim2.new(1, 0, 0, 60),
		Position = UDim2.fromOffset(0, 28),
		TextSize = 20,
		TextXAlignment = Enum.TextXAlignment.Center,
		TextYAlignment = Enum.TextYAlignment.Top,
		TextStrokeTransparency = 0.4,
		Parent = subtitleFrame,
	})
	skipButton = UI.button({
		Text = "SKIP  >>",
		Size = UDim2.fromOffset(130, 42),
		Position = UDim2.new(1, -24, 0, 24),
		AnchorPoint = Vector2.new(1, 0),
		Style = "ghost",
		Parent = gui,
	}, function()
		skipRequested = true
	end)
end

local function setSubtitle(speaker, line)
	local show = State.setting("subtitles", true)
	speakerLabel.Text = speaker or ""
	lineLabel.Text = line or ""
	subtitleFrame.Visible = show and (line ~= nil and line ~= "")
end

local function finish(id)
	local camera = workspace.CurrentCamera
	camera.CameraType = Enum.CameraType.Custom
	camera.FieldOfView = 70
	local character = player.Character
	local humanoid = character and character:FindFirstChildOfClass("Humanoid")
	if humanoid then
		camera.CameraSubject = humanoid
	end
	gui.Enabled = false
	playingId = nil
	State.inCinematic = false
	State.emit("cinematic", false)
	Net.get("CinematicDone"):FireServer(id)
end

function Cinematic.isPlaying()
	return playingId ~= nil
end

function Cinematic.play(id)
	local data = Cinematics[id]
	if not data or playingId then
		return
	end
	playingId = id
	skipRequested = false
	State.inCinematic = true
	State.emit("cinematic", true)
	gui.Enabled = true
	skipButton.Visible = data.skippable ~= false
	local camera = workspace.CurrentCamera
	camera.CameraType = Enum.CameraType.Scriptable

	task.spawn(function()
		for _, shot in ipairs(data.shots) do
			if skipRequested then
				break
			end
			setSubtitle(shot.speaker, shot.line)
			if shot.black then
				black.BackgroundTransparency = 0
				title.Text = shot.title or ""
				UI.tween(title, 0.8, { TextTransparency = 0 })
			else
				title.TextTransparency = 1
				black.BackgroundTransparency = shot.fadeIn and 0 or 1
				if shot.fadeIn then
					UI.tween(black, 1.2, { BackgroundTransparency = 1 })
				end
				camera.FieldOfView = shot.fov or 70
			end
			local started = os.clock()
			local duration = shot.duration or 3
			while os.clock() - started < duration and not skipRequested do
				local t = math.clamp((os.clock() - started) / duration, 0, 1)
				local eased = t * t * (3 - 2 * t) -- smoothstep
				if not shot.black and shot.from and shot.to then
					local pos = shot.from.pos:Lerp(shot.to.pos, eased)
					local look = shot.from.look:Lerp(shot.to.look, eased)
					local cf = CFrame.lookAt(pos, look)
					if shot.shake and State.setting("cameraShake", true) then
						local s = shot.shake * 0.35
						cf = cf * CFrame.Angles((math.random() - 0.5) * s * 0.1, (math.random() - 0.5) * s * 0.1, 0) * CFrame.new((math.random() - 0.5) * s, (math.random() - 0.5) * s, 0)
					end
					camera.CFrame = cf
				end
				if shot.flicker and math.random() < 0.06 then
					black.BackgroundTransparency = 0.15
				elseif shot.flicker and not shot.fadeIn then
					black.BackgroundTransparency = 1
				end
				RunService.RenderStepped:Wait()
			end
			if shot.black then
				UI.tween(title, 0.3, { TextTransparency = 1 })
			end
		end
		black.BackgroundTransparency = 1
		title.TextTransparency = 1
		finish(id)
	end)
end

function Cinematic.init()
	build()
	Net.get("PlayCinematic").OnClientEvent:Connect(function(id)
		-- wait briefly for the character so the camera can return to it
		task.wait(0.1)
		Cinematic.play(id)
	end)
end

return Cinematic
