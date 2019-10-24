function generateMapMorta() {
  // Map initialization
  firstMapTile = L.tileLayer(configuration.MAP.FIRST_MAP.url, {
    attribution: configuration.MAP.FIRST_MAP.attribution,
    minZoom: configuration.MAP.FIRST_MAP.minzoom
  });
  orthoMap = L.tileLayer(configuration.MAP.SECOND_MAP.url, {
    attribution: configuration.MAP.SECOND_MAP.attribution,
    minZoom: configuration.MAP.SECOND_MAP.minzoom
  });

  baseMap = {};
  baseMap[configuration.MAP.FIRST_MAP.tileName] = firstMapTile;

  var mapmorta = L.map("mapmorta", {
    crs: L.CRS.EPSG3857,
    center: configuration.MAP.LAT_LONG,
    geosearch: true,
    zoom: configuration.MAP.ZOOM,
    layers: [firstMapTile],
    fullscreenControl: true
  });

  // Style of territory on map
  territoryStyle = {
    fill: false,
    color: configuration.MAP.BORDERS_COLOR,
    weight: configuration.MAP.BORDERS_WEIGHT
  };

  // Add limits of the territory to the map
  $(document).ready(function() {
    $.getJSON(url_limit_territory, function(json) {
        var territoryLayer = L.geoJson(json, {
            style: territoryStyle
        });
        territoryLayer.addTo(mapmorta);
        mapmorta.setMaxBounds(territoryLayer.getBounds());
    });
});

  // 'Google-like' baseLayer controler

  var LayerControl = L.Control.extend({
    options: {
      position: "bottomleft"
    },

    onAdd: function(mapmorta) {
      currentTileMap = "topo";
      var container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );

      container.style.backgroundColor = "white";
      container.style.backgroundImage =
        "url(" +
        configuration.URL_APPLICATION +
        "/static/images/logo_earth_map.PNG)";
      container.style.width = "50px";
      container.style.height = "50px";
      container.style.border = "solid white 1px";
      container.style.cursor = "pointer";
      $(container).attr("data-placement", "right");
      $(container).attr("data-toggle", "tooltip");
      $(container).attr("data-original-title", "Photos aérienne");

      container.onclick = function() {
        if (currentTileMap == "topo") {
          container.style.backgroundImage =
            "url(" +
            configuration.URL_APPLICATION +
            "/static/images/logo_topo_map.PNG)";
          $(container).attr("data-original-title", "Plan");
          mapmorta.removeLayer(firstMapTile);
          orthoMap.addTo(mapmorta);
          currentTileMap = "earth";
        } else {
          container.style.backgroundImage =
            "url(" +
            configuration.URL_APPLICATION +
            "/static/images/logo_earth_map.PNG)";
          $(container).attr("data-original-title", "Photos aérienne");
          mapmorta.removeLayer(orthoMap);
          firstMapTile.addTo(mapmorta);
          currentTileMap = "topo";
        }
      };
      return container;
    }
  });

  mapmorta.addControl(new LayerControl());

  // add tooltip on fullScreen button

  fullScreenButton = $(".leaflet-control-fullscreen");
  fullScreenButton.attr("data-placement", "right");
  fullScreenButton.attr("data-toggle", "tooltip");
  fullScreenButton.attr("data-original-title", "Plein écran");
  $(".leaflet-control-fullscreen-button").removeAttr("title");

  return mapmorta;
}

//****** Fonction fiche espècce ***********

// Popup Point
function onEachFeaturePoint(feature, layer) {
  popupContent =
    "<b>Date: </b>" +
    feature.properties.dateobsPopup +
    "</br><b>Altitude: </b>" +
    feature.properties.altitude_retenue +
    "</br><b>Observateurs: </b>" +
    feature.properties.observateurs;

  // verifie si le champs effectif est rempli
  if (feature.properties.effectif_total != undefined) {
    layer.bindPopup(
      popupContent +
        "</br><b>Effectif: </b>" +
        feature.properties.effectif_total
    );
  } else {
    layer.bindPopup(popupContent);
  }
}

