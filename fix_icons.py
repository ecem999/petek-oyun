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
    # 1. Define new unified styles
    new_styles = """
.header {
    position: absolute;
    top: 25px;
    right: 25px;
    display: flex;
    gap: 12px;
    z-index: 1000;
}

.icon-btn {
    width: 54px;
    height: 54px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px) saturate(160%);
    -webkit-backdrop-filter: blur(12px) saturate(160%);
    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.8rem;
    font-weight: 900;
    color: #4A148C;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    box-shadow: 0 0 15px rgba(224, 64, 251, 0.2), inset 0 0 10px rgba(255, 255, 255, 0.1);
    text-shadow: 0 0 5px rgba(224, 64, 251, 0.4);
    line-height: 1;
    padding: 0;
}

.icon-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: scale(1.1);
    box-shadow: 0 0 25px rgba(224, 64, 251, 0.6);
    border-color: rgba(255, 255, 255, 0.5);
}

.icon-btn:active {
    transform: scale(0.9);
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg) !important;
}
"""
    # 2. Find and replace old header and icon-btn blocks
    # Since we saw they are around 1191-1400, let's target them precisely
    
    # Remove existing .header, .icon-btn, .icon-btn:hover, .icon-btn:active
    content = re.sub(r'\.header\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:hover\s*\{[^}]*\}', '', content)
    content = re.sub(r'\.icon-btn:active\s*\{[^}]*\}', '', content)
    
    # Also remove the #settingsBtn hover we saw at the end
    content = re.sub(r'#settingsBtn:hover\s*\{[^}]*\}', '', content)
    
    # Append new styles at the end
    content += "\n/* --- UNIFIED HEADER ICONS (GLASSMORPHISM & LILA GLOW) --- */\n" + new_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css header icons synchronized")
else:
    print("Failed to decode style.css")
