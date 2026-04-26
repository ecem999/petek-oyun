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
    # 1. Clean consecutive empty lines (more than 2 -> 2)
    content = re.sub(r'\n\s*\n\s*\n+', '\n\n', content)
    
    # 2. Update .settings-content to be Opaque White
    # We'll find the blocks and replace background/backdrop-filter
    
    # Target:
    # .settings-content {
    #     background: rgba(255, 255, 255, 0.7) !important;
    #     backdrop-filter: blur(15px) ...
    # }
    
    opaque_bg = """
.settings-content {
    background: #FFFFFF !important;
    opacity: 1 !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    border: 3px solid #4A148C !important; /* Daha belirgin bir kenarlık */
    border-radius: 30px !important;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2) !important;
    max-width: 450px !important;
}
"""
    # Replace all occurrences of .settings-content { ... }
    # Using a simple regex since I'm cleaning the file anyway
    content = re.sub(r'\.settings-content\s*\{[^}]*\}', opaque_bg, content)

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css cleaned and settings modal updated to opaque white")
else:
    print("Failed to decode style.css")
