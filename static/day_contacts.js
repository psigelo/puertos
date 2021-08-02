var chart_day_contacts;
am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_dark);
// Themes end

// Create chart instance
chart_day_contacts = am4core.create("day_contacts", am4charts.XYChart);

// Add data
chart_day_contacts.data = [];

// Set input format for the dates
chart_day_contacts.dateFormatter.inputDateFormat = "yyyy-MM-dd";

// Create axes
var dateAxis = chart_day_contacts.xAxes.push(new am4charts.DateAxis());
var valueAxis = chart_day_contacts.yAxes.push(new am4charts.ValueAxis());

// Create series
var series = chart_day_contacts.series.push(new am4charts.LineSeries());
series.dataFields.valueY = "value";
series.dataFields.dateX = "date";
series.tooltipText = "{value}"
series.strokeWidth = 2;
series.minBulletDistance = 15;

// Drop-shaped tooltips
series.tooltip.background.cornerRadius = 20;
series.tooltip.background.strokeOpacity = 0;
series.tooltip.pointerOrientation = "vertical";
series.tooltip.label.minWidth = 40;
series.tooltip.label.minHeight = 40;
series.tooltip.label.textAlign = "middle";
series.tooltip.label.textValign = "middle";

// Make bullets grow on hover
var bullet = series.bullets.push(new am4charts.CircleBullet());
bullet.circle.strokeWidth = 2;
bullet.circle.radius = 4;
bullet.circle.fill = am4core.color("#fff");

var bullethover = bullet.states.create("hover");
bullethover.properties.scale = 1.3;

// Make a panning cursor
chart_day_contacts.cursor = new am4charts.XYCursor();
chart_day_contacts.cursor.behavior = "panXY";
chart_day_contacts.cursor.xAxis = dateAxis;
chart_day_contacts.cursor.snapToSeries = series;

// Create vertical scrollbar and place it before the value axis
chart_day_contacts.scrollbarY = new am4core.Scrollbar();
chart_day_contacts.scrollbarY.parent = chart_day_contacts.leftAxesContainer;
chart_day_contacts.scrollbarY.toBack();

// Create a horizontal scrollbar with previe and place it underneath the date axis
chart_day_contacts.scrollbarX = new am4charts.XYChartScrollbar();
chart_day_contacts.scrollbarX.series.push(series);
chart_day_contacts.scrollbarX.parent = chart_day_contacts.bottomAxesContainer;

dateAxis.start = 0;
dateAxis.keepSelection = true;


}); // end am4core.ready()

function GetDayContactsData() {

  $.getJSON("/day_contacts", function (data, status) {
    try {
      chart_day_contacts.data = data;
    } catch (e) {
    }
  });
}

window.addEventListener("load", GetDayContactsData);

