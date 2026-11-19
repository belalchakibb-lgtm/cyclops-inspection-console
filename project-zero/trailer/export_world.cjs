// Runs the game's real World builder modules (src/server/World) in a Lua VM
// with a Roblox API mock, and exports every created part as JSON.
// Usage: node export_world.cjs OUT.json   (needs: npm i fengari)
const fs = require('fs'), path = require('path');
const { lua, lauxlib, lualib, to_luastring, to_jsstring } = require(process.env.FENGARI || 'fengari');
const SRC = path.join(__dirname, '..', 'src');
const files = {
  Layout: 'shared/Layout.lua', Builder: 'server/World/Builder.lua', Props: 'server/World/Props.lua',
  Doors: 'server/World/Doors.lua', Hospital: 'server/World/Hospital.lua', City: 'server/World/City.lua',
  ZombieTypes: 'shared/ZombieTypes.lua',
};
const L = lauxlib.luaL_newstate(); lualib.luaL_openlibs(L);
function run(code, name) {
  if (lauxlib.luaL_loadbuffer(L, to_luastring(code), null, to_luastring(name)) !== 0 || lua.lua_pcall(L, 0, 1, 0) !== 0) {
    throw new Error(to_jsstring(lua.lua_tostring(L, -1)));
  }
  const r = lua.lua_type(L, -1) === lua.LUA_TSTRING ? to_jsstring(lua.lua_tostring(L, -1)) : null; lua.lua_pop(L, 1); return r;
}
run(fs.readFileSync(path.join(__dirname, 'roblox_mock.lua'), 'utf8'), 'mock');
let srcTable = 'SOURCES = {}\n';
for (const [k, f] of Object.entries(files)) srcTable += `SOURCES[${JSON.stringify(k)}] = ${JSON.stringify(fs.readFileSync(path.join(SRC, f), 'utf8'))}\n`;
// Lua's long JSON-escaped strings: use load on decoded text instead
run(srcTable.replace(/\\u([0-9a-f]{4})/g, (m, h) => String.fromCharCode(parseInt(h, 16))), 'sources');
const out = run(`
local cache = {}
local nodeMT
local function node(name) return setmetatable({ __name = name }, nodeMT) end
nodeMT = { __index = function(t, k)
  if k == "WaitForChild" or k == "FindFirstChild" then return function(_, n) return node(n) end end
  if k == "Parent" then return node("folder") end
end }
function require(n)
  local name = n.__name
  if cache[name] then return cache[name] end
  local env = setmetatable({ script = node(name) }, { __index = _G })
  local fn = assert(load(SOURCES[name], name, "t", env))
  cache[name] = fn()
  return cache[name]
end
local _rs = game:GetService("ReplicatedStorage")
_rs.WaitForChild = function(_, n) return node(n) end
local root = Instance.new("Folder")
require(node("Hospital")).build(root)
require(node("City")).build(root)

local function c(col) if not col then return {0.6,0.6,0.6} end return { col.R, col.G, col.B } end
local parts, lights = {}, {}
for _, o in ipairs(root:GetDescendants()) do
  if o.ClassName == "Part" then
    local cf, s = o.Props.CFrame, o.Props.Size
    if cf and s then
      local text, tcol
      for _, g in ipairs(o.Children) do
        if g.ClassName == "SurfaceGui" then
          for _, l in ipairs(g.Children) do if l.ClassName == "TextLabel" then text = l.Props.Text; tcol = c(l.Props.TextColor3) end end
        end
      end
      local flick = false
      parts[#parts + 1] = string.format('{"p":[%.3f,%.3f,%.3f],"r":[%s],"s":[%.3f,%.3f,%.3f],"c":[%.3f,%.3f,%.3f],"m":"%s","sh":"%s","t":%.2f,"col":%s,"n":"%s"%s}',
        cf.x, cf.y, cf.z, table.concat(cf.r, ","), s.X, s.Y, s.Z, c(o.Props.Color)[1], c(o.Props.Color)[2], c(o.Props.Color)[3],
        tostring(o.Props.Material or "Material.Plastic"), tostring(o.Props.Shape or "PartType.Block"), o.Props.Transparency or 0,
        tostring(o.Props.CanCollide ~= false), tostring(o.Props.Name or ""),
        text and string.format(',"text":"%s","tc":[%.3f,%.3f,%.3f]', (text:gsub('\\\\', '\\\\\\\\'):gsub('"', '\\\\"'):gsub('\\n', '\\\\n')), tcol[1], tcol[2], tcol[3]) or "")
      for _, l in ipairs(o.Children) do
        if l.ClassName == "PointLight" or l.ClassName == "SpotLight" or l.ClassName == "SurfaceLight" then
          local lc = c(l.Props.Color or Color3.new(1, 1, 1))
          lights[#lights + 1] = string.format('{"p":[%.2f,%.2f,%.2f],"c":[%.3f,%.3f,%.3f],"range":%.1f,"b":%.2f,"type":"%s","part":%d}',
            cf.x, cf.y, cf.z, lc[1], lc[2], lc[3], l.Props.Range or 16, l.Props.Brightness or 1, l.ClassName, #parts - 1)
        end
        if l.ClassName == "Fire" then lights[#lights + 1] = string.format('{"p":[%.2f,%.2f,%.2f],"c":[1,0.55,0.15],"range":20,"b":2,"type":"Fire","part":%d}', cf.x, cf.y + 2, cf.z, #parts - 1) end
        if l.ClassName == "Smoke" then lights[#lights + 1] = string.format('{"p":[%.2f,%.2f,%.2f],"c":[1,0.35,0.3],"range":0,"b":0,"type":"Smoke","part":%d}', cf.x, cf.y, cf.z, #parts - 1) end
      end
    end
  end
end
local L = require(node("Layout"))
local pts = {}
for k, v in pairs(L.Points) do pts[#pts + 1] = string.format('"%s":[%.2f,%.2f,%.2f]', k, v.X, v.Y, v.Z) end
local Z = require(node("ZombieTypes"))
local zs = {}
for k, d in pairs(Z) do zs[#zs+1] = string.format('"%s":{"skin":[%.3f,%.3f,%.3f],"shirt":[%.3f,%.3f,%.3f],"pants":[%.3f,%.3f,%.3f],"eyes":[%.3f,%.3f,%.3f],"h":%.2f,"w":%.2f}', k,
  d.skin.R,d.skin.G,d.skin.B,d.shirt.R,d.shirt.G,d.shirt.B,d.pants.R,d.pants.G,d.pants.B,d.eyes.R,d.eyes.G,d.eyes.B,d.scale.height,d.scale.width) end
return '{"parts":[' .. table.concat(parts, ",") .. '],"lights":[' .. table.concat(lights, ",") .. '],"points":{' .. table.concat(pts, ",") .. '},"zombies":{' .. table.concat(zs, ",") .. '}}'
`, 'export');
fs.writeFileSync(process.argv[2] || 'world.json', out);
const j = JSON.parse(out);
console.log(`exported ${j.parts.length} parts, ${j.lights.length} lights, ${Object.keys(j.points).length} points`);