// popup Maille
function onEachFeatureMaille(feature, layer) {
  popupContent =
    "<b>Nombre d'observation(s): </b>" +
    feature.properties.nb_observations +
    "</br><b>Observateur(s): </b>" +
    feature.properties.list_observateurs.filter(onlyUnique) +
    "</br> <b> Dernière observation: </b>" +
    feature.properties.last_observation +
    " ";
  layer.bindPopup(popupContent);
}

// Style maille
function getColor(d) {
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
    : d > 0
    ? "#FFEDA0"
    : "#eaeaea";
}

function styleMaillemorta(feature) {
  return {
    fillColor: getColormorta(feature.properties.eff_tot),
    weight: 2,
    color: "black",
    fillOpacity: 0.8
  };
}

function generateLegendMaille_fich_spmorta() {
  legend.onAdd = function(map) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 5, 10, 20, 50, 100],
      bins_labels = ["1", "2", "3-5", "5-10", "10-20", "20-50", "50-100", "100+"],
      labels = ["<strong> Nombre <br> d'observations </strong> <br>"];

    // loop through our density intervals and generate a label with a colored square for each interval

    labels.push('<i style="background:#eaeaea"></i>Absence<br>');

    for (var i = 0; i < grades.length; i++) {
      labels.push(
        '<i style="background:' +
          getColormorta(grades[i] + 1) +
          '"></i> ' +
          bins_labels[i] + "<br>"

      );
    }
    div.innerHTML = labels.join("<br>");

    return div;
  };

  legend.addTo(mapmorta);
}

function generateLegendMaillemorta() {
  legend.onAdd = function(mapmorta) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 5, 10, 20, 50, 100],
      labels = ["<strong> Nombre <br> d'observations </strong> <br>"];

    // loop through our density intervals and generate a label with a colored square for each interval
    for (var i = 0; i < grades.length; i++) {
      labels.push(
        '<i style="background:' +
          getColormorta(grades[i] + 1) +
          '"></i> ' +
          grades[i] +
          (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+")
      );
    }
    div.innerHTML = labels.join("<br>");

    return div;
  };

  legend.addTo(mapmorta);
}

// pour ne garder que les valeurs uniques d'une liste
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

// Geojson Maille
function generateGeojsonMaillemorta(observations, yearMin, yearMax) {
  var i = 0;
  myGeoJson = { type: "FeatureCollection", features: [] };
  tabProperties = [];
  while (i < observations.length) {
        if (observations[i].annee >= yearMin && observations[i].annee <= yearMax) {
                geometry = observations[i].geojson_maille;
                idMaille = observations[i].id_maille;
                observers = observations[i].observateurs;
                effectif_total = observations[i].effectif_total;
                properties = {
                                id_maille: idMaille,
                                nb_observations: 1,
                                eff_tot: effectif_total,
                                list_observateurs : [observers],
                                last_observation: observations[i].annee,
                                tabDateobs: [new Date(observations[i].dateobs)]
                              };

                var j = i + 1;
                while (j < observations.length && observations[j].id_maille <= idMaille) {
                        if (observations[j].annee >= yearMin && observations[j].annee <= yearMax) {
                            properties.eff_tot += observations[j].effectif_total;
                            properties.nb_observations += observations[j].nb_observations;
                            properties.tabDateobs.push(new Date(observations[i].dateobs));
                            properties.list_observateurs.push(observations[j].observateurs);
                          }

                        if (observations[j].annee >= properties.last_observation) {
                            properties.last_observation = observations[j].annee;
                          }
                        j = j + 1;
                }
                // ici il faut transformer la liste des observateurs d'un tableau vers un string en supprimant les doublons
                //properties.list_observateurs = properties.list_observateurs.filter(onlyUnique).join(', ')
                myGeoJson.features.push({
                                        type: "Feature",
                                        properties: properties,
                                        geometry: geometry
                                      });
                // on avance jusqu' à j
                i = j;
        } else {
          i = i + 1;
          }
        }
  return myGeoJson;
}

// Display Maille layer

