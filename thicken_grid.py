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
    # Target the stroke-width='1.2' inside the data URI and increase it to 3.0
    new_content = content.replace("stroke-width='1.2'", "stroke-width='3.0'")
    
    # Also adjust opacity slightly for a bolder look
    new_content = new_content.replace("opacity: 0.18;", "opacity: 0.22;")
    
    # Increase drop-shadow for a richer neon glow
    new_content = new_content.replace("filter: drop-shadow(0 0 2px rgba(224, 64, 251, 0.5)) drop-shadow(0 0 4px rgba(0, 229, 255, 0.3));", 
                                      "filter: drop-shadow(0 0 4px rgba(224, 64, 251, 0.6)) drop-shadow(0 0 8px rgba(0, 229, 255, 0.4));")

    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: Grid lines thickened")
else:
    print("Failed to decode style.css")
