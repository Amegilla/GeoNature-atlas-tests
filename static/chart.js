
// alti graph
// Morris.Bar({
//             element:"altiChart",
//             data : dataset,
//             xkey: "altitude",
//             ykeys : ["value"],
//             labels: ['Observation(s)'],
//             xLabelAngle: 45,
//             hideHover: 'auto',
//             resize: true,
//             axes: true,
//             gridIntegers: true
//             /*yLabelFormat: function(y){return y != Math.round(y)?'':y;}*/
// /*            horizontal: true
// */        });



svgbis=d3.selectAll("svg");

        svgbis.append("g")
        .append("text")
            .attr("y", "90%")
            .attr("x", "100%")
            .attr("dy", ".71em")
            .attr("fill", "#888888")
            .attr("font-size", "10px")
            .style("text-anchor", "end")
            .text("Altitude(m)");


// GRAPHIQUE CAMEMBERT SOURCES //
if($('#sourcesChart')[0]) {
var labels = [];
var values = [];
for(i = 0; i < sources.length; i++) {
  labels.push(sources[i].name_source);
  values.push(sources[i].nb_obs);
  }

  var sourcesChart = [{
    values: values,
    labels: labels,
    type: 'pie'
  }];
  
  var layout = {
    autosize: false,
    height: 250,
    margin: {
      l: 50,
      r: 50,
      b: 20,
      t: 20,
      pad: 4
    }
  }

  Plotly.newPlot('sourcesChart', sourcesChart, layout, {displayModeBar: false});
}
// FIN | GRAPHIQUE CAMEMBERT SOURCES //
            


// GRAPHIQUE NOMBRE D'OBSERVATIONS PAR ANNEES //
if($('#yearlyChart')[0]) {
  var yearlyChart =  Morris.Bar({
                  element:"yearlyChart",
                  data : years,
                  xkey: ["year"],
                  ykeys : ["nb_obs"],
                  labels: ['Observation(s)'],
                  xLabelAngle: 60,
                  hideHover: 'auto',
                  resize: true,
                  axes: true,
              });
}
// FIN | GRAPHIQUE NOMBRE D'OBSERVATIONS PAR ANNEES //

var phenologyChart =  Morris.Bar({
                        element:"phenologyChart",
                        data : months,
                        xkey: "mois",
                        ykeys : ["value"],
                        labels: ['Observation(s)'],
                        xLabelAngle: 60,
                        hideHover: 'auto',
                        resize: true,
                        axes: true,
                    });


svgContainer = d3.selectAll("svg");
    svgContainer.append("g")
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", '0%')
            .attr('x', '-15%')
            .attr("dy", ".71em")
            .attr("fill", "#888888")
            .attr("font-size", "10px")
            .style("text-anchor", "end")
            .text("Observations");



rect = d3.selectAll("rect");

            rect.on("mouseover", function(d) {
             d3.select(this).classed("highlight", true);
             d3.select(this).select("text").style("visibility", "visible");

});

            rect.on("mouseout", function() {
    d3.select(this).classed("highlight", false);

});

svgContainer = d3.selectAll("svg");
    svgContainer.append("g")
        .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", '0%')
            .attr('x', '-15%')
            .attr("dy", ".71em")
            .attr("fill", "#888888")
            .attr("font-size", "10px")
            .style("text-anchor", "end")
            .text("Observations");
