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
        print(f"Decoded with {enc}")
        break
    except:
        continue

if content:
    replacement = """/* ============================================================== */
/* ZARİF ALTIGEN IZGARA ARKA PLANI (ELITE HEXAGON GRID)            */
/* ============================================================== */
.hexagon-grid-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.18;
    background: linear-gradient(135deg, #E040FB 0%, #FF4081 50%, #00E5FF 100%);
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='112' height='100' viewBox='0 0 112 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100M56 16L84 0L112 16L112 50L84 66L56 50' fill='none' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg width='112' height='100' viewBox='0 0 112 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100M56 16L84 0L112 16L112 50L84 66L56 50' fill='none' stroke='black' stroke-width='1.2'/%3E%3C/svg%3E");
    mask-size: 70px auto;
    filter: drop-shadow(0 0 2px rgba(224, 64, 251, 0.5)) drop-shadow(0 0 4px rgba(0, 229, 255, 0.3));
}"""
    
    # Replace the block from floating hexagons to floatDown keyframes
    new_content = re.sub(r'/\* =+ \*/\s*/\* HAREKETL.*?@keyframes floatDown\s*\{.*?\}', replacement, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replacement Success")
else:
    print("Failed to decode style.css")
