var gantt_chart;
am4core.ready(function() {
$("#gantt_chart").hide();

// Themes begin
am4core.useTheme(am4themes_dark);
// Themes end

gantt_chart = am4core.create("ganttplot", am4charts.XYChart);
gantt_chart.hiddenState.properties.opacity = 0; // this creates initial fade-in

gantt_chart.paddingRight = 30;
gantt_chart.dateFormatter.inputDateFormat = "yyyy-MM-dd HH:mm";

var colorSet = new am4core.ColorSet();
colorSet.saturation = 0.4;

gantt_chart.data = [];

var categoryAxis = gantt_chart.yAxes.push(new am4charts.CategoryAxis());
categoryAxis.dataFields.category = "name";
categoryAxis.renderer.grid.template.location = 0;
categoryAxis.renderer.inversed = true;

var dateAxis = gantt_chart.xAxes.push(new am4charts.DateAxis());
dateAxis.dateFormatter.dateFormat = "yyyy-MM-dd HH:mm";
dateAxis.renderer.minGridDistance = 70;
dateAxis.baseInterval = { count: 5, timeUnit: "minute" };
// dateAxis.max = new Date(2018, 0, 1, 24, 0, 0, 0).getTime();
dateAxis.strictMinMax = true;
dateAxis.renderer.tooltipLocation = 0;

var series1 = gantt_chart.series.push(new am4charts.ColumnSeries());
series1.columns.template.width = am4core.percent(80);
series1.columns.template.tooltipText = "{name}: {openDateX} - {dateX}";

series1.dataFields.openDateX = "fromDate";
series1.dataFields.dateX = "toDate";
series1.dataFields.categoryY = "name";
series1.columns.template.propertyFields.fill = "color"; // get color from data
series1.columns.template.propertyFields.stroke = "color";
series1.columns.template.strokeOpacity = 1;

gantt_chart.scrollbarY = new am4core.Scrollbar();
gantt_chart.scrollbarX = new am4core.Scrollbar();
}); // end am4core.ready()


function GetGanttTracerDataRange(day, end_day, rut) {

  $.getJSON("/tracer/trace_hourly/"+day+"/"+end_day+"/"+rut, function (data, status) {
    $("#gantt_chart").show();
    try {

        if(data.Error == undefined){
            var height_str = "height:" + String(150 + 50 * $.unique(data.map(function (d) {return d.name;})).length) + "px";
            document.getElementById('ganttplot').setAttribute("style", height_str);
            gantt_chart.data = data;
        }
        else{
            $("#gantt_chart").hide();
            alert("No data for gantt plot")
        }

    } catch (e) {
    }
  });
}

function GetGanttTracerDataByPhoneRange(day, end_day, phone_number) {

  $.getJSON("/tracer/trace_hourly_by_phone/"+day+"/"+end_day+"/"+phone_number, function (data, status) {
    $("#gantt_chart").show();
    try {
        if(data.Error == undefined){
            var height_str = "height:" + String(150 + 50 * $.unique(data.map(function (d) {return d.name;})).length) + "px";
            document.getElementById('ganttplot').setAttribute("style", height_str);
            gantt_chart.data = data;
        }
        else{
            $("#gantt_chart").hide();
            alert("No data for gantt plot")
        }

    } catch (e) {
    }
  });
}
