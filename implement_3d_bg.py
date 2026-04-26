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
    # 1. Update the hexagon-grid-bg to be more 3D and have an energy sphere
    replacement = """/* ============================================================== */
/* FÜTÜRİSTİK 3D PETEK KOVANI (ADVANCED 3D ENERGY HIVE)            */
/* ============================================================== */
.hexagon-grid-bg {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    pointer-events: none;
    opacity: 0.25;
    
    /* Derinlik için isometric bakış açısı (Opsiyonel: Isometric hissi veren pattern kullanacağız) */
    background: linear-gradient(135deg, #E040FB 0%, #FF4081 50%, #00E5FF 100%);
    
    /* 3D Görünümlü İç İçe Geçmiş Lazer Petekler (Nested Laser Hexagons) */
    -webkit-mask-image: url("data:image/svg+xml,%3Csvg width='112' height='100' viewBox='0 0 112 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100M56 16L84 0L112 16L112 50L84 66L56 50' fill='none' stroke='black' stroke-width='2.5'/%3E%3Cpath d='M28 55L10 45L10 21L28 11L46 21L46 45Z' fill='none' stroke='black' stroke-width='1'/%3E%3Cpath d='M84 55L66 45L66 21L84 11L102 21L102 45Z' fill='none' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
    mask-image: url("data:image/svg+xml,%3Csvg width='112' height='100' viewBox='0 0 112 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100M56 16L84 0L112 16L112 50L84 66L56 50' fill='none' stroke='black' stroke-width='2.5'/%3E%3Cpath d='M28 55L10 45L10 21L28 11L46 21L46 45Z' fill='none' stroke='black' stroke-width='1'/%3E%3Cpath d='M84 55L66 45L66 21L84 11L102 21L102 45Z' fill='none' stroke='black' stroke-width='1'/%3E%3C/svg%3E");
    mask-size: 80px auto;
    
    /* Neon Parlama ve Derinlik Gölgeleri */
    filter: drop-shadow(0 0 5px rgba(224, 64, 251, 0.6)) drop-shadow(0 0 10px rgba(0, 229, 255, 0.4));
}

/* Sayfa ortasındaki yumuşak lazer enerji küresi (Focal Energy Sphere) */
.hexagon-grid-bg::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 80vw;
    height: 80vh;
    background: radial-gradient(circle, rgba(224, 64, 251, 0.3) 0%, rgba(255, 64, 129, 0.1) 40%, transparent 70%);
    transform: translate(-50%, -50%);
    filter: blur(60px);
    pointer-events: none;
    z-index: -1;
}"""
    
    # Replace the existing hexagon-grid-bg block
    new_content = re.sub(r'/\* =+ \*/\s*/\* ZARİF ALTIGEN.*?\}', replacement, content, flags=re.DOTALL)
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Success: 3D Energy Hive implemented")
else:
    print("Failed to decode style.css")
