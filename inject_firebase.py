import os

html_files = [
    'iki-kisilik-kur.html',
    'iki-kisilik-katil.html',
    'oyun-2.html',
    'tek-kisilik.html',
    'oyun.html'
]

firebase_scripts = """
    <!-- Firebase SDKs -->
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js"></script>
    <script src="https://www.gstatic.com/firebasejs/8.10.1/firebase-database.js"></script>
    <script src="firebase-config.js"></script>
"""

for file_name in html_files:
    if os.path.exists(file_name):
        with open(file_name, 'rb') as f:
            data = f.read()
        
        # Detect encoding
        encodings = ['utf-8', 'latin-1', 'cp1252']
        content = None
        for enc in encodings:
            try:
                content = data.decode(enc)
                break
            except:
                continue
        
        if content:
            if 'firebase-app.js' not in content:
                # Insert before the last script or before </body>
                if '<script' in content:
                    # Find the first script tag and insert before it (to ensure config is available to others)
                    # OR insert before the specific JS file of the page
                    parts = content.split('</body>')
                    new_content = parts[0] + firebase_scripts + '</body>' + parts[1]
                    
                    with open(file_name, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {file_name}")
            else:
                print(f"{file_name} already has Firebase")
