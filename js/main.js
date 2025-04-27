$(document).ready(function(){
    console.log("main js loaded...");


    // Create global AppUtils object
    window.MainUtil = window.MainUtil || {};


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


});





