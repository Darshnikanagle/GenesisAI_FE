$(document).ready(function(){
    console.log("user dashboard js loaded....");

    $(document).on("sidebarLoaded", function() {
        $(".sb_dashboard").addClass("active");
    });

    $("#header-container").load("header_and_sidebar.html", function() {
        // After loading sidebar
        $(document).trigger("sidebarLoaded");
    });


    // Example: Fetch thread counts by type
    $.ajax({
        url: AppConfig.BASE_URL + '/thread/count-by-type/' + localStorage.getItem("userId"), // You should expose this API
        method: 'GET',
        // contentType: 'application/json',
        beforeSend: function () {
            MainUtil.showLoader();
        },
        success: function(response) {
            // Example response:
            // { "Resume Screening": 5, "PDF Summarizer": 3, "Content Search": 2 }
            console.log("response", response)

            $('#chatThreadCount').text(response["chat"] || 0);
            $('#resumeScreeningCount').text(response["resume"] || 0);
            $('#pdfSummarizerCount').text(response["summarize"] || 0);
            $('#contentSearchCount').text(response["pdf"] || 0);
        },
        error: function(xhr) {
            console.error('Failed to fetch thread counts.', xhr);
        },
        complete: function () {
            MainUtil.hideLoader();
        }
    });


});