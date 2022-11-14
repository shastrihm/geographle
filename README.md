# Wordle but with Satellite Imagery

Play - https://shastrihm.github.io/geographle

To host locally, run `python -m http.server 8080` from the root dir of this repo.
Then open `localhost:8080` in a browser tab (use incognito mode if developing to avoid caching stale code)

TODO:
- Use compass direction instead of bearing for feedback arrows?
- Fix bug where guessed coords don't align with user click location near the poles
    (probably have to have click events register on the globe scene and not the 2d map layer, 
    see https://sandcastle.cesium.com/?src=Picking.html)
- Refine coloring system for feedback
