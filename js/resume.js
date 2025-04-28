$(document).ready(function(){
    console.log("resume js loaded....");

    
    $(document).on("sidebarLoaded", function() {
        $(".sb_resume").addClass("active");
    });

    const user_id = localStorage.getItem("userId");
    const type = "resume"

    // Mulit choice on the Model
    const element_model = document.getElementById('resumeAttributes-model');
    const choices_model = new Choices(element_model, {
        removeItemButton: true,       // Enable removing selected items
        duplicateItemsAllowed: false, // Prevent duplicates
        addChoices: true,
        shouldSort: false,            // Disable sorting to keep custom items order
        addItems: true,
    });

    // Mulit choice on the main page
    const resumeAttributesElement = document.getElementById('resumeAttributes');
    var choices = new Choices(resumeAttributesElement, {
        removeItemButton: true,       // Enable removing selected items
        duplicateItemsAllowed: false, // Prevent duplicates
        addChoices: true,
        shouldSort: false,            // Disable sorting to keep custom items order
        addItems: true,
        removeItems: true
    });


    function destroyAndUpdateChoices(newChoices) {
        choices.clearChoices();

        // const values = choices.getValue(true);

        // choices = new Choices(resumeAttributesElement, {
        //     removeItemButton: true,       // Enable removing selected items
        //     duplicateItemsAllowed: false, // Prevent duplicates
        //     addChoices: true,
        //     shouldSort: false,            // Disable sorting to keep custom items order
        //     addItems: true,
        //     removeItems: true
        // });

        newChoices.forEach(value => {
            choices.setValue([value]);
        });

    }



    // document.getElementById('screen-resumes').addEventListener('click', function () {
    //   const criteriaText = document.getElementById('criteria_text').value;
    //   // Handle AI resume screening logic here...
    //   alert('Screening resumes based on the criteria...');
    // });

    function fetchAndRenderMessages(threadId) {
        $.ajax({
            url: AppConfig.BASE_URL + '/thread/' + threadId + '/messages',  // Adjust endpoint if needed
            type: 'GET',
            data: { thread_id: threadId },
            success: function (response) {

                const $tableBody = $(".resume-result-table tbody");
                $tableBody.empty(); // Clear any previous data

                const messages = response.data;
    
                messages.forEach(msg => {
                    if (msg.user_type === 'user') {

                        const crieteria = msg.message;
                        // Array of preselected values
                        const preselectedValues = crieteria.split(", ");

                        destroyAndUpdateChoices(preselectedValues);

                    } else if (msg.user_type === 'system') {
                        
                        const resume_result_string = msg.message;
                        resume_result = JSON.parse(resume_result_string);

                        resume_result.forEach((result, index) => {
                            const details = Object.entries(result.details)
                                .map(([key, value]) => `<strong>${key}:</strong> ${value}`)
                                .join("<br>");

                                r_status = result.status == 'Shortlisted' ? '<i class="fas fa-check status-checked"></i>' : '<i class="fas fa-times status-cross"></i>';

                            const row = `
                                <tr>
                                    <td>${result.file_name}</td>
                                    <td>${r_status}</td>
                                    <td>${details}</td>
                                </tr>
                            `;

                            $tableBody.append(row);

                        });

                    }
                });
            },
            error: function (xhr, status, error) {
                console.error('Failed to fetch messages:', error);
                alert('Unable to load chat history.');
            }
        });
    }


    // GET ALL THREADS
    $.ajax({
        url: AppConfig.BASE_URL + '/thread', // replace with your login API
        type: 'GET',
        contentType: 'application/json',
        data: { "type": type, "user_id": user_id },
        success: function (response) {
            MainUtil.hideLoader();
            console.log('/api/thread:', response);
          
            threads = response["data"]
            

            const $container = $('.threads-container');
            $container.empty(); // Clear existing threads

            threads.forEach((thread, index) => {
                const isActive = index === 0 ? 'active' : '';
                const $thread = UserMainUtil.getThreadItemHtml(thread, isActive);
                
                if(isActive) {
                    fetchAndRenderMessages(thread.id)
                }
                $container.append($thread);
            });
          
        },
        error: function (xhr, status, error) {
            MainUtil.hideLoader();
            console.error('Failed to fetch records:', error);
            alert('Failed to fetch records')
            // Show error message to user
        }
    });


    //   CREATE NEW THREAD
    $('#createNewThread').on('click', function (e) {
        e.preventDefault(); // prevent the form from submitting normally

        UserMainUtil.showLoader()

        var formData = new FormData();
        var files = $('#pdfFileInput')[0].files;

        // Append each selected file
        for (var i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        formData.append("title", $('#threadName').val());
        formData.append("type", type);
        
        formData.append("user_id", localStorage.getItem("userId"));

        const attributesList = $("#resumeAttributes-model").val();
        var commaSeparated = attributesList.join(",");

        formData.append("content", commaSeparated);

        $.ajax({
            url: AppConfig.BASE_URL + '/thread',  // Adjust endpoint if needed
            type: 'POST',
            // contentType: 'application/json',
            data: formData,
            processData: false, // prevent jQuery from processing data
            contentType: false, // prevent jQuery from setting content type
            beforeSend: function () {
                MainUtil.showLoader();
                $('#closeModalButton').click();
              },
            success: function (response) {
                MainUtil.showToast("Thread created succesfully!", "success");

                $('#closeModalButton').click();

                thread = response.thread;

                $('.thread-item').removeClass('active');

                const $thread = UserMainUtil.getThreadItemHtml(thread, "active");
                
                fetchAndRenderMessages(thread.id)

                $('.threads-container').prepend($thread);

            },
            error: function (xhr, status, error) {
                MainUtil.showToast("Thread creation failed, please try again!", "error");
                console.error('Failed to create new thread:', error);
                // alert('Failed to create new thread');
                $('#openModalButton').click();
            },
            complete: function () {
                MainUtil.hideLoader();
            }
        });

    });


    $(document).on("click", ".thread-item", function () {

        console.log("thread item clicked....")

        if (!$(this).hasClass('active')) {

            $('.thread-item').removeClass('active');
            $(this).addClass('active');

            threadId = $(this).attr("data-thread-id");
            fetchAndRenderMessages(threadId);

        }
    });



});