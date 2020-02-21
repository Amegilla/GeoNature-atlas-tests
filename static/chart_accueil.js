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
         data: values,
         dataLabels: {
            enabled: true
        }
         
       }]
   
   });


   if($('#sourcesChart')[0]) {
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
}