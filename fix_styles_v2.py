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
        break
    except:
        continue

if content:
    # 1. Remove the previously appended (possibly broken or incorrect) styles
    content = content.split('/* ============================================================== */\n/* AYARLAR VE EK MODAL STİLLERİ')[0]
    
    # 2. Define the correct styles
    new_styles = """
/* ============================================================== */
/* AYARLAR VE EK MODAL STİLLERİ (GLASSMORPHISM)                   */
/* ============================================================== */

/* Ayarlar Butonu Özel Animasyon (Dönme) */
#settingsBtn {
    transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

#settingsBtn:hover {
    transform: scale(1.1) rotate(90deg);
}

/* Glassmorphism Ayarlar Paneli */
.settings-content {
    background: rgba(255, 255, 255, 0.7) !important;
    backdrop-filter: blur(15px) saturate(180%) !important;
    -webkit-backdrop-filter: blur(15px) saturate(180%) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    border-radius: 30px !important;
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2) !important;
    max-width: 450px !important;
}

.settings-content .modal-title {
    color: #4A148C !important;
    font-size: 1.8rem !important;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.settings-content .input-label {
    font-weight: 800 !important;
    color: #4A148C !important;
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 1px;
}

/* Kategori ve Zorluk Seçimlerinde Aktif Durum (Glassmorphism Glow) */
.settings-content .category-card.active, 
.settings-content .diff-btn.active {
    background: rgba(74, 20, 140, 0.2) !important;
    border: 2px solid #4A148C !important;
    box-shadow: 0 0 15px rgba(74, 20, 140, 0.3) !important;
    transform: translateY(-3px);
}

.settings-content .diff-btn {
    padding: 12px !important;
    border: 1px solid rgba(74, 20, 140, 0.1);
}

/* E-mail Input (Nickname ile birebir aynı) */
input[type='email'].custom-input {
    background-color: #fffaee !important; /* Nickname ile aynı sarımsı beyaz */
}
"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content + new_styles)
    print("Success: style.css corrected and Glassmorphism added")
else:
    print("Failed to decode style.css")
