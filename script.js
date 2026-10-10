// =====================================================
// SHARED HELPERS (saving and loading)
// =====================================================

// Save any value (array, object, number) under a name
function saveData(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

// Load a value by name. If nothing is saved yet, return the fallback.
function loadData(key, fallback) {
    const saved = localStorage.getItem(key);
    if (saved === null) {
        return fallback;
    }
    return JSON.parse(saved);
}


// =====================================================
// ASSIGNMENT TRACKER (tasks.html)
// =====================================================

// Only run this section if the assignment form exists on this page
if (document.querySelector("#task-form")) {

    // ---------- Data ----------
    let tasks = loadData("tasks", []); // load saved assignments, or start empty
    let nextTaskId = 1;

    // Continue the id numbering after the highest saved id
    for (let i = 0; i < tasks.length; i++) {
        if (tasks[i].id >= nextTaskId) {
            nextTaskId = tasks[i].id + 1;
        }
    }
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
        saveData("tasks", tasks);
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
        saveData("tasks", tasks);
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
        saveData("tasks", tasks);

        // 4. Update the screen and reset the form
        renderTasks();
        taskForm.reset();
        showTaskMessage("Assignment added!", "success");
    });

    // Show the (empty) list message when the page first loads
    renderTasks();
}

// =====================================================
// BUDGET TRACKER (budget.html)
// =====================================================

if (document.querySelector("#expense-form")) {

    // ---------- Data ----------
    let startingBudget = loadData("startingBudget", 0);
    let expenses = loadData("expenses", []);
    let nextExpenseId = 1;

    for (let i = 0; i < expenses.length; i++) {
        if (expenses[i].id >= nextExpenseId) {
            nextExpenseId = expenses[i].id + 1;
        }
    }
    // ---------- Grab page elements ----------
    const budgetForm = document.querySelector("#budget-form");
    const budgetInput = document.querySelector("#budget-amount");
    const expenseForm = document.querySelector("#expense-form");
    const descriptionInput = document.querySelector("#expense-description");
    const amountInput = document.querySelector("#expense-amount");
    const categoryInput = document.querySelector("#expense-category");
    const dateInput = document.querySelector("#expense-date");
    const budgetMessage = document.querySelector("#budget-message");
    const budgetWarning = document.querySelector("#budget-warning");
    const expenseList = document.querySelector("#expense-list");
    const startingDisplay = document.querySelector("#starting-display");
    const totalDisplay = document.querySelector("#total-display");
    const remainingDisplay = document.querySelector("#remaining-display");

    // ---------- Show feedback ----------
    function showBudgetMessage(text, type) {
        budgetMessage.textContent = text;
        budgetMessage.className = "message " + type;
    }

    // ---------- Add up all expenses ----------
    function calculateTotal() {
        let total = 0;
        for (let i = 0; i < expenses.length; i++) {
            total = total + expenses[i].amount; // amounts are numbers, so this is real addition
        }
        return total;
    }

    // ---------- Update the three summary boxes ----------
    function updateSummary() {
        const total = calculateTotal();
        const remaining = startingBudget - total;

        startingDisplay.textContent = "GH₵ " + startingBudget.toFixed(2);
        totalDisplay.textContent = "GH₵ " + total.toFixed(2);
        remainingDisplay.textContent = "GH₵ " + remaining.toFixed(2);

        if (remaining < 0) {
            remainingDisplay.className = "stat-value negative";
            budgetWarning.textContent =
                "Warning: you have spent GH₵ " + Math.abs(remaining).toFixed(2) +
                " more than your budget.";
        } else {
            remainingDisplay.className = "stat-value";
            budgetWarning.textContent = "";
        }
    }

    // ---------- Delete an expense ----------
    function deleteExpense(id) {
        for (let i = 0; i < expenses.length; i++) {
            if (expenses[i].id === id) {
                expenses.splice(i, 1);
                break;
            }
        }
        saveData("expenses", expenses);
        renderExpenses(); updateSummary();
        showBudgetMessage("Expense deleted.", "success");
    }

    // ---------- Draw the expense list ----------
    function renderExpenses() {
        expenseList.innerHTML = "";

        if (expenses.length === 0) {
            expenseList.innerHTML = "<li class='empty'>No expenses recorded yet.</li>";
            return;
        }

        for (let i = 0; i < expenses.length; i++) {
            const expense = expenses[i];

            const li = document.createElement("li");
            li.className = "item";

            li.innerHTML =
                "<strong>" + expense.description + "</strong>" +
                "<span>" + expense.category + " &bull; " + expense.date + "</span>" +
                "<span class='badge'>GH₵ " + expense.amount.toFixed(2) + "</span>";

            const actions = document.createElement("div");
            actions.className = "actions";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "btn-delete";
            deleteBtn.addEventListener("click", function () {
                deleteExpense(expense.id);
            });
            actions.appendChild(deleteBtn);

            li.appendChild(actions);
            expenseList.appendChild(li);
        }
    }

    // ---------- Set the starting budget ----------
    budgetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const amount = Number(budgetInput.value);

        if (budgetInput.value === "" || isNaN(amount) || amount <= 0) {
            showBudgetMessage("Enter a starting budget greater than 0.", "error");
            return;
        }

        startingBudget = amount;
        saveData("startingBudget", startingBudget);
        updateSummary();
        budgetForm.reset();
        showBudgetMessage("Starting budget set.", "success");
    });

    // ---------- Add an expense ----------
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = Number(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;

        if (startingBudget <= 0) {
            showBudgetMessage("Set your starting budget first.", "error");
            return;
        }

        if (description === "" || date === "") {
            showBudgetMessage("Please fill in the description and date.", "error");
            return;
        }

        if (amountInput.value === "" || isNaN(amount) || amount <= 0) {
            showBudgetMessage("Enter an amount greater than 0.", "error");
            return;
        }

        const newExpense = {
            id: nextExpenseId,
            description: description,
            amount: amount,
            category: category,
            date: date
        };
        expenses.push(newExpense);
        nextExpenseId++;
        saveData("expenses", expenses);

        renderExpenses();
        updateSummary();
        expenseForm.reset();
        showBudgetMessage("Expense added!", "success");
    });

    // Draw everything once when the page first loads
    renderExpenses();
    updateSummary();
}