function displayMailleLayerFicheEspece(observationsMaille, yearMin, yearMax) {
  myGeoJson = generateGeojsonMaillemorta(observationsMaille, yearMin, yearMax);
  currentLayer = L.geoJson(myGeoJson, {
    onEachFeature: onEachFeatureMaille,
    style: styleMaille
  });
  currentLayer.addTo(mapmorta);

  // ajout de la légende
  generateLegendMaille_fich_sp();
}

function generateGeojsonMailleCommune(observations) {
  var i = 0;
  myGeoJson = { type: "FeatureCollection", features: [] };
  tabProperties = [];
  while (i < observations.length) {
    geometry = observations[i].geojson_maille;
    idMaille = observations[i].id_maille;
    properties = {
      id_maille: idMaille,
      nb_observations: 1,
      last_observation: observations[i].annee
    };
    var j = i + 1;
    while (j < observations.length && observations[j].id_maille <= idMaille) {
      properties.nb_observations += observations[j].nb_observations;

      if (observations[j].annee >= properties.last_observation) {
        properties.last_observation = observations[j].annee;
      }
      j = j + 1;
    }
    myGeoJson.features.push({
      type: "Feature",
      properties: properties,
      geometry: geometry
    });
    // on avance jusqu' à j
    i = j;
  }

  return myGeoJson;
}

function displayMailleLayerCommune(observations) {
  myGeoJson = generateGeojsonMailleCommune(observations);
  currentLayer = L.geoJson(myGeoJson, {
    onEachFeature: onEachFeatureMaille,
    style: styleMaille
  });
  currentLayer.addTo(map);

  // ajout de la légende
  generateLegendMaille();
}

// GeoJson Point
function generateGeojsonPointFicheEspece(observationsPoint, yearMin, yearMax) {
  myGeoJson = { type: "FeatureCollection", features: [] };
  observationsPoint.forEach(function(obs) {
    if (obs.year >= yearMin && obs.year <= yearMax) {
      properties = obs;
      properties["dateobsCompare"] = new Date(obs.dateobs);
      properties["dateobsPopup"] = obs.dateobs;
      properties["nb_observations"] = 1;
      myGeoJson.features.push({
        type: "Feature",
        properties: properties,
        geometry: obs.geojson_point
      });
    }
  });
  return myGeoJson;
}

// Display marker Layer (cluster or not)
function displayMarkerLayerFicheEspece(observationsPoint, yearMin, yearMax) {
  myGeojson = generateGeojsonPointFicheEspece(
    observationsPoint,
    yearMin,
    yearMax
  );

  if (typeof pointDisplayOptionsFicheEspece == "undefined") {
    pointDisplayOptionsFicheEspece = function(feature) {
      return {};
    };
  }
  currentLayer = L.geoJson(myGeojson, {
    onEachFeature: onEachFeaturePoint,

    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, pointDisplayOptionsFicheEspece(feature));
    }
  });
  if (myGeojson.features.length > configuration.LIMIT_CLUSTER_POINT) {
    newLayer = currentLayer;
    currentLayer = L.markerClusterGroup();
    currentLayer.addLayer(newLayer);
    mapmorta.addLayer(currentLayer);
  } else {
    currentLayer.addTo(mapmorta);
  }

  if (typeof divLegendeFicheEspece !== "undefined") {
    legend.onAdd = function(mapmorta) {
      var div = L.DomUtil.create("div", "info legend");
      div.innerHTML = divLegendeFicheEspece;
      return div;
    };
    legend.addTo(mapmorta);
  }
}

// ***************Fonction lastObservations: mapHome et mapCommune*****************

/* *** Point ****/

function onEachFeaturePointLastObs(feature, layer) {
  popupContent =
    "<b>Espèce: </b>" +
    feature.properties.taxon +
    "</br><b>Date: </b>" +
    feature.properties.dateobs +
    "</br><b>Altitude: </b>" +
    feature.properties.altitude_retenue;

  layer.bindPopup(
    popupContent +
      "</br> <a href='" +
      configuration.URL_APPLICATION +
      "/espece/" +
      feature.properties.cd_ref +
      "'> Fiche espèce </a>"
  );
}

