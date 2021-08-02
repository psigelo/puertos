var table_dt;
$(document).ready(function() {
    $("#modify_fields").hide();
    $.getJSON("/get_all_users_by_type/celular", function (data, status) {
            if(data.Error == undefined && data.length != 0){
                try {
                      if(table_dt != undefined){
                      table_dt.fnClearTable();
                        table_dt.fnDestroy();
                      }
                      table_dt = $('#example').dataTable( {
                            "data": data,
                            "columns": [
                                { "data": "nombre", "title": "Nombre" },
                                { "data": "rut", "title": "Rut"  },
                                { "data": "tel" , "title": "Teléfono" },
                                { "data": "estado" , "title": "Estado" },
                                { "data": "habilitado", "title": "Habilitado"  },
                                { "data": "marca" , "title": "Marca" },
                                { "data": "equipo" , "title": "Equipo" },
                                { "data": "empresa", "title": "Empresa"  },
                                { "data": "firestore_id", "title": "id"  }
                            ]
                        } );
                      $('#example tbody').on('click', ' tr', function () {
                          var nombre = this.children[0].textContent;
                          var rut = this.children[1].textContent;
                          var tel = this.children[2].textContent;
                          var estado = this.children[3].textContent;
                          var habilitado = this.children[4].textContent;
                          var marca = this.children[5].textContent;
                          var equipo = this.children[6].textContent;
                          var empresa = this.children[7].textContent;
                          var firebase_id = this.children[8].textContent;
                          document.getElementById("nombre").value = nombre;
                          document.getElementById("rut").value = rut;
                          document.getElementById("telefono").value = tel;
                          document.getElementById("estado").value = estado;
                          if(habilitado == "si")
                          {document.getElementById("habilitado").checked = true;}
                          else{document.getElementById("habilitado").checked = false;}
                          document.getElementById("marca").value = marca;
                          document.getElementById("equipo").value = equipo;
                          document.getElementById("empresa").value = empresa;
                          document.getElementById("db_id").value = firebase_id;

                          $("#modify_fields").show();

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
});