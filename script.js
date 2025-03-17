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
        this.displayTasks();
    }

    saveTasks() {
        localStorage.setItem("tasks", JSON.stringify(this.tasks));
    }

    addTask(task) {
        this.tasks.push(task);
        this.saveTasks();
        this.displayTasks();
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
            this.displayTasks();
            if (task.priority === "high") this.showNotification("High-priority task updated!");
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.displayTasks();
    }

    toggleTaskCompletion(id) {
        const task = this.tasks.find(task => task.id == id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.displayTasks();
        }
    }

    filterTasks(category) {
        let filteredTasks = this.tasks;
        if (category !== "All") {
            filteredTasks = this.tasks.filter(task => task.category === category);
        }
        this.displayTasks(filteredTasks);
    }

    searchTasks(query) {
        const searchedTasks = this.tasks.filter(task =>
            task.title.toLowerCase().includes(query.toLowerCase()) ||
            task.description.toLowerCase().includes(query.toLowerCase())
        );
        this.displayTasks(searchedTasks);
    }

    sortTasks(order) {
        if (order === "low-to-high") {
            this.tasks.sort((a, b) => this.getPriorityValue(a.priority) - this.getPriorityValue(b.priority));
        } else if (order === "high-to-low") {
            this.tasks.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
        }
        this.saveTasks();
        this.displayTasks();
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

// Ensure theme is applied BEFORE other scripts run
document.addEventListener("DOMContentLoaded", function () {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
    }
});

// Dark Mode Toggle Fix
document.getElementById("theme-toggle").addEventListener("click", function () {
    // Toggle the dark mode class
    document.body.classList.toggle("dark-mode");

    // Save the theme preference
    if (document.body.classList.contains("dark-mode")) {
        localStorage.setItem("theme", "dark");
    } else {
        localStorage.setItem("theme", "light");
    }
});

// Event Listeners
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

// Category Filter Dropdown Event Listener
document.getElementById("category-filter").addEventListener("change", function () {
    taskManager.filterTasks(this.value);
});

// Search Feature
document.getElementById("search-bar").addEventListener("input", function () {
    taskManager.searchTasks(this.value);
});

// Sort Event Listener
document.getElementById("sort-tasks").addEventListener("change", function () {
    taskManager.sortTasks(this.value);
});
