// Ideas
// Init on random point on map. At fixed zoom level
// User can drag map around to see, but only within a fixed box.
// cannot zoom out further than the bounding box


// precompute bboxes for each country so we dont have
// to do it after each page reload

// RUN SERVER BY DOING `python3 -m http.server 8080` in project directory
// otherwise you will get cross origin taint canavs issue
// port 8080 to stop caching


// canvas only for bitmap
var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');
canvas.width = BMAP_WIDTH;
canvas.height = BMAP_HEIGHT;

const EXTENT_OFFSET = 50000; // FOV: # of units (in mercator) in each cardinal direction from center
                            // to allow viewing/dragging the map (bounding box of viewable area)
const ZOOM_LEVEL = 10; // Level to start zoom at. Number denotes the
                      // zoom level resulting from clicking the zoom in button that many times

const MAX_ZOOM = 17;
const MIN_ZOOM = ZOOM_LEVEL;

var HOME_COORDS = null; // solution to puzzle -- in mercator

//takes an url and returns a promise of a (loaded) Image.
function getImage(url){
    return new Promise(function(resolve, reject){
        var image = new Image();
        image.onload = function(){
          context.drawImage(image, 0, 0);
          resolve("Loaded image");
          };
        image.src = url;
    });
};


function getPixelArray(img_url){
  // Returns Promise for IMG_HEIGHT x IMG_WIDTH array
  // where elts in array are either 255 (water) or 0 (land)
  return getImage(img_url).then(function(){
    var imgd = context.getImageData(0, 0, canvas.width, canvas.height);
    pix = imgd.data;
    // Since each pixel is represented by 4 elements (RGBA),
    // and is a 1D array, turn into 2D array s.t. each pixel
    // is either 1 (land) or 0 (water)
    var new_pix = [];
    var row = [];
    for (let i = 0; i < pix.length; i += 4){
      row.push(pix[i]);
      if (row.length == BMAP_WIDTH){
        new_pix.push(row);
        row = [];
      }
    }
    return new_pix;
  });
};



function bitmapPixToLatLon(pixelX, pixelY, width, height) {
  // converts from pixel coordinates in land/ocean bitmap to lat, long
  // width, height are width height or bitmap.png (1800x3600)
  return {
    latitude: parseFloat((((pixelY / (height / 180)) - 90) / -1).toFixed(2)),
    longitude: parseFloat(((pixelX / (width / 360)) - 180).toFixed(2)),
  };
};


function getValidStartingLatLon(bbox) {
  // Returns valid latitude/longtidude values for starting pos
  // so that its not in the ocean, and that is is within the given bbox
  // bbox is an object with attributes xmax, xmin, ymax, ymin
  return getPixelArray("bitmap.png").then(function(new_pix){
    var col = Math.round(getRandomInRange(bbox.xmin, bbox.xmax));
    var row = Math.round(getRandomInRange(bbox.ymin, bbox.ymax));
    var lim = 50;
    while (new_pix[row][col] != 0 && lim >0){
      col = Math.round(getRandomInRange(bbox.xmin, bbox.xmax));
      row = Math.round(getRandomInRange(bbox.ymin, bbox.ymax));
      lim--;
      };
    // col is the x-cord (longitude), row is y-cord (latitude)
    return bitmapPixToLatLon(col, row, BMAP_WIDTH, BMAP_HEIGHT);
    });
};

function getRandomInRange(from, to) {
    return (Math.random() * (to - from) + from);
};




function main(){
  // main loop
  var map = new ol.Map({
    target: 'map',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.XYZ({
          url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          maxZoom: 19
        })
      })
    ]
  });
  if (randCountry == "usa"){
    randCountry = US_STATES[Math.floor(Math.random() * US_STATES.length)];
    randCountry = "usa_states/" + randCountry;
  }
  fetch('countries/' + randCountry + '.json')
    .then(response => response.json())
    .then(function(json){
      var countryBounds = json.features[0].geometry.coordinates[0];
      COUNTRY_BBOX = boundingBox(countryBounds);
      return getValidStartingLatLon(COUNTRY_BBOX);
    })
    .then(function(coords){
        var long = coords.longitude;
        var lat = coords.latitude;
        var home = ol.proj.fromLonLat([long, lat]);
        HOME_COORDS = home;
        console.log(home);
        view = new ol.View({
          center:  home,
          zoom: ZOOM_LEVEL,
          minZoom: MIN_ZOOM,
          maxZoom: MAX_ZOOM,
          extent: [home[0]- EXTENT_OFFSET,
                  home[1] - EXTENT_OFFSET,
                  home[0] + EXTENT_OFFSET,
                  home[1] + EXTENT_OFFSET],
        });
        map.addControl(new ol.control.ZoomSlider());
        map.addControl(new ol.control.ScaleLine());
        map.setView(view);
      });
};
main();
