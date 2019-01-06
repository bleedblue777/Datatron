(function ($) {

  "use strict";

  [].slice.call( document.querySelectorAll( 'select.cs-select' ) ).forEach( function(el) {
    new SelectFx(el);
  } );

  jQuery('.selectpicker').selectpicker;

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

  var custom_array = 0;
  var custom_table = {};
  var table_row = {};
  var selected = [];

  var prev_tr;
  var next_tr;

  var ac_no_selected = [];
  var part_no_selected = [];
  var section_no_selected = [];
  var booth_no_selected = [];
  var booth_selected = [];
  var surname_selected = [];
  var address_selected = [];
  var age_selected = [];
  var dob_selected = [];
  var status_type_selected = [];

  var ac_no_string;
  var part_no_string;
  var section_no_string;
  var booth_no_string;
  var booth_string;
  var surname_string;
  var address_string;
  var age_string;
  var dob_string;
  var status_type_string;

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

    $('#edit-search-custom').keydown(function(e) {
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

  $('#custom-search-button').click(function(){
    
    var min_filter_for_query = 0;
    var filter_flag = 0;

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
        ,isnull(trim(a.` + ac_details.house_no_en + `),'') + case when isnull(trim(a.` + ac_details.house_no_en + `),'') = '' then '' else ', ' end + isnull(trim(b.` + sec_details.section_name + `),'') +', '+ isnull(trim(b.` + sec_details.pin_code + `),'') as address
        ,trim(c.` + control_details.ps_building_name_en + `) as booth
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
        WHERE 1=1`;

    if(ac_no_string != ''){
          query += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
          min_filter_for_query += 1;
    }

        if(part_no_string != '' || booth_no_string != ''){
          query += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
          min_filter_for_query += 1;
        }

        if(section_no_string != ''){
          query += ` AND a.`+ac_details.section_no+` IN (`+section_no_string+`)`;
          min_filter_for_query += 1;
        }

        if(booth_no_string != ''){
          query += ` AND c.`+control_details.psbuilding_no+` IN (`+booth_no_string+`)`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        if(booth_string != ''){
          query += ` AND c.`+control_details.ps_building_name_en+` IN ('`+booth_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        if(surname_string != ''){
          query += ` AND a.`+ac_details.last_name_en+` IN ('`+surname_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        if(address_string != ''){
          query += ` AND b.`+sec_details.address+` IN ('`+address_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1
        }

        if(age_string != ''){
          query += ` AND a.`+ac_details.age+` IN (`+age_string+`)`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        if(dob_string != ''){
          query += ` AND a.`+ac_details.dob+` IN ('`+dob_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        if(status_type_string != ''){
          query += ` AND b.`+ac_details.status_type+` IN ('`+status_type_string+`')`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        console.log(query)

    if(min_filter_for_query <= 8 || filter_flag == 1){
      
      $('#custom-table-div').hide();
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

              $('#custom-table-div').show();

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

              custom_table = $('#bootstrap-data-table').DataTable();
              custom_table.columns.adjust().draw();

              $('body').addClass('open');
      });
    }

    else{
      window.alert("Please select more options. Data too large to display")
    }

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

              $('#custom-table-div').show();

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

              custom_table = $('#bootstrap-data-table').DataTable();
              custom_table.columns.adjust().draw();

      });

  }


  $('#custom-search-table-content').on('dblclick','tr',function(){
    if(custom_table.row($(this).prev()).data()){
      $('#prev').show();
    }
    else{
       $('#prev').hide();
    }
    if(custom_table.row($(this).next()).data()){
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

        $('#modal-drag-customwise').draggable({
            handle: ".modal-header"
        });

    console.log(custom_table.row(this).data());
    table_row = custom_table.row(this).data();
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
    $('#custom-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getFamilyDetailsForPerson();
  });

  $('#back-btn').click(function(){
    if($('#bootstrap-data-table').is(':visible'))
    {
      $('#custom-search-button').click();
      $('#custom-table-div').hide();
      $('#loading_gif').show();
      $('#back-btn').hide();
    }
  });

  $('#prev').click(function() {

        if (custom_table.row(prev_tr).data()) {

            $('#next').show();

            table_row = custom_table.row(prev_tr).data();
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

        if (custom_table.row(next_tr).data()) {

            $('#prev').show();

            table_row = custom_table.row(next_tr).data();
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
        if (custom_table.row(prev_tr).data()) {
            $('#next-edit').show();
            table_row = custom_table.row(prev_tr).data();
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
        if (custom_table.row(next_tr).data()) {
            $('#prev-edit').show();
            table_row = custom_table.row(next_tr).data();
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
        $('#edit-search-custom').modal('show');
        $('#edit-search-custom').modal({
            backdrop: false,
            show: true
        });
        $('#edit-search-custom').draggable({
            handle: ".modal-header"
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

  function getCustomDataForFilter() {

        sql.close();

        update_filters();

        sql.connect(dbConfig, err => {
            // ... error checks
            if (err) {
                window.alert(err);
                console.log(err);
                return;
            }

        var query1 = `SELECT distinct a.`+ac_details.ac_no+` as ac_no
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        ORDER BY 1`;
             
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

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["ac_no"];
                t+='</div>';
              }

            $('#search-ac-no').html(t);
      });

        var query2 = `SELECT distinct a.`+ac_details.part_no+` as part_no
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        WHERE 1=1`;

        if(ac_no_string != ''){
          query2 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }
        query2 += ` ORDER BY 1`;
             
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

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["part_no"];
                t+='</div>';
              }

            $('#search-part-no').html(t);
      });

        var query3 = `SELECT distinct a.`+ac_details.section_no+` as section_no
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        WHERE 1=1`;

        if(ac_no_string != ''){
          query3 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != ''){
          query3 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
        }

        query3 += ` ORDER BY 1`;

          // Use the connection
        new sql.Request().query(query3, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["section_no"];
                t+='</div>';
              }

            $('#search-section-no').html(t);
      });

      var query4 = `SELECT distinct b.`+control_details.psbuilding_no+` as booth_no
        FROM [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] b
        WHERE 1=1`;

        if(ac_no_string != ''){
          query4 += ` AND b.`+control_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        query4 += ` ORDER BY 1`;

             
          // Use the connection
        new sql.Request().query(query4, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["booth_no"];
                t+='</div>';
              }

            $('#search-booth-no').html(t);
      });

      var query5 = `SELECT distinct top 1000 b.`+control_details.ps_building_name_en+` as booth
        FROM [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] b
        WHERE 1=1`;

        if(ac_no_string != ''){
          query5 += ` AND b.`+control_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query5 += ` AND b.`+control_details.psbuilding_no+` IN (`+part_no_string+`)`;
        }

        query5 += ` ORDER BY 1`;

        console.log(query5)

             
          // Use the connection
        new sql.Request().query(query5, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["booth"];
                t+='</div>';
              }

            $('#search-booth').html(t);
      });

       var query6 = `SELECT distinct top 1000 trim(a.`+ac_details.last_name_en+`) as surname
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
        WHERE 1=1`;

        if(ac_no_string != ''){
          query6 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query6 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
        }

        if(section_no_string != ''){
          query6 += ` AND a.`+ac_details.section_no+` IN (`+section_no_string+`)`;
        }

        if(booth_string != ''){
          query6 += ` AND c.`+control_details.ps_building_name_en+` IN ('`+booth_string+`')`;
        }

        if(address_string != ''){
          query6 += ` AND b.`+sec_details.section_name+` IN ('`+address_string+`')`;
        }

        if(age_string != ''){
          query6 += ` AND a.`+control_details.age+` IN (`+age_string+`)`;
        }

        query6 += ` ORDER BY 1`;

             
          // Use the connection
        new sql.Request().query(query6, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["surname"];
                t+='</div>';
              }

            $('#search-surname').html(t);
      });

      var query7 = `SELECT distinct top 1000 trim(b.`+sec_details.section_name+`) as address
        FROM [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        WHERE 1=1`;

        if(ac_no_string != ''){
          query7 += ` AND b.`+sec_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query7 += ` AND b.`+sec_details.part_no+` IN (`+part_no_string+`)`;
        }

        if(section_no_string != ''){
          query7 += ` AND b.`+sec_details.section_no+` IN (`+section_no_string+`)`;
        }

        // if(booth_string != ''){
        //   query7 += ` AND c.`+control_details.ps_building_name_en+` IN (`+booth_string+`)`;
        // }

        // if(age_string != ''){
        //   query7 += ` AND a.`+control_details.age+` IN (`+age_string+`)`;
        // }

        // query7 += ` ORDER BY 1`;

             
          // Use the connection
        new sql.Request().query(query7, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["address"];
                t+='</div>';
              }

            $('#search-address').html(t);
      });

      var query8 = `SELECT distinct a.`+ac_details.age+` as age
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        WHERE 1=1`;

        if(ac_no_string != ''){
          query8 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query8 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
        }

        if(section_no_string != ''){
          query8 += ` AND a.`+ac_details.section_no+` IN (`+section_no_string+`)`;
        }

        query8 += ` ORDER BY 1`;
             
          // Use the connection
        new sql.Request().query(query8, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["age"];
                t+='</div>';
              }

            $('#search-age').html(t);
      });

      var query9 = `SELECT distinct top 1000 a.`+ac_details.dob+` as dob
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        WHERE 1=1`;

        if(ac_no_string != ''){
          query9 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query9 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
        }

        if(section_no_string != ''){
          query9 += ` AND a.`+ac_details.section_no+` IN (`+section_no_string+`)`;
        }

        query9 += ` ORDER BY 1`;
             
          // Use the connection
        new sql.Request().query(query9, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["dob"];
                t+='</div>';
              }

            $('#search-dob').html(t);
      });

      var query10 = `SELECT distinct a.`+ac_details.status_type+` as status_type
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        WHERE 1=1`;

        if(ac_no_string != ''){
          query10 += ` AND a.`+ac_details.ac_no+` IN (`+ac_no_string+`)`;
        }

        if(part_no_string != '' || booth_no_string != ''){
          query10 += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
        }

        if(section_no_string != ''){
          query10 += ` AND a.`+ac_details.section_no+` IN (`+section_no_string+`)`;
        }

        query10 += ` ORDER BY 1`;
             
          // Use the connection
        new sql.Request().query(query10, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            var t='';

            for(var i=0;i<result["recordset"].length;i++){
                t+='<div class="item">';
                t+=result["recordset"][i]["status_type"];
                t+='</div>';
              }

            $('#search-status-type').html(t);
      });


    });
  };

  getCustomDataForFilter();

  $('#clear-options')
  .on('click', function() {
    $('.ui.dropdown')
      .dropdown('restore defaults')
    ;
  });

  $('#search-ac-no').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-ac-no-dropdown').on("click", function() {

    ac_no_selected = $('#search-ac-no-dropdown').dropdown('get value');
    console.log(ac_no_selected);
    getCustomDataForFilter();

  });

  $('#search-part-no').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-part-no-dropdown').on("click", function() {

    part_no_selected = $('#search-part-no-dropdown').dropdown('get value');
    booth_no_selected = part_no_selected;
    console.log(part_no_selected);
    getCustomDataForFilter();

  });

  $('#search-section-no').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-section-no-dropdown').on("click", function() {

    section_no_selected = $('#search-section-no-dropdown').dropdown('get value');
    console.log(section_no_selected);
    getCustomDataForFilter();

  });

  $('#search-booth-no').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-booth-no-dropdown').on("click", function() {

    booth_no_selected = $('#search-booth-no-dropdown').dropdown('get value');
    part_no_selected = booth_no_selected;
    console.log(booth_no_selected);
    getCustomDataForFilter();

  });

  $('#search-booth').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-booth-dropdown').on("click", function() {

    var sel = [];
    $('#search-booth-dropdown').find('a').each(function() {
      sel.push($(this).attr('data-value'));
    });

    booth_selected = sel;

    console.log(booth_selected);
    getCustomDataForFilter();

  });

  $('#search-surname').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-surname-dropdown').on("click", function() {

    var sel = [];
    $('#search-surname-dropdown').find('a').each(function() {
      sel.push($(this).attr('data-value'));
    });

    surname_selected = sel;

    console.log(surname_selected);
    getCustomDataForFilter();

  });

  $('#search-address').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-address-dropdown').on("click", function() {

    var sel = [];
    $('#search-address-dropdown').find('a').each(function() {
      sel.push($(this).attr('data-value'));
    });

    address_selected = sel;

    console.log(address_selected);
    getCustomDataForFilter();

  });


  $('#search-age').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-age-dropdown').on("click", function() {

    age_selected = $('#search-age-dropdown').dropdown('get value');
    console.log(age_selected);
    getCustomDataForFilter();

  });

  $('#search-dob').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-dob-dropdown').on("click", function() {

    var sel = [];
    $('#search-dob-dropdown').find('a').each(function() {
      sel.push($(this).attr('data-value'));
    });

    dob_selected = sel;

    console.log(dob_selected);
    getCustomDataForFilter();

  });

  $('#search-status-type').on("click", function() {

    getCustomDataForFilter();

  });

  $('#search-status-type-dropdown').on("click", function() {

    var sel = [];
    $('#search-status-type-dropdown').find('a').each(function() {
      sel.push($(this).attr('data-value'));
    });

    status_type_selected = sel;

    console.log(status_type_selected);
    getCustomDataForFilter();

  });

  // $('#search-ac-no-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-ac-no-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-part-no-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-part-no-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-section-no-no-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-section-no-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-booth-no-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-booth-no-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-booth-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-booth-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-surname-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-surname-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-address-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-address-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-age-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-age-dropdown').click();
  //       return false;  
  //     }
  // });   

  // $('#search-dob-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-dob-dropdown').click();
  //       return false;  
  //     }
  // });

  // $('#search-status-type-dropdown').keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       $('#search-status-type-dropdown').click();
  //       return false;  
  //     }
  // });      

  // $(document).keypress(function (e) {
  //   var key = e.which;
  //   if(key == 13)  // the enter key code
  //     {
  //       getCustomDataForFilter();
  //       console.log("jek");
  //       return false;  
  //     }
  // });      

  function update_filters(){
        
        ac_no_selected = $('#search-ac-no-dropdown').dropdown('get value');

        if($('#search-booth-no-dropdown').dropdown('get value') == ''){
          part_no_selected = $('#search-part-no-dropdown').dropdown('get value');
          booth_no_selected = part_no_selected;
        }

        section_no_selected = $('#search-section-no-dropdown').dropdown('get value');

        if($('#search-part-no-dropdown').dropdown('get value') == ''){
          booth_no_selected = $('#search-booth-no-dropdown').dropdown('get value');
          part_no_selected = booth_no_selected;
        }

        booth_selected = [];
        $('#search-booth-dropdown').find('a').each(function() {
          booth_selected.push($(this).attr('data-value'));
        });

        address_selected = [];
        $('#search-address-dropdown').find('a').each(function() {
          address_selected.push($(this).attr('data-value'));
        });

        surname_selected = [];
        $('#search-surname-dropdown').find('a').each(function() {
          surname_selected.push($(this).attr('data-value'));
        });

        age_selected = $('#search-age-dropdown').dropdown('get value');

        var dob_selected = [];
        $('#search-dob-dropdown').find('a').each(function() {
          dob_selected.push($(this).attr('data-value'));
        });

        var status_type_selected = [];
        $('#search-status-type-dropdown').find('a').each(function() {
          status_type_selected.push($(this).attr('data-value'));
        });

        ac_no_string = ac_no_selected.toString();
        part_no_string = part_no_selected.toString();
        section_no_string = section_no_selected.toString();
        booth_no_string = booth_no_selected.toString();
        booth_string = booth_selected.join("','");
        surname_string = surname_selected.join("','");
        address_string = address_selected.join("','");
        age_string = age_selected.toString();
        dob_string = dob_selected.join("','");
        status_type_string = status_type_selected.join("','");

  }

})(jQuery);
