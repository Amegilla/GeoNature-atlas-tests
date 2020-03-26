
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
      : "#FFEDA0";
  }

function generateMap() {
    // Map initialization
    firstMapTile = L.tileLayer(configuration.MAP.FIRST_MAP.url, {
        attribution: configuration.MAP.FIRST_MAP.attribution,
        minZoom: configuration.MAP.FIRST_MAP.minzoom
        });
    orthoMap = L.tileLayer(configuration.MAP.SECOND_MAP.url, {
        attribution: configuration.MAP.SECOND_MAP.attribution,
        minZoom: configuration.MAP.SECOND_MAP.minzoom
        });
    GoogleSatellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        attribution: '&copy; GoogleMap',
        minZoom: configuration.MAP.SECOND_MAP.minzoom,
        subdomains : ["mt0", "mt1", "mt2", "mt3"]
        });
    CorineLandCover = L.WMS.layer("http://ws.carmencarto.fr/WMS/119/fxx_inpn?", "Zones_de_protection_speciale", {
      format: 'image/png',
      uppercase: true,
      transparent: true,
      continuousWorld : true,
      tiled: true,
      info_format: 'text/html',
      opacity: 1,
      identify: false,
  });
  layer_Coursdeaumtropolede510km_7 = L.WMS.layer("http://services.sandre.eaufrance.fr/geo/eth_FXX?", "CoursEau5", {
    format: 'image/png',
    uppercase: true,
    transparent: true,
    continuousWorld : true,
    tiled: true,
    info_format: 'text/html',
    opacity: 1,
    identify: false,
});


    wmsLayer = L.tileLayer.wms('http://ws.carmencarto.fr/WMS/119/fxx_inpn?', {
      attribution: 'Espaces naturels et Natura 2000'
      });
    Routes = L.tileLayer.wms('https://public.sig.rennesmetropole.fr/geoserver/ows?', 
                    {layers: 'ref_rva:vgs_troncon_domanialite',format: 'image/png',transparent:true}); 
    
    baseMap = {};
    baseMap[configuration.MAP.FIRST_MAP.tileName] = firstMapTile;

    var map = L.map("map", {
        crs: L.CRS.EPSG3857,
        center: configuration.MAP.LAT_LONG,
        geosearch: true,
        zoom: configuration.MAP.ZOOM,
        layers: [firstMapTile],
        fullscreenControl: true
      });
 

      var baseLayers = {
        "OpenStreetmap": firstMapTile,
        "OpenTopomap": orthoMap,
        "GoogleSatellite" : GoogleSatellite
        };
      var data = {"CorineLandCover" : CorineLandCover,
                "Routes": Routes,
                "Natura2000" : wmsLayer,
                "ZPS" : layer_Coursdeaumtropolede510km_7
                };
        L.control.layers(baseLayers,data).addTo(map);
   
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
        territoryLayer.addTo(map);
        map.setMaxBounds(territoryLayer.getBounds());
        });
    });
     
    // add tooltip on fullScreen button
    fullScreenButton = $(".leaflet-control-fullscreen");
    fullScreenButton.attr("data-placement", "right");
    fullScreenButton.attr("data-toggle", "tooltip");
    fullScreenButton.attr("data-original-title", "Plein écran");
    $(".leaflet-control-fullscreen-button").removeAttr("title");

    return map;
}


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

  
var map = generateMap();

var legend = L.control({position: 'bottomright'});

/* Desactive la molette de la carte et ne l'active qu'apres un clic sur la carte */
map.scrollWheelZoom.disable();
$('#map').click(function(){
  map.scrollWheelZoom.enable();
})




