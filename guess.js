const GUESSPOINT_ID = 'P';
const LIMITCIRCLE_ID = 'C';
const USER_ICON_SCALE = 0.07;
const ARROW_ICON_SCALE = 0.12;

const WIN_DISTANCE = 30; // in km
var NUM_GUESSES = 5;

// 2D map
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


// 3D Globe
var guess_globe = new olcs.OLCesium({
  map: guess_map,
});
guess_globe.setEnabled(true);

var scene = guess_globe.getCesiumScene();


function getUserSubmittedCoords(vectorLayer){
  // assumes user has already submitted coords
  // in [x, y] projection units format
  return vectorLayer.getSource().getFeatureById(GUESSPOINT_ID).getGeometry().getCoordinates();
}

function hasUserSubmittedCoords(vectorLayer){
  return vectorLayer.getSource().getFeatureById(GUESSPOINT_ID) != null;
}


function distance(pt1, pt2, convertToLonLat = true){
  // calculates distance between two points in km,
  // takes into account curvature of the earth

  if (convertToLonLat){
    var pt1 = ol.proj.toLonLat(pt1);
    var pt2 = ol.proj.toLonLat(pt2);
  }

  var lon1 = pt1[0];
  var lat1 = pt1[1];
  var tpt1 = turf.point([lon1, lat1]);

  var lon2 = pt2[0];
  var lat2 = pt2[1];
  var tpt2 = turf.point([lon2, lat2]);

  return turf.distance(tpt1, tpt2, { units: "kilometers"})
}

function placeFeedbackArrowOnMap(guess_coords, solution_coords){
  // input in lon, lat units. gets converted to projectoin units in getConstrainedCircle
  // 1. Computes distance d of shortest path between guess and soln
  // 2. pick color from colormap based on d
  // 3. compute rotation of arrow icon in one of the 8 cardinal directions
  // 4. place colored arrow icon on map
  // later - extra feedback panel in addition to arrow, like worldle
  var d = distance(guess_coords, solution_coords, convertToLonLat=false);
  
  // compute color
  var red = "#ff0000";
  var orange = "#ff7700";
  var yellow = "#ffc400";
  var green = "#00d10a";
    // in km
  var greenLimit = 1000;
  var yellowLimit = 5000;
  var orangeLimit = 10000;
  var redLimit = 20000;

  var color;
  if (d < greenLimit) {
    color = Cesium.Color.GREEN;
  }
  else if (d < yellowLimit) {
    color = Cesium.Color.YELLOW;
  }
  else if (d < orangeLimit) {
    color = Cesium.Color.ORANGE;
  }
  else {
    color = Cesium.Color.RED;
  }

  // compute direction
  var bearing = turf.bearing(turf.point(guess_coords), turf.point(solution_coords));
  var bearingRounded = Math.round(bearing / 45.0) * 45;
  var bearingInRadians = -1*bearingRounded*(Math.PI / 180);

  var arrow = new ol.Feature({
    geometry: new ol.geom.Point(ol.proj.fromLonLat(guess_coords))
  });

  var billboards = scene.primitives.add(new Cesium.BillboardCollection());
  billboards.add({
    position : new Cesium.Cartesian3.fromDegrees(guess_coords[0], guess_coords[1], 0),
    image : 'assets/arrow.svg',
    scale : ARROW_ICON_SCALE,
    rotation : bearingInRadians,
    color : color,
  });
  // var icon = new ol.style.Icon({
  //       scale: ARROW_ICON_SCALE,
  //       src: "assets/arrow.svg",
  //       color: color,
  //       rotation: bearingInRadians,
  //   });
  // var arrowStyle = new ol.style.Style({
  //   image: icon,
  // });
  console.log(bearing);
  console.log(d);
  console.log(color);

  // arrow.setStyle(arrowStyle);
  // var source = vectorLayer.getSource();
  // source.addFeature(arrow);
  // //point.setId(GUESSPOINT_ID);
}


var guessMapSubmitButton = document.createElement('button');
guessMapSubmitButton.innerHTML = 'Submit Guess';
document.getElementById("submitbutton").appendChild(guessMapSubmitButton);

var guessesRemainingDisplay = document.createElement('p');
guessesRemainingDisplay.innerHTML = NUM_GUESSES.toString() + " guesses left";
document.getElementById("numguesses").appendChild(guessesRemainingDisplay);

// Onclick events
guess_map.on('click', function (e) {
          var coord = ol.proj.fromLonLat(ol.proj.toLonLat(e.coordinate));
          var point = new ol.Feature({
              geometry: new ol.geom.Point(coord)
            });
          
          // Points can only be styled with `image` or `text` attrs
          var pointStyle = new ol.style.Style({
            image: new ol.style.Icon({
                scale: USER_ICON_SCALE,
                src: "assets/flag_green.svg"
            }),
          });

          point.setStyle(pointStyle);

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
    
    var lonlat = ol.proj.toLonLat(HOME_COORDS);
    var lon = lonlat[0].toFixed(1);
    var lat = lonlat[1].toFixed(1);
    NUM_GUESSES--;

    if (ol.extent.containsXY(EXTENT, coords[0], coords[1])){
      alert('You win!');
      guessMapSubmitButton.disabled = true;
    }
    else if (NUM_GUESSES <= 0){
      var d = distance(HOME_COORDS, coords).toFixed(1);
      alert("you were " + d + " kilometers away. Solution is in (Lat, Lon) = (" + lat + ", " + lon + "), "
          + randCountry);
      guessMapSubmitButton.disabled = true;
    }
    else {
      placeFeedbackArrowOnMap(ol.proj.toLonLat(coords), ol.proj.toLonLat(HOME_COORDS));
    }

    guessesRemainingDisplay.innerHTML = NUM_GUESSES.toString() + " guesses left";
  }
  else {
    coords = null;
    alert("You did not submit a guess! Click anywhere on the bottom map to guess a location.")
  }

  return false;
};
