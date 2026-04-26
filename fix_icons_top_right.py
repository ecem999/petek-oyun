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
    # 1. Define new Hexagon Glowing Yellow styles (Horizontal & Top-Right)
    new_styles = """
/* --- UNIFIED HEADER ICONS (GLOWING YELLOW HEXAGONS - HORIZONTAL - TOP RIGHT) --- */
.header {
    position: fixed; 
    top: 30px;
    right: 30px; /* EN SAĞ ÜST KÖŞE */
    display: flex;
    flex-direction: row; /* YAN YANA DİZİLİM */
    gap: 15px;
    z-index: 2000;
    align-items: center;
}

.icon-btn {
    width: 62px;
    height: 70px; /* Altıgen oranları */
    background: linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
    font-weight: 900;
    color: #FFFFFF; /* Beyaz ikon sembolü */
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    filter: drop-shadow(0 0 12px rgba(255, 235, 59, 0.9));
    border: none;
    padding: 0;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
    margin: 0;
}

.icon-btn:hover {
    transform: scale(1.1);
    filter: drop-shadow(0 0 20px rgba(255, 235, 59, 1));
}

.icon-btn:active {
    transform: scale(0.9);
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg) !important;
}

/* Mobil cihazlar için ölçeklendirme */
@media screen and (max-width: 600px) {
    .header {
        top: 20px;
        right: 20px;
    }
    .icon-btn {
        width: 52px;
        height: 60px;
        font-size: 1.5rem;
    }
}
"""
    # 2. Find and replace old header and icon-btn blocks
    content = re.sub(r'\/\* --- UNIFIED HEADER ICONS .*? \/\*', '/*', content, flags=re.DOTALL)
    content = re.sub(r'\.header\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:active\s*\{[^}]*\}', '', content)
    content = re.sub(r'#settingsBtn:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'#settingsBtn\s*\{[^}]*\}', '', content)
    content = re.sub(r'#helpBtn\s*\{[^}]*\}', '', content)
    
    # Append the styles
    content += "\n" + new_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Icons corrected to Horizontal Glowing Yellow Hexagons in the Top-Right")
else:
    print("Failed to decode style.css")
