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

// =====================================================
// BUDGET TRACKER (budget.html)
// =====================================================

if (document.querySelector("#expense-form")) {

    // ---------- Data ----------
    let startingBudget = 0;
    let expenses = [];
    let nextExpenseId = 1;

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
        renderExpenses();
        updateSummary();
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

        renderExpenses();
        updateSummary();
        expenseForm.reset();
        showBudgetMessage("Expense added!", "success");
    });

    // Draw everything once when the page first loads
    renderExpenses();
    updateSummary();
}