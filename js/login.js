
(function ($) {
    "use strict";

    var age = 0;
    var pass = '';

    $('#user-name').focus();

    /*==================================================================
    [ Focus input ]*/
    $('.input100').each(function(){
        $(this).on('blur', function(){
            if($(this).val().trim() != "") {
                $(this).addClass('has-val');
            }
            else {
                $(this).removeClass('has-val');
            }
        })    
    })
  
  
    /*==================================================================
    [ Validate ]*/
    var input = $('.validate-input .input100');

    $('.login100-form-btn').on('click',function(){
        var check = true;

        for(var i=0; i<input.length; i++) {
            if(validate(input[i]) == false){
                showValidate(input[i]);
                check=false;
            }
            // console.log(check);
            if(check == true){  
                if(authenticate(input[i]) == false){
                    check=false;
                    $(input).val('');
                    window.alert("Invalid Credentials.Please Try Again!");
                    break;
                }
            }
        }

        // console.log(check);
        // if(check == false){
        //     window.alert("Invalid Credentials.Please Try Again!");
        // }

        if(check == true){
            window.location="index.html";
        }
        return check;
    });

    $(input).keypress(function(e){
        if(e.which==13){
            $('.login100-form-btn').click();
        }
    });


    $('.validate-form .input100').each(function(){
        $(this).focus(function(){
           hideValidate(this);
        });
    });

    function validate (input) {
        if($(input).attr('type') == 'text' || $(input).attr('name') == 'username') {
            if($(input).val().trim() == '') {
                return false;
            }
        }
        else {
            if($(input).val().trim() == ''){
                return false;
            }
        }
    }

     function authenticate (input) {
        if($(input).attr('type') == 'text' || $(input).attr('name') == 'username') {
            if($(input).val().trim() == "152") {
                return true;
            }
            else{
                return false;
            }
        }
        else {
            if($(input).val().trim() == 'admin'){
                return true;
            }
            else{
                return false;
            }
        }
    }

    function showValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).addClass('alert-validate');
    }

    function hideValidate(input) {
        var thisAlert = $(input).parent();

        $(thisAlert).removeClass('alert-validate');
    }
    
    /*==================================================================
    [ Show pass ]*/
    var showPass = 0;
    $('.btn-show-pass').on('click', function(){
        if(showPass == 0) {
            $(this).next('input').attr('type','text');
            $(this).find('i').removeClass('zmdi-eye');
            $(this).find('i').addClass('zmdi-eye-off');
            showPass = 1;
        }
        else {
            $(this).next('input').attr('type','password');
            $(this).find('i').addClass('zmdi-eye');
            $(this).find('i').removeClass('zmdi-eye-off');
            showPass = 0;
        }
        
    });

})(jQuery);