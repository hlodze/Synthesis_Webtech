// =====================================================
// STUDENT LIFE HUB - script.js
// One shared script for all four pages.
// Each section only runs on the page that has its form/elements.
// =====================================================


// =====================================================
// SHARED HELPERS (saving, loading, safe text, budgets)
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

// Make user-typed text safe to place inside innerHTML
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;   // textContent treats the text as plain text
    return div.innerHTML;     // reading innerHTML back gives the safe version
}

// Load all budgets. On first run after this update, convert the old
// single budget and expense list into one budget so nothing is lost.
function loadBudgets() {
    let budgets = loadData("budgets", null);

    if (budgets === null) {
        budgets = [];
        const oldAmount = loadData("startingBudget", 0);
        const oldExpenses = loadData("expenses", []);

        if (oldAmount > 0 || oldExpenses.length > 0) {
            budgets.push({
                id: 1,
                name: "My Budget",
                amount: oldAmount,
                expenses: oldExpenses
            });
        }
        saveData("budgets", budgets);
    }

    return budgets;
}

// Find the budget the user was last viewing (or the first one)
function getActiveBudget(budgets) {
    const activeId = loadData("activeBudgetId", null);

    for (let i = 0; i < budgets.length; i++) {
        if (budgets[i].id === activeId) {
            return budgets[i];
        }
    }

    if (budgets.length > 0) {
        return budgets[0];
    }
    return null; // no budgets exist yet
}


// =====================================================
// ASSIGNMENT TRACKER (tasks.html)
// =====================================================

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
                break; // found it, no need to keep looping
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
                tasks.splice(i, 1); // remove 1 item at position i
                break;
            }
        }
        saveData("tasks", tasks);
        renderTasks();
        showTaskMessage("Assignment deleted.", "success");
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
            if (task.completed) {
                li.className = "item done"; // lets CSS strike through the title
            }

            const status = task.completed ? "Completed" : "Pending";

            li.innerHTML =
                "<strong>" + escapeHTML(task.title) + "</strong>" +
                "<span>" + escapeHTML(task.subject) + " &bull; Due " + task.due + "</span>" +
                "<span class='badge priority-" + task.priority.toLowerCase() + "'>" +
                task.priority + "</span>" +
                "<span class='badge status-" + status.toLowerCase() + "'>" +
                status + "</span>";

            // Container for the buttons
            const actions = document.createElement("div");
            actions.className = "actions";

            // Complete button (only shown while the assignment is pending)
            if (!task.completed) {
                const completeBtn = document.createElement("button");
                completeBtn.textContent = "Complete";
                completeBtn.className = "btn-complete";
                completeBtn.addEventListener("click", function () {
                    completeTask(task.id);
                });
                actions.appendChild(completeBtn);
            }

            // Delete button (always shown)
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

    // Draw the list when the page first loads
    renderTasks();
}


// =====================================================
// BUDGET TRACKER (budget.html)
// =====================================================

