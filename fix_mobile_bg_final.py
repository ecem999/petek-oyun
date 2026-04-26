import os
import re

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

encodings = ['utf-8', 'latin-1', 'cp1252']
content = None
for enc in encodings:
    try:
        content = data.decode(enc)
        break
    except:
        continue

if content:
    # 1. Update Body & Hexagon Grid BG for Mobile
    content = content.replace('background-color: #9370DB !important;', 'background-color: #a29bfe !important;')
    
    # 2. Add prep-body and prep-container if missing
    prep_styles = """
/* --- HAZIRLIK SAYFALARI (MOBILE COMPATIBLE) --- */
.prep-body {
    background-color: #a29bfe !important;
    background: linear-gradient(135deg, #E6E6FA 0%, #a29bfe 100%) !important;
    min-height: 100vh !important;
    min-height: -webkit-fill-available !important;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    position: relative;
    overflow-x: hidden;
}

.prep-container {
    width: 100%;
    max-width: 450px;
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
}

/* Mobile Background Adjustment */
@media screen and (max-width: 768px) {
    .hexagon-grid-bg {
        position: absolute !important; /* Fixed mobilde beyazlığa neden olabilir */
        height: 100% !important;
        min-height: 100vh !important;
    }
}
"""
    # Append to the end
    content += "\n" + prep_styles

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Mobile background styles updated in style.css")
else:
    print("Failed to decode style.css")
