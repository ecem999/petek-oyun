import os
import sys
from io import BytesIO
from PIL import Image

try:
    import rembg
except ImportError:
    print("rembg is not installed. Exiting.")
    sys.exit(1)

# Files in chronological order of upload roughly mapped to k1-k4
files = [
    r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720552.png",
    r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720570.png",
    r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720588.png",
    r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720629.png"
]

out_dir = r"c:\Users\aaaec\OneDrive\Desktop\petek"

names = ["k1_beyaz.png", "k2_beyaz.png", "k3_beyaz.png", "k4_beyaz.png"]

for i, f in enumerate(files):
    if not os.path.exists(f):
        print(f"File not found: {f}")
        continue
    
    with open(f, 'rb') as fp:
        img_bytes = fp.read()
    
    # Process with rembg
    out_bytes = rembg.remove(img_bytes)
    
    # Compose on white background
    img = Image.open(BytesIO(out_bytes)).convert("RGBA")
    
    # Create white background
    white_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    
    # Alpha composite
    white_bg.paste(img, (0, 0), img)
    final_img = white_bg.convert("RGB") # Remove alpha channel naturally
    
    out_path = os.path.join(out_dir, names[i])
    final_img.save(out_path, "PNG")
    print(f"Saved: {out_path}")
