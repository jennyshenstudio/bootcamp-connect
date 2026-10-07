"""Build the claude.ai artifact copy of the prototype.

Writes build/artifact/index.html (the page without <!doctype>/<html>/<head>/<body>, which
claude.ai adds when publishing) plus css/ and js/, and build/artifact/files.json mapping each
published path to its file. Publish index.html with those files to the same artifact URL.
"""
import json, os, re, shutil

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'build', 'artifact')

shutil.rmtree(OUT, ignore_errors=True)
os.makedirs(OUT)
s = open(os.path.join(ROOT, 'prototype.html')).read()
head = re.search(r'<head>(.*?)</head>', s, re.S).group(1)
body_tag = re.search(r'<body([^>]*)>', s)
body_class = re.search(r'class="([^"]*)"', body_tag.group(1)).group(1)
body = s[body_tag.end():s.rindex('</body>')]
head = re.sub(r'\s*<meta[^>]*>', '', head)
with open(os.path.join(OUT, 'index.html'), 'w') as f:
    f.write(head.strip() + '\n<script>document.documentElement.classList.add("h-full");document.body.className="'
            + body_class + '";</script>\n' + body.strip() + '\n')
files = {}
for d in ('css', 'js'):
    shutil.copytree(os.path.join(ROOT, d), os.path.join(OUT, d))
    for name in sorted(os.listdir(os.path.join(OUT, d))):
        files[d + '/' + name] = os.path.join(OUT, d, name)
with open(os.path.join(OUT, 'files.json'), 'w') as f:
    json.dump(files, f, indent=1)
print('Built', OUT, 'with', len(files), 'files')