if (document.querySelector("#expense-form")) {

    // ---------- Data ----------
    let budgets = loadBudgets();
    let activeBudget = getActiveBudget(budgets);
    let nextBudgetId = 1;
    let nextExpenseId = 1;

    // Continue id numbering after the highest saved ids
    for (let i = 0; i < budgets.length; i++) {
        if (budgets[i].id >= nextBudgetId) {
            nextBudgetId = budgets[i].id + 1;
        }
        for (let j = 0; j < budgets[i].expenses.length; j++) {
            if (budgets[i].expenses[j].id >= nextExpenseId) {
                nextExpenseId = budgets[i].expenses[j].id + 1;
            }
        }
    }

    // ---------- Grab page elements ----------
    const budgetSelect = document.querySelector("#budget-select");
    const summaryTitle = document.querySelector("#summary-title");
    const budgetForm = document.querySelector("#budget-form");
    const budgetNameInput = document.querySelector("#budget-name");
    const budgetInput = document.querySelector("#budget-amount");
    const budgetFormMessage = document.querySelector("#budget-form-message");
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
    const manageCard = document.querySelector("#manage-card");
    const editForm = document.querySelector("#edit-budget-form");
    const editNameInput = document.querySelector("#edit-name");
    const editAmountInput = document.querySelector("#edit-amount");
    const deleteBudgetBtn = document.querySelector("#delete-budget-btn");
    const manageMessage = document.querySelector("#manage-message");

    // ---------- Show feedback ----------
    function showBudgetMessage(text, type) {
        budgetMessage.textContent = text;
        budgetMessage.className = "message " + type;
    }

    function showBudgetFormMessage(text, type) {
        budgetFormMessage.textContent = text;
        budgetFormMessage.className = "message " + type;
    }

    function showManageMessage(text, type) {
        manageMessage.textContent = text;
        manageMessage.className = "message " + type;
    }

    // ---------- Save everything ----------
    function saveBudgets() {
        saveData("budgets", budgets);
        if (activeBudget !== null) {
            saveData("activeBudgetId", activeBudget.id);
        } else {
            localStorage.removeItem("activeBudgetId");
        }
    }

    // ---------- Fill the budget dropdown ----------
    function renderBudgetSelect() {
        budgetSelect.innerHTML = "";

        if (budgets.length === 0) {
            const option = document.createElement("option");
            option.textContent = "No budgets yet";
            budgetSelect.appendChild(option);
            budgetSelect.disabled = true;
            return;
        }

        budgetSelect.disabled = false;

        for (let i = 0; i < budgets.length; i++) {
            const option = document.createElement("option");
            option.value = budgets[i].id;
            option.textContent = budgets[i].name; // textContent keeps typed names safe
            budgetSelect.appendChild(option);
        }

        budgetSelect.value = activeBudget.id;
    }

    // ---------- Add up the active budget's expenses ----------
    function calculateTotal() {
        let total = 0;
        for (let i = 0; i < activeBudget.expenses.length; i++) {
            total = total + activeBudget.expenses[i].amount; // amounts are numbers, so this is real addition
        }
        return total;
    }

    // ---------- Update the three summary boxes ----------
    function updateSummary() {
        if (activeBudget === null) {
            summaryTitle.textContent = "Budget Summary";
            startingDisplay.textContent = "GH₵ 0.00";
            totalDisplay.textContent = "GH₵ 0.00";
            remainingDisplay.textContent = "GH₵ 0.00";
            remainingDisplay.className = "stat-value";
            budgetWarning.textContent = "";
            return;
        }

        const total = calculateTotal();
        const remaining = activeBudget.amount - total;

        summaryTitle.textContent = "Summary: " + activeBudget.name;
        startingDisplay.textContent = "GH₵ " + activeBudget.amount.toFixed(2);
        totalDisplay.textContent = "GH₵ " + total.toFixed(2);
        remainingDisplay.textContent = "GH₵ " + remaining.toFixed(2);

        if (remaining < 0) {
            remainingDisplay.className = "stat-value negative";
            budgetWarning.textContent =
                "Warning: you have spent GH₵ " + Math.abs(remaining).toFixed(2) +
                " more than this budget.";
        } else {
            remainingDisplay.className = "stat-value";
            budgetWarning.textContent = "";
        }
    }

    // ---------- Delete an expense ----------
    function deleteExpense(id) {
        for (let i = 0; i < activeBudget.expenses.length; i++) {
            if (activeBudget.expenses[i].id === id) {
                activeBudget.expenses.splice(i, 1);
                break;
            }
        }
        saveBudgets();
        renderExpenses();
        updateSummary();
        showBudgetMessage("Expense deleted.", "success");
    }

    // ---------- Draw the expense list ----------
    function renderExpenses() {
        expenseList.innerHTML = "";

        if (activeBudget === null) {
            expenseList.innerHTML = "<li class='empty'>Create a budget to start recording expenses.</li>";
            return;
        }

        if (activeBudget.expenses.length === 0) {
            expenseList.innerHTML = "<li class='empty'>No expenses recorded in this budget yet.</li>";
            return;
        }

        for (let i = 0; i < activeBudget.expenses.length; i++) {
            const expense = activeBudget.expenses[i];

            const li = document.createElement("li");
            li.className = "item";

            li.innerHTML =
                "<strong>" + escapeHTML(expense.description) + "</strong>" +
                "<span>" + escapeHTML(expense.category) + " &bull; " + expense.date + "</span>" +
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

    // ---------- Fill the edit form with the active budget ----------
    function fillEditForm() {
        if (activeBudget === null) {
            manageCard.style.display = "none"; // nothing to edit
            return;
        }
        manageCard.style.display = "block";
        editNameInput.value = activeBudget.name;
        editAmountInput.value = activeBudget.amount;
    }

    // ---------- Redraw the whole page ----------
    function refreshAll() {
        renderBudgetSelect();
        updateSummary();
        renderExpenses();
        fillEditForm();
    }

    // ---------- Switch budgets ----------
    budgetSelect.addEventListener("change", function () {
        const chosenId = Number(budgetSelect.value);

        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].id === chosenId) {
                activeBudget = budgets[i];
                break;
            }
        }

        saveBudgets();
        refreshAll();
        showBudgetMessage("", "success");
        showManageMessage("", "success");
    });

    // ---------- Create a new budget ----------
    budgetForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = budgetNameInput.value.trim();
        const amount = Number(budgetInput.value);

        if (name === "") {
            showBudgetFormMessage("Please give the budget a name.", "error");
            return;
        }

        if (budgetInput.value === "" || isNaN(amount) || amount <= 0) {
            showBudgetFormMessage("Enter a starting amount greater than 0.", "error");
            return;
        }

        // Don't allow two budgets with the same name
        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].name.toLowerCase() === name.toLowerCase()) {
                showBudgetFormMessage("A budget with that name already exists.", "error");
                return;
            }
        }

        const newBudget = {
            id: nextBudgetId,
            name: name,
            amount: amount,
            expenses: []
        };
        budgets.push(newBudget);
        nextBudgetId++;
        activeBudget = newBudget; // switch to the new budget straight away

        saveBudgets();
        refreshAll();
        budgetForm.reset();
        showBudgetFormMessage("Budget created!", "success");
    });

    // ---------- Add an expense ----------
    expenseForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const description = descriptionInput.value.trim();
        const amount = Number(amountInput.value);
        const category = categoryInput.value;
        const date = dateInput.value;

        if (activeBudget === null) {
            showBudgetMessage("Create a budget first.", "error");
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
        activeBudget.expenses.push(newExpense);
        nextExpenseId++;

        saveBudgets();
        renderExpenses();
        updateSummary();
        expenseForm.reset();
        showBudgetMessage("Expense added!", "success");
    });

    // ---------- Edit the active budget ----------
    editForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const name = editNameInput.value.trim();
        const amount = Number(editAmountInput.value);

        if (name === "") {
            showManageMessage("Please give the budget a name.", "error");
            return;
        }

        if (editAmountInput.value === "" || isNaN(amount) || amount <= 0) {
            showManageMessage("Enter a starting amount greater than 0.", "error");
            return;
        }

        // Check for duplicate names, ignoring the budget we're editing
        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].id !== activeBudget.id &&
                budgets[i].name.toLowerCase() === name.toLowerCase()) {
                showManageMessage("A budget with that name already exists.", "error");
                return;
            }
        }

        activeBudget.name = name;
        activeBudget.amount = amount;

        saveBudgets();
        refreshAll();
        showManageMessage("Budget updated.", "success");
    });

    // ---------- Delete the active budget ----------
    deleteBudgetBtn.addEventListener("click", function () {
        const sure = confirm(
            "Delete \"" + activeBudget.name + "\" and all its expenses? This cannot be undone."
        );

        if (!sure) {
            return; // user pressed Cancel
        }

        for (let i = 0; i < budgets.length; i++) {
            if (budgets[i].id === activeBudget.id) {
                budgets.splice(i, 1);
                break;
            }
        }

        // Switch to another budget, or to none if that was the last one
        if (budgets.length > 0) {
            activeBudget = budgets[0];
        } else {
            activeBudget = null;
        }

        saveBudgets();
        refreshAll();
        showBudgetFormMessage("Budget deleted.", "success");
    });

    // Draw everything once when the page first loads
    refreshAll();
}


