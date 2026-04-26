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
    # 1. Broadly remove ALL .header and .icon-btn definitions from the entire file
    # This is to ensure no legacy styles (even those without blocks) are lingering
    content = re.sub(r'\.header\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.icon-btn\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'\.icon-btn:[a-z]+\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    content = re.sub(r'#settingsBtn:hover\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # 2. Aggressively clean empty lines
    lines = content.splitlines()
    cleaned_lines = []
    prev_empty = False
    for line in lines:
        if line.strip() == '':
            if not prev_empty:
                cleaned_lines.append('')
                prev_empty = True
        else:
            cleaned_lines.append(line)
            prev_empty = False
    content = '\n'.join(cleaned_lines)

    # 3. Apply the ULTIMATE SIDE-BY-SIDE styles
    ultimate_styles = """
/* --- ULTIMATE SIDE-BY-SIDE HEADER ICONS (GLOWING YELLOW HEXAGONS) --- */
.header {
    position: fixed !important;
    top: 20px !important;
    right: 20px !important;
    display: flex !important;
    flex-direction: row !important; /* YAN YANA - KESİN ÇÖZÜM */
    flex-wrap: nowrap !important;   /* ALT SATIRA KAYMAYI ENGELLER */
    gap: 15px !important;           /* ARALARINDAKİ BOŞLUK */
    z-index: 9999 !important;
    align-items: center !important;
    width: auto !important;
    height: auto !important;
}

.icon-btn {
    display: flex !important;
    justify-content: center !important;
    align-items: center !important;
    width: 62px !important;
    height: 70px !important;
    background: linear-gradient(135deg, #FFEB3B 0%, #FBC02D 100%) !important;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%) !important;
    cursor: pointer !important;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
    filter: drop-shadow(0 0 10px rgba(255, 235, 59, 0.8)) !important;
    border: none !important;
    padding: 0 !important;
    margin: 0 !important;
    color: #FFFFFF !important;
    font-size: 1.8rem !important;
    font-weight: 900 !important;
    text-shadow: 0 0 8px rgba(255, 255, 255, 0.5) !important;
    pointer-events: auto !important;
}

.icon-btn:hover {
    transform: scale(1.1) !important;
    filter: drop-shadow(0 0 20px rgba(255, 235, 59, 1)) !important;
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg) !important;
}

/* Mobil Ölçeklendirme - Yan Yana Düzeni Koruyarak */
@media screen and (max-width: 600px) {
    .header {
        top: 15px !important;
        right: 15px !important;
        gap: 10px !important;
    }
    .icon-btn {
        width: 50px !important;
        height: 56px !important;
        font-size: 1.4rem !important;
    }
}
"""
    content += "\n" + ultimate_styles

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css scorched and icons set to ultimate side-by-side layout")
else:
    print("Failed to decode style.css")
