 // Create the chart altitude
 if($('#altiChart')[0]) {
 var labels = [];
 var values = [];
 for(i = 0; i < dataset.length; i++) {
   labels.push(dataset[i].altitude);
   values.push(dataset[i].value);
   }

   Highcharts.chart('altiChart', {
       chart: {
           plotBackgroundColor: null,
           plotBorderWidth: null,
           plotShadow: false,
           type: 'line'
         },
       credits: {
           enabled: false
         },
         title: {
           text: "Observations par classes d'altitudes",
           style : { "color": "#333333", "fontSize": "20px" }
         },
         
         legend: {
           enabled: false
         },
         
       xAxis: {
           categories: labels,
           labels: {
               rotation: 45
           }
       },
       yAxis: {
           title: {
               text: 'Nombre de données'
           }
       },
   
       plotOptions: {
           spline: {
               dataLabels: {
                   enabled: true
               },
               lineWidth: 4,
               states: {
                   hover: {
                       lineWidth: 5
                   }
               },
               marker: {
                   enabled: false
               }
           }
       },
       
       series: [{
         name: 'donnée(s)',
         data: values,
         type: 'spline',
       }]
   
   });
  }
  // FIN GRAPHIQUE ALTITUDES PLOT //




// Radialize the colors
Highcharts.setOptions({
colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
  return {
    radialGradient: {
      cx: 0.5,
      cy: 0.3,
      r: 0.7
    },
    stops: [
      [0, color],
      [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
    ]
  };
})
});


var pieColors = (function () {
  var colors = [],
      base = Highcharts.getOptions().colors[0],
      i;

  for (i = 0; i < 10; i += 1) {
      // Start out with a darkened base color (negative brighten), and end
      // up with a much brighter color
      colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
  }
  return colors;
}());



Highcharts.chart('sourcesChart', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  credits: {
    enabled: false
  },
  title: {
    text: "Origine des données",
    style : { "color": "#333333", "fontSize": "20px" }
  },
  tooltip: {
    headerFormat: '',
    pointFormat: '<b>{point.label}</b> <br> <b>{point.y}</b>', 
    valueSuffix: ' donnée(s) <br>({point.percentage:.1f}%)'
  },

  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      colors: pieColors,
      borderColor: "#7094db",
      /*
       style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        },
        */
      showInLegend: false,
      
      dataLabels: {
        allowOverlap: true,
        connectorColor: "#7094db",
        enabled: true,
        format: '<b>{point.label}</b> <b>: {point.y} donnée(s)</b><br>{point.percentage:.1f} %',
        /*distance: 10,*/
        filter: {
          property: 'percentage',
          operator: '>',
          value: 0
        },
        style : { "color": "#333333", "fontSize": "11px" }
      }

    }
  },

  series: [{
   data : sources,
   innerSize: '30%',                
   //showInLegend:true,
   dataLabels: {
       enabled: true,
       padding: 0
   }
  }],

  navigation: {
        buttonOptions: {

            theme: {
                'stroke-width': 1,
                stroke: 'silver',
                r: 0,
                states: {
                    hover: {
                        fill: '#a4edba'
                    },
                    select: {
                        stroke: '#039',
                        fill: '#a4edba'
                    }
                },
                style: {
                    color: '#3c763d',
                    textDecoration: 'bold'
                }
            }

        }
    }

});




Highcharts.chart('contactTypesChart', {
  chart: {
    plotBackgroundColor: null,
    plotBorderWidth: null,
    plotShadow: false,
    type: 'pie'
  },
  credits: {
    enabled: false
  },
  title: {
    text: "Type de contact",
    style : { "color": "#333333", "fontSize": "20px" }
  },
  tooltip: {
    headerFormat: '',
    pointFormat: '<b>{point.label}</b> <br> <b>{point.y}</b>', 
    valueSuffix: ' donnée(s) <br>({point.percentage:.1f}%)'
  },

  plotOptions: {
    pie: {
      allowPointSelect: true,
      cursor: 'pointer',
      colors: pieColors,
      borderColor: "#7094db",
      /*
       style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        },
        */
      showInLegend: false,
      
      dataLabels: {
        allowOverlap: true,
        connectorColor: "#7094db",
        enabled: true,
        format: '<b>{point.label}</b> <b>: {point.y} donnée(s)</b><br>{point.percentage:.1f} %',
        /*distance: 10,*/
        filter: {
          property: 'percentage',
          operator: '>',
          value: 0
        },
        style : { "color": "#333333", "fontSize": "11px" }
      }

    }
  },

  series: [{
   data : contacttypes,
   innerSize: '30%',                
   //showInLegend:true,
   dataLabels: {
       enabled: true,
       padding: 0
   }
  }],

  navigation: {
        buttonOptions: {

            theme: {
                'stroke-width': 1,
                stroke: 'silver',
                r: 0,
                states: {
                    hover: {
                        fill: '#a4edba'
                    },
                    select: {
                        stroke: '#039',
                        fill: '#a4edba'
                    }
                },
                style: {
                    color: '#3c763d',
                    textDecoration: 'bold'
                }
            }

        }
    }

});



// Create the chart phenology per months

  var labels = [];
  var values = [];
  for(i = 0; i < months.length; i++) {
    labels.push(months[i].mois);
    values.push(months[i].value);
    }

    Highcharts.chart('phenologyChart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'line'
          },
        credits: {
            enabled: false
          },
          title: {
            text: "Phénologie de l'espèce",
            style : { "color": "#333333", "fontSize": "15px" }
          },
          legend: {
            enabled: false
          },
          
        xAxis: {
            categories: labels
        },
        yAxis: {
            title: {
                text: 'Nombre de données'
            }
        },
    
        plotOptions: {
            spline: {
                dataLabels: {
                    enabled: true
                },
                lineWidth: 4,
                states: {
                    hover: {
                        lineWidth: 5
                    }
                },
                marker: {
                    enabled: false
                }
            }
        },
        
        series: [{
          name: 'donnée(s)',
          data: values,
          type: 'spline',
        }]
    
    });


  // Create the chart phenology per year

  var labels = [];
  var values = [];
  for(i = 0; i < years.length; i++) {
    labels.push(years[i].year);
    values.push(years[i].nb_obs);
    }

    Highcharts.chart('yearlyChart', {
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false,
            type: 'column'
          },
        credits: {
            enabled: false
          },
          title: {
            text: "Age des données",
            style : { "color": "#333333", "fontSize": "15px" }
          },
          legend: {
            enabled: false
          },
          
        xAxis: {
            categories: labels,
            crosshair: true,
            labels: {
                rotation: -45
            }
        },
        yAxis: {
            title: {
                text: 'Nombre de données'
            }
        },
        
        series: [{
          name: 'donnée(s)',
          data: values
          
        }]
    
    });