function onEachFeaturePointCommune(feature, layer) {
  popupContent =
    "<b>Espèce: </b>" +
    feature.properties.taxon +
    "</br><b>Date: </b>" +
    feature.properties.dateobs +
    "</br><b>Altitude: </b>" +
    feature.properties.altitude_retenue +
    "</br><b> Observateurs(s): </b>" +
    feature.properties.observateurs;

  layer.bindPopup(
    popupContent +
      "</br> <a href='" +
      configuration.URL_APPLICATION +
      "/espece/" +
      feature.properties.cd_ref +
      "'> Fiche espèce </a>"
  );
}

function generateGeojsonPointLastObs(observationsPoint) {
  myGeoJson = { type: "FeatureCollection", features: [] };

  observationsPoint.forEach(function(obs) {
    properties = obs;
    properties["dateobsCompare"] = new Date(obs.dateobs);
    properties["dateobsPopup"] = obs.dateobs;
    properties["nb_observations"] = 1;
    myGeoJson.features.push({
      type: "Feature",
      properties: properties,
      geometry: obs.geojson_point
    });
    myGeoJson.features.push({
      type: "Feature",
      properties: properties,
      geometry: obs.geojson_point
    });
  });
  return myGeoJson;
}

function displayMarkerLayerPointLastObs(observationsPoint) {
  myGeojson = generateGeojsonPointLastObs(observationsPoint);
  if (typeof pointDisplayOptionsFicheCommuneHome == "undefined") {
    pointDisplayOptionsFicheCommuneHome = function(feature) {
      return {};
    };
  }

  currentLayer = L.geoJson(myGeojson, {
    onEachFeature: onEachFeaturePointLastObs,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(
        latlng,
        pointDisplayOptionsFicheCommuneHome(feature)
      );
    }
  });

  mapmorta.addLayer(currentLayer);
  if (typeof divLegendeFicheCommuneHome !== "undefined") {
    legend.onAdd = function(mapmorta) {
      var div = L.DomUtil.create("div", "info legend");
      div.innerHTML = divLegendeFicheCommuneHome;
      return div;
    };
    legend.addTo(mapmorta);
  }
}

function displayMarkerLayerPointCommune(observationsPoint) {
  myGeojson = generateGeojsonPointLastObs(observationsPoint);
  if (typeof pointDisplayOptionsFicheCommuneHome == "undefined") {
    pointDisplayOptionsFicheCommuneHome = function(feature) {
      return {};
    };
  }

  currentLayer = L.geoJson(myGeojson, {
    onEachFeature: onEachFeaturePointCommune,
    pointToLayer: function(feature, latlng) {
      return L.circleMarker(
        latlng,
        pointDisplayOptionsFicheCommuneHome(feature)
      );
    }
  });

  newLayer = currentLayer;
  currentLayer = L.markerClusterGroup();
  currentLayer.addLayer(newLayer);
  map.addLayer(currentLayer);
}

//  ** MAILLE ***

function compare(a, b) {
  if (a.id_maille < b.id_maille) return -1;
  if (a.id_maille > b.id_maille) return 1;
  return 0;
}

function printEspece(tabEspece, tabCdRef) {
  stringEspece = "";
  i = 0;
  while (i < tabEspece.length) {
    stringEspece +=
      "<li> <a href='./espece/" + tabCdRef[i] + "'>" + tabEspece[i] + "</li>";
    i = i + 1;
  }
  return stringEspece;
}

function onEachFeatureMailleLastObs(feature, layer) {
  popupContent =
    "<b>Espèces observées dans la maille: </b> <ul> " +
    printEspece(feature.properties.list_taxon, feature.properties.list_cdref) +
    "</ul>";

  layer.bindPopup(popupContent);
}

function styleMailleLastObs() {
  return {
    opacity: 1,
    weight: 2,
    color: "red",
    fillOpacity: 0
  };
}

