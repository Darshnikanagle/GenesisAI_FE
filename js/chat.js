$(document).ready(function(){
    console.log("chat js loaded....");

    $(document).on("sidebarLoaded", function() {
        $(".sb_chat").addClass("active");
    });

    const user_id = localStorage.getItem("userId");
    const type = "chat"

    // Function to scroll chat to the bottom
    function scrollToBottom() {
        const chatBox = $(".chat-box");
        chatBox.scrollTop(chatBox[0].scrollHeight);
    }

      // Function to append a user message to the chat box
    function appendUserMessage(message) {
        const userMessageHtml = `<div class="message user">
            <p class="mr-5"><i class="fas fa-user"></i></p>
            <p>${message}</p>
        </div>`;

        $(".chat-box").append(userMessageHtml);

        scrollToBottom();
    }
  
    // Function to append an AI response to the chat box
    function appendAiMessage(message) {
        const aiMessageHtml = `<div class="message ai">
            <p class="mr-5"><i class="fas fa-robot"></i></p>
            <p>${message}</p>
        </div>`;

        $(".chat-box").append(aiMessageHtml);

        scrollToBottom();
    }

    function fetchAndRenderMessages(threadId) {
        $.ajax({
            url: AppConfig.BASE_URL + '/thread/' + threadId + '/messages',  // Adjust endpoint if needed
            type: 'GET',
            data: { thread_id: threadId },
            beforeSend: function () {
                UserMainUtil.showLoader();
            },
            success: function (response) {
                const messages = response.data;
    
                // Clear chat box before rendering new messages
                $('.chat-box').empty();
    
                messages.forEach(msg => {
                    if (msg.user_type === 'user') {
                        appendUserMessage(msg.message);
                    } else if (msg.user_type === 'system') {
                        appendAiMessage(msg.message);
                    }
                });
            },
            error: function (xhr, status, error) {
                console.error('Failed to fetch messages:', error);
                alert('Unable to load chat history.');
            },
            complete: function () {
                UserMainUtil.hideLoader();
            }
        });
    }
    


    // GET ALL THREADS
    $.ajax({
        url: AppConfig.BASE_URL + '/thread', // replace with your login API
        type: 'GET',
        contentType: 'application/json',
        data: { "type": type, "user_id": user_id },
        beforeSend: function () {
            UserMainUtil.showLoader();
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
            UserMainUtil.hideLoader();
        }
    });

    


      function submitMessage(message) {
        $.ajax({
            url: AppConfig.BASE_URL + '/llm/chat',  // Adjust endpoint if needed
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ 
                thread_id: UserMainUtil.getActiveThreadId(),
                query: message,
                user_id: localStorage.getItem("userId"),
                user_type: "user"
            }),
            beforeSend: function () {
                UserMainUtil.showLoader();
            },
            success: function (response) {
                const messages = response.data;
                appendAiMessage(messages);
            },
            error: function (xhr, status, error) {
                console.error('Failed to fetch messages:', error);
                alert('Unable to load chat history.');
            },
            complete: function () {
                UserMainUtil.hideLoader();
            }
        });
    }


      // Function to handle sending messages
    function sendMessage() {
        const message = $("#user_message").val();
        if (message.trim() !== "") {
          appendUserMessage(message);
          $("#user_message").val(''); // Clear input field

          // Simulate AI response (in a real scenario, this would come from an API)
        //   setTimeout(function() {
        //     const aiResponse = "AI is processing your message..."; // Replace with real AI response
        //     appendAiMessage(aiResponse);
        //   }, 1000);

          submitMessage(message)
        } else {
          alert("No message");
        }
      }
  
      // Event listener for the Send button
      $("#send_message").on("click", function() {
          sendMessage();
      });
  
      // Event listener for the Enter key
      $("#user_message").on("keypress", function(e) {
        if (e.which === 13) {
          sendMessage();
        }
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

      
    //   CREATE NEW THREAD
    $('#createNewThread').on('click', function (e) {
        e.preventDefault(); // prevent the form from submitting normally

        $.ajax({
            url: AppConfig.BASE_URL + '/thread',  // Adjust endpoint if needed
            type: 'POST',
            // contentType: 'application/json',
            data: { 
                title: $('#threadName').val(),
                user_id: localStorage.getItem("userId"),
                type: type
            },
            beforeSend: function () {
                UserMainUtil.showLoader();
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
                $('#openModalButton').click();
                // alert('Failed to create new thread');
            },
            complete: function () {
                UserMainUtil.hideLoader();
            }
        });

    });




});

