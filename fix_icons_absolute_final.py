import os
import re

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

# Try common encodings
encodings = ['utf-8', 'latin-1', 'cp1252']
content = None
for enc in encodings:
    try:
        content = data.decode(enc)
        break
    except:
        continue

if content:
    # 1. Define the ABSOLUTE FINAL styles for Top-Right Horizontal Hexagons
    final_styles = """
/* --- ULTIMATE HEADER ICONS (GLOWING YELLOW HEXAGONS - HORIZONTAL - TOP RIGHT) --- */
.header {
    position: fixed !important; 
    top: 20px !important;
    right: 20px !important; /* EN UÇ SAĞ ÜST KÖŞE */
    display: flex !important;
    flex-direction: row !important; /* YAN YANA */
    gap: 15px !important;
    z-index: 5000 !important; /* EN ÜSTTE */
    align-items: center !important;
}

.icon-btn {
    width: 62px !important;
    height: 70px !important;
    background: linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%) !important;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%) !important;
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    font-size: 1.8rem !important;
    font-weight: 900 !important;
    color: #FFFFFF !important;
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    filter: drop-shadow(0 0 12px rgba(255, 235, 59, 0.9)) !important;
    border: none !important;
    padding: 0 !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5) !important;
    margin: 0 !important;
}

.icon-btn:hover {
    transform: scale(1.1) !important;
    filter: drop-shadow(0 0 20px rgba(255, 235, 59, 1)) !important;
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg) !important;
}

/* Mobil Ölçeklendirme */
@media screen and (max-width: 600px) {
    .header {
        top: 15px !important;
        right: 15px !important;
    }
    .icon-btn {
        width: 50px !important;
        height: 56px !important;
        font-size: 1.4rem !important;
    }
}
"""
    # 2. Scour the file for any previous header/icon-btn definitions and remove them
    content = re.sub(r'\/\* --- UNIFIED HEADER ICONS .*? \/\*', '', content, flags=re.DOTALL)
    content = re.sub(r'\/\* --- ULTIMATE HEADER ICONS .*? \/\*', '', content, flags=re.DOTALL)
    content = re.sub(r'\.header\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'#settingsBtn:hover\s*\{[^}]*\}', '', content)
    
    # 3. Append the final styles
    content += "\n" + final_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Final Icon Redesign Applied - Top-Right Horizontal Hexagons")
else:
    print("Failed to decode style.css")
