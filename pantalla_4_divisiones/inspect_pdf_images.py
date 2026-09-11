import os, pypdf, sys
sys.stdout.reconfigure(encoding='utf-8')

reader = pypdf.PdfReader('c:/Proyectos/Interactivo/Interactivo/Divisiones_Brigadas/AVIACIÓN UU PPUU.pdf')
print("Pages in PDF:", len(reader.pages))

for i, page in enumerate(reader.pages):
    imgs = page.images
    print(f"Page {i+1}: {len(imgs)} image(s) -> {[img.name for img in imgs]}")

print("\nExisting aviacion images in public/assets/divisiones:")
for f in sorted(os.listdir('public/assets/divisiones')):
    if 'aviacion' in f:
        size = os.path.getsize(os.path.join('public/assets/divisiones', f))
        print(f"  {f} ({size} bytes)")
