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
    # 1. Clean excessive empty lines
    lines = content.splitlines()
    cleaned_lines = []
    prev_empty = False
    for line in lines:
        if line.strip() == '':
            if not prev_empty:
                cleaned_lines.append('')
                prev_empty = True
        else:
            cleaned_lines.append(line)
            prev_empty = False
    content = '\n'.join(cleaned_lines)

    # 2. Update .scoreboard-row to have a margin-top
    # We'll use a high priority rule at the end to be safe
    new_style = """
/* --- SCOREBOARD POSITIONING FIX --- */
.scoreboard-row {
    margin-top: 60px !important; /* Geri butonu ile çakışmayı önlemek için aşağı çekildi */
    display: flex !important;
    justify-content: space-between !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 600px !important;
    margin-left: auto !important;
    margin-right: auto !important;
}

@media screen and (max-width: 600px) {
    .scoreboard-row {
        margin-top: 50px !important;
    }
}
"""
    # Remove existing definitions of .scoreboard-row to avoid conflicts
    content = re.sub(r'\.scoreboard-row\s*\{[^}]*\}', '', content, flags=re.DOTALL)
    
    # Append the new style
    content += "\n" + new_style

    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print("Success: style.css cleaned and scoreboard-row pushed down.")
else:
    print("Failed to decode style.css")
