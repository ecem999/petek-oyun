import os
import re

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

# Try common encodings
encodings = ['utf-8', 'latin-1', 'cp1252', 'utf-16']
content = None
for enc in encodings:
    try:
        content = data.decode(enc)
        break
    except:
        continue

if content:
    # 1. Lower background grid z-index to -1
    content = content.replace("z-index: 0;", "z-index: -1;")
    
    # 2. Ensure header and containers are above background
    # (These usually have z-index: 10 already, but let's be sure)
    
    # 3. Double check modal pointer-events (should be fine but let's reinforce)
    if "pointer-events: none;" not in content.split(".modal-overlay {")[1].split("}")[0]:
         content = content.replace(".modal-overlay {", ".modal-overlay {\n    pointer-events: none;")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css z-index and pointer-events fixed")
else:
    print("Failed to decode style.css")
