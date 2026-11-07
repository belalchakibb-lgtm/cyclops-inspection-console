--[[
	MonetizationService
	Fair, cosmetic-only monetization through Roblox's official
	MarketplaceService.
	- VIP Game Pass: cosmetic VIP items (gold beam, VIP pack, VIP title)
	- Developer Products: cosmetic bundles
	ProcessReceipt is idempotent: each PurchaseId is recorded inside the
	player's profile and only reported as granted after a successful save.
	Nothing story-related or power-related is ever sold.
]]

local MarketplaceService = game:GetService("MarketplaceService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local Shared = ReplicatedStorage:WaitForChild("Shared")
local Config = require(Shared:WaitForChild("Config"))
local Cosmetics = require(Shared:WaitForChild("Cosmetics"))
local Net = require(Shared:WaitForChild("Net"))

local MonetizationService = {}
local Services

local productsById = {}
local productsByKey = {}
for _, p in ipairs(Config.Monetization.Products) do
	productsByKey[p.key] = p
	if p.productId and p.productId ~= 0 then
		productsById[p.productId] = p
	end
end

local function grantVip(player)
	player:SetAttribute("VIP", true)
	for _, id in ipairs(Cosmetics.VipItems) do
		Services.Rewards.grantCosmetic(player, id, true)
	end
	Services.sync(player)
end

local function checkVip(player)
	local passId = Config.Monetization.VipGamePassId
	if passId == 0 then
		return
	end
	local ok, owns = pcall(function()
		return MarketplaceService:UserOwnsGamePassAsync(player.UserId, passId)
	end)
	if ok and owns then
		grantVip(player)
	end
end

local function processReceipt(info)
	local player = Players:GetPlayerByUserId(info.PlayerId)
	if not player then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local profile = Services.Data.waitFor(player, 10)
	if not profile then
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	profile.purchases = profile.purchases or {}
	if profile.purchases[info.PurchaseId] then
		return Enum.ProductPurchaseDecision.PurchaseGranted -- already handled
	end
	local product = productsById[info.ProductId]
	if not product then
		warn("[Monetization] Unknown product " .. tostring(info.ProductId))
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	local newlyGranted = {}
	for _, cosmeticId in ipairs(product.cosmetics) do
		if not profile.cosmetics.owned[cosmeticId] then
			profile.cosmetics.owned[cosmeticId] = true
			table.insert(newlyGranted, cosmeticId)
		end
	end
	profile.purchases[info.PurchaseId] = os.time()
	if not Services.Data.save(player, false) then
		-- roll back so Roblox retries later
		profile.purchases[info.PurchaseId] = nil
		for _, id in ipairs(newlyGranted) do
			profile.cosmetics.owned[id] = nil
		end
		return Enum.ProductPurchaseDecision.NotProcessedYet
	end
	Net.fire("Notify", player, "Thank you! " .. product.name .. " unlocked.", "reward")
	Services.sync(player)
	return Enum.ProductPurchaseDecision.PurchaseGranted
end

-- Catalog shown in the client shop (only configured items).
function MonetizationService.catalog()
	local list = {}
	if Config.Monetization.VipGamePassId ~= 0 then
		table.insert(list, { key = "vip", name = "VIP Membership", cosmetics = Cosmetics.VipItems, gamepass = true })
	end
	for _, p in ipairs(Config.Monetization.Products) do
		if p.productId ~= 0 then
			table.insert(list, { key = p.key, name = p.name, cosmetics = p.cosmetics, price = p.price })
		end
	end
	return list
end

local function onBuy(player, key)
	if type(key) ~= "string" then
		return
	end
	if key == "vip" then
		local passId = Config.Monetization.VipGamePassId
		if passId ~= 0 and not player:GetAttribute("VIP") then
			MarketplaceService:PromptGamePassPurchase(player, passId)
		end
		return
	end
	local product = productsByKey[key]
	if product and product.productId ~= 0 then
		MarketplaceService:PromptProductPurchase(player, product.productId)
	end
end

function MonetizationService.init(services)
	Services = services
end

function MonetizationService.start()
	MarketplaceService.ProcessReceipt = processReceipt
	MarketplaceService.PromptGamePassPurchaseFinished:Connect(function(player, passId, purchased)
		if purchased and passId == Config.Monetization.VipGamePassId then
			grantVip(player)
			Net.fire("Notify", player, "Welcome to VIP! Your cosmetics are unlocked.", "reward")
		end
	end)
	Services.Data.onLoaded(function(player)
		checkVip(player)
	end)
	Net.on("BuyProduct", onBuy, 2)
end

return MonetizationService
