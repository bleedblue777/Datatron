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


  var age_table = {};
  var table_row = {};

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

  var pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);
      });


	function getAgeReportFor18to25() {

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
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.age+` BETWEEN 18 AND 25`;
    // Query
 
    request.query(query, (err, result) => {
        // ... error checks
        if(err) console.log(err);

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
                    // lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
	            $('#age-report-table').show();
	            $('#loading_gif').hide();

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

      });
      $('#page-index').html('<a href="AgeReport.html">AgeWise Reports</a>/<a href="AgeReport.html?click18to25=true" class="back-age" id="back18to25" style="cursor: pointer;">Age Between 18 and 25</a>');
	}

	function getAgeReportFor26to35() {

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
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.age+` BETWEEN 26 AND 35`;
    // Query
 
    request.query(query, (err, result) => {
        // ... error checks
        if(err) console.log(err);
 
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
                    // lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
              $('#age-report-table').show();
              $('#loading_gif').hide();

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

              $('#page-index').html('<a href="AgeReport.html">AgeWise Reports</a>/<a href="AgeReport.html?click26to35=true" class="back-age" id="back26to35" style="cursor: pointer;">Age Between 26 and 35</a>');
      });
	}

	function getAgeReportFor36to45() {

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
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.age+` BETWEEN 36 AND 45`;
    // Query
 
    request.query(query, (err, result) => {
        // ... error checks
        if(err) console.log(err);
 
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
                    // lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
              $('#age-report-table').show();
              $('#loading_gif').hide();

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

      });
        $('#page-index').html('<a href="AgeReport.html">AgeWise Reports</a>/<a href="AgeReport.html?click36to45=true" class="back-age" id="back36to45" style="cursor: pointer;">Age Between 36 and 45</a>');
	}

	function getAgeReportFor46to60() {

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
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.age+` BETWEEN 46 AND 60`;
    // Query
 
    request.query(query, (err, result) => {
        // ... error checks
        if(err) console.log(err);
 
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
                    // lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
              $('#age-report-table').show();
              $('#loading_gif').hide();

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

      });

    $('#page-index').html('<a href="AgeReport.html">AgeWise Reports</a>/<a href="AgeReport.html?click46to60=true" class="back-age" id="back46to60" style="cursor: pointer;">Age Between 46 and 60</a>');
	}

	function getAgeReportForAbove60() {

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
        AND a.`+ac_details.section_no+` = b.`+sec_details.section_no+`
        WHERE a.`+ac_details.age+` > 60`;
    // Query
 
    request.query(query, (err, result) => {
        // ... error checks
        if(err) console.log(err);

              $('#age-report-table').show();
 
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
                    // lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
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
              $('#age-report-table').show();
              $('#loading_gif').hide();

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

      });
      
      $('#page-index').html('<a href="AgeReport.html">AgeWise Reports</a>/<a href="AgeReport.html?clickabove60=true" class="back-age" id="back60" style="cursor: pointer;">Age Above 60</a>');
	}

  function getFamilyDetailsForPerson() {

     
          var person_section_no = table_row.section_no;
          var person_house_no = table_row.house_no;
          var person_part_no = table_row.part_no;

          // create Request object

          const request = pool.request();

         var query = `SELECT a.` + ac_details.ac_no + ` as ac_no
        ,a.` + ac_details.part_no + ` as part_no
        ,a.` + ac_details.serial_no + ` as serial_no
        ,trim(a.` + ac_details.first_name_en + `) +' '+ trim(a.` + ac_details.last_name_en + `) as name
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
        WHERE a.` + ac_details.section_no + ` = ` + person_section_no + ` AND a.` + ac_details.house_no_en + ` = '` + person_house_no + `' AND a.` + ac_details.house_no_en + ` <> '' AND a.` + ac_details.part_no + ` = ` + person_part_no;
     
            // Use the connection
            request.query(query, (err, result) => {
            // ... error checks
            if(err) console.log(err);

              $('#age-report-table').show();
 
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

              age_table = $('#bootstrap-data-table').DataTable();
              age_table.columns.adjust().draw();

             // $('.back-age').after("<h>/Family Details");

      });
  }


	//getAgeReport();	

	$('#btn-18to25').click(function(){
    $('#btn-26to35').css("background-color","#8f9396");
    $('#btn-36to45').css("background-color","#8f9396");
    $('#btn-46to60').css("background-color","#8f9396");
    $('#btn-above60').css("background-color","#8f9396");
    $('#btn-18to25').css("background-color","#45494c");
		$('#age-report-table').hide();
    $('#loading_gif').show();
		getAgeReportFor18to25();
        $('body').addClass('open');
	})

	$('#btn-26to35').click(function(){
    $('#btn-18to25').css("background-color","#8f9396");
    $('#btn-36to45').css("background-color","#8f9396");
    $('#btn-46to60').css("background-color","#8f9396");
    $('#btn-above60').css("background-color","#8f9396");
    $('#btn-26to35').css("background-color","#45494c");
		$('#age-report-table').hide();
		$('#loading_gif').show();
		getAgeReportFor26to35();
        $('body').addClass('open');
	})

	$('#btn-36to45').click(function(){
    $('#btn-18to25').css("background-color","#8f9396");
    $('#btn-26to35').css("background-color","#8f9396");
    $('#btn-46to60').css("background-color","#8f9396");
    $('#btn-above60').css("background-color","#8f9396");
    $('#btn-36to45').css("background-color","#45494c");
		$('#age-report-table').hide();
		$('#loading_gif').show();
		getAgeReportFor36to45();
        $('body').addClass('open');
	})

	$('#btn-46to60').click(function(){
    $('#btn-18to25').css("background-color","#8f9396");
    $('#btn-26to35').css("background-color","#8f9396");
    $('#btn-36to45').css("background-color","#8f9396");
    $('#btn-above60').css("background-color","#8f9396");
    $('#btn-46to60').css("background-color","#45494c");
		$('#age-report-table').hide();
		$('#loading_gif').show();
		getAgeReportFor46to60();
        $('body').addClass('open');
	})

	$('#btn-above60').click(function(){
    $('#btn-18to25').css("background-color","#8f9396");
    $('#btn-26to35').css("background-color","#8f9396");
    $('#btn-36to45').css("background-color","#8f9396");
    $('#btn-46to60').css("background-color","#8f9396");
    $('#btn-above60').css("background-color","#45494c");
		$('#age-report-table').hide();
		$('#loading_gif').show();
		getAgeReportForAbove60();
        $('body').addClass('open');
	})

    $('#btn-custom-range').click(function(){
        window.location="search_by_age.html?enable_back=true";
    });


  function getParameterByName(name) 
  {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
    results = regex.exec(location.search);
    return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
  }

	if(getParameterByName('click18to25') == 'true')
	{
    pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);

        $('#btn-18to25').trigger('click');
      });
	}

	if(getParameterByName('click26to35') == 'true')
	{
    pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);

        $('#btn-26to35').trigger('click');
      });
	}

	if(getParameterByName('click36to45') == 'true')
	{
    pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);

        $('#btn-36to45').trigger('click');
      });
	}

	if(getParameterByName('click46to60') == 'true')
	{
    pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);

        $('#btn-46to60').trigger('click');
      });
	}

	if(getParameterByName('clickabove60') == 'true')
	{
    pool = new sql.ConnectionPool(dbConfig, err => {
    // ... error checks
        if (err) console.log(err);

        $('#btn-above60').trigger('click');
      });
	}


  $('#closemodal1').click(function(){
    $('#exampleModalCenter').hide();
  })

  $('#closemodal2').click(function(){
    $('#exampleModalCenter').hide();
  })

  $('#bootstrap-data-table').dblclick(function(){
    $('#exampleModalCenter').show();
    $('#exampleModalCenter').modal({
    backdrop: false,
    show: true
  });

  // $('.modal-dialog modal-dialog-centered').draggable({
  //   handle: ".modal-header"
  // });
  })


  $('#age-table-content').on('dblclick','tr',function(){
    if(age_table.row($(this).prev()).data()){
      $('#prev').show();
    }
    else{
       $('#prev').hide();
    }
    if(age_table.row($(this).next()).data()){
      $('#next').show();
    }
    else{
       $('#next').hide();
    }
    console.log(age_table.row(this).data());
    table_row = age_table.row(this).data();
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

  $('#family-btn-agewise').click(function(){
    $('#closemodal1').click();
    $('#age-report-table').hide();
    $('#loading_gif').show();
    getFamilyDetailsForPerson();
  })

   $('#edit-button').click(function() {
        $('#exampleModalCenter').hide();
        $('#edit-age-report').show();
        $('#edit-age-report').modal({
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

    $('#prev').click(function() {

        if (age_table.row(prev_tr).data()) {

            $('#next').show();

            table_row = age_table.row(prev_tr).data();
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

        if (age_table.row(next_tr).data()) {

            $('#prev').show();

            table_row = age_table.row(next_tr).data();
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
        if (age_table.row(prev_tr).data()) {
            $('#next-edit').show();
            table_row = age_table.row(prev_tr).data();
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
        if (age_table.row(next_tr).data()) {
            $('#prev-edit').show();
            table_row = age_table.row(next_tr).data();
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

    $('#edit-age-report').keydown(function(e) {
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