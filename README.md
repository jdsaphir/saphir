# saphir.one

Source for [www.saphir.one](https://www.saphir.one/), my personal résumé site.

A landing page asks the visitor what they are hiring for and branches into a
résumé written for that role. Every version covers the same history and differs
only in what it leads with.

| Page | URL |
| --- | --- |
| Landing page | `/` |
| Full résumé | `/general` |
| Developer | `/developer` |
| Community manager | `/community` |
| Localizer | `/localizer` |

Plain HTML, CSS and JavaScript. No framework, no build step, no dependencies
beyond two Google Fonts.

## What gets deployed

Everything tracked here **except** `README.md` and `.claude/`:

```
.htaccess
index.html  general.html  developer.html  community.html  localizer.html
avatar.jpg
assets/style.css  assets/site.js  assets/favicon.svg
```

`.htaccess` is what makes the extensionless URLs work, and it redirects both
plain HTTP and the bare `saphir.one` host to `https://www.saphir.one`. Upload it
first; if the site returns 500 afterwards, the host forbids the `Options`
directive and that one line can be removed.

## Local preview

`.claude/serve.py` is a small static server that reproduces the `.htaccess`
clean-URL rules, so `/developer` resolves locally the same way it does in
production. Python 3 only, no packages required.

```bash
python .claude/serve.py 8765
```

Then open http://127.0.0.1:8765/. Opening the `.html` files directly with
`file://` also works, but every internal link will 404 because they are written
without the `.html` extension.

## Theming

The palette is driven by CSS custom properties in `assets/style.css`, built on
sapphire `#0f52ba` and lilac `#ddb3e0`. Light and dark are defined as two token
sets. The page follows the operating system by default; the toggle in the header
overrides it and stores the choice, and clearing that choice returns it to
following the system. Printing always forces the light palette and expands every
collapsed detail section.