// =====================================================
// STUDY PLANNER (study.html)
// =====================================================

if (document.querySelector("#study-form")) {

    // ---------- Data ----------
    let activities = loadData("activities", []);
    let nextActivityId = 1;

    for (let i = 0; i < activities.length; i++) {
        if (activities[i].id >= nextActivityId) {
            nextActivityId = activities[i].id + 1;
        }
    }

    // ---------- Grab page elements ----------
    const studyForm = document.querySelector("#study-form");
    const studySubjectInput = document.querySelector("#study-subject");
    const studyDescriptionInput = document.querySelector("#study-description");
    const studyDateInput = document.querySelector("#study-date");
    const studyMessage = document.querySelector("#study-message");
    const studyList = document.querySelector("#study-list");
    const studyTotalDisplay = document.querySelector("#study-total");
    const studyCompletedDisplay = document.querySelector("#study-completed");

    // ---------- Show feedback ----------
    function showStudyMessage(text, type) {
        studyMessage.textContent = text;
        studyMessage.className = "message " + type;
    }

    // ---------- Count completed activities ----------
    function countCompleted() {
        let count = 0;
        for (let i = 0; i < activities.length; i++) {
            if (activities[i].completed) {
                count++;
            }
        }
        return count;
    }

    // ---------- Update the progress boxes ----------
    function updateStudyProgress() {
        studyTotalDisplay.textContent = activities.length;
        studyCompletedDisplay.textContent = countCompleted();
    }

    // ---------- Mark an activity as completed ----------
    function completeActivity(id) {
        for (let i = 0; i < activities.length; i++) {
            if (activities[i].id === id) {
                activities[i].completed = true;
                break;
            }
        }
        saveData("activities", activities);
        renderActivities();
        updateStudyProgress();
        showStudyMessage("Activity marked as completed.", "success");
    }

    // ---------- Delete an activity ----------
    function deleteActivity(id) {
        for (let i = 0; i < activities.length; i++) {
            if (activities[i].id === id) {
                activities.splice(i, 1);
                break;
            }
        }
        saveData("activities", activities);
        renderActivities();
        updateStudyProgress();
        showStudyMessage("Activity deleted.", "success");
    }

    // ---------- Draw the list ----------
    function renderActivities() {
        studyList.innerHTML = "";

        if (activities.length === 0) {
            studyList.innerHTML = "<li class='empty'>No study activities planned yet.</li>";
            return;
        }

        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];

            const li = document.createElement("li");
            li.className = "item";
            if (activity.completed) {
                li.className = "item done";
            }

            const status = activity.completed ? "Completed" : "Pending";

            li.innerHTML =
                "<strong>" + activity.subject + ": " + activity.description + "</strong>" +
                "<span>" + activity.date + "</span>" +
                "<span class='badge status-" + status.toLowerCase() + "'>" +
                status + "</span>";

            const actions = document.createElement("div");
            actions.className = "actions";

            if (!activity.completed) {
                const completeBtn = document.createElement("button");
                completeBtn.textContent = "Complete";
                completeBtn.className = "btn-complete";
                completeBtn.addEventListener("click", function () {
                    completeActivity(activity.id);
                });
                actions.appendChild(completeBtn);
            }

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.className = "btn-delete";
            deleteBtn.addEventListener("click", function () {
                deleteActivity(activity.id);
            });
            actions.appendChild(deleteBtn);

            li.appendChild(actions);
            studyList.appendChild(li);
        }
    }

    // ---------- Handle the form ----------
    studyForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const subject = studySubjectInput.value.trim();
        const description = studyDescriptionInput.value.trim();
        const date = studyDateInput.value;

        if (subject === "" || description === "" || date === "") {
            showStudyMessage("Please fill in the subject, description and date.", "error");
            return;
        }

        const newActivity = {
            id: nextActivityId,
            subject: subject,
            description: description,
            date: date,
            completed: false
        };
        activities.push(newActivity);
        nextActivityId++;
        saveData("activities", activities);

        renderActivities();
        updateStudyProgress();
        studyForm.reset();
        showStudyMessage("Study activity added!", "success");
    });

    // Draw everything once when the page first loads
    renderActivities();
    updateStudyProgress();
}