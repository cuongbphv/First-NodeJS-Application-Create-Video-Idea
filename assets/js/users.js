$(document).ready(function(){
    $('#enableInput').click(function(){
        var btnTxt = $('#enableInput').text();

        if(btnTxt === 'Save Change'){
            $('form#changeProfile').submit();
        }
        else{
            $("#inputFname").prop('disabled', false);
            $('#enableInput').text('Save Change');
        }
    });

    $('#cancelInput').click(function(){
            $("#inputFname").prop('disabled', true);
            $('#enableInput').text('Edit Profile');
    });
});