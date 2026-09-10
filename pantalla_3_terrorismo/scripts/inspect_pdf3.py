import os
import pypdf

pdf_path = r'c:\Proyectos\Interactivo\Interactivo\Terrorismo\incluir linea tiempo (3).pdf'

reader = pypdf.PdfReader(pdf_path)
print(f"Total pages: {len(reader.pages)}")

for idx, page in enumerate(reader.pages):
    print(f"\n--- PAGE {idx + 1} ---")
    text = page.extract_text()
    print(text)
    print(f"Images in page {idx + 1}: {len(page.images)}")
    for img_idx, img in enumerate(page.images):
        print(f"  Image {img_idx + 1}: {img.name}, size: {len(img.data)} bytes")
