var map2 = generateMap("mapmorta");
generateSliderOnMap2();

$("a[href='#mortmap']").on('shown.bs.tab', function(e) {
  map2.invalidateSize();
});



var legend2 = L.control({position: 'bottomright'});

var currentLayer2; 

// Current observation geoJson:  type object
var myGeoJson2;

var compteurLegend2 = 0; // counter to not put the legend each time


$.ajax({
  url: configuration.URL_APPLICATION+'/api/observationsMailleAndPoint_lulu_morta/', 
  dataType: "json",
  beforeSend: function(){
    $('#loadingGif').attr("src", configuration.URL_APPLICATION+'/static/images/loading.svg')
  }

  }).done(function(observations2) {
    $('#loadingGif').hide();

      //display nb observations

    var mailleBoolean2 = false;
    if (observations2.maille.length > 500) {
       displayMailleLayerFicheEspece2(observations2.maille, taxonYearMin, YEARMAX);
       mailleBoolean2 = true;
    }
    else {
      displayMarkerLayerFicheEspece2(observations2.point, taxonYearMin, YEARMAX);
    }
    
    if (mailleBoolean2){
      // Slider event
          mySlider2.on("change",function(){
              years = mySlider2.getValue();
              yearMin = years[0];
              yearMax = years[1];


              map2.removeLayer(currentLayer2);
              if(map2.getZoom() >= configuration.ZOOM_LEVEL_POINT){
                displayMarkerLayerFicheEspece2(observations2.point, yearMin, yearMax);
              }else{
                displayMailleLayerFicheEspece2(observations2.maille, yearMin, yearMax)
              }

              nbObs2=0;
              myGeoJson2.features.forEach(function(l){
                nbObs2 += l.properties.nb_observations
              })

              $("#nbObs2").html("Nombre d'observation(s): "+ nbObs2);

             });


            // ZoomEvent: change maille to point
            var legendblock2 = $("div.info");
            var activeMode2 = "Maille";
            map2.on("zoomend", function(){
            if (activeMode2 != "Point" && map2.getZoom() >= configuration.ZOOM_LEVEL_POINT ){
              map2.removeLayer(currentLayer2);
              legendblock2.attr("hidden", "true");


                years = mySlider2.getValue();
                yearMin = years[0];
                yearMax = years[1];

              displayMarkerLayerFicheEspece2(observations2.point, yearMin, yearMax);
              activeMode2 = "Point";
            }
            if (activeMode2 != "Maille" && map2.getZoom() <= configuration.ZOOM_LEVEL_POINT -1 ){
              // display legend
              map2.removeLayer(currentLayer2);

              legendblock2.removeAttr( "hidden" );

                years = mySlider2.getValue();
                yearMin = years[0];
                yearMax = years[1];
              displayMailleLayerFicheEspece2(observations2.maille, yearMin, yearMax);
              activeMode2 = "Maille"
            }

            });

    // if not display Maille
    }else {
            // Slider event
            mySlider2.on("change",function(){
                years = mySlider2.getValue();
                yearMin = years[0];
                yearMax = years[1];


                map2.removeLayer(currentLayer2);
                displayMarkerLayerFicheEspece2(observations2.point, yearMin, yearMax);
                nbObs2=0;
                myGeoJson2.features.forEach(function(l){
                  nbObs2 += l.properties.nb_observations
                })

                $("#nbObs2").html("Nombre d'observation(s): "+ nbObs2);
               });

    }

})

// Legende

htmlLegend2 = "<i style='border: solid "+configuration.MAP.BORDERS_WEIGHT+"px "+configuration.MAP.BORDERS_COLOR+";'> &nbsp; &nbsp; &nbsp;</i> Limite du "+ configuration.STRUCTURE;

generateLegende2(htmlLegend2);
