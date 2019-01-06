$.noConflict();

jQuery(document).ready(function($) {

    "use strict";

    [].slice.call(document.querySelectorAll('select.cs-select')).forEach(function(el) {
        new SelectFx(el);
    });

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

    // $('.user-area> a').on('click', function(event) {
    // 	event.preventDefault();
    // 	event.stopPropagation();
    // 	$('.user-menu').parent().removeClass('open');
    // 	$('.user-menu').parent().toggleClass('open');
    // });

    var age = 0;
    var voter_status_arr = 0;
    var pass = '';

    var dataSet = [];

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

   
    $('#flot-pie-age').bind("plotclick", function(event, pos, obj) {
        window.location.replace(dataSet[obj.seriesIndex].url);
    });

    function getDashBoardStats() {

        sql.connect(dbConfig, err => {
            // ... error checks
            if (err) {
                window.alert(err);
                console.log(err);
                return;
            }

            // Query
        // Perform a query
        var query1 = `select count(distinct a.`+control_details.psbuilding_no+`) as 'Total Booth', count(b.`+ac_details.serial_no+`) as 'Total Voters', 
        sum(case when b.`+ac_details.age+`  >= 18 and b.`+ac_details.age+`  <= 25 then 1 end ) as 'Age Between 18 to 25',
          sum(case when b.`+ac_details.age+`  >= 26 and b.`+ac_details.age+`  <= 35 then 1 end ) as 'Age Between 26 to 35', 
        sum(case when b.`+ac_details.age+`  >= 36 and b.`+ac_details.age+`  <= 45 then 1 end ) as 'Age Between 36 to 45',
        sum(case when b.`+ac_details.age+`  >= 46 and b.`+ac_details.age+`  <= 60 then 1 end ) as 'Age Between 46 to 60',
        sum(case when b.`+ac_details.age+`  >= 60 then 1 end ) as 'Age Above 60'
        from [`+control_details.control_db+`].[dbo].[`+control_details.booth_table+`] a left join [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] b
        on a.`+control_details.ac_no+` = b.`+ac_details.ac_no+` and a.`+control_details.psbuilding_no+` = b.`+ac_details.part_no+`
        where b.`+ac_details.ac_no+` = `+dbconfig_json.ac;
 
        new sql.Request().query(query1, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

            age = result["recordset"][0];

            $('#count-booth').text(age["Total Booth"]);
            $('#count-booth2').text(age["Total Booth"]);
            $('#count-voter').text(age["Total Voters"]);
            $('#count-voter2').text(age["Total Voters"]);
            $('#count-new-voters').text(age["Age Between 18 to 25"]);

              dataSet = [{
                label: "Age Between 18 to 25",
                data: age["Age Between 18 to 25"],
                color: "#005CDE",
                url: "AgeReport.html?click18to25=true"
            }, {
                label: "Age Between 26 to 35",
                data: age["Age Between 26 to 35"],
                color: "#00A36A",
                url: "AgeReport.html?click26to35=true"
            }, {
                label: "Age Between 36 to 45",
                data: age["Age Between 36 to 45"],
                color: "#7D0096",
                url: "AgeReport.html?click36to45=true"
            }, {
                label: "Age Between 46 to 60",
                data: age["Age Between 46 to 60"],
                color: "#e8c3b9",
                url: "AgeReport.html?click46to60=true"
            }, {
                label: "Age Above 60",
                data: age["Age Above 60"],
                color: "#DE000F",
                url: "AgeReport.html?clickabove60=true"
            }];

            var options = {
                series: {
                    pie: {
                        show: true,
                        innerRadius: 0.5,

                    }
                },
                grid: {
                    hoverable: true,
                    clickable: true
                },
                tooltip: true,
                tooltipOpts: {
                    cssClass: "flotTip",
                    content: function(label, xval, yval) {
                        var content = "%s (" + yval[0][1] + ")";
                        return content;
                    },
                    shifts: {
                        x: 20,
                        y: 0
                    },
                    defaultTheme: false

                }
            };

            $.plot($('#flot-pie-age'), dataSet, options);

            // new Chart(document.getElementById("doughnut-chart"), {
            //     type: 'doughnut',
            //     data: {
            //       labels: ["Age Between 18 and 25", "Age Between 26 and 35", "Age Between 36 and 45", "Age Between 46 and 60", "Age Above 60"],
            //       radius: "50%", 
            //       datasets: [
            //         {
            //           label: "Voters",
            //           backgroundColor: ["#3e95cd", "#8e5ea2","#3cba9f","#e8c3b9","#c45850"],
            //           data: [age["Age Between 18 to 25"],age["Age Between 26 to 35"],age["Age Between 36 to 45"],age["Age Between 46 to 60"],age["Age Above 60"]]
            //         }
            //       ]
            //     },
            //     options: {
            //       title: {
            //         display: true,
            //         text: 'Age Doughnut Chart'
            //       }
            //     }
            // });

            $('.count1').each(function () {
            $(this).prop('Counter',0).animate({
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });

        });

        var query2 = `select max(`+ac_details.ac_no+`) as 'AC_NO',
	    sum(case when a.`+ac_details.sex+` = 'M' then 1 end ) as 'Male Voters',
	    sum(case when a.`+ac_details.sex+` = 'F' then 1 end ) as 'Female Voters',
	    sum(case when a.`+ac_details.sex+` <> 'M' and a.`+ac_details.sex+` <> 'F' then 1 end) as 'Others'
	    from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a`;

        new sql.Request().query(query2, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            var res = result["recordset"][0];

            $('#ac-no').text('AC NO. '+res["AC_NO"]);
            $('#count-male2').text(res["Male Voters"]);
            $('#count-female').text(res["Female Voters"]);    
            $('#count-male-percent').text((res["Male Voters"]*100/(res["Male Voters"]+res["Female Voters"]+res["Others"])).toFixed(2));
            $('#count-female-percent').text((res["Female Voters"]*100/(res["Female Voters"]+res["Male Voters"]+res["Others"])).toFixed(2));
            // $('#count-female2').text((res["Female Voters"]*100/(res["Female Voters"]+res["Male Voters"]+res["Others"])).toFixed(2));

             var data = [
                [0, res["Male Voters"]],
                [1, res["Female Voters"]]
            ];
            var dataSet2 = [{
                label: "Gender Wise Voters",
                data: data,
                color: "#5482FF"
            }];
            var ticks = [
                [0, "Male"],
                [1, "Female"]
            ];

            var options = {
                series: {
                    bars: {
                        show: true
                    }
                },
                bars: {
                    align: "center",
                    barWidth: 0.5
                },
                xaxis: {
                    axisLabel: "Voters",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 10,
                    ticks: ticks
                },
                yaxis: {
                    axisLabel: "No. of Voters",
                    axisLabelUseCanvas: true,
                    axisLabelFontSizePixels: 12,
                    axisLabelFontFamily: 'Verdana, Arial',
                    axisLabelPadding: 3,
                    tickFormatter: function(v, axis) {
                        return v;
                    }
                },
                legend: {
                    noColumns: 0,
                    labelBoxBorderColor: "#000000",
                    position: "nw"
                },
                grid: {
                    hoverable: true,
                    borderWidth: 2,
                    backgroundColor: {
                        colors: ["#ffffff", "#EDF5FF"]
                    }
                }
            };

            $.plot($("#flotBar"), dataSet2, options);

            $('.count2').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });


            });

         var query3 = `select count(1) as birthday_count
        from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        where month(a.`+ac_details.dob+`) = month(getdate()) and day(a.`+ac_details.dob+`) = day(getdate())`;

        new sql.Request().query(query3, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#count-birthdays').text(result["recordset"][0]["birthday_count"]);

            $('.count3').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });
        });

        var query4 = `select top 1 trim(`+ac_details.last_name_en+`) as highest_surname, 
        count(`+ac_details.last_name_en+`) as count
        from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        group by trim(`+ac_details.last_name_en+`) 
        order by count(`+ac_details.last_name_en+`) desc`;

        new sql.Request().query(query4, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#count-highest-surname').text(result["recordset"][0]["highest_surname"]);
            $('#count-highest-surname-count').text(result["recordset"][0]["count"]);

            $('.count4').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });
        });

        // var query5 = `select count(1) as 'Duplicate Voters' from 
        //             (select `+ac_details.id_card_no+` 
        //             from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]
        //             group by `+ac_details.id_card_no+` having count(`+ac_details.id_card_no+`) > 1 and count(distinct `+ac_details.serial_no+`) > 1) b`;

        var query5 = `select count(1) as 'Duplicate Voters' from 
        [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]
        where `+ac_details.id_card_no+` <> '' and `+ac_details.id_card_no+` in
        (select `+ac_details.id_card_no+` 
        from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]
        group by `+ac_details.id_card_no+` having count(`+ac_details.id_card_no+`) > 1 and count(distinct `+ac_details.serial_no+`) > 1)`;

        new sql.Request().query(query5, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#count-duplicate-voters').text(result["recordset"][0]["Duplicate Voters"]);

            $('.count5').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });
        });

        var query6 = `select count(1) as 'Voters With Phone No' from 
        [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`]
        where `+ac_details.mobile_no+` <> ''`;

        new sql.Request().query(query6, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#count-voters-with-phone-no').text(result["recordset"][0]["Voters With Phone No"]);

            $('.count6').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });
        });

        var query7 = `select sum(case when a.`+ac_details.voter_status+` = 'A' then 1 end ) as "Party Voters",
        sum(case when a.`+ac_details.voter_status+` = 'B' then 1 end ) as "Opposition Voters",
        sum(case when a.`+ac_details.voter_status+` = 'C' then 1 end ) as "Can Be Converted",
        sum(case when a.`+ac_details.voter_status+` = 'D' then 1 end ) as "Don't Know"
        from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        where a.`+ac_details.ac_no+` = `+dbconfig_json.ac;
 
        new sql.Request().query(query7, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                window.alert(err);
                console.log(err);
                return;
            }

        voter_status_arr = result["recordset"][0];
        console.log(voter_status_arr)

        new Chart(document.getElementById("doughnut-chart"), {
                type: 'doughnut',
                data: {
                  labels: ["Party Voters", "Opposition Voters", "Can Be Converted", "Don't Know"],
                  radius: "50%", 
                  datasets: [
                    {
                      label: "Voters",
                      backgroundColor: ["#3FD34C", "#ff0000","#1042C0","#e8c3b9"],
                      data: [voter_status_arr["Party Voters"],voter_status_arr["Opposition Voters"],voter_status_arr["Can Be Converted"],voter_status_arr["Don't Know"]]
                    }
                  ]
                },
                options: {
                  title: {
                    display: true,
                    text: 'Voter Selection Doughnut Chart'
                  }
                }
        });

        });

        var query8 = `select count(1) as "Party Voters"
        from [`+ac_details.ac_db+`].[dbo].[`+ac_details.ac_table+`] a
        where a.`+ac_details.voter_status+` = 'A'`;

        new sql.Request().query(query8, (err, result) => {
        // ... error checks
            if (err) {
                console.log("An error occurred performing the query.");
                console.log(err);
                return;
            }

            $('#count-party-voters').text(result["recordset"][0]["Party Voters"]);

            $('.count7').each(function () {
            $(this).prop('Counter',0).animate({ 
                Counter: $(this).text()
                }, {
                    duration: 3000,
                    easing: 'swing',
                    step: function (now) {
                            $(this).text(Math.ceil(now));
                        }
                    });
            });
        });


        });
    }

    //getEmp();
    getDashBoardStats();

    $('#birthday-redirect').click(function(){
        window.location="birthdays_dashboard.html";
    })

    $('#surname-redirect').click(function(){
        window.location="surnamewise_report.html";
    })

    $('#phone-redirect').click(function(){
        window.location="search_by_phone.html";
    })

    $('#new-voters-redirect').click(function(){
        window.location="AgeReport.html?click18to25=true";
    })

    $('#duplicate-voters-redirect').click(function(){
        window.location="duplicate_voters_report.html";
    })

    $('.overview-item--c4').click(function(){
        window.location="boothwise_report.html";
    })

    // $('.overview-item--c2').click(function(){
    //     window.location="AgeReport.html?click18to25=true";
    // })

    // $('overview-item--c3').click(function(){
    //     window.location="search_by_phone.html";
    // })

    // $('.overview-item--c4').click(function(){
    //     window.location="AgeReport.html?click18to25=true";
    // })
    
});