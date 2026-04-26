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
    # Remove previous multiplayer hex styles to avoid duplication
    content = re.sub(r'\/\* --- MULTIPLAYER HEXAGON STATES .*? \*\/\n?', '', content, flags=re.DOTALL)
    
    # Define the ABSOLUTE FINAL requested multiplayer specific hex styles (BLUE vs RED - NO BORDERS)
    multiplayer_hex_styles = """
/* --- MULTIPLAYER HEXAGON STATES (BLUE vs RED - BORDERLESS) --- */

/* 1. Seçilme Efekti (Active) - Parlak Sarı Neon */
.hex-point.active {
    transform: scale(1.15) !important;
    z-index: 100 !important;
    background: linear-gradient(135deg, #FFFF00 0%, #FFD600 100%) !important;
    filter: drop-shadow(0 0 20px rgba(255, 214, 0, 0.8)) !important;
    border: none !important; /* ÇERÇEVE YASAĞI */
    outline: none !important;
    animation: hexPulseSelection 1.2s infinite alternate !important;
}

@keyframes hexPulseSelection {
    from { transform: scale(1.1); }
    to { transform: scale(1.18); }
}

/* 2. Oyuncu 1 (Host) - MAVİ */
.hex-point.host_won {
    background: linear-gradient(135deg, #00E5FF 0%, #00B0FF 100%) !important;
    color: #FFFFFF !important;
    filter: drop-shadow(0 0 18px rgba(0, 229, 255, 0.7)) !important;
    pointer-events: none !important;
    transform: scale(1) !important;
    border: none !important; /* ÇERÇEVE YASAĞI */
    outline: none !important;
}

/* 3. Oyuncu 2 (Joiner) - KIRMIZI */
.hex-point.joiner_won {
    background: linear-gradient(135deg, #FF1744 0%, #D50000 100%) !important;
    color: #FFFFFF !important;
    filter: drop-shadow(0 0 18px rgba(255, 23, 68, 0.7)) !important;
    pointer-events: none !important;
    transform: scale(1) !important;
    border: none !important; /* ÇERÇEVE YASAĞI */
    outline: none !important;
}

/* 4. Yanlış Cevap / Bilememe (Pasif) - GRİ */
.hex-point.dead {
    background: linear-gradient(135deg, #9E9E9E 0%, #616161 100%) !important;
    color: rgba(255, 255, 255, 0.5) !important;
    filter: grayscale(1) opacity(0.6) !important;
    pointer-events: none !important;
    transform: scale(0.95) !important;
    border: none !important; /* ÇERÇEVE YASAĞI */
    outline: none !important;
}

.hex-point.host_won span, .hex-point.joiner_won span, .hex-point.dead span {
    text-shadow: none !important;
}
"""
    # Append the updated styles
    content += "\n" + multiplayer_hex_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Multiplayer hex colors updated to Blue vs Red (Borderless) in style.css")
else:
    print("Failed to decode style.css")
