var table_dt;
var day;
var end_day;
var rut;
var client_view;
var phone_number;

function show_user_table() {
  $("#search_users_t").show();
  day = $("#day_pick").val().replace(/-/g, "T");
  end_day = $("#day_pick_end").val().replace(/-/g, "T");
  day = day.replace(/\//g, "T");
  end_day = end_day.replace(/\//g, "T");
  $.getJSON("/tracer/get_users/"+day+"/"+end_day, function (data, status) {
        if(data.Error == undefined && data.length != 0){
            try {
                  if(table_dt != undefined){
                  table_dt.fnClearTable();
                    table_dt.fnDestroy();
                  }
                  table_dt = $('#example').dataTable( {
                        "data": data,
                        "columns": [
                            { "data": "rut", "title": "rut"},
                            { "data": "client_view", "title": "Usuario" },
                            { "data": "tel", "title": "Teléfono" }
                        ]

                    } );
                  $('#example tbody').on('click', ' tr', function () {
                      rut = this.children[0].textContent;
                      client_view = this.children[1].textContent;
                        phone_number = this.children[2].textContent;
                        console.log("hola")
                        phone_number = phone_number.replace(/\+/g, "");

                        $("#t_rut").html(rut);
                        $("#t_tel").html(phone_number);
                        $("#t_view").html(client_view);
                        $("#sospechoso").show();
                      if(rut != ""){
                          rut = rut.replace(/-/g, "T");
                          rut = rut.replace(/\./g, "");
                          day = $("#day_pick").val().replace(/-/g, "T");
                          day = day.replace(/\//g, "T");
                          GetArcTracerDataRange(day, end_day, rut);
                          GetGanttTracerDataRange(day, end_day, rut);
                      }else if (phone_number != ""){
                          day = $("#day_pick").val().replace(/-/g, "T");
                          day = day.replace(/\//g, "T");
                          GetArcTracerDataByPhoneRange(day, end_day, phone_number);
                          GetGanttTracerDataByPhoneRange(day, end_day, phone_number);
                      }else{
                          alert("No rut or phone number provided to search.")
                      }


                    });
            } catch (e) {
            }
        }else{
            if(table_dt != undefined){
                table_dt.fnClearTable();
                table_dt.fnDestroy();
            }
            alert("No users for this date");
        }
      });
  }
function download_csv() {
    if(rut != ""){
      var path = "/tracer/hourly_csv/"+day+"/"+end_day+"/"+rut;
      var element = document.createElement('a');
      element.setAttribute('href', path);
      element.setAttribute('download', 'user.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
    else{
      var path = "/tracer/hourly_csv_by_phone/"+day+"/"+end_day+"/"+phone_number;
      var element = document.createElement('a');
      element.setAttribute('href', path);
      element.setAttribute('download', 'user.csv');
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
}
$(document).ready(function() {
  $("#day_pick").datepicker({format: 'yyyy-mm-dd', autoclose: true});
  $("#day_pick_end").datepicker({format: 'yyyy-mm-dd', autoclose: true});
  $("#search_users_t").hide();
  $("#sospechoso").hide();
});