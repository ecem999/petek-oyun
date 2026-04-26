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
    # 1. Define new Hexagon Glowing Yellow styles
    new_styles = """
/* --- UNIFIED HEADER ICONS (GLOWING YELLOW HEXAGONS) --- */
.header {
    position: absolute;
    bottom: 260px; /* HOW TO PLAY butonunun hemen üstü için ayarlandı */
    left: 45px;
    display: flex;
    gap: 15px;
    z-index: 1000;
    align-items: center;
}

.icon-btn {
    width: 60px;
    height: 68px; /* Altıgen oranları */
    background: linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.6rem;
    font-weight: 900;
    color: #FFFFFF; /* Beyaz ikonlar */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: drop-shadow(0 0 8px rgba(255, 235, 59, 0.8));
    border: none;
    padding: 0;
    text-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}

.icon-btn:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 15px rgba(255, 235, 59, 1));
}

.icon-btn:active {
    transform: scale(0.9);
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg) !important;
}
"""
    # 2. Find and replace old header and icon-btn blocks
    # Remove any existing .header, .icon-btn blocks (including the ones I just added)
    content = re.sub(r'\/\* --- UNIFIED HEADER ICONS .*? \/\*', '/*', content, flags=re.DOTALL)
    content = re.sub(r'\.header\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:active\s*\{[^}]*\}', '', content)
    content = re.sub(r'#settingsBtn:hover\s*\{[^}]*\}', '', content)
    
    # Append new styles at the end
    content += "\n" + new_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css icons redesigned as yellow hexagons and moved to bottom-left")
else:
    print("Failed to decode style.css")
