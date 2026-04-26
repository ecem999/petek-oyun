import os

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
    lines = content.splitlines()
    new_lines = []
    prev_empty = False
    for line in lines:
        if line.strip() == '':
            if not prev_empty:
                new_lines.append('')
                prev_empty = True
        else:
            new_lines.append(line)
            prev_empty = False
    
    with open(path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))
    print(f"Cleaned. New line count: {len(new_lines)}")
else:
    print("Failed to decode style.css")
