$(document).ready(function(){
    console.log("login js loaded....")

    $('#loginForm').on('submit', function (e) {
        e.preventDefault(); // prevent the form from submitting normally
    
        const email = $('#email').val();
        const password = $('#password').val();
    
        $.ajax({
          url: AppConfig.BASE_URL + '/users/login', // replace with your login API
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ email: email, password: password }),
          success: function (response) {
            console.log('Login successful:', response);
            localStorage.clear();
            // Redirect or show success message
            localStorage.setItem("email", email);
            localStorage.setItem("userId", response.user_id);
            window.location.href = "userdashboard_chat.html";
          },
          error: function (xhr, status, error) {
            console.error('Login failed:', error);
            alert('Login failed:', error)
            // Show error message to user
          }
        });
      });





});

