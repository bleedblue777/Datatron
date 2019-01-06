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

  var booth_array = 0;
  var booth_table = {};
  var table_row = {};

  var prev_tr;
  var next_tr;

  var page = [];

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


	function getBoothWiseReport() {

     sql.close();

	   sql.connect(dbConfig, err => {
            // ... error checks
            if (err) {
                console.log(err);
                return;
            }

	        var query = `select b.`+control_details.psbuilding_no+` as 'part_no', max(b.`+control_details.ps_building_name_en+`) as 'Booth', count(a.`+ac_details.serial_no+`) as 'Total Voters',
              cast((count(a.`+ac_details.serial_no+`) *100.00) / (select count(1) from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]) as decimal (18,4)) 'Total Voters In %'
              from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a left join [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] b 
              on a.`+ac_details.ac_no+` = b.`+control_details.ac_no+` and a.`+ac_details.part_no+` = b.`+control_details.psbuilding_no+`
              group by b.`+control_details.psbuilding_no;
	           
	          new sql.Request().query(query, (err, result) => {
            // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }
              
              $('#bootstrap-data-table1').show();
              $('#booth-table-div').show();
	            
              $('#bootstrap-data-table1').DataTable().destroy();
	            $('#bootstrap-data-table1').DataTable( {
        data: result["recordset"],
        order: [[2,"desc"]],
        columns: [
            { data: "part_no" },
            { data: "Booth" },
            { data: "Total Voters" },
            { data: "Total Voters In %" }
        ],
        scrollX: true,
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
              $('#bootstrap-data-table2').DataTable().destroy();
              $('#bootstrap-data-table3').DataTable().destroy();
              $('#bootstrap-data-table2').hide();
              $('#bootstrap-data-table3').hide();
	            $('#loading_gif').hide();

              booth_table = $('#bootstrap-data-table1').DataTable();
              booth_table.columns.adjust().draw();

              page.push(1);

              //$('body').addClass('open');
	        });
	    });

	}

  $('body').addClass('open');
	getBoothWiseReport();	

  function getFamilyDetailsForPerson() {

      sql.close();

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
              
              $('#bootstrap-data-table3').show();
              $('#booth-table-div').show();

              // $('#table-div').html(makeTableHTML(recordset["recordset"]));
              $('#bootstrap-data-table3').DataTable().destroy();
              $('#bootstrap-data-table3').DataTable( {
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
              $('#bootstrap-data-table1').DataTable().destroy();
              $('#bootstrap-data-table2').DataTable().destroy();
              $('#bootstrap-data-table1').hide();
              $('#bootstrap-data-table2').hide();
              $('#loading_gif').hide();

              booth_table = $('#bootstrap-data-table3').DataTable();
              booth_table.columns.adjust().draw();           

              if(page[page.length - 1] == 2){
                page.push(3); 
              }
              else
                page.push(5);

      });

  }

  function getDetailsBoothWise() {

        sql.close();

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
        WHERE c.`+control_details.psbuilding_no+` = `+person_part_no;
             
          // Use the connection
            request.query(query, (err, result) => {
          // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#bootstrap-data-table3').show();
              $('#booth-table-div').show();

              $('#bootstrap-data-table3').DataTable().destroy();
              $('#bootstrap-data-table3').DataTable( {
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
              $('#bootstrap-data-table1').DataTable().destroy();
              $('#bootstrap-data-table2').DataTable().destroy();
              $('#bootstrap-data-table1').hide();
              $('#bootstrap-data-table2').hide();
              $('#loading_gif').hide();

              booth_table = $('#bootstrap-data-table3').DataTable();
              booth_table.columns.adjust().draw();

              page.push(2);

      });

  }

  function getDetailsSurnameBoothWise() {

          sql.close();

          var person_part_no = table_row.part_no;

          const request = pool.request();

          var query = `select `+person_part_no+` as 'part_no',
              max(b.`+control_details.ps_building_name_en+`) as 'Booth', 
              case when (a.`+ac_details.last_name_en+` is null or a.`+ac_details.last_name_en+` ='' or a.`+ac_details.last_name_en+` ='.' or a.`+ac_details.last_name_en+` ='-' ) then 'Unknown' 
              else a.`+ac_details.last_name_en+` end  as 'Surname',
              count(*) as 'Total Voters', cast((count(*) * 100.00) / (select count(1) from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] where `+ac_details.part_no+` = `+person_part_no+`) as decimal (18,4)) 'Total Voters In % (Booth)', 
              cast((count(*) * 100.00) / (select count(1) from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]) as decimal (18,4)) 'Total Voters In % (Overall)' 
              from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
              left join [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] b
              on a.`+ac_details.ac_no+` = b.`+control_details.ac_no+` and a.`+ac_details.part_no+` = b.`+control_details.psbuilding_no+` 
              where b.`+control_details.psbuilding_no+` = `+person_part_no+`
              group by (case when (`+ac_details.last_name_en+` is null or `+ac_details.last_name_en+` ='' or `+ac_details.last_name_en+` ='.' or `+ac_details.last_name_en+` ='-' )
              then 'Unknown' else `+ac_details.last_name_en+` end) 
              order by 2 desc`;
             
          // Use the connection
            request.query(query, (err, result) => {
          // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#bootstrap-data-table2').show();
              $('#booth-table-div').show();

              $('#bootstrap-data-table2').DataTable().destroy();
              $('#bootstrap-data-table2').DataTable( {
                  data: result["recordset"],
                  order: [[3,"desc"]],
                  columns: [
                      { data: "part_no" },
                      { data: "Booth" },
                      { data: "Surname" },
                      { data: "Total Voters" },
                      { data: "Total Voters In % (Booth)" },
                      { data: "Total Voters In % (Overall)" }
                  ],
                  scrollX: true,
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
              $('#bootstrap-data-table1').DataTable().destroy();
              $('#bootstrap-data-table3').DataTable().destroy();
              $('#bootstrap-data-table1').hide();
              $('#bootstrap-data-table3').hide();
              $('#loading_gif').hide();

              booth_table = $('#bootstrap-data-table2').DataTable();
              booth_table.columns.adjust().draw();

              page.push(2);

      });

  }

  function getDetailsOfSurnameBooth() {

        sql.close();

        var person_part_no = table_row.part_no;

        if(page[page.length - 1] == 5)
          var booth_surname = table_row.surname;

        else
          var booth_surname = table_row.Surname;

        console.log(table_row)

        if (booth_surname.search("'") != -1) {
                booth_surname = booth_surname.substring(0, booth_surname.search("'")) + "'" + booth_surname.substring(booth_surname.search("'"), booth_surname.length);
            }

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
        ,a.`+ac_details.mobile_no+` as mobile_no
        FROM [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.section_table+`] b
        ON a.`+ac_details.ac_no+` = b.`+sec_details.ac_no+` AND a.`+ac_details.part_no+` = b.`+sec_details.part_no+` 
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        LEFT JOIN [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] c 
        ON a.`+ac_details.ac_no+` = c.`+control_details.ac_no+` AND a.`+ac_details.part_no+` = c.`+control_details.psbuilding_no+`
        WHERE c.`+control_details.psbuilding_no+` = `+person_part_no+` AND a.`+ac_details.last_name_en+` = '`+booth_surname+`'`;
             
          // Use the connection
            request.query(query, (err, result) => {
          // ... error checks
                if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

              $('#bootstrap-data-table3').show();
              $('#booth-table-div').show();

              $('#bootstrap-data-table3').DataTable().destroy();
              $('#bootstrap-data-table3').DataTable( {
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
              $('#bootstrap-data-table1').DataTable().destroy();
              $('#bootstrap-data-table2').DataTable().destroy();
              $('#bootstrap-data-table1').hide();
              $('#bootstrap-data-table2').hide();
              $('#loading_gif').hide();

              booth_table = $('#bootstrap-data-table3').DataTable();
              booth_table.columns.adjust().draw();

              page.push(4);

      });

  }


  $('#closemodal1').click(function(){
    $('#exampleModalCenter1').hide();
  })

  $('#closemodal2').click(function(){
    $('#exampleModalCenter1').hide();
  })

  $('#closemodal3').click(function(){
    $('#exampleModalCenter2').hide();
  })

  $('#closemodal4').click(function(){
    $('#exampleModalCenter2').hide();
  })

  $('#bootstrap-data-table1').dblclick(function(){
    $('#exampleModalCenter1').show();
    $('#exampleModalCenter1').modal({
    backdrop: false,
    show: true
  });

  $('#modal-drag-boothwise1').draggable({
    handle: ".modal-header"
  });
  })

  $('#bootstrap-data-table2').dblclick(function(){
    $('#family-btn-booth').hide();
    $('#surname-booth-detail-btn-booth').show();
    $('#exampleModalCenter2').show();
    $('#exampleModalCenter2').modal({
    backdrop: false,
    show: true
  });

  $('#modal-drag-boothwise2').draggable({
    handle: ".modal-header"
  });
  })

  $('#bootstrap-data-table3').dblclick(function(){
    $('#family-btn-booth').show();
    $('#surname-booth-detail-btn-booth').hide();
    $('#exampleModalCenter2').show();
    $('#exampleModalCenter2').modal({
    backdrop: false,
    show: true
  });

  $('#modal-drag-boothwise2').draggable({
    handle: ".modal-header"
  });
  })


  $('#booth-table-content1').on('dblclick','tr',function(){
    if(booth_table.row($(this).prev()).data()){
      $('#prev2').show();
    }
    else{
       $('#prev2').hide();
    }
    if(booth_table.row($(this).next()).data()){
      $('#next2').show();
    }
    else{
       $('#next2').hide();
    }
    console.log(booth_table.row(this).data());
    table_row = booth_table.row(this).data();
    var t = '<tbody>';
    var keys = Object.keys(table_row);

    for(var i=0;i<keys.length;i++){
      t+='<tr>';
      t+='<th>';
      t+=keys[i];
      t+='</th>';

      var key=keys[i];

      t+='<td>';
      t+=table_row[key];
      t+='</td></tr>';
    }
    t+='</tbody>'
    $('#modal-table-id1').html(t);
    prev_tr = $(this).prev();
    next_tr = $(this).next();
  });

  $('#booth-table-content2').on('dblclick','tr',function(){
    if(booth_table.row($(this).prev()).data()){
      $('#prev2').show();
    }
    else{
       $('#prev2').hide();
    }
    if(booth_table.row($(this).next()).data()){
      $('#next2').show();
    }
    else{
       $('#next2').hide();
    }
    console.log(booth_table.row(this).data());
    table_row = booth_table.row(this).data();
    var t = '<tbody>';
    var keys = Object.keys(table_row);

    for(var i=0;i<keys.length;i++){
      t+='<tr>';
      t+='<th>';
      t+=keys[i];
      t+='</th>';

      var key=keys[i];

      t+='<td>';
      t+=table_row[key];
      t+='</td></tr>';
    }
    t+='</tbody>'
    $('#modal-table-id2').html(t);
    prev_tr = $(this).prev();
    next_tr = $(this).next();
  });

  $('#booth-table-content3').on('dblclick','tr',function(){
    if(booth_table.row($(this).prev()).data()){
      $('#prev2').show();
    }
    else{
       $('#prev2').hide();
    }
    if(booth_table.row($(this).next()).data()){
      $('#next2').show();
    }
    else{
       $('#next2').hide();
    }
    console.log(booth_table.row(this).data());
    table_row = booth_table.row(this).data();
    var t = '<tbody>';
    var keys = Object.keys(table_row);

     var loop_array = [3, 3, 3, 3, 3, 1];
        var j = 0;
        var k = 0;

        for (var i = 0; i < loop_array.length; i++) {
            t += '<tr>';

            k = loop_array[i] + j;

            for (; j < k; j++) {
                t += '<th>';
                t += keys[j];
                t += '</th>';

                var key = keys[j];

                t += '<td>';
                t += table_row[key];
                t += '</td>';
            }
            t += '</tr>';
        }
    t+='</tbody>'
    $('#modal-table-id2').html(t);
    prev_tr = $(this).prev();
    next_tr = $(this).next();
  });


  $('#family-btn-booth').click(function(){
    $('#closemodal2').click();
    $('#booth-table-div').hide();
    $('#loading_gif').show();
    getFamilyDetailsForPerson();
  })

  $('#detail-btn-booth').click(function(){
    $('#closemodal1').click();
    $('#booth-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getDetailsBoothWise();
  })

  $('#detail-btn-surnamewise-booth').click(function(){
    $('#closemodal1').click();
    $('#booth-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getDetailsSurnameBoothWise();
  })

  $('#surname-booth-detail-btn-booth').click(function(){
    $('#closemodal2').click();
    $('#booth-table-div').hide();
    $('#loading_gif').show();
    $('#back-btn').show();
    getDetailsOfSurnameBooth();
  })
  

  $('#back-btn').click(function(){
    if($('#bootstrap-data-table1').is(':visible'))
    {

    }
    else if(page[page.length - 1] == 2)
    {
      $('#booth-table-div').hide();
      $('#loading_gif').show();
      getBoothWiseReport();
    }
    else if(page[page.length - 1] == 3)
    {
      $('#booth-table-div').hide();
      $('#loading_gif').show();
      getDetailsBoothWise();
    }
    else if(page[page.length - 1] == 4)
    {
      $('#booth-table-div').hide();
      $('#loading_gif').show();
      getDetailsSurnameBoothWise();
    }
    else if(page[page.length - 1] == 5)
    {
      $('#booth-table-div').hide();
      $('#loading_gif').show();
      getDetailsOfSurnameBooth();
    }
  })

  $('#edit-button').click(function() {
    if($('#bootstrap-data-table3').is(':visible'))
    {
      if($('#exampleModalCenter1').is(':visible')){
        $('#exampleModalCenter1').hide();
      }
      else
      {
        $('#exampleModalCenter2').hide();
      }
        $('#edit-boothwise-report').show();
        $('#edit-boothwise-report').modal({
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
      }
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

    $('#prev1').click(function() {

        if (booth_table.row(prev_tr).data()) {

            $('#next1').show();

            table_row = booth_table.row(prev_tr).data();
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            if($('#bootstrap-data-table3').is(':visible'))
            {
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
            }

            else{
              for(var i=0;i<keys.length;i++){
                t+='<tr>';
                t+='<th>';
                t+=keys[i];
                t+='</th>';

                var key=keys[i];

                t+='<td>';
                t+=table_row[key];
                t+='</td></tr>';
              }
            }
            t += '</tbody>'
            $('#modal-table-id1').html(t);

            next_tr = prev_tr.next();
            prev_tr = prev_tr.prev();
        } else {
            $('#prev1').hide();
        }
    })

    $('#next1').click(function() {

        if (booth_table.row(next_tr).data()) {

            $('#prev1').show();

            table_row = booth_table.row(next_tr).data();
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            if($('#bootstrap-data-table3').is(':visible'))
            {
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
            }

            else{
              for(var i=0;i<keys.length;i++){
                t+='<tr>';
                t+='<th>';
                t+=keys[i];
                t+='</th>';

                var key=keys[i];

                t+='<td>';
                t+=table_row[key];
                t+='</td></tr>';
              }
            }
            t += '</tbody>'
            $('#modal-table-id1').html(t);
            prev_tr = next_tr.prev();
            next_tr = next_tr.next();
        } else {
            $('#next1').hide();
        }
    })

    $('#prev2').click(function() {

        if (booth_table.row(prev_tr).data()) {

            $('#next2').show();

            table_row = booth_table.row(prev_tr).data();
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            if($('#bootstrap-data-table3').is(':visible'))
            {
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
            }

            else{
              for(var i=0;i<keys.length;i++){
                t+='<tr>';
                t+='<th>';
                t+=keys[i];
                t+='</th>';

                var key=keys[i];

                t+='<td>';
                t+=table_row[key];
                t+='</td></tr>';
              }
            }
            t += '</tbody>'
            $('#modal-table-id2').html(t);

            next_tr = prev_tr.next();
            prev_tr = prev_tr.prev();
        } else {
            $('#prev2').hide();
        }
    })

    $('#next2').click(function() {

        if (booth_table.row(next_tr).data()) {

            $('#prev2').show();

            table_row = booth_table.row(next_tr).data();
            var t = '<tbody>';
            var keys = Object.keys(table_row);

            if($('#bootstrap-data-table3').is(':visible'))
            {
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
            }

            else{
              for(var i=0;i<keys.length;i++){
                t+='<tr>';
                t+='<th>';
                t+=keys[i];
                t+='</th>';

                var key=keys[i];

                t+='<td>';
                t+=table_row[key];
                t+='</td></tr>';
              }
            }
            t += '</tbody>'
            $('#modal-table-id2').html(t);
            prev_tr = next_tr.prev();
            next_tr = next_tr.next();
        } else {
            $('#next2').hide();
        }
    })

    $('#prev-edit').click(function() {
        if (booth_table.row(prev_tr).data()) {
            $('#next-edit').show();
            table_row = booth_table.row(prev_tr).data();
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
        if (booth_table.row(next_tr).data()) {
            $('#prev-edit').show();
            table_row = booth_table.row(next_tr).data();
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

    $('#exampleModalCenter1').keydown(function(e) {
        var key = e.which;
        if (key == 37) // the left key code
        {
            $('#prev1').click();
            return false;
        }
        else if (key == 39) // the right key code
        {
            $('#next1').click();
            return false;
        }
    });

    $('#exampleModalCenter2').keydown(function(e) {
        var key = e.which;
        if (key == 37) // the left key code
        {
            $('#prev2').click();
            return false;
        }
        else if (key == 39) // the right key code
        {
            $('#next2').click();
            return false;
        }
    });

    $('#edit-boothwise-report').keydown(function(e) {
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

})(jQuery);
