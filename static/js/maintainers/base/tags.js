//GLOBAL VARIABLES
var datatablesOptions = {
  columnDefs:[{
      "targets": [ 1 ],
      "visible": false,
      "searchable": false
    },{
    targets: -1,
    data: null,
    defaultContent: "<a href='#' id='edit' data-toggle='modal' data-target='#editModal'><i class='fas fa-edit action-icons'></i></a> <a href='#' id='delete' data-toggle='modal' data-target='#modal_del'><i class='fas fa-trash action-icons'></i></a>"
  }
  ],
  dom: 'Blfrtip',
  buttons: ['copyHtml5', 'excelHtml5', 'csvHtml5'],
};

var current_del = "";
var tags_table;

$('#tags tbody').on( 'click', '#delete', function () {
  var data = tags_table.row($(this).parents('tr')).data();
  current_del = data[1];
  $("#modal_del_id").text(data[2]+" "+data[3]+"?")
});

$('#tags tbody').on('click', '#edit', function () {
  var current_edit = tags_table.row($(this).parents('tr')).data();
  console.log("current", current_edit);
  current_del = current_edit[1];
  var elements = document.getElementById("editModal").getElementsByTagName("input");
  elements[0].value = current_edit[2];
  elements[1].value = current_edit[3];
  $("#editModal").modal({ 'show': true });
});

function postEdit() {
  elements = document.getElementById("editModal").getElementsByTagName("input");
  data = {
    current: current_del,
    name: elements[0].value,
    description: elements[1].value
  }
  console.log("data", data)
  $.post("/tags/edit", data, function (data, status) {
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

function postDel(){
  els = document.getElementById("modal_del_id").innerText.substring(0,document.getElementById("modal_del_id").innerText.length-1);
  elements = els.split(" ");
  console.log("elements",elements);
  data = {
    id:current_del,
    name:elements[0].value,
    description:elements[1].value
    }
  $.post("/tags/delete",data, function(data,status){
    console.log("status:",status);
    if (status != 'success') {
      $.notify("Error al eliminar tag", "warn");
    }
    else {
      $.notify("Tag eliminado exitósamente", "info");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function postAdd(){
  elements = document.getElementById("addModal").getElementsByTagName("input");
  console.log("elements:",elements)
  data = {
    name:elements[0].value,
    description:elements[1].value,
    }
  console.log("data",data)
  $.post("/tags/add",data, function(data,status){
    console.log("status:",status);
    if (status != 'success') {
      $.notify("Error al agregar Tag", "warn");
    }
    else {
      $.notify("Tag agregado exitósamente", "success");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}

function GetTags(table){
  $.getJSON("/tags/get", function(data, status){
    try {
      console.log("json objs received:", data.length)
      console.log("data tag:", data)

      for(var i =0; i<data.length; i++){
        table.row.add( [
          i+1,
          data[i]._id.$oid+"",
          data[i].name+"",
          data[i].description,
          moment(data[i].createdAt.$date).utc().format("YYYY-MM-DD HH:mm:ss"),
          data[i].designated,
        ] ).draw( false );
      }
    }catch(e){
    }
  });
}


$(document).ready(function() {
  tags_table = $('#tags').DataTable(datatablesOptions);
  GetTags(tags_table);
  //console.log("table",users_table.row( this ).data())

} );
