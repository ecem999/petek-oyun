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
    # Define the new multiplayer specific hex styles
    multiplayer_hex_styles = """
/* --- MULTIPLAYER HEXAGON STATES (REAL-TIME SYNC) --- */

/* 1. Seçilme Efekti (Active/Secili) */
.hex-point.active {
    transform: scale(1.15) !important;
    z-index: 100 !important;
    background: linear-gradient(135deg, #FFF176 0%, #FFEB3B 100%) !important; /* Parlak Sarı */
    filter: drop-shadow(0 0 15px rgba(255, 235, 59, 0.8)) !important;
    border: 3px solid #FBC02D !important;
    animation: pulseSelection 1.5s infinite alternate !important;
}

@keyframes pulseSelection {
    from { transform: scale(1.1); filter: drop-shadow(0 0 10px rgba(255, 235, 59, 0.6)); }
    to { transform: scale(1.2); filter: drop-shadow(0 0 20px rgba(255, 235, 59, 1)); }
}

/* 2. Oyuncu 1 (Host) Kazandı - Mor */
.hex-point.host_won {
    background: linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%) !important; /* Mor */
    color: #FFFFFF !important;
    filter: drop-shadow(0 0 15px rgba(123, 31, 162, 0.6)) !important;
    pointer-events: none !important;
    transform: scale(1) !important;
}

/* 3. Oyuncu 2 (Joiner) Kazandı - Lila/Sarı Karışımı */
.hex-point.joiner_won {
    background: linear-gradient(135deg, #E1BEE7 0%, #FFD54F 100%) !important; /* Lila ve Sarı Geçişli */
    color: #4A148C !important;
    filter: drop-shadow(0 0 15px rgba(225, 190, 231, 0.6)) !important;
    pointer-events: none !important;
    transform: scale(1) !important;
}

/* 4. Kimse Bilemedi (Pasif) - Mat Gri */
.hex-point.dead {
    background: linear-gradient(135deg, #BDBDBD 0%, #757575 100%) !important; /* Mat Gri */
    color: rgba(255, 255, 255, 0.5) !important;
    filter: grayscale(1) !important;
    pointer-events: none !important;
    opacity: 0.7 !important;
    transform: scale(0.95) !important;
}

.hex-point.host_won span, .hex-point.joiner_won span, .hex-point.dead span {
    text-shadow: none !important;
}
"""
    # Append to the end of the file
    content += "\n" + multiplayer_hex_styles
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: Multiplayer hex styles added to style.css")
else:
    print("Failed to decode style.css")
