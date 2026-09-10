import os
import pypdf
from PIL import Image
import io

pdf_path = r'c:\Proyectos\Interactivo\Interactivo\Terrorismo\incluir linea tiempo (3).pdf'
output_dir = r'c:\Proyectos\Interactivo\mvp_ejercito\pantalla_3_terrorismo\public\assets\terrorismo'

reader = pypdf.PdfReader(pdf_path)

for page_idx, page in enumerate(reader.pages):
    print(f"\nPage {page_idx + 1}:")
    for img_idx, img_obj in enumerate(page.images):
        name = img_obj.name
        data = img_obj.data
        filename = f"pdf3_p{page_idx + 1}_img{img_idx + 1}_{name}"
        out_path = os.path.join(output_dir, filename)
        with open(out_path, 'wb') as f:
            f.write(data)
        im = Image.open(out_path)
        print(f"  Saved {filename}: {im.size}, {im.format}, {len(data)} bytes")
