#!/usr/bin/env python3
"""
Builds build/ProjectZero.rbxlx - a complete Roblox place file containing
every script in src/, laid out exactly like default.project.json (Rojo).

Usage:  python3 tools/build_rbxlx.py
Open the result in Roblox Studio (File > Open from File) and press Play.

File naming (same as Rojo):
  *.server.lua -> Script      *.client.lua -> LocalScript
  *.lua        -> ModuleScript   folders    -> Folder
"""
import os
import sys
from xml.sax.saxutils import escape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "src")
OUT = os.path.join(ROOT, "build", "ProjectZero.rbxlx")

_ref = [0]


def ref():
    _ref[0] += 1
    return "RBX%08X" % _ref[0]


def cdata(text):
    # ']]>' cannot appear inside CDATA; split it if it ever does.
    return "<![CDATA[" + text.replace("]]>", "]]]]><![CDATA[>") + "]]>"


def prop_xml(kind, name, value):
    if kind == "string":
        return '<string name="%s">%s</string>' % (name, escape(value))
    if kind == "bool":
        return '<bool name="%s">%s</bool>' % (name, "true" if value else "false")
    if kind == "float":
        return '<float name="%s">%s</float>' % (name, repr(float(value)))
    if kind == "int":
        return '<int name="%s">%d</int>' % (name, value)
    if kind == "token":
        return '<token name="%s">%d</token>' % (name, value)
    if kind == "Color3":
        r, g, b = value
        return '<Color3 name="%s"><R>%s</R><G>%s</G><B>%s</B></Color3>' % (name, r / 255, g / 255, b / 255)
    if kind == "source":
        return '<ProtectedString name="Source">%s</ProtectedString>' % cdata(value)
    raise ValueError(kind)


def item(cls, name, props=None, children=None):
    out = ['<Item class="%s" referent="%s"><Properties>' % (cls, ref())]
    out.append(prop_xml("string", "Name", name))
    for kind, pname, value in props or []:
        out.append(prop_xml(kind, pname, value))
    out.append("</Properties>")
    for child in children or []:
        out.append(child)
    out.append("</Item>")
    return "".join(out)


def from_dir(path):
    """Converts a directory's contents to a list of Item XML strings."""
    children = []
    for entry in sorted(os.listdir(path)):
        full = os.path.join(path, entry)
        if os.path.isdir(full):
            children.append(item("Folder", entry, children=from_dir(full)))
        elif entry.endswith(".lua"):
            with open(full, encoding="utf-8") as f:
                source = f.read()
            if entry.endswith(".server.lua"):
                cls, name = "Script", entry[: -len(".server.lua")]
            elif entry.endswith(".client.lua"):
                cls, name = "LocalScript", entry[: -len(".client.lua")]
            else:
                cls, name = "ModuleScript", entry[: -len(".lua")]
            children.append(item(cls, name, [("source", "Source", source)]))
    return children


def main():
    services = []
    services.append(item("Workspace", "Workspace", [
        ("bool", "StreamingEnabled", False),
        ("float", "Gravity", 196.2),
    ]))
    services.append(item("Lighting", "Lighting", [
        ("token", "Technology", 4),  # Future lighting (auto-scales on low-end devices)
        ("float", "ClockTime", 18.9),
        ("float", "Brightness", 1.4),
        ("Color3", "Ambient", (38, 42, 48)),
        ("Color3", "OutdoorAmbient", (70, 74, 86)),
        ("bool", "GlobalShadows", True),
    ]))
    services.append(item("Players", "Players", [
        ("bool", "CharacterAutoLoads", False),
    ]))
    services.append(item("ReplicatedStorage", "ReplicatedStorage", children=[
        item("Folder", "Shared", children=from_dir(os.path.join(SRC, "shared"))),
    ]))
    services.append(item("ServerScriptService", "ServerScriptService", children=from_dir(os.path.join(SRC, "server"))))
    services.append(item("ServerStorage", "ServerStorage"))
    services.append(item("StarterPlayer", "StarterPlayer", [
        ("float", "CameraMaxZoomDistance", 22),
        ("float", "CameraMinZoomDistance", 0.5),
        ("bool", "EnableMouseLockOption", True),
        ("bool", "LoadCharacterAppearance", True),
    ], children=[
        item("StarterPlayerScripts", "StarterPlayerScripts", children=from_dir(os.path.join(SRC, "client"))),
        item("StarterCharacterScripts", "StarterCharacterScripts", children=from_dir(os.path.join(SRC, "character"))),
    ]))
    services.append(item("StarterGui", "StarterGui", [("bool", "ShowDevelopmentGui", True)]))
    services.append(item("SoundService", "SoundService"))

    xml = ('<roblox xmlns:xmime="http://www.w3.org/2005/05/xmlmime" '
           'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
           'xsi:noNamespaceSchemaLocation="http://www.roblox.com/roblox.xsd" version="4">'
           + "".join(services) + "</roblox>\n")
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        f.write(xml)
    print("Wrote %s (%d bytes, %d instances)" % (os.path.relpath(OUT, ROOT), len(xml), _ref[0]))


if __name__ == "__main__":
    sys.exit(main())
