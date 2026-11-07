// Static checks for PROJECT: ZERO Luau sources (run: node tools/lint.js)
// 1. Parses every .lua file (Lua 5.1 subset: the codebase avoids Luau-only syntax)
// 2. Reports globals that are not Roblox/Luau built-ins (catches typos)
// 3. Verifies every WaitForChild("X") used inside require(...) resolves to a module
const fs = require('fs');
const path = require('path');
const luaparse = require(process.env.LUAPARSE || 'luaparse');

const ROOT = path.join(__dirname, '..', 'src');
const GLOBALS = new Set(`game workspace script Instance Vector3 Vector2 CFrame Color3 UDim UDim2 Enum task tick os math string table
pairs ipairs next typeof type print warn error pcall xpcall require setmetatable getmetatable tostring tonumber select unpack
rawget rawset rawequal BrickColor Ray RaycastParams OverlapParams TweenInfo NumberSequence NumberSequenceKeypoint ColorSequence
ColorSequenceKeypoint NumberRange Rect PhysicalProperties DateTime utf8 bit32 coroutine debug Random Region3 Font Axes Faces
assert time elapsedTime buffer shared _G`.split(/\s+/));

function walk(dir, out) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, out); else if (p.endsWith('.lua')) out.push(p);
  }
  return out;
}

const files = walk(ROOT, []);
const moduleNames = new Set(files.map(f => path.basename(f).replace(/\.(server|client)?\.?lua$/, '').replace(/\.$/, '')));
let errors = 0;

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);
  let ast;
  try {
    ast = luaparse.parse(src, { luaVersion: '5.1', scope: true, locations: true });
  } catch (e) {
    console.log(`SYNTAX ${rel}: ${e.message}`); errors++; continue;
  }
  // globals
  const seen = new Set();
  (function visit(node) {
    if (!node || typeof node !== 'object') return;
    if (Array.isArray(node)) { node.forEach(visit); return; }
    if (node.type === 'Identifier' && node.isLocal === false && !GLOBALS.has(node.name)) {
      const key = node.name + ':' + node.loc.start.line;
      if (!seen.has(key)) { seen.add(key); console.log(`GLOBAL ${rel}:${node.loc.start.line} '${node.name}'`); errors++; }
    }
    for (const k in node) if (k !== 'loc' && k !== 'range') visit(node[k]);
  })(ast.body);
  // require targets
  const re = /require\([^)]*WaitForChild\("([A-Za-z0-9_]+)"\)\)/g;
  let m;
  while ((m = re.exec(src))) {
    if (!moduleNames.has(m[1])) { console.log(`REQUIRE ${rel}: no module named ${m[1]}`); errors++; }
  }
  if (src.includes(']]>')) { console.log(`CDATA ${rel}: contains ]]>`); errors++; }
}
console.log(`${files.length} files checked, ${errors} problem(s)`);

// ---- Cross-module checks (second pass) ----
let xerr = 0;
const defs = {}; // moduleName -> Set(function/field names)
for (const file of files) {
  const name = path.basename(file).replace(/\.(server|client)\.lua$/, '').replace(/\.lua$/, '');
  const src = fs.readFileSync(file, 'utf8');
  const set = new Set();
  const re = new RegExp(`(?:function\\s+${name}[.:](\\w+))|(?:^\\s*${name}\\.(\\w+)\\s*=)`, 'gm');
  let m;
  while ((m = re.exec(src))) set.add(m[1] || m[2]);
  defs[name] = set;
}
// Services.<Key> -> module
const svcMap = {};
const mainSrc = fs.readFileSync(path.join(ROOT, 'server', 'Main.server.lua'), 'utf8');
for (const m of mainSrc.matchAll(/(\w+) = require\(ServicesFolder:WaitForChild\("(\w+)"\)\)/g)) svcMap[m[1]] = m[2];
const netSrc = fs.readFileSync(path.join(ROOT, 'shared', 'Net.lua'), 'utf8');
const remotes = new Set([...netSrc.matchAll(/^\s*"(\w+)", --/gm)].map(m => m[1]));
for (const file of files) {
  const rel = path.relative(ROOT, file);
  const src = fs.readFileSync(file, 'utf8');
  // local Alias = require(...WaitForChild("Module"))
  const aliases = {};
  for (const m of src.matchAll(/local (\w+) = require\([^\n]*WaitForChild\("(\w+)"\)\)/g)) aliases[m[1]] = m[2];
  for (const [alias, mod] of Object.entries(aliases)) {
    if (!defs[mod] || defs[mod].size === 0) continue;
    for (const m of src.matchAll(new RegExp(`\\b${alias}\\.(\\w+)\\(`, 'g'))) {
      if (!defs[mod].has(m[1])) { console.log(`API ${rel}: ${alias}.${m[1]}() not defined in ${mod}`); xerr++; }
    }
  }
  for (const m of src.matchAll(/Services\.(\w+)\.(\w+)\(/g)) {
    const mod = svcMap[m[1]];
    if (!mod) { console.log(`SERVICE ${rel}: unknown Services.${m[1]}`); xerr++; continue; }
    if (!defs[mod].has(m[2])) { console.log(`SERVICE ${rel}: Services.${m[1]}.${m[2]}() not defined in ${mod}`); xerr++; }
  }
  for (const m of src.matchAll(/Net\.(?:get|on|fire|fireAll)\("(\w+)"/g)) {
    if (!remotes.has(m[1])) { console.log(`REMOTE ${rel}: unknown remote ${m[1]}`); xerr++; }
  }
}
console.log(`cross-module check: ${xerr} problem(s)`);
process.exit(errors + xerr ? 1 : 0);