function generateLegendMailleEspeces() {
    legend.onAdd = function(map) {
      var div = L.DomUtil.create("div", "info legend"),
        grades = [0, 1, 2, 3, 5, 10, 20, 30],
        labels = ["<strong> Nombre <br> d'espèces </strong> <br>"];
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
        labels.push(
          '<i style="background:' +
            getColor(grades[i] + 1) +
            '"></i> ' +
            grades[i] +
            (grades[i + 1] ? "&ndash;" + grades[i + 1] + "<br>" : "+")
        );
      }
      div.innerHTML = labels.join("<br>");
  
      return div;
    };
  
    legend.addTo(map);
  }

/* on va charger les données du nb d'espèces par mailles */
  $.ajax({
    /*url: configuration.URL_APPLICATION+'/api/nb_espece_par_maille/'+cd_ref, */
    url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobalchiro',
    dataType: "json",
    beforeSend: function(){
      $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
    }
    }).done(function(observations) {
      $('#loadingGif').hide();
      $('#sp_all').prop('disabled', true)
      $('#sp_vu').prop('disabled', false)
      $('#sp_annexeII').prop('disabled', false)
      $('#sp_cr_en').prop('disabled', false)
      displayMailleLayerEspeces(observations);   

    });

  // map interaction all
  $('#sp_all').click(function(){
    $('#sp_all').prop('disabled', true)
    $('#sp_vu').prop('disabled', false)
    $('#sp_annexeII').prop('disabled', false)
    $('#sp_cr_en').prop('disabled', false)
    map.removeLayer(currentLayer);

    $.ajax({
    /*url: configuration.URL_APPLICATION+'/api/nb_espece_par_maille/'+cd_ref, */
    url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobalchiro',
    dataType: "json",
    beforeSend: function(){
      $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
    }
    }).done(function(observations) {
      $('#loadingGif').hide();
      displayMailleLayerEspeces(observations);   

    });

  })


  // map interaction annexe II
  $('#sp_annexeII').click(function(){
    $('#sp_all').prop('disabled', false)
    $('#sp_vu').prop('disabled', false)
    $('#sp_annexeII').prop('disabled', true)
    $('#sp_cr_en').prop('disabled', false)
    map.removeLayer(currentLayer);

    $.ajax({
    /*url: configuration.URL_APPLICATION+'/api/nb_espece_par_maille/'+cd_ref, */
    url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobalchiroannexeII',
    dataType: "json",
    beforeSend: function(){
      $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
    }
    }).done(function(observationsannexeII) {
      $('#loadingGif').hide();
      displayMailleLayerEspeces(observationsannexeII);   

    });

  })

  // map interaction CR EN
  $('#sp_cr_en').click(function(){
    $('#sp_all').prop('disabled', false)
    $('#sp_vu').prop('disabled', false)
    $('#sp_cr_en').prop('disabled', true)
    $('#sp_annexeII').prop('disabled', false)
    map.removeLayer(currentLayer);

    $.ajax({
      /*url: configuration.URL_APPLICATION+'/api/nb_espece_par_maille/'+cd_ref, */
      url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobalchiroCREN',
      dataType: "json",
      beforeSend: function(){
        $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
      }
      }).done(function(observationsCREN) {
        $('#loadingGif').hide();
        displayMailleLayerEspeces(observationsCREN);   
  
      });

  })

  // map interaction VU 
  $('#sp_vu').click(function(){
    $('#sp_all').prop('disabled', false)
    $('#sp_vu').prop('disabled', true)
    $('#sp_cr_en').prop('disabled', false)
    $('#sp_annexeII').prop('disabled', false)
    map.removeLayer(currentLayer);

    $.ajax({
      /*url: configuration.URL_APPLICATION+'/api/nb_espece_par_maille/'+cd_ref, */
      url: configuration.URL_APPLICATION+'/api/observationsEspecesMailleGlobalchiroVU',
      dataType: "json",
      beforeSend: function(){
        $('#loadingGif').attr('src', configuration.URL_APPLICATION+'/static/images/loading.svg')
      }
      }).done(function(observationsVU) {
        $('#loadingGif').hide();
        displayMailleLayerEspeces(observationsVU);   
      });  

  })