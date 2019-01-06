(function ($) {

	"use strict";

  [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
    new SelectFx(el);
  } );

  jQuery('.selectpicker').selectpicker;

  $('#input-search-by-phone').focus();

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

  $('.ui.dropdown')
  .dropdown({
    allowAdditions: true,
    forceSelection: false,
    fullTextSearch: true
  });
  
  var phone_table = {};
  var table_row = {};

  var prev_tr;
  var next_tr

  var part_no_selected = [];
  var phone_selected = [];

  var part_no_string;
  var phone_string;


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

	
	$('#exampleModalCenter').keydown(function (e) {
 		var key = e.which;
 		if(key == 37)  // the left key code
  		{
        $('#prev').click();    		
        return false;  
  		}
      else if(key == 39)  // the right key code
      {
        $('#next').click();
        return false;  
      }
	});   

  $('#edit-search-phone').keydown(function (e) {
    var key = e.which;
    if(key == 37)  // the left key code
      {
        $('#prev-edit').click();       
        return false;  
      }
    else if(key == 39)  // the right key code
      {
        $('#next-edit').click();
        return false;  
      }
  });   
  

  // $('.edit-form').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#save-button').click();
  //       return false;  
  //     }
  // });

	function getPhoneDetails(){

    $('#loading_gif').show();
    $('#phone-table-div').hide();

      sql.connect(dbConfig, err => {
            // ... error checks
            if (err) {
                console.log(err);
                return;
            }

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
        FROM [` + ac_details.ac_db + `].[dbo].[` + ac_details.ac_table + `] a
        LEFT JOIN [` + control_details.control_db + `].[dbo].[` + control_details.section_table + `] b
        ON a.` + ac_details.ac_no + ` = b.` + sec_details.ac_no + ` AND a.` + ac_details.part_no + ` = b.` + sec_details.part_no + ` 
        AND a.` + ac_details.section_no + ` = b.` + sec_details.section_no + `
        LEFT JOIN [` + control_details.control_db + `].[dbo].[` + control_details.booth_table + `] c 
        ON a.` + ac_details.ac_no + ` = c.` + control_details.ac_no + ` AND a.` + ac_details.part_no + ` = c.` + control_details.psbuilding_no + `
        WHERE a.`+ac_details.mobile_no+` IS NOT NULL AND a.`+ac_details.mobile_no+` <> ''`;

                    console.log(query)

          new sql.Request().query(query, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#phone-table-div').show();

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

              phone_table = $('#bootstrap-data-table').DataTable();
              phone_table.columns.adjust().draw();

              getPhoneDataForFilter();

              $('body').addClass('open');
      });
    });    

	};

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
        INNER JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.section_no+` = `+person_section_no+` AND a.`+ac_details.house_no_en+` = '`+person_house_no+`' AND a.`+ac_details.house_no_en+` <> '' AND a.`+ac_details.part_no+` = `+person_part_no;
         
          // Use the connection
            request.query(query, (err, result) => {
          // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#phone-table-div').show();

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

              phone_table = $('#bootstrap-data-table').DataTable();
              phone_table.columns.adjust().draw();

      });

  }

  getPhoneDetails();

  $('#search-by-phone-button').click(function(){
    
    var min_filter_for_query = 0;
    var filter_flag = 1;

    update_filters();

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
        ,trim(a.` + ac_details.house_no_en + `) + case when a.` + ac_details.house_no_en + ` = '' then '' else ', ' end + trim(b.` + sec_details.section_name + `) +', '+ trim(b.` + sec_details.pin_code + `) as address
        ,trim(c.` + control_details.ps_building_name_en + `) as booth
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
        WHERE 1=1 AND a.`+ac_details.mobile_no+` IS NOT NULL AND a.`+ac_details.mobile_no+` <> ''`;


        if(part_no_string != '' && !part_no_string.includes('all')){
          query += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
          min_filter_for_query += 1;
        }

        if(phone_string != '' && !phone_string.includes('all')){
          query += ` AND a.`+ac_details.mobile_no+` IN ('`+phone_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        console.log(query)

    if(min_filter_for_query >= 1 || filter_flag == 1){
      
      $('#phone-table-div').hide();
      $('#loading_gif').show();

      const request = pool.request();
             
          // Use the connection
            request.query(query, (err, result) => {
        // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#phone-table-div').show();

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

              phone_table = $('#bootstrap-data-table').DataTable();
              phone_table.columns.adjust().draw();

      });
    }

    else{
      window.alert("Please select more options. Data too large to display")
    }

  });

  $('#closemodal1').click(function(){
    $('#exampleModalCenter').hide();
  })

  $('#closemodal2').click(function(){
    $('#exampleModalCenter').hide();
  })


  $('#phone-table-content').on('dblclick','tr',function(){
    if(phone_table.row($(this).prev()).data()){
      $('#prev').show();
    }
    else{
       $('#prev').hide();
    }
    if(phone_table.row($(this).next()).data()){
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

  $('#modal-drag-phonewise').draggable({
    handle: ".modal-header"
  });

    console.log(phone_table.row(this).data());
    table_row = phone_table.row(this).data();
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
    prev_tr=$(this).prev();
    next_tr=$(this).next();  
  });

  $('#family-btn-phonewise').click(function(){
    $('#closemodal1').click();
    $('#phone-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getFamilyDetailsForPerson();
  });

  $('#back-btn').click(function(){
    if($('#bootstrap-data-table').is(':visible'))
    {
      $('#search-by-phone-button').click();
      $('#phone-table-div').hide();
      $('#loading_gif').show();
      $('#back-btn').hide();
    }
  });

  $('#print-id').click(function(){
    var divToPrint=document.getElementById("bootstrap-data-table");
    newWin= window.open("");
    newWin.document.write(divToPrint.outerHTML);
    newWin.print();
    newWin.close();
  });

  $('#edit-button').click(function(){
    $('#exampleModalCenter').hide();
    $('#edit-search-phone').show();
    $('#edit-search-phone').modal({
    backdrop: false,
    show: true
  });
    $('#edit-ac-no').attr('placeholder',table_row["ac_no"]);
    $('#edit-part-no').attr('placeholder',table_row["part_no"]);
    $('#edit-serial-no').attr('placeholder',table_row["serial_no"]);
    $('#edit-surname').attr('placeholder',table_row["surname"]);
    $('#edit-first-name').attr('placeholder',table_row["first_name"]);
    $('#edit-middle-name').attr('placeholder',table_row["middle_name"]);
    $('#edit-sex').attr('placeholder',table_row["sex"]);
    $('#edit-age').attr('placeholder',table_row["age"]);
    $('#edit-dob').attr('placeholder',table_row["dob"]);
    $('#edit-id-card-no').attr('placeholder',table_row["card_no"]);
    $('#edit-section-no').attr('placeholder',table_row["section_no"]);
    $('#edit-house-no').attr('placeholder',table_row["house_no"]);
    $('#edit-mobile-no').attr('placeholder',table_row["mobile_no"]);
  })

  $('#save-button').click(function(){
    var new_values = [];

    $('#edit-form').find('input').each(function () {
    //console.log($(this).attr('placeholder')); // "this" is the current element in the loop
    if($(this).val() == ''){
      new_values.push($(this).attr('placeholder'));
    }
    else{
      new_values.push($(this).val());
    }

});

    if(new_values[3].toString().search("'")!=-1)
      {
        new_values[3]=new_values[3].substring(0,new_values[3].search("'")) + "'" + new_values[3].substring(new_values[3].search("'"),new_values[3].length);
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

            window.alert('Details updated for ID '+new_values[9])

          });

    // if($('#edit-middle-name').text() == '')
    // {
    //   console.log($('#edit-middle-name').attr('placeholder'));
    // }
    // else{
    //   console.log($('#edit-middle-name').text());
    // }
  })

  $('#prev').click(function(){

    if(phone_table.row(prev_tr).data()){

    $('#next').show();

    table_row = phone_table.row(prev_tr).data();
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
    
    next_tr=prev_tr.next();
    prev_tr=prev_tr.prev();
  }
  else{
      $('#prev').hide();    
  }
  })

  $('#next').click(function(){

    if(phone_table.row(next_tr).data()){
 
    $('#prev').show();

    table_row = phone_table.row(next_tr).data();
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
    prev_tr=next_tr.prev();
    next_tr=next_tr.next();
  }
  else{
    $('#next').hide();
  }
  })

  $('#prev-edit').click(function(){
    if(phone_table.row(prev_tr).data()){
    $('#next-edit').show();
    table_row = phone_table.row(prev_tr).data();
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
    next_tr=prev_tr.next();
    prev_tr=prev_tr.prev();
  }
    else{
    $('#prev-edit').hide();
  }
  })

  $('#next-edit').click(function(){
    if(phone_table.row(next_tr).data()){
    $('#prev-edit').show();
    table_row = phone_table.row(next_tr).data();
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
    prev_tr=next_tr.prev();
    next_tr=next_tr.next();    
  }
    else{
    $('#next-edit').hide();
  }
  })

  function check_numeric(inputtxt)
{
 if(inputtxt.match(/^[0-9\s]*$/) && inputtxt != '') 
  {
   return true;
  }
  else
  { 
   return false; 
  }
  }

  function getPhoneDataForFilter() {

        sql.close();

        update_filters();

        sql.connect(dbConfig, err => {
            // ... error checks
            if (err) {
                window.alert(err);
                console.log(err);
                return;
            }

        var query1 = `SELECT distinct a.`+ac_details.part_no+` as part_no
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        ORDER BY 1`;

        console.log(query1)
             
          // Use the connection
        new sql.Request().query(query1, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';
            t+='<div class="item">';
                t+='ALL'
                t+='</div>';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["part_no"];
                t+='</div>';
              }

            $('#search-part-no').html(t);
      });
      

      if(part_no_string != '' && !part_no_string.includes('all')){


        var query2 = `SELECT distinct a.` + ac_details.mobile_no + ` as phone_no
          FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
          WHERE 1=1`;


          if(part_no_string != '' && !part_no_string.includes('all')){
            query2 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
          }

          query2 += ` ORDER BY 1`;

          console.log(query2)
               
            // Use the connection
          new sql.Request().query(query2, (err, result) => {
          // ... error checks
              if (err) {
                  console.log("An error occurred performing the query.");
                  window.alert(err);
                  console.log(err);
                  return;
              }

              var t='';
              t+='<div class="item">';
                  t+='ALL'
                  t+='</div>';

              for(var i=0;i<result["recordset"].length;i++){
                  t+='<div class="item">';
                  t+=result["recordset"][i]["phone_no"];
                  t+='</div>';
                }

              $('#search-phone').html(t);
        });
      }
      else if(part_no_string.includes('all'))
      {
        $('#search-phone').html('');
      }
    });
  };


  $('#clear-options')
  .on('click', function() {
    $('.ui.dropdown')
      .dropdown('restore defaults')
    ;
  });


  $('#search-part-no-dropdown').on("click", function() {

    if(part_no_string == 'all'){
      $('.ui.dropdown #search-part-no-dropdown')
      .dropdown('restore defaults');
    }

    part_no_selected = $('#search-part-no-dropdown').dropdown('get value');
    console.log(part_no_selected);
    getPhoneDataForFilter();

  });

  $('#search-phone-dropdown').on("click", function() {
    
    if(phone_string == 'all'){
      $('.ui.dropdown #search-phone-dropdown')
      .dropdown('restore defaults');
    }

    phone_selected = $('#search-phone-dropdown').dropdown('get value');
    console.log(phone_selected);
    getPhoneDataForFilter();

  });

  function update_filters(){
        
        part_no_selected = $('#search-part-no-dropdown').dropdown('get value');

        var phone_selected = [];
        $('#search-phone-dropdown').find('a').each(function() {
          phone_selected.push($(this).attr('data-value'));
        });

        part_no_string = part_no_selected.toString();
        phone_string = phone_selected.join("','");
  }

})(jQuery);
