const POINT_ICON_RADIUS = 4; // radius of dot that is drawn when user clicks on guess map


function getUserSubmittedCoords(vectorLayer){
  // assumes user has already submitted coords
  // in [x, y] (mercator) format
  var point = vectorLayer.getSource().getFeatures()[0].A.geometry.getCoordinates();
  return point;
}

function hasUserSubmittedCoords(vectorLayer){
  return vectorLayer.getSource() != null;
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

function distance(pt1, pt2){
  // calculates distance between two points in meters
  var pt1 = ol.proj.toLonLat(pt1);
  var pt2 = ol.proj.toLonLat(pt2);
  return measure(pt1[1], pt1[0], pt2[1], pt2[0])
  //return (((pt2[0] - pt1[0])**2) - ((pt2[1] - pt1[1])**2))**0.5
}


var guess_map = new ol.Map({
        target: 'guessmap',
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


var vectorLayer = new ol.layer.Vector({
  source: null, // needs to be an ol.source.Vector (see guess_map.on)
  name: "marker",
  style: new ol.style.Style({
    image: new ol.style.Circle({
      radius: POINT_ICON_RADIUS,
      fill: new ol.style.Fill({color: 'red'})
    })
  })
});

guess_map.addLayer(vectorLayer);


var guessMapSubmitButton = document.createElement('button');
guessMapSubmitButton.innerHTML = 'Submit Guess';
document.getElementById("guessmap").appendChild(guessMapSubmitButton);



// Onclick events
guess_map.on('singleclick', function (e) {
          var point = new ol.Feature({
                    geometry: new ol.geom.Point(e.coordinate)
                  });
          var newSource = new ol.source.Vector({features: [point]});
          vectorLayer.setSource(newSource);
        });


guessMapSubmitButton.onclick = function(){
  var coords;
  if (hasUserSubmittedCoords(vectorLayer)){
    coords = getUserSubmittedCoords(vectorLayer);
    var d = distance(HOME_COORDS, coords).toFixed(1);
    var lonlat = ol.proj.toLonLat(HOME_COORDS);
    var lon = lonlat[0].toFixed(1);
    var lat = lonlat[1].toFixed(1);
    alert("you were " + d + " kilometers away. Solution is in (Lat, Lon) = (" + lat + ", " + lon + "), "
        + randCountry);
  }
  else {
    coords = null;
    alert("You did not submit a guess! Click anywhere on the bottom map to guess a location.")
  }

  return false;
};
