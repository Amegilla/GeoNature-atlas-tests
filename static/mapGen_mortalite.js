function generateLegendMaille_fich_sp2() {
  legend2.onAdd = function(map2) {
    var div = L.DomUtil.create("div", "info legend"),
      grades = [0, 1, 2, 5, 10, 20, 50, 100],
      bins_labels = ["1", "2", "3-5", "5-10", "10-20", "20-50", "50-100", "100+"],
      labels = ["<strong> Nombre <br> d'observations </strong> <br>"];

    // loop through our density intervals and generate a label with a colored square for each interval

    labels.push('<i style="background:#eaeaea"></i>Absence<br>');

    for (var i = 0; i < grades.length; i++) {
      labels.push(
        '<i style="background:' +
          getColor2(grades[i] + 1) +
          '"></i> ' +
          bins_labels[i] + "<br>"

      );
    }
    div.innerHTML = labels.join("<br>");

    return div;
  };

  legend2.addTo(map2);
}

// Style maille
function getColor2(d) {
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

// Display marker Layer (cluster or not)
function displayMarkerLayerFicheEspece2(observationsPoint, yearMin, yearMax) {
  myGeojson2 = generateGeojsonPointFicheEspece2(
    observationsPoint,
    yearMin,
    yearMax
  );

  if (typeof pointDisplayOptionsFicheEspece == "undefined") {
    pointDisplayOptionsFicheEspece = function(feature) {
      return {};
    };
  }
  currentLayer2 = L.geoJson(myGeojson2, {
    onEachFeature: onEachFeaturePoint2,

    pointToLayer: function(feature, latlng) {
      return L.circleMarker(latlng, pointDisplayOptionsFicheEspece(feature));
    }
  });
  if (myGeojson2.features.length > configuration.LIMIT_CLUSTER_POINT) {
    newLayer = currentLayer2;
    currentLayer2 = L.markerClusterGroup();
    currentLayer2.addLayer(newLayer);
    map2.addLayer(currentLayer2);
  } else {
    currentLayer2.addTo(map2);
  }

  if (typeof divLegendeFicheEspece !== "undefined") {
    legend2.onAdd = function(map2) {
      var div = L.DomUtil.create("div", "info legend");
      div.innerHTML = divLegendeFicheEspece;
      return div;
    };
    legend2.addTo(map2);
  }
}

// GeoJson Point
function generateGeojsonPointFicheEspece2(observationsPoint, yearMin, yearMax) {
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

// Popup Point
function onEachFeaturePoint2(feature, layer) {
  popupContent =
    "<b>Date: </b>" +
    feature.properties.dateobsPopup +
    "</br><b>Coordinateur(s): </b>" +
    feature.properties.nom_coordinateur +
    "</br><b>Découvreur(s): </b>" +
    feature.properties.nom_decouvreur +
    "</br><b>Informateur(s): </b>" +
    feature.properties.nom_informateur;
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
function onEachFeatureMaille2(feature, layer) {
  popupContent =
    "<b>Nombre d'observation(s): </b>" +
    feature.properties.nb_observations +
    "</br><b>Coordinateur(s): </b>" +
    feature.properties.list_coordinateurs.filter(onlyUnique)+
    "</br><b>Informateur(s): </b>" +
    feature.properties.list_informateurs.filter(onlyUnique)+
    "</br><b>Découvreur(s): </b>" +
    feature.properties.list_decouvreurs.filter(onlyUnique) +
    "</br> <b> Dernière observation: </b>" +
    feature.properties.last_observation +
    " ";
  layer.bindPopup(popupContent);
}

function displayMailleLayerFicheEspece2(observationsMaille, yearMin, yearMax) {
  myGeoJson2 = generateGeojsonMaille2(observationsMaille, yearMin, yearMax);
  currentLayer2 = L.geoJson(myGeoJson2, {
    onEachFeature: onEachFeatureMaille2,
    style: styleMaille
  });
  currentLayer2.addTo(map2);

  // ajout de la légende
  generateLegendMaille_fich_sp2();
}

// Geojson Maille
function generateGeojsonMaille2(observations, yearMin, yearMax) {
  var i = 0;
  myGeoJson2 = { type: "FeatureCollection", features: [] };
  tabProperties = [];
  while (i < observations.length) {
        if (observations[i].annee >= yearMin && observations[i].annee <= yearMax) {
                geometry = observations[i].geojson_maille;
                idMaille = observations[i].id_maille;
                coordinateurs = observations[i].coordinateur;
                informateurs = observations[i].informateur;
                decouvreurs = observations[i].decouvreur;
                effectif_total = observations[i].effectif_total;
                properties = {
                                id_maille: idMaille,
                                nb_observations: 1,
                                eff_tot: effectif_total,
                                list_coordinateurs : [coordinateurs],
                                list_informateurs : [informateurs],
                                list_decouvreurs : [decouvreurs],
                                last_observation: observations[i].annee,
                                tabDateobs: [new Date(observations[i].dateobs)]
                              };

                var j = i + 1;
                while (j < observations.length && observations[j].id_maille <= idMaille) {
                        if (observations[j].annee >= yearMin && observations[j].annee <= yearMax) {
                            properties.eff_tot += observations[j].effectif_total;
                            properties.nb_observations += observations[j].nb_observations;
                            properties.tabDateobs.push(new Date(observations[i].dateobs));
                            properties.list_coordinateurs.push(observations[j].coordinateur);
                            properties.list_informateurs.push(observations[j].informateur);
                            properties.list_decouvreurs.push(observations[j].decouvreur);
                          }

                        if (observations[j].annee >= properties.last_observation) {
                            properties.last_observation = observations[j].annee;
                          }
                        j = j + 1;
                }
                // ici il faut transformer la liste des observateurs d'un tableau vers un string en supprimant les doublons
                //properties.list_observateurs = properties.list_observateurs.filter(onlyUnique).join(', ')
                myGeoJson2.features.push({
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
  return myGeoJson2;
}







// Legend

var legend2;
var legendActiv2 = false;
var div;

function generateLegende2(htmlLegend) {
  // Legende

  var legendControl = L.Control.extend({
    options: {
      position: "topleft"
      //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },

    onAdd: function(map2) {
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
        if (legendActiv2 == false) {
          legend2 = L.control({ position: "topleft" });

          legend2.onAdd = function(map2) {
            (div = L.DomUtil.create("div", "info legend")),
              $(div).addClass("generalLegend");

            div.innerHTML = htmlLegend;

            return div;
          };
          legend2.addTo(map2);
          legendActiv2 = true;
        } else {
          legend2.remove(map2);
          legendActiv2 = false;
        }
      };
      return container;
    }
  });

  map2.addControl(new legendControl());
}







var mySlider2;
function generateSliderOnMap2() {
  var SliderControl = L.Control.extend({
    options: {
      position: "bottomleft"
      //control position - allowed: 'topleft', 'topright', 'bottomleft', 'bottomright'
    },

    onAdd: function(map2) {
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
        "<p> <span id='yearMin'> </span> <input id='sliderControl2' type='text'/> <span id='yearMax'>  </span>  </p>" +
          "<p id='nbObs2'> Nombre d'observation(s): " +
          nb_obs +
          " </p>"
      );
      L.DomEvent.disableClickPropagation(sliderContainer);
      return sliderContainer;
    }
  });

  map2.addControl(new SliderControl());

  mySlider2 = new Slider("#sliderControl2", {
    value: [taxonYearMin, YEARMAX],
    min: taxonYearMin,
    max: YEARMAX,
    step: configuration.MAP.STEP
  });

  $("#yearMax").html("&nbsp;&nbsp;&nbsp;&nbsp;" + YEARMAX);
  $("#yearMin").html(taxonYearMin + "&nbsp;&nbsp;&nbsp;&nbsp");
}