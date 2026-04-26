import os

path = r'c:\Users\aaaec\OneDrive\Desktop\petek\style.css'
with open(path, 'rb') as f:
    data = f.read()

# Try common encodings
encodings = ['utf-8', 'latin-1', 'cp1252']
for enc in encodings:
    try:
        content = data.decode(enc)
        if '.icon-btn' in content or '.header' in content:
            print(f"Found in {enc}")
            # Find line numbers
            lines = content.splitlines()
            for i, line in enumerate(lines):
                if '.icon-btn' in line or '.header' in line:
                    print(f"{i+1}: {line}")
        else:
            print(f"Not found in {enc}")
        break
    except:
        continue
