# Ashesi Life Planner

A simple web application that helps university students organise their assignments, track their spending in Ghanaian cedis (GH₵), and plan their study time. Built with HTML, CSS, and vanilla JavaScript, with no frameworks or backend.

## Features

- **Dashboard:** summary of outstanding assignments, upcoming deadlines, starting and remaining budget, and completed study activities.
- **Assignment Tracker:** add assignments with a title, subject, due date, and priority; mark them as completed; delete them.
- **Budget Tracker:** set a starting budget, record expenses by category and date, and see the total spent and remaining balance. Warns when spending exceeds the budget.
- **Study Planner:** plan study activities by subject and date, mark them as completed, and see a progress count.
- Data is saved in the browser, so it is still there after a refresh.

## Project Structure

    student-life-hub/
    ├── index.html    Dashboard
    ├── tasks.html    Assignment tracker
    ├── budget.html   Budget tracker
    ├── study.html    Study planner
    ├── style.css     Shared styles
    └── script.js     Shared logic (one section per page)

## How to Run

1. Download or clone this repository.
2. Open `index.html` in any modern web browser.

No installation or server is needed.

## Concepts Demonstrated

- **HTML:** semantic structure, forms, labels, input types, lists, navigation
- **CSS:** classes, cards, flexbox, grid, responsive layout with a media query
- **JavaScript:** variables, arrays of objects, functions, conditionals, loops, comparison operators, arithmetic
- **DOM:** `querySelector`, `createElement`, updating content, `addEventListener`
- **Validation and numbers:** `Number()`, `isNaN()`, `toFixed(2)`
- **Browser storage:** `localStorage` with `JSON.stringify` and `JSON.parse`

## Limitations

- Data is stored per browser and device, and clearing browser data erases it.
- There are no user accounts.

## Possible Future Extensions

- Edit existing records
- Spending breakdown by category
- A backend and database so data can be shared between devices