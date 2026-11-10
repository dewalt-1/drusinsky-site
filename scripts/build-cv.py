"""Turn the LaTeX CV into public/cv.html, a page in the site's own style.

    python3 scripts/build-cv.py [path/to/cv-drusinsky.tex]

Only the body from the first \\section* on is used, so the street address and
phone number in the LaTeX header never reach the page. Handles the commands
the CV uses: \\section*, \\subsection*, tablist and itemize lists, \\enquote,
\\textit, \\href, \\textsuperscript, and the usual escapes.
"""

import datetime
import html
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else os.path.expanduser('~/Documents/Projects/CV/cv-drusinsky.tex')
OUT = os.path.join(ROOT, 'public', 'cv.html')


def inline(tex):
    """LaTeX inline markup to HTML."""
    s = tex.strip()
    s = re.sub(r'\s*\\\\\s*', '\0BR\0', s)          # line breaks first
    s = s.replace('\\&', '\0AMP\0').replace('\\_', '_').replace('\\ ', ' ')
    s = html.escape(s, quote=False).replace('\0AMP\0', '&amp;').replace('\0BR\0', '<br>')
    s = s.replace('---', '—').replace('--', '–').replace('~', '\u00a0')
    for _ in range(3):   # nested commands, innermost first
        s = re.sub(r'\\href\{([^{}]*)\}\{([^{}]*)\}', r'<a href="\1">\2</a>', s)
        s = re.sub(r'\\enquote\{([^{}]*)\}', r'“\1”', s)
        s = re.sub(r'\\textit\{([^{}]*)\}', r'<em>\1</em>', s)
        s = re.sub(r'\\textsuperscript\{([^{}]*)\}', r'<sup>\1</sup>', s)
    s = s.replace('\\tab{}', '').replace('{}', '')
    leftover = re.findall(r'\\[A-Za-z]+', s)
    if leftover:
        raise SystemExit(f'unhandled LaTeX in CV: {leftover} in: {tex[:80]}')
    return re.sub(r'\s+', ' ', s)


def convert(tex):
    body = tex[tex.index('\\section*'):tex.index('\\begin{center}')]
    body = re.sub(r'(?m)^\s*%.*$', '', body)
    out, mode, item = [], None, None

    def flush():
        nonlocal item
        if item is None:
            return
        label, text = item
        if mode == 'tablist':
            out.append(f'<li><span class="when">{inline(label)}</span><span class="what">{inline(text)}</span></li>')
        else:
            out.append(f'<li>{inline(text)}</li>')
        item = None

    for line in body.splitlines():
        t = line.strip()
        if not t:
            continue
        if m := re.match(r'\\section\*\{(.*)\}', t):
            out.append(f'<h2>{inline(m[1])}</h2>')
        elif m := re.match(r'\\subsection\*\{(.*)\}', t):
            out.append(f'<h3>{inline(m[1])}</h3>')
        elif t in ('\\begin{tablist}', '\\begin{itemize}'):
            mode = 'tablist' if 'tablist' in t else 'itemize'
            out.append(f'<ul class="{mode}">')
        elif t in ('\\end{tablist}', '\\end{itemize}'):
            flush()
            out.append('</ul>')
            mode = None
        elif m := re.match(r'\\item\[([^\]]*)\]\s*(.*)', t):
            flush()
            item = (m[1], m[2])
        elif m := re.match(r'\\item\s+(.*)', t):
            flush()
            item = ('', m[1])
        elif item is not None:
            item = (item[0], item[1] + ' ' + t)
        else:
            raise SystemExit(f'unexpected line in CV: {t}')
    return '\n'.join(out)


PAGE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>CV — Ben Drusinsky</title>
<meta name="description" content="Curriculum vitae of Ben Drusinsky, architect, computational designer and creative technologist.">
<style>
@font-face {{
  font-family: "Areal";
  src: local("ABC Areal Superfamily Variable"), local("ABCArealSuperfamilyVariable-Regular");
  font-weight: 400 700;
  font-display: swap;
}}
:root {{ --bg: #fff; --ink: #000; --dim: #8c8c8c; --faint: #cfcfcf; --sans: "Areal", Arial, Helvetica, sans-serif; }}
* {{ box-sizing: border-box; }}
html {{ background: var(--bg); }}
body {{ margin: 0; color: var(--ink); background: var(--bg); font: 400 12px/1.5 var(--sans); -webkit-font-smoothing: antialiased; }}
main {{ max-width: 680px; padding: 16px 16px 64px; }}
a {{ color: inherit; text-decoration: underline; text-decoration-color: var(--faint); text-underline-offset: 2px; }}
a:hover {{ text-decoration-color: var(--ink); }}
.back {{ display: inline-block; margin-bottom: 24px; color: var(--dim); text-decoration: none; font-size: 11px; }}
.back:hover {{ color: var(--ink); }}
h1 {{ margin: 0 0 2px; font-size: 13px; font-weight: 500; }}
.sub {{ margin: 0; font-size: 11.5px; }}
h2 {{ margin: 32px 0 8px; font-size: 9px; font-weight: 400; letter-spacing: .1em; text-transform: uppercase; color: var(--dim); }}
h3 {{ margin: 16px 0 6px; font-size: 11px; font-weight: 500; }}
ul {{ margin: 0; padding: 0; list-style: none; }}
li {{ margin: 0 0 6px; }}
.tablist li {{ display: grid; grid-template-columns: 64px 1fr; gap: 12px; }}
.when {{ color: var(--dim); font-variation-settings: "MONO" 100; font-feature-settings: "tnum"; }}
.updated {{ margin-top: 40px; font-size: 10.5px; color: var(--dim); }}
@media (max-width: 480px) {{ .tablist li {{ grid-template-columns: 52px 1fr; gap: 8px; }} }}
</style>
</head>
<body>
<main>
<a class="back" href="./">← Work</a>
<h1>Ben Drusinsky</h1>
<p class="sub">Architect, computational designer, creative technologist</p>
<p class="sub">benodru *at* gmail.com<br>Rotterdam, NL · Köln, DE</p>
{body}
<p class="updated">Updated {updated}</p>
</main>
</body>
</html>
"""


def main():
    tex = open(SRC, encoding='utf-8').read()
    body = convert(tex)
    for secret in ('Gevers', '648432257', '2586'):
        assert secret not in body, f'{secret} would be published'
    updated = datetime.date.fromtimestamp(os.path.getmtime(SRC)).strftime('%B %Y')
    with open(OUT, 'w', encoding='utf-8') as f:
        f.write(PAGE.format(body=body, updated=updated))
    print(f'wrote {OUT}')


main()
