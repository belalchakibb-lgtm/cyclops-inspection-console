--[[
	InteractionService
	Thin wrapper around ProximityPrompt (works with keyboard, gamepad and
	touch out of the box). Every trigger is re-validated on the server:
	distance, alive, not downed, not in a cinematic, and a per-player debounce.
]]

local Players = game:GetService("Players")

local InteractionService = {}

local debounce = {}

local function validPlayer(player, part, maxDistance)
	local character = player.Character
	if not character then
		return false
	end
	local humanoid = character:FindFirstChildOfClass("Humanoid")
	local root = character:FindFirstChild("HumanoidRootPart")
	if not humanoid or humanoid.Health <= 0 or not root then
		return false
	end
	if character:GetAttribute("Downed") or player:GetAttribute("InCinematic") then
		return false
	end
	if (root.Position - part.Position).Magnitude > maxDistance + 8 then
		return false
	end
	return true
end

--[[
	opts: action, object, hold (seconds), distance, id (attribute), kind, lineOfSight
	handler(player, prompt) -> nothing
]]
function InteractionService.add(part, opts, handler)
	local prompt = Instance.new("ProximityPrompt")
	prompt.ActionText = opts.action or "Interact"
	prompt.ObjectText = opts.object or ""
	prompt.HoldDuration = opts.hold or 0
	prompt.MaxActivationDistance = opts.distance or 9
	prompt.RequiresLineOfSight = opts.lineOfSight == true
	prompt.KeyboardKeyCode = Enum.KeyCode.E
	prompt.GamepadKeyCode = Enum.KeyCode.ButtonX
	prompt.Style = Enum.ProximityPromptStyle.Default
	if opts.id then
		prompt:SetAttribute("PickupId", opts.id)
	end
	if opts.kind then
		prompt:SetAttribute("PickupKind", opts.kind)
	end
	prompt.Parent = part

	prompt.Triggered:Connect(function(player)
		local now = os.clock()
		local key = player.UserId
		if debounce[key] and now - debounce[key] < 0.35 then
			return
		end
		debounce[key] = now
		if not validPlayer(player, part, prompt.MaxActivationDistance) then
			return
		end
		local ok, err = pcall(handler, player, prompt)
		if not ok then
			warn("[Interaction] handler error: " .. tostring(err))
		end
	end)
	return prompt
end

function InteractionService.init() end

function InteractionService.start()
	Players.PlayerRemoving:Connect(function(player)
		debounce[player.UserId] = nil
	end)
end

return InteractionService
