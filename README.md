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

`avatar.jpg` is a 512x512 derivative of a master PNG that is kept locally and
deliberately not tracked here. 512px covers the largest on-page use, the 132px
landing hero, at 3x pixel density, and clears the minimum for social preview
images. To regenerate it after changing the master:

```bash
ffmpeg -i avatar.png -vf "crop='min(iw,ih)*0.78':'min(iw,ih)*0.78':'(iw-min(iw,ih)*0.78)/2+min(iw,ih)*0.03':'(ih-min(iw,ih)*0.78)/2-min(iw,ih)*0.02',scale=512:512:flags=lanczos" -map_metadata -1 -q:v 6 -pix_fmt yuvj444p avatar.jpg
```

The crop takes the largest centred square, then keeps the middle 78% of it,
nudged 3% right and 2% up to centre the dolphin. The master has generous empty
space around the subject, and without that second step the dolphin is unreadable
at the 30px header and 88px sidebar sizes.

`4:4:4` chroma matters here: the artwork is saturated magenta and blue, and the
default `4:2:0` subsampling visibly smears those edges at the same file size.

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
