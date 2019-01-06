(function ($) {

	"use strict";

	[].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
    new SelectFx(el);
  } );

  jQuery('.selectpicker').selectpicker;

  $('#input-search-by-id').focus();

  $('#menuToggle').on('click', function(event) {
    $('body').toggleClass('open');
  });

  $('.search-trigger').on('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.search-trigger').parent('.header-left').addClass('open');
  });

  $('.search-close').on('click', function(event) {
    event.preventDefault();
    event.stopPropagation();
    $('.search-trigger').parent('.header-left').removeClass('open');
  });


	var id_array = 0;
  var id_table = {};
  var table_row = {};
  var selected = [];

  var prev_tr;
  var next_tr

	var sql = require("mssql/msnodesqlv8");

  var fs = require('fs');

  var dbconfig_json = '';

  try {
      dbconfig_json = JSON.parse(fs.readFileSync('./dbConfig.json', 'utf8'));
  } 
  catch(err) {
      window.alert(err);
  }
  
  var dbConfig = {
      driver: dbconfig_json.dbdriver,
      server: dbconfig_json.dbserver,
      database: dbconfig_json.dbdatabase,
      options: dbconfig_json.dboptions
  };

  var ac_details = dbconfig_json.ac_details;
  var control_details = dbconfig_json.control_details;
  var sec_details = dbconfig_json.sec_details;

  const pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);
      });

  $('#exampleModalCenter').keydown(function(e) {
        var key = e.which;
        if (key == 37) // the left key code
        {
            $('#prev').click();
            return false;
        }
        else if (key == 39) // the right key code
        {
            $('#next').click();
            return false;
        }
    });

    $('#edit-search-id').keydown(function(e) {
        var key = e.which;
        if (key == 37) // the left key code
        {
            $('#prev-edit').click();
            return false;
        }
        else if (key == 39) // the right key code
        {
            $('#next-edit').click();
            return false;
        }
    });

	$('#search-by-id-button').click(function(){
		
    var input_id = $('#input-search-by-id').val().trim();

    if(alphanumeric(input_id)){
      
      $('#ID-table-div').hide();
      $('#loading_gif').show();

		  const request = pool.request();

	       var query = `SELECT a.` + ac_details.ac_no + ` as ac_no
        ,a.` + ac_details.part_no + ` as part_no
        ,a.` + ac_details.serial_no + ` as serial_no
        ,isnull(trim(a.` + ac_details.first_name_en + `),'') +' '+ isnull(trim(a.` + ac_details.last_name_en + `),'') as name
        ,a.` + ac_details.age + ` as age
        ,a.` + ac_details.sex + ` as sex
        ,isnull(REVERSE(SUBSTRING(REVERSE(cast(a.` + ac_details.dob + ` as varchar)),CHARINDEX(' ',REVERSE(cast(a.` + ac_details.dob + ` as varchar))),len(cast(a.` + ac_details.dob + ` as varchar)))),'') as dob
        ,a.` + ac_details.id_card_no + ` as card_no
        ,a.` + ac_details.section_no + ` as section_no
        ,a.` + ac_details.house_no_en + ` as house_no
        ,a.` + ac_details.mobile_no + ` as mobile_no
        ,isnull(trim(a.` + ac_details.house_no_en + `),'') + case when isnull(trim(a.` + ac_details.house_no_en + `),'') = '' then '' else ', ' end + isnull(trim(b.` + sec_details.section_name + `),'') +', '+ isnull(trim(b.` + sec_details.pin_code + `),'') as address
        ,trim(c.` + control_details.ps_building_name_en + `) as booth
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
  		  WHERE a.`+ac_details.id_card_no+` like '%`+input_id+`%'`;
	           
	        // Use the connection
            request.query(query, (err, result) => {
        // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#ID-table-div').show();

	            // $('#table-div').html(makeTableHTML(recordset["recordset"]));
	            $('#bootstrap-data-table').DataTable().destroy();
	            $('#bootstrap-data-table').DataTable( {
        data: result["recordset"],
        order: [[1,"asc"],[2,"asc"]],
                    columns: [{
                        data: "ac_no"
                    }, {
                        data: "part_no"
                    }, {
                        data: "serial_no"
                    }, {
                        data: "name"
                    }, {
                        data: "age"
                    }, {
                        data: "sex"
                    }, {
                        data: "dob"
                    }, {
                        data: "card_no"
                    }, {
                        data: "section_no"
                    }, {
                        data: "house_no"
                    }, {
                        data: "mobile_no"
                    }, {
                        data: "address"
                    }, {
                        data: "booth"
                    }],
                    columnDefs: [
                    {
                        "targets": [ 0 ],
                        "visible": false
                    },
                    {
                        "targets": [ 8 ],
                        "visible": false
                    },
                    {
                        "targets": [ 9 ],
                        "visible": false
                    }
                ],
                    scrollX: true,
                    scrollY: "390px",
                dom: 'lBfrtip',
                buttons: [{
                        extend: 'excelHtml5',
                        title: 'AgeWise Report',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'pdfHtml5',
                        title: 'AgeWise Report',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    'print',
                    {
                        extend: 'colvis',
                        text: 'Change Columns'
                    }
                ]
    } );

	            $('#loading_gif').hide();

              id_table = $('#bootstrap-data-table').DataTable();
              id_table.columns.adjust().draw();

              $('body').addClass('open');

	    });
    };

	});

   function getFamilyDetailsForPerson() {

     // create Request object
          var person_section_no = table_row.section_no;
          var person_house_no = table_row.house_no;
          var person_part_no = table_row.part_no;

          const request = pool.request();

        var query = `SELECT a.` + ac_details.ac_no + ` as ac_no
        ,a.` + ac_details.part_no + ` as part_no
        ,a.` + ac_details.serial_no + ` as serial_no
        ,isnull(trim(a.` + ac_details.first_name_en + `),'') +' '+ isnull(trim(a.` + ac_details.last_name_en + `),'') as name
        ,a.` + ac_details.age + ` as age
        ,a.` + ac_details.sex + ` as sex
        ,isnull(REVERSE(SUBSTRING(REVERSE(cast(a.` + ac_details.dob + ` as varchar)),CHARINDEX(' ',REVERSE(cast(a.` + ac_details.dob + ` as varchar))),len(cast(a.` + ac_details.dob + ` as varchar)))),'') as dob
        ,a.` + ac_details.id_card_no + ` as card_no
        ,a.` + ac_details.section_no + ` as section_no
        ,a.` + ac_details.house_no_en + ` as house_no
        ,a.` + ac_details.mobile_no + ` as mobile_no
        ,isnull(trim(a.` + ac_details.house_no_en + `),'') + case when isnull(trim(a.` + ac_details.house_no_en + `),'') = '' then '' else ', ' end + isnull(trim(b.` + sec_details.section_name + `),'') +', '+ isnull(trim(b.` + sec_details.pin_code + `),'') as address
        ,trim(c.` + control_details.ps_building_name_en + `) as booth
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
        WHERE a.`+ac_details.section_no+` = `+person_section_no+` AND a.`+ac_details.house_no_en+` = '`+person_house_no+`' AND a.`+ac_details.house_no_en+` <> '' AND a.`+ac_details.part_no+` = `+person_part_no;

          // Use the connection
            request.query(query, (err, result) => {
          // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#ID-table-div').show();

              // $('#table-div').html(makeTableHTML(recordset["recordset"]));
              $('#bootstrap-data-table').DataTable().destroy();
              $('#bootstrap-data-table').DataTable( {
        data: result["recordset"],
        order: [[1,"asc"],[2,"asc"]],
                    columns: [{
                        data: "ac_no"
                    }, {
                        data: "part_no"
                    }, {
                        data: "serial_no"
                    }, {
                        data: "name"
                    }, {
                        data: "age"
                    }, {
                        data: "sex"
                    }, {
                        data: "dob"
                    }, {
                        data: "card_no"
                    }, {
                        data: "section_no"
                    }, {
                        data: "house_no"
                    }, {
                        data: "mobile_no"
                    }, {
                        data: "address"
                    }, {
                        data: "booth"
                    }],
                    columnDefs: [
                    {
                        "targets": [ 0 ],
                        "visible": false
                    },
                    {
                        "targets": [ 8 ],
                        "visible": false
                    },
                    {
                        "targets": [ 9 ],
                        "visible": false
                    }
                ],
                    scrollX: true,
                    scrollY: "390px",
                dom: 'lBfrtip',
                buttons: [{
                        extend: 'excelHtml5',
                        title: 'AgeWise Report',
                        exportOptions: {
                            columns: ':visible'
                        }
                    }, {
                        extend: 'pdfHtml5',
                        title: 'AgeWise Report',
                        exportOptions: {
                            columns: ':visible'
                        }
                    },
                    'print',
                    {
                        extend: 'colvis',
                        text: 'Change Columns'
                    }
                ]
    } );
              
              $('#loading_gif').hide();

              id_table = $('#bootstrap-data-table').DataTable();
              id_table.columns.adjust().draw();

      });

  }

  $('.form-group').keypress(function (e) {
    var key = e.which;
    if(key == 13)  // the enter key code
      {
        $('#search-by-id-button').click();
        return false;  
      }
  });   

  $('#closemodal1').click(function(){
    $('#exampleModalCenter').hide();
  })

  $('#closemodal2').click(function(){
    $('#exampleModalCenter').hide();
  })

  // $('#bootstrap-data-table').dblclick(function(){
  //   $('#exampleModalCenter').show();
  //   $('#exampleModalCenter').modal({
  //   backdrop: false,
  //   show: true
  // });
  // })

  // $('.modal-dialog modal-dialog-centered').draggable({
  //   handle: ".modal-header"
  // });

  $('#id-table-content').on('dblclick','tr',function(){
    if(id_table.row($(this).prev()).data()){
      $('#prev').show();
    }
    else{
       $('#prev').hide();
    }
    if(id_table.row($(this).next()).data()){
      $('#next').show();
    }
    else{
       $('#next').hide();
    }

     $('#exampleModalCenter').show();
        $('#exampleModalCenter').modal({
            backdrop: false,
            show: true
        });

        $('.modal-dialog').draggable({
            handle: ".modal-header"
        });

    console.log(id_table.row(this).data());
    table_row = id_table.row(this).data();
    var t = '<tbody>';
    var keys = Object.keys(table_row);

   var loop_array1 = [6, 1, 3];
        var loop_array2 = [1,2,4,5,6,7,3,10,11,12]
        var i = 0;
        var j = 0;

        for (var i = 0; i < loop_array1.length; i++) {
            t += '<tr>';

            for (var k = 0; k < loop_array1[i]; k++,j++) {

                if(j<6){
                    t += '<th style="width=16%">';
                }
                
                else{
                    t += '<th>';
                }
                t += keys[loop_array2[j]];
                t += '</th>';

                var key = keys[loop_array2[j]];

                if(j==6){
                    t += '<td colspan="11">';
                }
                else if(j==7){
                    t += '<td colspan="1">';
                }
                else if(j==8){
                    t += '<td colspan="6">';
                }
                else if(j==9){
                    t += '<td colspan="2">';
                }
                else{
                    t += '<td>';
                }
                t += table_row[key];
                t += '</td>';
            }
            t += '</tr>';
        }
    t+='</tbody>'
    $('#modal-table-id').html(t);
    prev_tr = $(this).prev();
    next_tr = $(this).next();
  });

  $('#family-btn-idwise').click(function(){
    $('#closemodal1').click();
    $('#ID-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getFamilyDetailsForPerson();
  });

  $('#back-btn').click(function(){
    if($('#bootstrap-data-table').is(':visible'))
    {
      $('#search-by-id-button').click();
      $('#id-table-div').hide();
      $('#loading_gif').show();
      $('#back-btn').hide();
    }
  });

  $('#prev').click(function() {

        if (id_table.row(prev_tr).data()) {

            $('#next').show();

            table_row = id_table.row(prev_tr).data();
            console.log(table_row)
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            var loop_array1 = [6, 1, 3];
        var loop_array2 = [1,2,4,5,6,7,3,10,11,12]
        var i = 0;
        var j = 0;

        for (var i = 0; i < loop_array1.length; i++) {
            t += '<tr>';

            for (var k = 0; k < loop_array1[i]; k++,j++) {

                if(j<6){
                    t += '<th style="width=16%">';
                }
                
                else{
                    t += '<th>';
                }
                t += keys[loop_array2[j]];
                t += '</th>';

                var key = keys[loop_array2[j]];

                if(j==6){
                    t += '<td colspan="11">';
                }
                else if(j==7){
                    t += '<td colspan="1">';
                }
                else if(j==8){
                    t += '<td colspan="6">';
                }
                else if(j==9){
                    t += '<td colspan="2">';
                }
                else{
                    t += '<td>';
                }
                t += table_row[key];
                t += '</td>';
            }
            t += '</tr>';
        }

            t += '</tbody>'
            $('#modal-table-id').html(t);

            next_tr = prev_tr.next();
            prev_tr = prev_tr.prev();
        } else {
            $('#prev').hide();
        }
    })

    $('#next').click(function() {

        if (id_table.row(next_tr).data()) {

            $('#prev').show();

            table_row = id_table.row(next_tr).data();
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            var loop_array1 = [6, 1, 3];
        var loop_array2 = [1,2,4,5,6,7,3,10,11,12]
        var i = 0;
        var j = 0;

        for (var i = 0; i < loop_array1.length; i++) {
            t += '<tr>';

            for (var k = 0; k < loop_array1[i]; k++,j++) {

                if(j<6){
                    t += '<th style="width=16%">';
                }
                
                else{
                    t += '<th>';
                }
                t += keys[loop_array2[j]];
                t += '</th>';

                var key = keys[loop_array2[j]];

                if(j==6){
                    t += '<td colspan="11">';
                }
                else if(j==7){
                    t += '<td colspan="1">';
                }
                else if(j==8){
                    t += '<td colspan="6">';
                }
                else if(j==9){
                    t += '<td colspan="2">';
                }
                else{
                    t += '<td>';
                }
                t += table_row[key];
                t += '</td>';
            }
            t += '</tr>';
        }

            t += '</tbody>'
            $('#modal-table-id').html(t);
            prev_tr = next_tr.prev();
            next_tr = next_tr.next();
        } else {
            $('#next').hide();
        }
    })

    $('#prev-edit').click(function() {
        if (id_table.row(prev_tr).data()) {
            $('#next-edit').show();
            table_row = id_table.row(prev_tr).data();
            $('#edit-part-no').attr('placeholder', table_row["part_no"]);
            $('#edit-serial-no').attr('placeholder', table_row["serial_no"]);
            $('#edit-sex').attr('placeholder', table_row["sex"]);
            $('#edit-age').attr('placeholder', table_row["age"]);
            $('#edit-id-card-no').attr('placeholder', table_row["card_no"]);
            $('#edit-name').attr('placeholder', table_row["name"]);
            $('#edit-address').attr('placeholder', table_row["address"]);
            $('#edit-booth').attr('placeholder', table_row["booth"]);
            $('#edit-dob').attr('placeholder', table_row["dob"]);
            $('#edit-mobile-no').attr('placeholder', table_row["mobile_no"]);
            // $('#edit-anniversary-date').attr('placeholder', table_row["anniiversary_date"]);
            next_tr = prev_tr.next();
            prev_tr = prev_tr.prev();
        } else {
            $('#prev-edit').hide();
        }
    })

    $('#next-edit').click(function() {
        if (id_table.row(next_tr).data()) {
            $('#prev-edit').show();
            table_row = id_table.row(next_tr).data();
            $('#edit-part-no').attr('placeholder', table_row["part_no"]);
            $('#edit-serial-no').attr('placeholder', table_row["serial_no"]);
            $('#edit-sex').attr('placeholder', table_row["sex"]);
            $('#edit-age').attr('placeholder', table_row["age"]);
            $('#edit-id-card-no').attr('placeholder', table_row["card_no"]);
            $('#edit-name').attr('placeholder', table_row["name"]);
            $('#edit-address').attr('placeholder', table_row["address"]);
            $('#edit-booth').attr('placeholder', table_row["booth"]);
            $('#edit-dob').attr('placeholder', table_row["dob"]);
            $('#edit-mobile-no').attr('placeholder', table_row["mobile_no"]);
            // $('#edit-anniversary-date').attr('placeholder', table_row["anniiversary_date"]);
            prev_tr = next_tr.prev();
            next_tr = next_tr.next();
        } else {
            $('#next-edit').hide();
        }
    })

    $('#edit-button').click(function() {
        $('#exampleModalCenter').hide();
        $('#edit-search-id').show();
        $('#edit-search-id').modal({
            backdrop: false,
            show: true
        });
        $('#edit-part-no').attr('placeholder', table_row["part_no"]);
        $('#edit-serial-no').attr('placeholder', table_row["serial_no"]);
        $('#edit-sex').attr('placeholder', table_row["sex"]);
        $('#edit-age').attr('placeholder', table_row["age"]);
        $('#edit-id-card-no').attr('placeholder', table_row["card_no"]);
        $('#edit-name').attr('placeholder', table_row["name"]);
        $('#edit-address').attr('placeholder', table_row["address"]);
        $('#edit-booth').attr('placeholder', table_row["booth"]);
        $('#edit-dob').attr('placeholder', table_row["dob"]);
        $('#edit-mobile-no').attr('placeholder', table_row["mobile_no"]);
        // $('#edit-anniversary-date').attr('placeholder', table_row["anniiversary_date"]);
    })

    $('#save-button').click(function() {
        var new_values = [];

        $('#edit-form').find('input').each(function() {
            //console.log($(this).attr('placeholder')); // "this" is the current element in the loop
            if ($(this).val().trim() == '') {
                new_values.push($(this).attr('placeholder'));
            } else {
                new_values.push($(this).val().trim());
            }

        });

        if (new_values[3].toString().search("'") != -1) {
            new_values[3] = new_values[3].substring(0, new_values[3].search("'")) + "'" + new_values[3].substring(new_values[3].search("'"), new_values[3].length);
        }
        const request = pool.request();

        var query = `update [` + ac_details.ac_db + `].[dbo].[` + ac_details.ac_table + `]
                set ` + ac_details.dob + ` = '` + new_values[11] + `'
                ,` + ac_details.mobile_no + ` = '` + new_values[15] + `'
                where ` + ac_details.ac_no + ` = ` + new_values[0] + `
                and ` + ac_details.part_no + ` = ` + new_values[1] + `
                and ` + ac_details.serial_no + ` = ` + new_values[2];

        console.log(query)

        // Use the connection
        request.query(query, (err, result) => {
            // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                return;
            }

            window.alert('Details updated for ID ' + new_values[12])

        });

        // if($('#edit-middle-name').text() == '')
        // {
        //   console.log($('#edit-middle-name').attr('placeholder'));
        // }
        // else{
        //   console.log($('#edit-middle-name').text());
        // }
    })

  //Function to convert hex format to a rgb color
  function rgb2hex(orig){
   var rgb = orig.replace(/\s/g,'').match(/^rgba?\((\d+),(\d+),(\d+)/i);
    return (rgb && rgb.length === 4) ? "#" +
    ("0" + parseInt(rgb[1],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[2],10).toString(16)).slice(-2) +
    ("0" + parseInt(rgb[3],10).toString(16)).slice(-2) : orig;
  };

  $('#save-status-btn').click(function(){

    var green_selected_card_nos = '(';
    $('.green-status').each(function(){
      var status_table = id_table.row(this).data();
      green_selected_card_nos += "'"+status_table.card_no+"'";
      green_selected_card_nos += ','
    });

    green_selected_card_nos = green_selected_card_nos.replace(/,\s*$/, "");
    green_selected_card_nos += ')';
    console.log(green_selected_card_nos);

    if (green_selected_card_nos != '('){
      sql.close();
      sql.connect(dbConfig, function (err) {
      
          if (err) console.log(err);

          // create Request object

          var request = new sql.Request();
          var query = `UPDATE [dbo].[E_Details]
                SET voter_status = 1
                WHERE CardNo in `+green_selected_card_nos;
             
          // query to the database and get the records
          request.query(query, function (err, recordset) {
              
              if (err) console.log(err);
              window.alert(recordset.rowsAffected + " record(s) updated");

          });
        });
    }

    // else if($(this).hasClass('selected') && rgb2hex($(this).css('background-color')) == '#ff0000'){
    //   var status_table = id_table.row(this).data();
    //   sql.close();
    //   sql.connect(dbConfig, function (err) {
      
    //       if (err) console.log(err);

    //       // create Request object
    //       var person_card_no = status_table.CardNo;

    //       var request = new sql.Request();
    //       var query = `UPDATE [dbo].[E_Details] a 
    //             SET a.voter_status = 0
    //             WHERE a.CardNo = `+person_card_no;
             
    //       // query to the database and get the records
    //       request.query(query, function (err, recordset) {
              
    //           if (err) console.log(err);

    //           console.log(recordset.affectedRows + "record(s) updated");

    //       });
    //     });
    // }

    else
      console.log("No rows to update. Please select rows.");
    });

  // Function to check letters and numbers
function alphanumeric(inputtxt)
{
 if(inputtxt.match(/^[0-9a-zA-Z//]+$/)) 
  {
   return true;
  }
  else
  { 
   window.alert("Invalid Input. Please Enter Alphanumeric Characters Only"); 
   return false; 
  }
  }
  

})(jQuery);
