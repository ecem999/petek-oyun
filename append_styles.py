import os

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
    replacement = """

/* ============================================================== */
/* AYARLAR VE EK MODAL STİLLERİ                                    */
/* ============================================================== */
.settings-content {
    max-width: 500px !important;
    padding: 30px !important;
}

#settingsBtn {
    font-size: 1.4rem;
    background: rgba(255, 255, 255, 0.15);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: #4A148C;
    border-radius: 12px;
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

#settingsBtn:hover {
    background: rgba(255, 255, 255, 0.25);
    transform: rotate(45deg);
}

/* Kategori Kart Modifiye (Ayarlar Paneli için) */
.settings-content .category-card {
    padding: 10px !important;
    min-height: 80px !important;
}

.settings-content .category-icon {
    font-size: 1.5rem !important;
}

.settings-content .category-name {
    font-size: 0.75rem !important;
}

/* Aktif Seçim Belirteci */
.category-card.active, .diff-btn.active {
    border: 2px solid #4A148C !important;
    background-color: rgba(74, 20, 140, 0.1) !important;
    box-shadow: 0 0 10px rgba(74, 20, 140, 0.2) !important;
}

/* E-mail Alanı (Nickname ile aynı stil) */
input[type='email'].custom-input {
    background: rgba(255, 255, 255, 0.9);
}
"""
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content + replacement)
    print("Success: Styles appended to style.css")
else:
    print("Failed to decode style.css")
