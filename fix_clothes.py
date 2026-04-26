import os
import sys
from io import BytesIO
from PIL import Image

try:
    from rembg import remove, new_session
except ImportError:
    print("rembg is not installed. Exiting.")
    sys.exit(1)

# Files to fix
targets = {
    "k1": {
        "src": r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720552.png",
        "out": "k1_beyaz.png"
    },
    "k4": {
        "src": r"C:\Users\aaaec\.gemini\antigravity\brain\803de1c9-4f0e-4dee-a3be-04c82853781f\media__1776964720629.png",
        "out": "k4_beyaz.png"
    }
}

out_dir = r"c:\Users\aaaec\OneDrive\Desktop\petek"

# Use u2net_human_seg and isnet-general-use if possible
# Also u2net_cloth_seg might help if the error is specifically in clothes
models_to_try = ["u2net", "u2net_human_seg", "isnet-general-use", "u2net_cloth_seg"]

for key, paths in targets.items():
    print(f"--- Processing {key} ---")
    if not os.path.exists(paths["src"]):
        print(f"Source not found: {paths['src']}")
        continue
        
    with open(paths["src"], 'rb') as fp:
        img_bytes = fp.read()
    
    # We will try a few and hopefully u2net_human_seg is the best for general, 
    # but let's see if we can find a better balance.
    # We use u2net_human_seg as primary since it was requested to fix k4 specifically before.
    
    selected_model = "u2net_human_seg"
    print(f"Using {selected_model} for {key}...")
    session = new_session(selected_model)
    
    # post_process_mask=True can help with jagged edges
    out_bytes = remove(img_bytes, session=session, post_process_mask=True)
    
    img = Image.open(BytesIO(out_bytes)).convert("RGBA")
    white_bg = Image.new("RGBA", img.size, (255, 255, 255, 255))
    white_bg.paste(img, (0, 0), img)
    final_img = white_bg.convert("RGB")
    
    out_path = os.path.join(out_dir, paths["out"])
    final_img.save(out_path, "PNG")
    print(f"Saved: {out_path}")

    # Also save the cloth-specific version just in case for review
    print(f"Attempting cloth-specific segmentation for {key}...")
    try:
        session_cloth = new_session("u2net_cloth_seg")
        cloth_bytes = remove(img_bytes, session=session_cloth, post_process_mask=True)
        cloth_img = Image.open(BytesIO(cloth_bytes)).convert("RGBA")
        cloth_white_bg = Image.new("RGBA", cloth_img.size, (255, 255, 255, 255))
        cloth_white_bg.paste(cloth_img, (0, 0), cloth_img)
        cloth_out_name = f"{key}_beyaz_cloth.png"
        cloth_white_bg.convert("RGB").save(os.path.join(out_dir, cloth_out_name), "PNG")
        print(f"Saved: {cloth_out_name}")
    except Exception as e:
        print(f"Cloth segmentation failed for {key}: {e}")
