var chart_netplot;
var networkSeries_netplot;

am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_dark);
// Themes end

chart_netplot = am4core.create("chartdiv", am4plugins_forceDirected.ForceDirectedTree);

networkSeries = chart_netplot.series.push(new am4plugins_forceDirected.ForceDirectedSeries())
networkSeries.dataFields.linkWith = "linkWith";
networkSeries.dataFields.name = "name";
networkSeries.dataFields.id = "name";
networkSeries.dataFields.value = 100;
networkSeries.dataFields.children = "children";
networkSeries.minRadius = 30;

networkSeries.nodes.template.label.text = "{name}"
networkSeries.fontSize = 8;
networkSeries.linkWithStrength = 0;

var nodeTemplate = networkSeries.nodes.template;
nodeTemplate.tooltipText = "{name}";
nodeTemplate.fillOpacity = 1;
nodeTemplate.label.hideOversized = true;
nodeTemplate.label.truncate = true;

var linkTemplate = networkSeries.links.template;
linkTemplate.strokeWidth = 1;
var linkHoverState = linkTemplate.states.create("hover");
linkHoverState.properties.strokeOpacity = 1;
linkHoverState.properties.strokeWidth = 2;

nodeTemplate.events.on("over", function (event) {
    var dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link) {
        link.isHover = true;
    })
})

nodeTemplate.events.on("out", function (event) {
    var dataItem = event.target.dataItem;
    dataItem.childLinks.each(function (link) {
        link.isHover = false;
    })
})

networkSeries.data = [];
$("#network_zone").hide()
}); // end am4core.ready()

function GetNetPlotData(day_start, day_end) {

  $.getJSON("/net_plot/"+day_start+"/"+day_end, function (data, status) {
  $("#network_zone").show();
    try {
        if(data.Error == undefined){
            networkSeries.data = data;
        }
        else{
            $("#network_zone").hide();
            alert("No data for network plot")
        }
    } catch (e) {
    }
  });
}


function GetNetworkTracerData(day, rut) {

    $.getJSON("/tracer/network/"+ day + "/" + rut, function (data, status) {
    $("#network_zone").show()
    try {
        networkSeries.data = data;
    } catch (e) {
    }
  });
}