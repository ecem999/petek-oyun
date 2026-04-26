import os

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

# Try common encodings
encodings = ['utf-8', 'latin-1', 'cp1252']
for enc in encodings:
    try:
        content = data.decode(enc)
        lines = content.splitlines()
        start = 1250
        end = 1420
        for i in range(start, min(end, len(lines))):
            print(f"{i+1}: {lines[i]}")
        break
    except:
        continue
