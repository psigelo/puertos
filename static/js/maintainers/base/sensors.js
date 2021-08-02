//GLOBAL VARIABLES
var datatablesOptions = {
  "columnDefs": [{
    "targets": -1,
    "data": null,
    "defaultContent": "<a href='#' id='edit' data-toggle='modal' data-target='#editModal'><i class='fas fa-edit action-icons'></i></a> <a href='#' id='delete' data-toggle='modal' data-target='#modal_del'><i class='fas fa-trash action-icons'></i></a>"
  }]
};
var cur_tenant = "";
//var sensors_table = $('#sensors').DataTable(datatablesOptions);
var current_sens = ""
$('#sensors tbody').on('click', '#delete', function () {
  var data = sensors_table.row($(this).parents('tr')).data();
  $("#modal_del_id").text(data[1] + "?")
});

$('#sensors tbody').on('click', '#edit', function () {
  var current_edit = sensors_table.row($(this).parents('tr')).data();
  console.log("current", current_edit);
  current_sens = current_edit[1];
  var elements = document.getElementById("editModal").getElementsByTagName("input");
  elements[0].value = current_edit[1];
  elements[1].value = current_edit[2];
  elements[2].value = current_edit[3];
  cur_tenant = current_edit[4];
  var current_tag = current_edit[7];
  if (current_tag.localeCompare("") != 0) {
    var opt = document.createElement('option');
    opt.text = current_edit[7];
    var tags = document.getElementById("editModal").getElementsByTagName("select")[0];
    tag.options.add(opt);
    tag.options[tag.options.length - 1].selected = true;
  }
  //$("#editModal").modal({ 'show': true });
});

function postEdit() {
  elements = document.getElementById("editModal").getElementsByTagName("input");
  var tags = document.getElementById("editModal").getElementsByTagName("select")[1];
  var tag_selected = tags.options[tags.selectedIndex].value;
  var tenants = document.getElementById("addModal").getElementsByTagName("select")[0];
  tenant_selected = tenants.options[tenants.selectedIndex].value;
  console.log("tag_selected", tag_selected);
  data = {
    current: current_sens,
    id: elements[0].value,
    model: elements[1].value,
    vendor: elements[2].value,
    tenant: tenant_selected,
    tag: tag_selected
  }
  console.log("data", data)
  $.post("/sensors/edit", data, function (data, status) {
    console.log("status:", status);
    if (status != 'success') {
      $.notify("Error al editar sensor", "warn");
    }
    else {
      $.notify("Sensor editado exitósamente", "success");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function postDel() {
  mac = document.getElementById("modal_del_id").innerText.substring(0, document.getElementById("modal_del_id").innerText.length - 1);
  console.log("mac:", mac);
  data = {
    id: mac
  }
  $.post("/sensors/delete", data, function (data, status) {
    console.log("status:", status);
    if (status != 'success') {
      $.notify("Error al eliminar sensor", "warn");
    }
    else {
      $.notify("Sensor eliminado exitósamente", "info");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function postAdd() {
  elements = document.getElementById("addModal").getElementsByTagName("input");
  tags = document.getElementById("addModal").getElementsByTagName("select")[1];
  tag_selected = tags.options[tags.selectedIndex].value;
  var tenants = document.getElementById("addModal").getElementsByTagName("select")[0];
  console.log("tenants",tenants);
  tenant_selected = tenants.options[tenants.selectedIndex].value;
  //tenant_selected = tenants.options[0].value;
  console.log("tenant_selected",tenant_selected);
  console.log("tag_selected", tag_selected);
  data = {
    id: elements[0].value,
    model: elements[1].value,
    vendor: elements[2].value,
    tenant: tenant_selected,
    tag: tag_selected,
  }
  console.log("data", data)
  $.post("/sensors/add", data, function (data, status) {
    console.log("status:", status);
    if (status != 'success') {
      $.notify("Error al agregar sensor", "warn");
    }
    else {
      $.notify("Sensor agregado exitósamente", "success");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function GetSensors(table) {
  $.getJSON("/sensors/get", function (data, status) {
    try {
      console.log("json objs received:", data.length)
      console.log("data:", data)
      for (var i = 0; i < data.length; i++) {
        //tag
        if (data[i].tag == null) {
          var tag = "";
        }
        else {
          var tag = data[i].tag.name + " " + data[i].tag.description;
        }
        //tenant
        if (data[i].tenant == null) {
          var tenant = "";
        }
        else {
          var tenant = data[i].tenant.name + " " + data[i].tenant.subname;
        }
        //updated
        if (data[i].updatedAt == null) {
          var updated = moment(data[i].createdAt.$date).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        else {
          var updated = moment(data[i].updatedAt.$date).utc().format("YYYY-MM-DD HH:mm:ss")
        }
        table.row.add([
          i + 1,
          data[i].sensorId + "",
          data[i].model + "",
          data[i].vendor + "",
          tenant,
          moment(data[i].createdAt.$date).utc().format("YYYY-MM-DD HH:mm:ss"),
          updated,
          tag
        ]).draw(false);
      }
    } catch (e) {

    }
  });
}



$(document).ready(function () {
  sensors_table = $('#sensors').DataTable(datatablesOptions);
  GetSensors(sensors_table)
});
