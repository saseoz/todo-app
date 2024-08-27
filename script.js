// dark-light mode
const modeBtn = document.querySelector(".toggle-mode");

modeBtn.addEventListener("click", () => {
    if (!document.body.classList.contains("dark-mode")) {
        modeBtn.setAttribute("data-changed", true);
        document.body.classList.add("dark-mode");
        localStorage.setItem("mode", "dark");
    } else {
        modeBtn.setAttribute("data-changed", false);
        document.body.classList.remove("dark-mode");
        localStorage.setItem("mode", "light");
    }
});

// add-clear-remove task
const inputForm = document.getElementById("input-form");
const textInput = document.getElementById("text-input");

const listItemWrap = document.querySelector("ul");

const clearCompletedBtn = document.querySelector(".clear-completed-btn");

const allBtn = document.querySelector(".all-btn");
const activeBtn = document.querySelector(".active-btn");
const completedBtn = document.querySelector(".completed-btn");
const conditionBtns = document.querySelectorAll(".condition-wrap button");

let itemNumber = document.querySelector(".item-number");
let itemCount = 0;

// get text-input value
inputForm.addEventListener("submit", (e) => {
    e.preventDefault();
    createLiElement(textInput.value);
    textInput.value = "";
});

// remove li element
function removeLiElement(btn) {
    const parentLi = btn.parentElement;
    const checkbox = parentLi.querySelector('.check-box');

    // Only decrease the count if the task is not completed
    if (!checkbox.checked) {
        itemCount--;
    }
    parentLi.remove();
    itemNumber.textContent = itemCount;
    saveListToLocalStorage();
}

// line through completed task
function checkboxButtonLineThrough(checkboxBtn) {
    const parentLi = checkboxBtn.parentElement.parentElement;

    // If marking as completed, decrease active count
    if (checkboxBtn.checked) {
        itemCount--;
        parentLi.classList.remove("active");
        parentLi.classList.add("completed");
    } else {
        // If marking as active again, increase active count
        itemCount++;
        parentLi.classList.remove("completed");
        parentLi.classList.add("active");
    }

    checkboxBtn.nextElementSibling.classList.toggle("line-through");
    itemNumber.textContent = itemCount;
    saveListToLocalStorage();
}

// clear all the selected items
clearCompletedBtn.addEventListener("click", () => {
    document.querySelectorAll(".completed-item").forEach(item => {
        item.parentElement.parentElement.remove();
    });
    saveListToLocalStorage();
});

// highlight the selected condition 
function highlightCondition(el) {
    conditionBtns.forEach(btn => {
        btn.setAttribute("data-selected", false);
    });
    el.setAttribute("data-selected", true);
    saveListToLocalStorage();
}

conditionBtns.forEach(btn => {
    btn.addEventListener("click", () => {
        highlightCondition(btn);
    });
});

// create li item  
function createLiElement(item, completed = false) {
    const li = document.createElement("li");
    li.classList.add("active");
    li.setAttribute("draggable", "true"); 
    li.innerHTML = `
        <div class="flex">
            <input class="check-box" type="checkbox" ${completed ? 'checked' : ''} data-checked="false">
            <p class="li-item">${item}</p>
        </div>
        <button class="remove-btn"></button>
    `;

    const removeLiBtn = li.querySelector(".remove-btn");
    removeLiBtn.addEventListener("click", () => {
        removeLiElement(removeLiBtn);
    });

    const checkboxBtn = li.querySelector(".check-box");

    if (completed) {
        checkboxBtn.classList.add("completed-item");
        checkboxBtn.nextElementSibling.classList.add("line-through");
        li.classList.remove("active");
        li.classList.add("completed");
    }

    checkboxBtn.addEventListener("change", () => {
        checkboxBtn.classList.toggle("completed-item");
        checkboxButtonLineThrough(checkboxBtn);
    });
    // Drag and Drop Event Listeners
    li.addEventListener("dragstart", handleDragStart);
    li.addEventListener("dragover", handleDragOver);
    li.addEventListener("drop", handleDrop);
    li.addEventListener("dragend", handleDragEnd);

    // Only count active (non-completed) items
    if (!completed) {
        itemCount++;
    }
    itemNumber.textContent = itemCount;

    listItemWrap.appendChild(li);
    saveListToLocalStorage();

    activeBtn.addEventListener("click", () => {
        li.classList.remove("hidden-element");
        if (!li.classList.contains("active")) {
            li.classList.add("hidden-element");
        }
    });

    allBtn.addEventListener("click", () => {
        li.classList.remove("hidden-element");
    });

    completedBtn.addEventListener("click", () => {
        li.classList.remove("hidden-element");
        if (!li.classList.contains("completed")) {
            li.classList.add("hidden-element");
        }
    });
}

// Function to save the list items to local storage
function saveListToLocalStorage() {
    const items = [];
    document.querySelectorAll('ul li').forEach(li => {
        items.push({
            text: li.querySelector('.li-item').textContent,
            completed: li.querySelector('.check-box').checked // Save the checkbox state
        });
    });
    localStorage.setItem('listItems', JSON.stringify(items));
}

// Load list from local storage
function loadListFromLocalStorage() {
    const items = JSON.parse(localStorage.getItem('listItems')) || [];
    itemCount = 0; // Reset item count when loading

    items.forEach(item => {
        createLiElement(item.text, item.completed); // Pass the saved completed state
    });

    // Count only active tasks
    const activeItems = items.filter(item => !item.completed).length;
    itemCount = activeItems;
    itemNumber.textContent = itemCount;
}

// Load dark mode setting from local storage
function loadModeFromLocalStorage() {
    const savedMode = localStorage.getItem("mode");
    if (savedMode === "dark") {
        document.body.classList.add("dark-mode");
        modeBtn.setAttribute("data-changed", true);
    } else {
        document.body.classList.remove("dark-mode");
        modeBtn.setAttribute("data-changed", false);
    }
}

loadListFromLocalStorage();
loadModeFromLocalStorage();

// Drag-and-Drop Handlers
let draggedItem = null;

function handleDragStart(e) {
    draggedItem = this; 
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/html", this.innerHTML); 
    this.classList.add("dragging");
}

function handleDragOver(e) {
    e.preventDefault(); 
    e.dataTransfer.dropEffect = "move"; 
    this.classList.add("drag-over");
}

function handleDrop(e) {
    e.preventDefault();
    if (draggedItem !== this) {
        const bounding = this.getBoundingClientRect();
        const offset = e.clientY - bounding.top;
        const position = offset > bounding.height / 2 ? "afterend" : "beforebegin";
        this.insertAdjacentElement(position, draggedItem);
    }
    this.classList.remove("drag-over");
    draggedItem.classList.remove("dragging");
    draggedItem = null;
    saveListToLocalStorage();
}

function handleDragEnd() {
    document.querySelectorAll('li').forEach(li => li.classList.remove("drag-over", "dragging"));
}