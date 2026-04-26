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
    # Update .prep-body to use a solid smooth color as requested
    new_prep_body = """
/* --- HAZIRLIK SAYFALARI (TEK PARÇA PÜRÜZSÜZ ARKA PLAN) --- */
.prep-body {
    background-color: #a29bfe !important;
    background: #a29bfe !important; /* İki parça görüntüsünü engellemek için düz renk */
    background-size: cover !important;
    background-attachment: fixed !important;
    
    min-height: 100vh !important;
    min-height: -webkit-fill-available !important;
    
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 !important; /* Margin/Padding sıfırlandı */
    margin: 0 !important;
    width: 100%;
    position: relative;
    overflow-x: hidden;
}
"""
    # Remove existing .prep-body { ... }
    content = re.sub(r'\.prep-body\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Append the new style
    content += "\n" + new_prep_body

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: .prep-body updated to a solid smooth lilac background.")
else:
    print("Failed to decode style.css")
