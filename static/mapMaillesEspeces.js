///////////////////////////////////////////////////////////
function generateGeojsonMailleEspeces(observations) {
  myGeoJson = { type: "FeatureCollection", features: [] };
  observations.forEach(function(obs) {
    myGeoJson.features.push({
      type: "Feature",
      geometry: obs.geojson_maille,
      properties:
        {
          nb_espece: obs.nb_espece,
          area_code: obs.area_code,
          liste_espece_vern: obs.liste_espece_vern,
          liste_observateurs: obs.liste_observateurs
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

  // ajout de la légende
  generateLegendMailleEspeces();
}

// popup Maille
function onEachFeatureMailleEspeces(feature, layer) {
  popupContent =
    "<b>Nombre d'espèces(s): </b>" +
    feature.properties.nb_espece +
    "</br> <b> Code Maille: </b>" +
    feature.properties.area_code +
    "</br> <b> Espèces: </b>" +
    feature.properties.liste_espece_vern +
    "</br> <b> Sources: </b>" +
    feature.properties.liste_observateurs
    + " ";
  layer.bindPopup(popupContent);
}

function getColorEspeces(d) {
  return d > 30
    ? "#800026"
    : d > 20
    ? "#BD0026"
    : d > 10
    ? "#E31A1C"
    : d > 5
    ? "#FC4E2A"
    : d > 3
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
    weight: 1,
    color: "black",
    fillOpacity: 0.8
  };
}

///////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////

var map = generateMap("mapnorm");
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


  function generateLegendMailleEspeces() {
    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 5, 10, 20, 30],
        bins_labels = ["1", "2", "3", "4-5", "6-10", "11-20", "21-30", "30+"],
        labels = ["<strong> Nombre <br> d'espèces </strong> <br>"];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' + bins_labels[i] + "<br>"
        );
      }
      div.innerHTML = labels.join("<br>");
  
      return div;
    };
  
    legend.addTo(map);
  }