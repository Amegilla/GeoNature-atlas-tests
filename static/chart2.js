//sfepm green with degraded of saturation
var sfepm_green_colors_full = ["#00948f","#04908c","#078d88","#0b8985","#0f8581","#12817e","#167e7a","#1a7a77","#1e7673","#217370","#256f6c","#296b69","#2c6866","#306462","#34605f","#375c5b","#3b5958","#3f5554","#435151","#464e4d","#4a4a4a"]
//var sfepm_green_colors = ["#00948f","#078d88","#0f8581","#167e7a","#1e7673","#256f6c","#2c6866","#34605f","#3b5958","#435151","#4a4a4a"]

var sfepm_green_colors = ["#006663","#009994","#00ccc5","#00fff7","#99fffc","#e6fffe"]

 
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




// // Radialize the colors
// Highcharts.setOptions({
// colors: Highcharts.map(Highcharts.getOptions().colors, function (color) {
//   return {
//     radialGradient: {
//       cx: 0.5,
//       cy: 0.3,
//       r: 0.7
//     },
//     stops: [
//       [0, color],
//       [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
//     ]
//   };
// })
// });


// var pieColors = (function () {
//   var colors = [],
//       base = Highcharts.getOptions().colors[0],
//       i;

//   for (i = 0; i < 10; i += 1) {
//       // Start out with a darkened base color (negative brighten), and end
//       // up with a much brighter color
//       colors.push(Highcharts.Color(base).brighten((i - 3) / 7).get());
//   }
//   return colors;
// }());



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
      //colors: pieColors,
      colors: sfepm_green_colors,
      borderColor: "#00948f",
      /*
       style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        },
        */
      showInLegend: false,
      
      dataLabels: {
        allowOverlap: true,
        connectorColor: "#00948f",
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
      //colors: pieColors,
      colors: sfepm_green_colors,
      borderColor: "#00948f",
      /*
       style: {
          color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
        },
        */
      showInLegend: false,
      
      dataLabels: {
        allowOverlap: true,
        connectorColor: "#00948f",
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
          color:'#00948f',
          type: 'spline',
        }]
    
    });


  // Create the chart phenology per year
  var labels_y = [];
  var values_y = [];
  for(i = 0; i < years.length; i++) {
    labels_y.push(years[i].year);
    values_y.push(years[i].nb_obs);
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
            text: "Périodes d'observation",
            style : { "color": "#333333", "fontSize": "15px" }
          },
          legend: {
            enabled: false
          },
          
        xAxis: {
            categories: labels_y,
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
          data: values_y,
          color:"#00948f",
        }]
    
    });