$(document).ready(function(){
    console.log("signup js loaded...");

    $('#username, #email, #password, #confirmPassword').on('keyup change', function() {
        const username = $('#username').val().trim();
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (username && email && password && confirmPassword && password === confirmPassword) {
            $('#signup_button').prop('disabled', false);
            $('#password_match_status').html('<span class="text-success"><i class="fas fa-check"></i> Passwords match</span>');
        } else {
            $('#signup_button').prop('disabled', true);
            if (password !== confirmPassword && confirmPassword !== "") {
                $('#password_match_status').html('<span class="text-danger"><i class="fas fa-times"></i> Passwords do not match</span>');
            } else {
                $('#password_match_status').html('');
            }
        }
    });


    $(document).on('click', '#signup_button', function(e) {
        // alert("clicked")
        e.preventDefault(); // prevent the form from submitting normally

        username = $('#username').val();
        email = $('#email').val();
        password = $('#password').val()

        MainUtil.showLoader();

        $.ajax({
            url: AppConfig.BASE_URL + '/users/register',  // Adjust endpoint if needed
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({name: username, email: email, password: password}),
            // processData: false, // prevent jQuery from processing data
            // contentType: false, // prevent jQuery from setting content type
            beforeSend: function () {
                MainUtil.showLoader();
            },
            success: function (response) {
                MainUtil.showToast(response.message, "success");
                console.log("account created successfully:", response)
            },
            error: function (xhr, status, error) {
                MainUtil.showToast(xhr.responseJSON.detail, "error");
                console.error('Failed to create new account:',xhr);
                // alert('Failed to create new thread');
            },
            complete: function () {
                MainUtil.hideLoader();
            }
        });
    });

    $('#password, #confirmPassword').on('keyup', function() {
        const password = $('#password').val();
        const confirmPassword = $('#confirmPassword').val();
        
        if (password === "" && confirmPassword === "") {
            $('#password_match_status').html('');
            return;
        }
        
        if (password === confirmPassword) {
            $('#password_match_status').html('<span class="text-success"><i class="fas fa-check"></i> Passwords match</span>');
        } else {
            $('#password_match_status').html('<span class="text-danger"><i class="fas fa-times"></i> Passwords do not match</span>');
        }
    });

});