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
    # 1. Update Body styles for Mobile Compatibility
    # We'll replace the existing body block or add a high-priority one
    
    new_body_styles = """
/* --- GLOBAL BODY & MOBILE BACKGROUND FIX --- */
html {
    height: -webkit-fill-available; /* iOS Fix */
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: #9370DB !important; /* Lila/Mor Yedek Renk */
    background: linear-gradient(135deg, #E6E6FA 0%, #9370DB 100%) !important;
    background-size: cover !important;
    background-repeat: no-repeat !important;
    background-attachment: scroll !important; /* Fixed mobilde sorunlu, scroll yapıldı */
    
    min-height: 100vh !important;
    min-height: -webkit-fill-available !important; /* iOS adres çubuğu fix */
    
    color: #4A148C;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    width: 100%;
    margin: 0;
    position: relative;
    overflow-x: hidden;
}

/* Masaüstü için fixed özelliğini koruyabiliriz */
@media screen and (min-width: 1024px) {
    body {
        background-attachment: fixed !important;
    }
}
"""
    # Remove existing body { ... } blocks to avoid conflict
    content = re.sub(r'body\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Append the new styles at the top (after basic reset if possible)
    if '/* Temel SÄ±fÄ±rlama' in content:
        content = content.replace('/* Temel SÄ±fÄ±rlama', new_body_styles + '\n/* Temel SÄ±fÄ±rlama')
    else:
        content = new_body_styles + '\n' + content

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Mobile background and height fixes applied to style.css")
else:
    print("Failed to decode style.css")
