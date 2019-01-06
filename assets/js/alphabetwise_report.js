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

  var age_array = 0;
  var alphabet_table = {};
  var table_row = {};
  var selected = [];

  var prev_tr;
  var next_tr;

  var part_no_selected = [];
  var alphabet_selected = [];

  var part_no_string;
  var alphabet_string;

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

    $('#edit-search-alphabetwise').keydown(function(e) {
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

  $('#search-by-alphabet-button').click(function(){
    
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


        if(part_no_string != '' && !part_no_string.includes('all')){
          query += ` AND a.`+ac_details.part_no+` IN (`+part_no_string+`)`;
          min_filter_for_query += 1;
        }

        if(alphabet_string != '' && !alphabet_string.includes('all')){
          query += ` AND a.`+ac_details.first_name_en+` like '[`+alphabet_string+`]%'`;
          min_filter_for_query += 1;
          filter_flag = 1;
        }

        query += `ORDER BY name`;

        console.log(query)

    if(min_filter_for_query >= 1 || filter_flag == 1){
      
      $('#alphabet-table-div').hide();
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

              $('#alphabet-table-div').show();

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

              alphabet_table = $('#bootstrap-data-table').DataTable();
              alphabet_table.columns.adjust().draw();

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

              $('#alphabet-table-div').show();

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

              alphabet_table = $('#bootstrap-data-table').DataTable();
              alphabet_table.columns.adjust().draw();

      });

  }


  $('#alphabet-search-table-content').on('dblclick','tr',function(){
    if(alphabet_table.row($(this).prev()).data()){
      $('#prev').show();
    }
    else{
       $('#prev').hide();
    }
    if(alphabet_table.row($(this).next()).data()){
      $('#next').show();
    }
    else{
       $('#next').hide();
    }

    $('#exampleModalCenter').show()
        $('#exampleModalCenter').modal({
            backdrop: false,
            show: true
        });

        $('#modal-drag-alphabetwise').draggable({
            handle: ".modal-header"
        });

    console.log(alphabet_table.row(this).data());
    table_row = alphabet_table.row(this).data();
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
    $('#alphabet-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getFamilyDetailsForPerson();
  });

  $('#back-btn').click(function(){
    if($('#bootstrap-data-table').is(':visible'))
    {
      $('#search-by-alphabet-button').click();
      $('#alphabet-table-div').hide();
      $('#loading_gif').show();
      $('#back-btn').hide();
    }
  });

  $('#prev').click(function() {

        if (alphabet_table.row(prev_tr).data()) {

            $('#next').show();

            table_row = alphabet_table.row(prev_tr).data();
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

        if (alphabet_table.row(next_tr).data()) {

            $('#prev').show();

            table_row = alphabet_table.row(next_tr).data();
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
        if (alphabet_table.row(prev_tr).data()) {
            $('#next-edit').show();
            table_row = alphabet_table.row(prev_tr).data();
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
        if (alphabet_table.row(next_tr).data()) {
            $('#prev-edit').show();
            table_row = alphabet_table.row(next_tr).data();
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
            $('#edit-button').click();
            prev_tr = next_tr.prev();
            next_tr = next_tr.next();
        } else {
            $('#next-edit').hide();
        }
    })

    $('#edit-button').click(function() {
        $('#exampleModalCenter').hide();
        $('#edit-search-alphabetwise').modal('show');
        $('#edit-search-alphabetwise').modal({
            backdrop: false,
            show: true
        });
        $('#edit-search-alphabetwise').draggable({
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

  function getAlphabetDataForFilter() {

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
      

      var query2 = `SELECT distinct upper(trim(left(a.` + ac_details.first_name_en + `,1))) as alphabet
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
                t+=result["recordset"][i]["alphabet"];
                t+='</div>';
              }

            $('#search-alphabet').html(t);
      });

    });
  };

  getAlphabetDataForFilter();

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
    getAlphabetDataForFilter();

  });

  $('#search-alphabet-dropdown').on("click", function() {

    if(alphabet_string == 'all'){
      $('.ui.dropdown #search-alphabet-dropdown')
      .dropdown('restore defaults');
    }

    alphabet_selected = $('#search-alphabet-dropdown').dropdown('get value');
    console.log(alphabet_selected);
    getAlphabetDataForFilter();

  });

  function update_filters(){
        
        part_no_selected = $('#search-part-no-dropdown').dropdown('get value');

        var alphabet_selected = [];
        $('#search-alphabet-dropdown').find('a').each(function() {
          alphabet_selected.push($(this).attr('data-value'));
        });

        part_no_string = part_no_selected.toString();
        alphabet_string = alphabet_selected.join("|");
  }


})(jQuery);
