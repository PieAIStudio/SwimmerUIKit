"""Rebuild reviewed Lucide path data, without installing a runtime icon library.

Usage: python3 scripts/generate-game-icons.py /path/to/lucide-1.51.0 [--check]
The input files must match scripts/game-icons-source.json. Only ordinary SVG
geometry is accepted; scripts, hrefs, styles and transforms are not a data path.
"""
from pathlib import Path
import hashlib
import json
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
SOURCE = Path(sys.argv[1])
CONTRACT = json.loads((ROOT / 'scripts/game-icons-source.json').read_text())


def num(value):
    return format(float(value), '.12g')


def shape(element):
    tag = element.tag.rsplit('}', 1)[-1]
    a = element.attrib
    allowed = {
        'path': {'d'}, 'line': {'x1', 'y1', 'x2', 'y2'},
        'circle': {'cx', 'cy', 'r'}, 'ellipse': {'cx', 'cy', 'rx', 'ry'},
        'rect': {'x', 'y', 'width', 'height', 'rx', 'ry'},
        'polyline': {'points'}, 'polygon': {'points'},
    }
    assert tag in allowed and set(a) <= allowed[tag], (tag, a)
    if tag == 'path':
        return a['d']
    if tag == 'line':
        return f"M{a.get('x1',0)} {a.get('y1',0)}L{a.get('x2',0)} {a.get('y2',0)}"
    if tag in ('polyline', 'polygon'):
        return 'M' + a['points'] + ('Z' if tag == 'polygon' else '')
    if tag in ('circle', 'ellipse'):
        x, y = float(a.get('cx', 0)), float(a.get('cy', 0))
        rx, ry = float(a.get('r', a.get('rx', 0))), float(a.get('r', a.get('ry', 0)))
        return f'M{num(x-rx)} {num(y)}a{num(rx)} {num(ry)} 0 1 0 {num(rx*2)} 0a{num(rx)} {num(ry)} 0 1 0 {num(-rx*2)} 0'
    x, y = float(a.get('x', 0)), float(a.get('y', 0))
    w, h = float(a['width']), float(a['height'])
    rx, ry = min(float(a.get('rx', a.get('ry', 0))), w/2), min(float(a.get('ry', a.get('rx', 0))), h/2)
    if not rx or not ry:
        return f'M{num(x)} {num(y)}h{num(w)}v{num(h)}h{num(-w)}Z'
    return f'M{num(x+rx)} {num(y)}H{num(x+w-rx)}a{num(rx)} {num(ry)} 0 0 1 {num(rx)} {num(ry)}V{num(y+h-ry)}a{num(rx)} {num(ry)} 0 0 1 {num(-rx)} {num(ry)}H{num(x+rx)}a{num(rx)} {num(ry)} 0 0 1 {num(-rx)} {num(-ry)}V{num(y+ry)}a{num(rx)} {num(ry)} 0 0 1 {num(rx)} {num(-ry)}Z'


rows = []
for entry in CONTRACT['icons']:
    raw = (SOURCE / 'icons' / (entry['upstream'] + '.svg')).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == entry['sha256'], entry['name']
    svg = ET.fromstring(raw)
    assert svg.attrib['viewBox'] == '0 0 24 24'
    assert svg.attrib['fill'] == 'none' and svg.attrib['stroke'] == 'currentColor'
    rows.append((entry['name'], [shape(child) for child in svg]))

header = '// Generated from reviewed Lucide ' + CONTRACT['version'] + '. ISC / Feather-derived MIT: see NOTICE.\n'
paths = header + "import type { GameIconData } from './types';\n\n"
exports = []
registry = []
for name, data in rows:
    symbol = name.upper().replace('-', '_') + '_ICON'
    paths += f'export const {symbol} = {{ name: {json.dumps(name)}, paths: {json.dumps(data)} }} as const satisfies GameIconData;\n'
    exports.append(symbol)
    registry.append(f'  {json.dumps(name)}: {symbol},')
files = {
    'src/icons/paths.ts': paths,
    'src/icons/registry.ts': header + f"import {{ {', '.join(exports)} }} from './paths';\n\nexport const GAME_ICONS = {{\n" + '\n'.join(registry) + "\n} as const;\nexport type GameIconName = keyof typeof GAME_ICONS;\nexport const GAME_ICON_NAMES = Object.keys(GAME_ICONS) as GameIconName[];\n",
    'src/icon-paths.ts': header + f"export {{ {', '.join(exports)} }} from './icons/paths';\nexport type {{ GameIconData }} from './icons/types';\n",
}
for relative, text in files.items():
    dest = ROOT / relative
    dest.parent.mkdir(parents=True, exist_ok=True)
    if '--check' in sys.argv:
        # Format with the repository's own formatter before comparing generated text.
        import subprocess
        result = subprocess.run([str(ROOT/'node_modules/.bin/oxfmt'), '--stdin-filepath', relative], input=text, text=True, capture_output=True, check=True)
        assert dest.read_text() == result.stdout, relative
    else:
        dest.write_text(text)
print(f'Validated {len(rows)} named icons against the pinned upstream source')
