$(document).ready(function(){
    console.log("summarize js loaded...");

    $(document).on("sidebarLoaded", function() {
        $(".sb_summarize").addClass("active");
    });

    const type = "summarize";

    document.querySelectorAll('input[name="inputType"]').forEach((elem) => {
        elem.addEventListener('change', function(event) {
          if (event.target.value === 'text') {
            // document.getElementById('textInputDiv').style.display = 'block';
            // document.getElementById('fileInputDiv').style.display = 'none';
          } else if (event.target.value === 'pdf') {
            // document.getElementById('textInputDiv').style.display = 'none';
            // document.getElementById('fileInputDiv').style.display = 'block';
          }
        });
    });

    function fetchAndRenderMessages(threadId) {
        $.ajax({
            url: AppConfig.BASE_URL + '/thread/' + threadId + '/messages',  // Adjust endpoint if needed
            type: 'GET',
            data: { thread_id: threadId },
            success: function (response) {
                const messages = response.data;
    
                // Clear chat box before rendering new messages
                $('#summary').text('');
    
                messages.forEach(msg => {
                    $('#summary').text(msg.message);
                });
            },
            error: function (xhr, status, error) {
                console.error('Failed to fetch messages:', error);
                alert('Unable to load chat history.');
            }
        });
    }

    function getThreadDetails(threadId) {
        $.ajax({
            url: AppConfig.BASE_URL + '/thread/' + threadId,  // Adjust endpoint if needed
            type: 'GET',
            // data: { thread_id: threadId },
            success: function (response) {
                const thread = response.thread;

                // Clear chat box before rendering new messages
                $('#user_text').val('');

                if (response.content) {
                    $('#user_text').val(response.content);
                }
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
        data: { "type": type, "user_id": localStorage.getItem("userId") },
        beforeSend: function () {
            MainUtil.showLoader();
            // $('#closeModalButton').click();
        },
        success: function (response) {
          console.log('/api/thread:', response);
          
          threads = response["data"]
          

          const $container = $('.threads-container');
          $container.empty(); // Clear existing threads

          threads.forEach((thread, index) => {
            const isActive = index === 0 ? 'active' : '';
            const $thread = UserMainUtil.getThreadItemHtml(thread, isActive);
            
            if(isActive) {
                getThreadDetails(thread.id)
                fetchAndRenderMessages(thread.id)
            }
            $container.append($thread);
        });
          
        },
        error: function (xhr, status, error) {
          console.error('Failed to fetch records:', error);
          alert('Failed to fetch records')
          // Show error message to user
        }, 
        complete: function () {
            MainUtil.hideLoader();
        }
    });


    // document.getElementById('submit-summary').addEventListener('click', function () {
    //     const inputText = document.getElementById('user_text').value;
    //     // Handle AI summarization here...
    //     alert('Summarizing the content...');
    // });

    // Create new thread
    $('#createNewThread').on('click', function (e) {
        e.preventDefault(); // prevent the form from submitting normally

        var formData = new FormData();
        // var file = $('#pdfFileInput')[0].files[0];
        // formData.append("files", file);
        formData.append("title", $('#threadName').val());
        formData.append("type", type);
        formData.append("content", $("#textContent").val());
        formData.append("user_id", localStorage.getItem("userId"));

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

                $('#closeModalButton').click();

                thread = response.thread;

                $('.thread-item').removeClass('active');

                const $thread = UserMainUtil.getThreadItemHtml(thread, "active");
                
                getThreadDetails(thread.id)
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
            getThreadDetails(threadId)
            fetchAndRenderMessages(threadId);

        }
      });



});