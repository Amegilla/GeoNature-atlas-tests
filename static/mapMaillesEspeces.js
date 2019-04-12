///////////////////////////////////////////////////////////
function generateGeojsonMailleEspeces(observations) {
  myGeoJson = { type: "FeatureCollection", features: [] };
  observations.forEach(function(obs) {
    myGeoJson.features.push({
      type: "Feature",
      geometry: obs.geojson_maille,
      properties:
        {
          nb_espece: obs.nb_espece
        }
    })
  });

  return myGeoJson;

}

function displayMailleLayerEspeces(observations) {
  myGeoJson = generateGeojsonMailleEspeces(observations);

  currentLayer = L.geoJson(myGeoJson, {
    onEachFeature: onEachFeatureMailleEspeces,
    style: styleMailleEspeces
  });
  currentLayer.addTo(map);
}

// popup Maille
function onEachFeatureMailleEspeces(feature, layer) {
  popupContent =
    "<b>Nombre d'espèces(s): </b>" +
    feature.properties.nb_espece;
  layer.bindPopup(popupContent);
}

function getColorEspeces(d) {
  return d > 100
    ? "#800026"
    : d > 50
    ? "#BD0026"
    : d > 20
    ? "#E31A1C"
    : d > 10
    ? "#FC4E2A"
    : d > 5
    ? "#FD8D3C"
    : d > 2
    ? "#FEB24C"
    : d > 1
    ? "#FED976"
    : "#FFEDA0";
}

function styleMailleEspeces(feature) {
  return {
    fillColor: getColorEspeces(feature.properties.nb_espece),
    weight: 2,
    color: "black",
    fillOpacity: 0.8
  };
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var map = generateMap();
//generateSliderOnMap();
var legend = L.control({position: 'bottomright'});


// Current observation Layer: leaflet layer type
var currentLayer; 

// Current observation geoJson:  type object
var myGeoJson;

$.ajax({
  url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobal', 
  dataType: "json",
  beforeSend: function(){
    $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
  }
  }).done(function(observations) {
    $('#loadingGif').hide();

    displayMailleLayerEspeces(observations);
  });


  