const GUESSPOINT_ID = 'P';
const LIMITCIRCLE_ID = 'C';
const POINT_ICON_RADIUS = 4;

const WIN_DISTANCE = 30 // in km
var guess_map = new ol.Map({
        target: "guessmap",
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM()
          })
        ],
        view: new ol.View({
          center: ol.proj.fromLonLat([37.41, 8.82]),
          zoom: 0
        })
      });

guess_map.addControl(new ol.control.ScaleLine());



var vectorLayer = new ol.layer.Vector({
  source: new ol.source.Vector(), // needs to be an ol.source.Vector (see guess_map.on)
  name: "marker"
});

guess_map.addLayer(vectorLayer);


function getUserSubmittedCoords(vectorLayer){
  // assumes user has already submitted coords
  // in [x, y] projection units format
  return vectorLayer.getSource().getFeatureById(GUESSPOINT_ID).getGeometry().getCoordinates();
}

function hasUserSubmittedCoords(vectorLayer){
  return vectorLayer.getSource().getFeatureById(GUESSPOINT_ID) != null;
}


function measure(lat1, lon1, lat2, lon2){
    var R = 6378.137; // Radius of earth in KM
    var dLat = lat2 * Math.PI / 180 - lat1 * Math.PI / 180;
    var dLon = lon2 * Math.PI / 180 - lon1 * Math.PI / 180;
    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d; // kilometers
}

function distance(pt1, pt2, convertToLonLat = true){
  // calculates distance between two points in km,
  // takes into account curvature of the earth
  if (convertToLonLat){
    var pt1 = ol.proj.toLonLat(pt1);
    var pt2 = ol.proj.toLonLat(pt2);
    return measure(pt1[1], pt1[0], pt2[1], pt2[0]);
  }
  else {
    return measure(pt1[1], pt1[0], pt2[1], pt2[0]);
  }
}

function getRandomPointDistanceKAway(center, k){
  var angle = Math.random()*2*Math.PI;
  var xOff = Math.cos(angle)*k;
  var yOff = Math.sin(angle)*k;
  return ol.proj.fromLonLat(ol.proj.toLonLat([center[0] + xOff, center[1] + yOff]));
}

function getConstrainedCircle(guess, sol){
  // Returns circle
  // Proceeds by exponentially increasing search radius, stop when overshoot.
  // returns circle with diameter equal to last updated search radius,
  // centered at midpoint between guess and end of diameter on the
  // direction
  // ALL COMPUTATION IS DONE IN PROJECTION UNITS (PIXELS) SO NO TAKING INTO ACCOUNT CURVATURE OF EARTH

  var guess = ol.proj.fromLonLat(guess);
  var guessX = guess[0];
  var guessY = guess[1];

  var sol = ol.proj.fromLonLat(sol);
  var solX = sol[0];
  var solY = sol[1];

  var init_dist = 1;
  const multipler = 2;
  var circle = new ol.geom.Circle([guessX, guessY], init_dist);
  while (!circle.intersectsCoordinate([solX,solY])){
    init_dist = init_dist*multipler;
    circle.setRadius(init_dist);
  }

  return circle;

  var new_radius = init_dist/2;
  var midpoint = getRandomPointDistanceKAway([guessX, guessY], new_radius);
  var precise_circle = new ol.geom.Circle(midpoint, new_radius);
  while (!precise_circle.intersectsCoordinate([solX,solY])){
    midpoint = getRandomPointDistanceKAway([guessX, guessY], new_radius);
    precise_circle.setCenter(midpoint);
  }
  return precise_circle;
}

function drawCircleOnMap(circle, map){


  var circleFeature = new ol.Feature(circle);
  var source = vectorLayer.getSource();
  var oldcircle = source.getFeatureById(LIMITCIRCLE_ID);
  source.removeFeature(oldcircle);
  source.addFeature(circleFeature);
  circleFeature.setId(LIMITCIRCLE_ID);
}

function fitExtentBasedOnCircle(circle, map){
  // Fits map view so that it is constrained to
  // the circle area
  map.getView().fit(circle, {duration:2000, easing:ol.easing.easeOut});
}


function getNewCircleAndDrawOnMap(guess_coords, solution_coords){
  // in lon, lat units. gets converted to projectoin units in getConstrainedCircle
  // to fix bug where scrolling way far out on map misrepresents projection coords
  var circle = getConstrainedCircle(guess_coords, solution_coords);
  drawCircleOnMap(circle, guess_map);
  fitExtentBasedOnCircle(circle, guess_map);
}




var guessMapSubmitButton = document.createElement('button');
guessMapSubmitButton.innerHTML = 'Submit Guess';
document.getElementById("guessmap").appendChild(guessMapSubmitButton);



// Onclick events
guess_map.on('singleclick', function (e) {
          var coord = ol.proj.fromLonLat(ol.proj.toLonLat(e.coordinate));
          var point = new ol.Feature({
                    geometry: new ol.geom.Point(coord)
                  });
          var source = vectorLayer.getSource();
          var oldpoint = source.getFeatureById(GUESSPOINT_ID);
          source.removeFeature(oldpoint);
          source.addFeature(point);
          point.setId(GUESSPOINT_ID);
        });


guessMapSubmitButton.onclick = function(){
  var coords;

  // // for debugging
  // var homepoint = new ol.Feature({
  //           geometry: new ol.geom.Point(HOME_COORDS)
  //         });
  // vectorLayer.getSource().addFeature(homepoint);
  // //

  if (hasUserSubmittedCoords(vectorLayer)){
    coords = getUserSubmittedCoords(vectorLayer);
    var d = distance(HOME_COORDS, coords).toFixed(1);
    var lonlat = ol.proj.toLonLat(HOME_COORDS);
    var lon = lonlat[0].toFixed(1);
    var lat = lonlat[1].toFixed(1);

    if (ol.extent.containsXY(EXTENT, coords[0], coords[1])){
      alert('You win!');
    }
    else {
      getNewCircleAndDrawOnMap(ol.proj.toLonLat(coords), ol.proj.toLonLat(HOME_COORDS));
    }
    // alert("you were " + d + " kilometers away. Solution is in (Lat, Lon) = (" + lat + ", " + lon + "), "
    //     + randCountry);
  }
  else {
    coords = null;
    alert("You did not submit a guess! Click anywhere on the bottom map to guess a location.")
  }

  return false;
};
