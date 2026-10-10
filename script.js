// =====================================================
// ASSIGNMENT TRACKER (tasks.html)
// =====================================================

// Only run this section if the assignment form exists on this page
if (document.querySelector("#task-form")) {

    // ---------- Data ----------
    let tasks = [];     // all assignments live here
    let nextTaskId = 1; // the id the next assignment will get

    // ---------- Grab page elements ----------
    const taskForm = document.querySelector("#task-form");
    const titleInput = document.querySelector("#task-title");
    const subjectInput = document.querySelector("#task-subject");
    const dueInput = document.querySelector("#task-due");
    const priorityInput = document.querySelector("#task-priority");
    const taskMessage = document.querySelector("#task-message");
    const taskList = document.querySelector("#task-list");

    // ---------- Show feedback ----------
    function showTaskMessage(text, type) {
        taskMessage.textContent = text;
        taskMessage.className = "message " + type; // "message success" or "message error"
    }

    // ---------- Mark an assignment as completed ----------
    function completeTask(id) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id === id) {
                tasks[i].completed = true;
                break;
            }
        }
        renderTasks();
        showTaskMessage("Assignment marked as completed.", "success");
    }

    // ---------- Delete an assignment ----------
    function deleteTask(id) {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].id === id) {
                tasks.splice(i, 1);
                break;
            }
        }
        renderTasks();
        showTaskMessage("Assignment deleted.", "success");
    }


    // ---------- Draw the list on screen ----------
    function renderTasks() {
        taskList.innerHTML = "";

        if (tasks.length === 0) {
            taskList.innerHTML = "<li class='empty'>No assignments yet.</li>";
            return;
        }

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            const li = document.createElement("li");
            li.className = "item";
            if (task.completed) {
                li.className = "item done";
            }

            const status = task.completed ? "Completed" : "Pending";

            li.innerHTML =
                "<strong>" + task.title + "</strong>" +
                "<span>" + task.subject + " &bull; Due " + task.due + "</span>" +
                "<span class='badge priority-" + task.priority.toLowerCase() + "'>" +
                task.priority + "</span>" +
                "<span class='badge status-" + status.toLowerCase() + "'>" +
                status + "</span>";

            const actions = document.createElement("div");
            actions.className = "actions";

            if (!task.completed) {
                const completeBtn = document.createElement("button");
                completeBtn.textContent = "Complete";
                completeBtn.className = "btn-complete";
                completeBtn.addEventListener("click", function () {
                    completeTask(task.id);
                });
                actions.appendChild(completeBtn);
            }

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "btn-delete";
            deleteBtn.addEventListener("click", function () {
                deleteTask(task.id);
            });
            actions.appendChild(deleteBtn);

            li.appendChild(actions);
            taskList.appendChild(li);
        }
    }

    // ---------- Handle the form ----------
    taskForm.addEventListener("submit", function (event) {
        event.preventDefault(); // stop the page from reloading

        // 1. Read the values (trim() removes spaces from both ends)
        const title = titleInput.value.trim();
        const subject = subjectInput.value.trim();
        const due = dueInput.value;
        const priority = priorityInput.value;

        // 2. Validate
        if (title === "" || subject === "" || due === "") {
            showTaskMessage("Please fill in the title, subject and due date.", "error");
            return; // stop here, don't add anything
        }

        const today = new Date().toISOString().slice(0, 10); // e.g. "2026-10-10"
        if (due < today) {
            showTaskMessage("The due date can't be in the past.", "error");
            return;
        }

        // 3. Build the object and add it to the array
        const newTask = {
            id: nextTaskId,
            title: title,
            subject: subject,
            due: due,
            priority: priority,
            completed: false
        };
        tasks.push(newTask);
        nextTaskId++;

        // 4. Update the screen and reset the form
        renderTasks();
        taskForm.reset();
        showTaskMessage("Assignment added!", "success");
    });

    // Show the (empty) list message when the page first loads
    renderTasks();
}