// =====================================================
// STUDY PLANNER (study.html)
// =====================================================

if (document.querySelector("#study-form")) {

    // ---------- Data ----------
    let activities = loadData("activities", []);
    let nextActivityId = 1;

    // Continue the id numbering after the highest saved id
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
                "<strong>" + escapeHTML(activity.subject) + ": " +
                escapeHTML(activity.description) + "</strong>" +
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


// =====================================================
// DASHBOARD (index.html)
// =====================================================

if (document.querySelector("#dash-outstanding")) {

    // ---------- Load the saved data ----------
    const tasks = loadData("tasks", []);
    const budgets = loadBudgets();
    const activeBudget = getActiveBudget(budgets);
    const expenses = activeBudget ? activeBudget.expenses : [];
    const startingBudget = activeBudget ? activeBudget.amount : 0;
    const activities = loadData("activities", []);

    // ---------- Grab page elements ----------
    const outstandingDisplay = document.querySelector("#dash-outstanding");
    const startingDisplay = document.querySelector("#dash-starting");
    const remainingDisplay = document.querySelector("#dash-remaining");
    const studyDisplay = document.querySelector("#dash-study");
    const upcomingList = document.querySelector("#dash-upcoming");

    // ---------- Collect pending assignments ----------
    const pending = [];
    for (let i = 0; i < tasks.length; i++) {
        if (!tasks[i].completed) {
            pending.push(tasks[i]);
        }
    }

    // ---------- Total expenses and remaining budget ----------
    let totalExpenses = 0;
    for (let i = 0; i < expenses.length; i++) {
        totalExpenses = totalExpenses + expenses[i].amount;
    }
    const remaining = startingBudget - totalExpenses;

    // ---------- Count completed study activities ----------
    let completedStudy = 0;
    for (let i = 0; i < activities.length; i++) {
        if (activities[i].completed) {
            completedStudy++;
        }
    }

    // ---------- Fill in the summary cards ----------
    outstandingDisplay.textContent = pending.length;
    startingDisplay.textContent = "GH₵ " + startingBudget.toFixed(2);
    remainingDisplay.textContent = "GH₵ " + remaining.toFixed(2);
    studyDisplay.textContent = completedStudy;

    if (remaining < 0) {
        remainingDisplay.className = "stat-value negative";
    }

    // ---------- Upcoming assignments (soonest first, max 5) ----------
    pending.sort(function (a, b) {
        if (a.due < b.due) {
            return -1; // a comes first
        }
        if (a.due > b.due) {
            return 1;  // b comes first
        }
        return 0;
    });

    const today = new Date().toISOString().slice(0, 10);

    if (pending.length === 0) {
        upcomingList.innerHTML = "<li class='empty'>No outstanding assignments. Nice work!</li>";
    } else {
        for (let i = 0; i < pending.length && i < 5; i++) {
            const task = pending[i];

            const li = document.createElement("li");
            li.className = "item";

            let dueLabel = "";
            if (task.due < today) {
                dueLabel = "<span class='badge priority-high'>Overdue</span>";
            }

            li.innerHTML =
                "<strong>" + escapeHTML(task.title) + "</strong>" +
                "<span>" + escapeHTML(task.subject) + " &bull; Due " + task.due + "</span>" +
                "<span class='badge priority-" + task.priority.toLowerCase() + "'>" +
                task.priority + "</span>" +
                dueLabel;

            upcomingList.appendChild(li);
        }
    }
}