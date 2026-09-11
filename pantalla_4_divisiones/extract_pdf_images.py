import os, pypdf, sys
sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('c:/Proyectos/Interactivo/Interactivo/Divisiones_Brigadas/AVIACIÓN UU PPUU.pdf')

# Save images from pages 14, 16, 18
img_map = {
    14: 'aviacion_image7.png',
    16: 'aviacion_image8.png',
    18: 'aviacion_image9.png'
}

for page_idx, out_name in img_map.items():
    page = reader.pages[page_idx - 1]
    for img in page.images:
        out_path = os.path.join('public/assets/divisiones', out_name)
        with open(out_path, 'wb') as f:
            f.write(img.data)
        print(f"Extracted page {page_idx} ({img.name}) -> {out_path} ({len(img.data)} bytes)")
