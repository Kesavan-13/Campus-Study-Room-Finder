from pathlib import Path
import fitz

source = Path("attached_assets/Room_Status_G04-G09_B01-B03_Labs_M2026_1790748844552.pdf")
out_dir = Path(".agents/outputs")
out_dir.mkdir(parents=True, exist_ok=True)

document = fitz.open(source)
print(f"Pages: {document.page_count}")
for index, page in enumerate(document):
    image = page.get_pixmap(matrix=fitz.Matrix(1.4, 1.4), alpha=False)
    destination = out_dir / f"timetable-page-{index + 1}.png"
    image.save(destination)
    print(destination)