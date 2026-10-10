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

    // ---------- Draw the list on screen ----------
    function renderTasks() {
        taskList.innerHTML = ""; // clear the old list first

        if (tasks.length === 0) {
            taskList.innerHTML = "<li class='empty'>No assignments yet.</li>";
            return;
        }

        for (let i = 0; i < tasks.length; i++) {
            const task = tasks[i];

            const li = document.createElement("li");
            li.className = "item";

            const status = task.completed ? "Completed" : "Pending";

            li.innerHTML =
                "<strong>" + task.title + "</strong>" +
                "<span>" + task.subject + " &bull; Due " + task.due + "</span>" +
                "<span class='badge priority-" + task.priority.toLowerCase() + "'>" +
                task.priority + "</span>" +
                "<span class='badge status-" + status.toLowerCase() + "'>" +
                status + "</span>";

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