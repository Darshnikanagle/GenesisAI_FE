
// Create global AppUtils object
window.UserMainUtil = window.UserMainUtil || {};

UserMainUtil.getActiveThreadId = function() {
    return $('.thread-item.active').attr("data-thread-id");
}

UserMainUtil.getThreadItemHtml = function (thread, active) {
    return `
        <div class="thread-item ${active}" data-thread-id="${thread.id}">
            <span class="thread-name-span">${thread.title}</span>
            <i class="fas fa-edit edit-thread mx-2" style="cursor: pointer; display: none;"></i>
            <i class="fas fa-trash delete-thread-icon text-danger" style="display: none; cursor: pointer;"></i>
        </div>
    `;
}


$(document).ready(function(){

    console.log("user main js loaded....");

    $("#header-container").load("header_and_sidebar.html", function() {
        // After loading sidebar
        $(document).trigger("sidebarLoaded");
    });

    console.log("header, sidebar and loader content loaded....");

    $("#delete-model-container").load("delete_confirmation_model.html");

    console.log("delete model content loaded....");

    $(document).on('click', '#toggleSidebarBtn', function() {
    // $('#toggleSidebarBtn').click(function() {
        $('#mainSidebar').toggleClass('collapsed');
        $('.content').toggleClass('expanded');
    });

    //Handle logout
    $(document).on('click', '#logout_btn', function() {
        localStorage.removeItem("userId");
        window.location.href = "login.html"
    });

    // SEARCH/FILTER THREADS
    $('#threadSearch').on('input', function() {
        const searchTerm = $(this).val().toLowerCase(); // Get the search term and convert to lowercase
  
        // Loop through all thread items and hide those that don't match
        $('.thread-item').each(function() {
          const threadText = $(this).find('span').text().toLowerCase(); // Get thread text and convert to lowercase
  
          // Check if the thread contains the search term
          if (threadText.indexOf(searchTerm) !== -1) {
            $(this).show(); // Show the matching thread
          } else {
            $(this).hide(); // Hide non-matching thread
          }
        });
    });


    // DELETE THREAD
    var threadIdToDelete = null;

    // Click on bin icon
    $(document).on('click', '.delete-thread-icon', function (e) {
        e.stopPropagation(); // Don't open thread
        var $threadItem = $(this).closest('.thread-item');
        threadIdToDelete = $threadItem.data('thread-id');
        $('#confirmDeleteModal').modal('show');
    });

    // Confirm delete from modal
    $(document).on('click', '#confirmDeleteBtn', function () {
        if (threadIdToDelete) {
            $.ajax({
                url: AppConfig.BASE_URL + '/thread/' + threadIdToDelete, // Assuming DELETE /thread/{id}
                type: 'DELETE',
                success: function (response) {
                    console.log('Thread deleted:', response);
                    isActive = $('.thread-item[data-thread-id="' + threadIdToDelete + '"]').hasClass("active");
                    $('.thread-item[data-thread-id="' + threadIdToDelete + '"]').remove();
                    $('#confirmDeleteModal').modal('hide');
                    threadIdToDelete = null;
                    MainUtil.showToast("Thread deleted successfully!", "success");

                    // Show first thread as active
                    if(isActive) {
                        // $(".thread-item:first").addClass("active");
                        $(".thread-item:first").trigger("click");
                    }
                },
                error: function (xhr, status, error) {
                    console.error('Delete failed:', error);
                    alert('Failed to delete thread');
                    $('#confirmDeleteModal').modal('hide');
                    threadIdToDelete = null;
                    MainUtil.showToast("Thread delete failed!", "error");
                }
            });
        }
    });


    // When clicking edit icon
    let $threadItem = null;
    let $threadName = null;
    let originalText = null;
    $(document).on('click', '.edit-thread', function(e) {
        e.stopPropagation(); // Prevent triggering parent click
        $threadItem = $(this).closest('.thread-item');
        $threadName = $threadItem.find('.thread-name-span');

        // Store the original text for later
        originalText = $threadName.text();
        console.log("Orignial thread name:", originalText)

        // Make it editable
        $threadName.attr('contenteditable', 'true');
        // Small timeout to ensure browser applies it before focus
        setTimeout(() => {
            $threadName.focus();

            // Move cursor to end
            const node = $threadName[0];
            const range = document.createRange();
            range.selectNodeContents(node);
            range.collapse(false); // Collapse range to the end
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }, 0);
        console.log("edit enabled....")
    });

    function revertThreadName() {
        $threadName.attr('contenteditable', 'false'); // Disable editing
        $threadName.text(originalText); // Revert to original text
    }


    // When pressing Enter inside editable thread name
    $(document).on('keydown', '.thread-name-span', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const $this = $(this);
            const newName = $this.text().trim();
            const threadId = $this.closest('.thread-item').data('thread-id');

            if (newName === '') {
                alert('Thread name cannot be empty.');
                return;
            }

            // Disable editing temporarily
            $this.attr('contenteditable', 'false');

            var formData = new FormData();
            formData.append("title", newName);

            // AJAX call to update the thread name
            console.log("New thread name:", newName, threadId)
            $.ajax({
                url: AppConfig.BASE_URL + '/thread/' + threadId, // Update URL as per your API
                type: 'PUT',
                contentType: 'application/json',
                // data: formData,
                // data: 
                data: JSON.stringify({title: newName}),
                // processData: false, // prevent jQuery from processing data
                // contentType: false, // prevent jQuery from setting content type
                success: function(response) {
                    console.log("Thread name uppdated suucessfully:", newName, threadId)
                    MainUtil.showToast('Thread renamed successfully!', 'success');
                    $this.attr('contenteditable', 'false');
                },
                error: function(xhr) {
                    console.log("Failed to update thread name:", newName, threadId)
                    MainUtil.showToast('Rename failed. Try again.', 'error');
                    // Allow editing again
                    $this.attr('contenteditable', 'true').focus();
                }
            });
        } else if (e.key === 'Escape') {
            revertThreadName();
        }
    });

    // Handle click outside to revert to original text
    $(document).on('blur', '.thread-name-span', function(event) {
        revertThreadName();
    });


});