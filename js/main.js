// Create global AppUtils object
window.MainUtil = window.MainUtil || {};


function hideShowLoader(action) {
    var interval = setInterval(function() {
        // Check if the element exists
        if ($('#pageLoader').length) {
            // Once found, clear the interval and execute your code
            clearInterval(interval);
            // Your code to execute once the element is available
            action == 'show' ? $('#pageLoader').addClass('d-flex') : $('#pageLoader').removeClass('d-flex');
            
            console.log('Element found ');
        }
    }, 100);  // Check every 100ms
}

MainUtil.showLoader = function() {
    hideShowLoader('show');
}
  
MainUtil.hideLoader = function() {
    hideShowLoader('hide');
}


MainUtil.showToast = function (message, type = 'success') {
    const $toast = $("#alertToast");
    const $toastBody = $("#alertToast .toast-body");

    // Remove old background classes
    $toast.removeClass('bg-success bg-danger bg-warning bg-info text-white');

    // Set new background based on type
    switch(type) {
        case 'success':
            $toast.addClass('bg-success text-white');
            break;
        case 'error':
            $toast.addClass('bg-danger text-white');
            break;
        case 'warning':
            $toast.addClass('bg-warning text-dark');
            break;
        case 'info':
            $toast.addClass('bg-info text-white');
            break;
    }

    // Update the message
    $toastBody.text(message);

    // Show the toast
    const toast = new bootstrap.Toast(document.getElementById('alertToast'), { delay: 3000 });
    toast.show();
}


$(document).ready(function(){
    console.log("main js loaded...");


    


});





