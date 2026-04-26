import os
import sys
from io import BytesIO
from PIL import Image

try:
    from rembg import remove, new_session
except ImportError:
    print("rembg is not installed. Exiting.")
    sys.exit(1)

# Specifically target k4 which had issues
file_k4 = r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720629.png"
out_dir = r"c:\Users\aaaec\OneDrive\Desktop\petek"
out_name = "k4_beyaz.png"

if not os.path.exists(file_k4):
    print(f"File not found: {file_k4}")
    sys.exit(1)

with open(file_k4, 'rb') as fp:
    img_bytes = fp.read()

# Try using a different model for better human segmentation
# Models: u2net, u2netp, u2net_human_seg, silueta
models = ["u2net", "u2net_human_seg", "silueta"]

for model_name in models:
    print(f"Trying model: {model_name}")
    session = new_session(model_name)
    out_bytes = remove(img_bytes, session=session)
    
    img = Image.open(BytesIO(out_bytes)).convert("RGBA")
    white_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    white_bg.paste(img, (0, 0), img)
    final_img = white_bg.convert("RGB")
    
    # Save with a specific name to compare or just overwrite if confident
    temp_name = f"k4_beyaz_{model_name}.png"
    final_img.save(os.path.join(out_dir, temp_name), "PNG")
    print(f"Saved: {temp_name}")

# Additionally, let's try to save the most likely best one as k4_beyaz.png
# Usually u2net_human_seg is better for this
session_human = new_session("u2net_human_seg")
final_out_bytes = remove(img_bytes, session=session_human)
final_img_human = Image.open(BytesIO(final_out_bytes)).convert("RGBA")
white_bg_final = Image.new("RGBA", final_img_human.size, (255, 255, 255, 255))
white_bg_final.paste(final_img_human, (0, 0), final_img_human)
white_bg_final.convert("RGB").save(os.path.join(out_dir, out_name), "PNG")
print(f"Overwritten {out_name} with u2net_human_seg result.")
