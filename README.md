# Daily Satellite Image guessing game
To host locally, run `python3 -m http.server 8080` from the directory of this repo

TODO:
Easy mode (low zoom)
Medium mode (mid zoom (for mass release?))
Hard mode (high zoom)

weight countries by area?
  - so bigger countries can actually get picked
  - areas densely packed with countries will balance out the lower  probability
  - islands not overrepresented

fix circle feedback strategy so that successive feedback is consistent
  - i.e. each successive circle is completely contained by the
          previous one
