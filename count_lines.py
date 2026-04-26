import os

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

encodings = ['utf-8', 'latin-1', 'cp1252']
for enc in encodings:
    try:
        content = data.decode(enc)
        lines = content.splitlines()
        print(f"Total lines: {len(lines)}")
        break
    except:
        continue
