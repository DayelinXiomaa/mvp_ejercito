import zipfile
import xml.etree.ElementTree as ET
import json
import re

def parse_pptx(pptx_path):
    slides = {}
    with zipfile.ZipFile(pptx_path, 'r') as z:
        for f in z.namelist():
            if f.startswith('ppt/slides/slide') and f.endswith('.xml'):
                num = int(''.join(filter(str.isdigit, f)))
                root = ET.fromstring(z.read(f))
                lines = []
                for p in root.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}p'):
                    p_texts = [t.text for t in p.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t') if t.text]
                    line = ''.join(p_texts).strip()
                    if line:
                        lines.append(line)
                slides[num] = lines
    return slides

ddee = parse_pptx(r"c:\Proyectos\Interactivo\Interactivo\ES\DDEE BRIG UU PPUU.pptx")

# Let's write out all slides and their first 2 lines to a file to inspect
with open(r"c:\Proyectos\Interactivo\mvp_ejercito\all_ddee_slides.txt", "w", encoding="utf-8") as out:
    for s in sorted(ddee.keys()):
        lines = ddee[s]
        if not lines:
            out.write(f"Slide {s:3d}: [EMPTY]\n")
        else:
            title_parts = lines[:3]
            out.write(f"Slide {s:3d}: {' // '.join(title_parts)}\n")

print("Wrote all_ddee_slides.txt with 674 slides.")
