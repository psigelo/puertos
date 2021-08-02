//GLOBAL VARIABLES
var datatablesOptions = {
  "columnDefs":[{
    "targets": -1,
    "data": null,
    "defaultContent": "<a href='#' id='edit' data-toggle='modal' data-target='#modal_edit'><i class='fas fa-edit action-icons'></i></a> <a href='#' id='delete' data-toggle='modal' data-target='#modal_del'><i class='fas fa-trash action-icons'></i></a>"
  }]
};

var beamers_table = $('#beamers').DataTable(datatablesOptions);
var current = "";

$('#beamers tbody').on( 'click', '#delete', function () {
        var data = beamers_table.row($(this).parents('tr')).data();
        $("#modal_del_id").text(data[1]+"?")
});

$('#beamers tbody').on('click', '#edit', function () {
  var current_edit = beamers_table.row($(this).parents('tr')).data();
  console.log("current", current_edit);
  current = current_edit[1];
  var elements = document.getElementById("editModal").getElementsByTagName("input");
  elements[0].value = current_edit[1];
  elements[1].value = current_edit[2];
  elements[2].value = current_edit[3];
  $("#editModal").modal({ 'show': true });
});

function postEdit() {
  elements = document.getElementById("editModal").getElementsByTagName("input");
  data = {
    current_id:current,
    id:elements[0].value,
    model:elements[1].value,
    vendor:elements[2].value
  }
  console.log("data", data)
  $.post("/beamers/edit", data, function (data, status) {
    console.log("status:", status);
    if (status != 'success') {
      $.notify("Error al editar beamer", "warn");
    }
    else {
      $.notify("Beamer editado exitósamente", "success");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function postDel(){
  mac = document.getElementById("modal_del_id").innerText.substring(0,document.getElementById("modal_del_id").innerText.length-1);
  console.log("mac:",mac);
  data = {
    id:mac
  }
  $.post("/beamers/delete",data, function(data,status){
    console.log("status:",status);
    if (status != 'success') {
      $.notify("Error al eliminar beamer", "warn");
    }
    else {
      $.notify("Beamer eliminado exitósamente", "info");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function postAdd(){
  elements = document.getElementById("addModal").getElementsByTagName("input");
  console.log("elements:",elements)
  data = {
    id:elements[0].value,
    model:elements[1].value,
    vendor:elements[2].value
  }
  console.log("data",data)
  $.post("/beamers/add",data, function(data,status){
    console.log("status:",status);
    if (status != 'success') {
      $.notify("Error al agregar beamer", "warn");
    }
    else {
      $.notify("Beamer agregado exitósamente", "success");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}


function GetBeamers(table){
  $.getJSON("/beamers/get", function(data, status){
    try {
      console.log("json objs received:", data.length)
      console.log("data:", data);
      for(var i =0; i<data.length; i++){
        var updated = "";
        if(typeof data[i].updatedAt !== 'undefined'){
          updated = moment(data[i].updatedAt.$date).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        else{
          updated = moment(data[i].createdAt.$date).utc().format("YYYY-MM-DD HH:mm:ss");
        }
        table.row.add([
          i+1,
          data[i].beamerId+"",
          data[i].model+"",
          data[i].vendor+"",
          data[i].tenant.name+"-"+data[i].tenant.subname,
          moment(data[i].createdAt.$date).utc().format("YYYY-MM-DD HH:mm:ss"),
          updated,
        ]).draw( false );
      }
    } catch(e) {

    }
  });
}



$(document).ready(function() {
    GetBeamers(beamers_table)
} );
