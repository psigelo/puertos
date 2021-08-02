var chart;

am4core.ready(function() {

// Themes begin

am4core.useTheme(am4themes_dark);
// Themes end

chart = am4core.create("arcplot", am4charts.ChordDiagram);

// colors of main characters
chart.colors.saturation = 0.45;
chart.colors.step = 2;
var colors = {
}

chart.data = []

chart.dataFields.fromName = "from";
chart.dataFields.toName = "to";
chart.dataFields.value = "value";

chart.nodePadding = 0.5;
chart.minNodeSize = 0.01;
chart.startAngle = 80;
chart.endAngle = chart.startAngle + 360;
chart.sortBy = "value";
chart.fontSize = 10;


var nodeTemplate = chart.nodes.template;
nodeTemplate.readerTitle = "Click to show/hide or drag to rearrange";
nodeTemplate.showSystemTooltip = true;
nodeTemplate.propertyFields.fill = "color";
nodeTemplate.tooltipText = "{name} connections: {total}";

// when rolled over the node, make all the links rolled-over
nodeTemplate.events.on("over", function(event) {
    var node = event.target;
    node.outgoingDataItems.each(function(dataItem) {
        if(dataItem.toNode){
            dataItem.link.isHover = true;
            dataItem.toNode.label.isHover = true;
        }
    })
    node.incomingDataItems.each(function(dataItem) {
        if(dataItem.fromNode){
            dataItem.link.isHover = true;
            dataItem.fromNode.label.isHover = true;
        }
    })

    node.label.isHover = true;
})

// when rolled out from the node, make all the links rolled-out
nodeTemplate.events.on("out", function(event) {
    var node = event.target;
    node.outgoingDataItems.each(function(dataItem) {
        if(dataItem.toNode){
            dataItem.link.isHover = false;
            dataItem.toNode.label.isHover = false;
        }
    })
    node.incomingDataItems.each(function(dataItem) {
        if(dataItem.fromNode){
            dataItem.link.isHover = false;
           dataItem.fromNode.label.isHover = false;
        }
    })

    node.label.isHover = false;
})

var label = nodeTemplate.label;
label.relativeRotation = 90;

label.fillOpacity = 0.4;
let labelHS = label.states.create("hover");
labelHS.properties.fillOpacity = 1;

nodeTemplate.cursorOverStyle = am4core.MouseCursorStyle.pointer;
// this adapter makes non-main character nodes to be filled with color of the main character which he/she kissed most
nodeTemplate.adapter.add("fill", function(fill, target) {
    let node = target;
    let counters = {};
    let mainChar = false;
    node.incomingDataItems.each(function(dataItem) {
        if(colors[dataItem.toName]){
            mainChar = true;
        }

        if(isNaN(counters[dataItem.fromName])){
            counters[dataItem.fromName] = dataItem.value;
        }
        else{
            counters[dataItem.fromName] += dataItem.value;
        }
    })
    if(mainChar){
        return fill;
    }

    let count = 0;
    let color;
    let biggest = 0;
    let biggestName;

    for(var name in counters){
        if(counters[name] > biggest){
            biggestName = name;
            biggest = counters[name];
        }
    }
    if(colors[biggestName]){
        fill = colors[biggestName];
    }

    return fill;
})

// link template
var linkTemplate = chart.links.template;
linkTemplate.strokeOpacity = 0;
linkTemplate.fillOpacity = 0.15;
linkTemplate.tooltipText = "{fromName} & {toName}:{value.value}";

var hoverState = linkTemplate.states.create("hover");
hoverState.properties.fillOpacity = 0.7;
hoverState.properties.strokeOpacity = 0.7;




// window.addEventListener("load", GetSensorsData);
$("#preventivo").hide();
}); // end am4core.ready()


function GetSensorsData(day_first, day_end) {
    $("#preventivo").show();

  $.getJSON("/arc_data/"+day_first+"/"+day_end+"/sum", function (data, status) {
    try {
        if(data.Error == undefined){
            chart.data = data;
        }
        else{
            $("#preventivo").hide();
            alert("No data for arc plot")
        }

    } catch (e) {
    }
  });
}

function GetArcTracerDataRange(day, end_day, rut) {
  $.getJSON("/tracer/arc_data/"+day+"/"+end_day+"/"+rut+"/sum", function (data, status) {
    $("#preventivo").show();
    try {
          if(data.Error == undefined && data.length != 0){
                chart.data = data;
            }
            else{
                $("#preventivo").hide();
                alert("No data for arc plot")
            }
    } catch (e) {
    }
  });
}


function GetArcTracerDataByPhoneRange(day, end_day, phone_number) {
  $.getJSON("/tracer/arc_data_by_phone/"+day+"/"+end_day+"/"+phone_number+"/sum", function (data, status) {
    $("#preventivo").show();
    try {
          if(data.Error == undefined && data.length != 0){
                chart.data = data;
            }
            else{
                $("#preventivo").hide();
                alert("No data for arc plot")
            }
    } catch (e) {
    }
  });
}



