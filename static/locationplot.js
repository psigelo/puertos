var chart_location_close_contacts;

am4core.ready(function() {

// Themes begin
am4core.useTheme(am4themes_dark);
// Themes end

// create chart
chart_location_close_contacts = am4core.create("location_close_contacts", am4charts.TreeMap);
chart_location_close_contacts.hiddenState.properties.opacity = 0; // this makes initial fade in effect

chart_location_close_contacts.data = [];

chart_location_close_contacts.colors.step = 2;

// define data fields
chart_location_close_contacts.dataFields.value = "value";
chart_location_close_contacts.dataFields.name = "name";
chart_location_close_contacts.dataFields.children = "children";

chart_location_close_contacts.zoomable = false;
var bgColor = new am4core.InterfaceColorSet().getFor("background");

// level 0 series template
var level0SeriesTemplate = chart_location_close_contacts.seriesTemplates.create("0");
var level0ColumnTemplate = level0SeriesTemplate.columns.template;

level0ColumnTemplate.column.cornerRadius(10, 10, 10, 10);
level0ColumnTemplate.fillOpacity = 0;
level0ColumnTemplate.strokeWidth = 4;
level0ColumnTemplate.strokeOpacity = 0;

// level 1 series template
var level1SeriesTemplate = chart_location_close_contacts.seriesTemplates.create("1");
var level1ColumnTemplate = level1SeriesTemplate.columns.template;

level1SeriesTemplate.tooltip.animationDuration = 0;
level1SeriesTemplate.strokeOpacity = 1;

level1ColumnTemplate.column.cornerRadius(10, 10, 10, 10)
level1ColumnTemplate.fillOpacity = 1;
level1ColumnTemplate.strokeWidth = 4;
level1ColumnTemplate.stroke = bgColor;

var bullet1 = level1SeriesTemplate.bullets.push(new am4charts.LabelBullet());
bullet1.locationY = 0.5;
bullet1.locationX = 0.5;
bullet1.label.text = "{name}";
bullet1.label.fill = am4core.color("#ffffff");

chart_location_close_contacts.maxLevels = 2;
$("#location_close_contacts_s").hide()
}); // end am4core.ready()


function GetLocationCloseContactsData(day_first, day_end) {

    $.getJSON("/location/close_contacts/"+ day_first + "/" + day_end, function (data, status) {
    $("#location_close_contacts_s").show()
    try {
        if(data.Error == undefined){
            chart_location_close_contacts.data = data;
        }
        else{
            $("#location_close_contacts_s").hide();
            // alert("No data for location close contacts plot")
        }
    } catch (e) {
    }
  });
}