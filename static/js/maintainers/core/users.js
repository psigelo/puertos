
//GLOBAL VARIABLES
var datatablesOptions = {
  "columnDefs":
    [{
      "targets": -1,
      "data": null,
      "defaultContent": "<a href='#' data-toggle='modal' id='edit' data-target='#editModal'><i class='fas fa-edit action-icons'></i></a> <a href='#' id='delete' data-toggle='modal' data-target='#modal_del'><i class='fas fa-trash action-icons'></i></a>"
    }]
};

var users_table = $('#users').DataTable(datatablesOptions);
var current_user;
var cur_ten;
$('#users tbody').on( 'click', '#delete', function () {
  var data = users_table.row($(this).parents('tr')).data();
  console.log("data:",data);
  $("#modal_del_id").text(data[1]+"?")
});

$('#users tbody').on( 'click', '#edit', function () {
  var data = users_table.row($(this).parents('tr')).data();
  console.log("data:",data);
  current_user = data[1];
  var elements = document.getElementById("editModal").getElementsByTagName("input");
  var roles = document.getElementById("editModal").getElementsByTagName("select")[0];
  var tenants = document.getElementById("editModal").getElementsByTagName("select")[1];
  cur_ten = tenants;
  for(var i=0;i<roles.options.length;i++){
    if(roles.options[i].value.localeCompare(data[3])==0){
      roles.options.selectedIndex = i; 
    }
  }
  for(var i=0;i<tenants.options.length;i++){
    if(tenants.options[i].innerText.localeCompare(data[4])==0){
      tenants.options.selectedIndex = i; 
    }
  }
  elements[0].value = data[1];
  elements[3].value = data[2];
  elements[4].value = data[5];
});

function postEdit(){
  elements = document.getElementById("editModal").getElementsByTagName("input");
  roles = document.getElementById("editModal").getElementsByTagName("select")[0];
  role_selected = roles.options[roles.selectedIndex].value;
  var tenants = document.getElementById("editModal").getElementsByTagName("select")[1];
  tenant_selected = tenants.options[tenants.selectedIndex].value;
  if (elements[1].value != elements[2].value) {
    $.notify("Claves no coinciden", "warn");
  }
  else {
    data = {
      current:current_user,
      username: elements[0].value,
      password: elements[1].value,
      name: elements[3].value,
      email: elements[4].value,
      role: role_selected,
      tenant: tenant_selected,
    }
    console.log("data", data)
    $.post("/users/edit", data, function (data, status) {
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
}

function postDel() {
  username = document.getElementById("modal_del_id").innerText.substring(0, document.getElementById("modal_del_id").innerText.length - 1);
  console.log("user:", username);
  data = {
    username: username
  }
  $.post("/users/delete", data, function (data, status) {
    console.log("status:", status);
    if (status != 'success') {
      $.notify("Error al eliminar usuario", "warn");
    }
    else {
      $.notify("Usuario eliminado exitósamente", "info");
    }
    setTimeout(function () { window.location.reload(); }, 1000);
  });
}


function postAdd() {
  elements = document.getElementById("addModal").getElementsByTagName("input");
  roles = document.getElementById("addModal").getElementsByTagName("select")[0];
  role_selected = roles.options[roles.selectedIndex].value;
  console.log("role selected", role_selected);
  var tenants = document.getElementById("addModal").getElementsByTagName("select")[1];
  tenant_selected = tenants.options[tenants.selectedIndex].value;
  if (elements[1].value != elements[2].value) {
    $.notify("Claves no coinciden", "warn");
  }
  else {
    data = {
      username: elements[0].value,
      password: elements[1].value,
      name: elements[3].value,
      email: elements[4].value,
      role: role_selected,
      tenant: tenant_selected,
    }
    console.log("data", data)
    $.post("/users/add", data, function (data, status) {
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
}

function GetUsers(table) {
  $.getJSON("/users/get", function (data, status) {
    try {
      console.log("json objs received:", data.length)
      console.log("data:", data)
      for (var i = 0; i < data.length; i++) {
        table.row.add([
          i + 1,
          data[i].username + "",
          data[i].name + "",
          data[i].role + "",
          data[i].tenant.name + "-" + data[i].tenant.subname,
          data[i].email
        ]).draw(false);
      }
    } catch (e) {
    }
  });
}


$(document).ready(function () {
  GetUsers(users_table);

});
