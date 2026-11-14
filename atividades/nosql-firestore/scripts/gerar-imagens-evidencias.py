"""Transforma logs VERDADEIROS do teste no emulador em evidências PNG legíveis.
Não simula uma captura do Firebase Console nem prova uso do Cloud Firestore real.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import textwrap

base = Path(__file__).resolve().parent.parent / "docs" / "evidencias-emulador"
base.mkdir(parents=True, exist_ok=True)
fonts = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
]
fontfile = next((p for p in fonts if Path(p).exists()), None)
font = ImageFont.truetype(fontfile, 23) if fontfile else ImageFont.load_default()
small = ImageFont.truetype(fontfile, 19) if fontfile else ImageFont.load_default()
heading = ImageFont.truetype(fontfile, 29) if fontfile else ImageFont.load_default()
for txt in sorted(base.glob("[0-9]*.txt")):
    lines = []
    for line in txt.read_text(encoding="utf-8").splitlines():
        lines.extend(textwrap.wrap(line, width=82) if len(line) > 82 else [line])
    width, height = 1710, max(530, 215 + len(lines) * 38)
    im = Image.new("RGB", (width, height), (11, 29, 22))
    dr = ImageDraw.Draw(im)
    dr.rounded_rectangle((32, 30, width-32, height-30), radius=24, fill=(18, 43, 31), outline=(78, 141, 96), width=2)
    dr.rounded_rectangle((32, 30, width-32, 125), radius=24, fill=(29, 82, 49))
    dr.text((65, 49), "KENNEDY - ATIVIDADE NOSQL", font=heading, fill=(233, 255, 237))
    dr.text((65, 144), "EVIDÊNCIA: saída de teste automatizado | FIRESTORE EMULATOR", font=small, fill=(159, 227, 173))
    y = 206
    for line in lines:
        dr.text((67, y), line, font=font, fill=(239, 252, 239))
        y += 38
    im.save(txt.with_suffix(".png"), optimize=True)
    print(f"Imagem gerada a partir de log de execução: {txt.with_suffix('.png').name}")