function generateGeoJsonMailleLastObs(observations) {
  var i = 0;
  myGeoJson = { type: "FeatureCollection", features: [] };
  while (i < observations.length) {
    geometry = observations[i].geojson_maille;
    idMaille = observations[i].id_maille;
    properties = {
      id_maille: idMaille,
      list_taxon: [observations[i].taxon],
      list_cdref: [observations[i].cd_ref],
      list_id_observation: [observations[i].id_observation]
    };
    var j = i + 1;
    while (j < observations.length && observations[j].id_maille == idMaille) {
      properties.list_taxon.push(observations[j].taxon);
      properties.list_cdref.push(observations[j].cd_ref);
      properties.list_id_observation.push(observations[j].id_observation);
      j = j + 1;
    }
    myGeoJson.features.push({
      type: "Feature",
      properties: properties,
      geometry: geometry
    });
    // on avance jusqu' à j
    i = j;
  }

  return myGeoJson;
}

function find_id_observation_in_array(tab_id, id_observation) {
  i = 0;
  while (i < tab_id.length && tab_id[i] != id_observation) {
    i = i + 1;
  }
  return i != tab_id.length;
}

function displayMailleLayerLastObs(observations) {
  observations.sort(compare);
  var geojsonMaille = generateGeoJsonMailleLastObs(observations);
  currentLayer = L.geoJson(geojsonMaille, {
    onEachFeature: onEachFeatureMailleLastObs,
    style: styleMailleLastObs
  });
  console.log(currentLayer);
  currentLayer.addTo(mapmorta);
}

// Legend

var legend;
var legendActiv = false;
var div;

function generateLegendemorta(htmlLegend) {
  // Legende

  var legendControl = L.Control.extend({
    options: {
      position: "topleft"
      //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },

    onAdd: function(mapmorta) {
      var container = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom"
      );

      container.style.backgroundColor = "white";
      container.style.width = "25px";
      container.style.height = "25px";
      container.style.border = "solid white 1px";
      container.style.cursor = "pointer";
      $(container).html(
        "<img src='" +
          configuration.URL_APPLICATION +
          "/static/images/info.png' alt='Légende'>"
      );
      $(container).attr("data-placement", "right");
      $(container).attr("data-toggle", "tooltip");
      $(container).attr("data-original-title", "Légende");

      container.onclick = function() {
        if (legendActiv == false) {
          legend = L.control({ position: "topleft" });

          legend.onAdd = function(mapmorta) {
            (div = L.DomUtil.create("div", "info legend")),
              $(div).addClass("generalLegend");

            div.innerHTML = htmlLegend;

            return div;
          };
          legend.addTo(mapmorta);
          legendActiv = true;
        } else {
          legend.remove(mapmorta);
          legendActiv = false;
        }
      };
      return container;
    }
  });

  mapmorta.addControl(new legendControl());
}

var mySlider;
function generateSliderOnMapmorta() {
  var SliderControl = L.Control.extend({
    options: {
      position: "bottomleft"
      //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },

    onAdd: function(mapmorta) {
      var sliderContainer = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-slider-control"
      );

      sliderContainer.style.backgroundColor = "white";
      sliderContainer.style.width = "300px";
      sliderContainer.style.height = "50px";
      sliderContainer.style.border = "solid white 1px";
      sliderContainer.style.cursor = "pointer";
      $(sliderContainer).css("margin-bottom", "-300px");
      $(sliderContainer).css("margin-left", "200px");
      $(sliderContainer).css("text-align", "center");
      $(sliderContainer).append(
        "<p> <span id='yearMin'> </span> <input id='sliderControl' type='text'/> <span id='yearMax'>  </span>  </p>" +
          "<p id='nbObs'> Nombre d'observation(s): " +
          nb_obs +
          " </p>"
      );
      L.DomEvent.disableClickPropagation(sliderContainer);
      return sliderContainer;
    }
  });

  map.addControl(new SliderControl());

  mySlider = new Slider("#sliderControl", {
    value: [taxonYearMin, YEARMAX],
    min: taxonYearMin,
    max: YEARMAX,
    step: configuration.MAP.STEP
  });

  $("#yearMax").html("&nbsp;&nbsp;&nbsp;&nbsp;" + YEARMAX);
  $("#yearMin").html(taxonYearMin + "&nbsp;&nbsp;&nbsp;&nbsp");
}
