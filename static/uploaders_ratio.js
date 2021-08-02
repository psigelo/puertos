var chart_uploaders_ratio;
am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_dark);
// Themes end

// Create chart instance
chart_uploaders_ratio = am4core.create("chart_ratio_uploaders", am4charts.XYChart);

// Add data
chart_uploaders_ratio.data = []

// Create category axis
var categoryAxis = chart_uploaders_ratio.xAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "day";

// Create value axis
var valueAxis = chart_uploaders_ratio.yAxes.push(new am4charts.ValueAxis());
valueAxis.title.text = "Place taken";
valueAxis.renderer.minLabelPosition = 0.01;

// Create series
var countries = ["celular", "sensor_posicion", "sensor_movil", "sensor_persona", "sensor_pulsera"];

for (i = 0; i < countries.length; i++) {
  var series1 = chart_uploaders_ratio.series.push(new am4charts.LineSeries());
    series1.dataFields.valueY = countries[i];
    series1.dataFields.categoryX = "day";
    series1.name = countries[i];
    series1.bullets.push(new am4charts.CircleBullet());
    series1.tooltipText = "{categoryX} {name}: {valueY}";
    series1.legendSettings.valueText = "{valueY}";
    series1.visible  = true;

    let hs1 = series1.segments.template.states.create("hover")
    hs1.properties.strokeWidth = 5;
    series1.segments.template.strokeWidth = 1;
}

// Add chart cursor
chart_uploaders_ratio.cursor = new am4charts.XYCursor();
chart_uploaders_ratio.cursor.behavior = "zoomY";

// Add legend
chart_uploaders_ratio.legend = new am4charts.Legend();
chart_uploaders_ratio.legend.itemContainers.template.events.on("over", function(event){
  var segments = event.target.dataItem.dataContext.segments;
  segments.each(function(segment){
    segment.isHover = true;
  })
})

chart_uploaders_ratio.legend.itemContainers.template.events.on("out", function(event){
  var segments = event.target.dataItem.dataContext.segments;
  segments.each(function(segment){
    segment.isHover = false;
  })
})


}); // end am4core.ready()

function GetUploadersData() {
  $.getJSON("/upload_stats", function (data, status) {
    try {
      chart_uploaders_ratio.data = data;
    } catch (e) {
    }
  });
}

window.addEventListener("load", GetUploadersData);

