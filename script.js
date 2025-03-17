// Task Class
class Task {
    constructor(title, description, priority, category) {
        this.id = Date.now();
        this.title = title;
        this.description = description;
        this.priority = priority;
        this.category = category;
        this.completed = false;
    }
}

// Task Manager Class
class TaskManager {
    constructor() {
        this.tasks = JSON.parse(localStorage.getItem("tasks")) || [];
        this.currentSortOrder = localStorage.getItem("sortOrder") || "none";
        this.currentFilter = "All"; // Track selected category
        this.applySortAndDisplay();
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.applySortAndDisplay();
        if (task.priority === "high") this.showNotification("High-priority task added!");
    }

    updateTask(id, newTitle, newDescription, newPriority, newCategory) {
        const task = this.tasks.find(task => task.id == id);
        if (task) {
            task.title = newTitle;
            task.description = newDescription;
            task.priority = newPriority;
            task.category = newCategory;
            this.saveTasks();
            this.applySortAndDisplay();
            if (task.priority === "high") this.showNotification("High-priority task updated!");
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.applySortAndDisplay();
    }

    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id == id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.applySortAndDisplay();
        }
    }

    // ✅ **Fixed Filtering Function**
    filterTasks(category) {
        this.currentFilter = category; // Store the selected category
        this.applySortAndDisplay();
    }

    searchTasks(query) {
        const searchedTasks = this.tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );
        this.displayTasks(searchedTasks);
    }

    // ✅ **Fully Fixed Sorting Function**
    sortTasks(order) {
        this.currentSortOrder = order;
        localStorage.setItem("sortOrder", order);
        this.applySortAndDisplay();
    }

    applySortAndDisplay() {
        let filteredTasks = [...this.tasks];

        // Apply filtering first
        if (this.currentFilter !== "All") {
            filteredTasks = filteredTasks.filter(task => task.category === this.currentFilter);
        }

        // Apply sorting
        if (this.currentSortOrder === "low-to-high") {
            filteredTasks.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
        } else if (this.currentSortOrder === "high-to-low") {
            filteredTasks.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
        }

        this.displayTasks(filteredTasks);
        this.saveTasks();
    }

    getPriorityValue(priority) {
        const priorityMap = { low: 1, medium: 2, high: 3 };
        return priorityMap[priority.toLowerCase()] || 0;
    }

    displayTasks(filteredTasks = this.tasks) {
        const taskList = document.getElementById("task-list");
        taskList.innerHTML = "";

        filteredTasks.forEach(task => {
            const taskElement = document.createElement("div");
            taskElement.className = "task";
            if (task.completed) taskElement.classList.add("completed");
            taskElement.innerHTML = `
                <div class="task-content">
                    <strong ${task.completed ? 'style="text-decoration: line-through; opacity: 0.6;"' : ""}>${task.title}</strong> 
                    - ${task.description} 
                    [${task.priority}] - ${task.category}
                </div>
                <div class="task-actions">
                    <button onclick="taskManager.toggleTaskCompletion(${task.id})">✔</button>
                    <button onclick="taskManager.deleteTask(${task.id})">❌</button>
                </div>
            `;
            taskList.appendChild(taskElement);
        });
    }

    showNotification(message) {
        const notification = document.getElementById("notification");
        notification.innerText = message;
        notification.style.display = "block";
        setTimeout(() => {
            notification.style.display = "none";
        }, 3000);
    }
}

const taskManager = new TaskManager();

// ✅ **Ensure theme and sorting are applied BEFORE other scripts run**
document.addEventListener("DOMContentLoaded", function () {
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }

    const savedSortOrder = localStorage.getItem("sortOrder") || "none";
    document.getElementById("sort-tasks").value = savedSortOrder;
    taskManager.applySortAndDisplay();
});

// ✅ **Dark Mode Toggle**
document.getElementById("theme-toggle").addEventListener("click", function () {
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
});

// ✅ **Category Filter Buttons**
document.querySelectorAll(".filter-btn").forEach(button => {
    button.addEventListener("click", function () {
        taskManager.filterTasks(this.dataset.category);
    });
});

// ✅ **Sort Event Listener**
document.getElementById("sort-tasks").addEventListener("change", function () {
    taskManager.sortTasks(this.value);
});

// ✅ **Task Form Event Listener**
document.getElementById("task-form").addEventListener("submit", function (e) {
    e.preventDefault();
    const title = document.getElementById("task-title").value.trim();
    const description = document.getElementById("task-desc").value.trim();
    const priority = document.getElementById("task-priority").value;
    const category = document.getElementById("task-category").value;

    if (title === "" || description === "") {
        alert("Error: Task Title and Description cannot be empty!");
        return;
    }

    const task = new Task(title, description, priority, category);
    taskManager.addTask(task);
    this.reset();
});
