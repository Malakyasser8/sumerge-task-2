import {
  initFirebase,
  getAllTodos,
  insertTodo,
  deleteAllTodos,
  updateTodo,
  deleteTodo,
} from "./firebase.js";

window.pendingItems = [];
window.pendingItemsIds = [];
window.pendingItemsCount = 0;
window.completedItemsCount = 0;
window.selectedItem = null;

// variable functions
window.addTodoToPendingList = addTodoToPendingList;
window.searchTodoItems = searchTodoItems;
window.addTodoToCompletedList = addTodoToCompletedList;
window.deleteAllData = deleteAllData;

function dragStart(element) {
  selectedItem = element;
}

function dragOver(element, e) {
  e.preventDefault();
  element.classList.add("drag-over");
}

function dragleave(element) {
  element.classList.remove("drag-over");
}

function drop(element) {
  element.classList.remove("drag-over");
  if (selectedItem) {
    addTodoToCompletedList(selectedItem.querySelector("input"));
    selectedItem = null;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  await initFirebase();
  const todos = await getAllTodos();
  const pendingTodos = todos.filter((item) => item.status == "pending");
  for (const item of pendingTodos) {
    addNewPendingTodo(item.id, item.name, item.priority);
  }
  const completedTodos = todos.filter((item) => item.status == "completed");
  for (const item of completedTodos) {
    await addCompletedTodo(item.id, `${item.priority}. ${item.name}`);
  }
});

function makeDraggable(element) {
  element.setAttribute("draggable", "true");

  element.addEventListener("dragstart", function (e) {
    window.selectedItem = element;
  });
}

function addNewPendingTodo(newId, todoTextInput, priorityValue) {
  let checkItem = document.getElementById("pending-check-item");
  let checkItemLabel = checkItem.content.querySelector(
    "#pending-check-item-label"
  );
  let checkItemDiv = checkItem.content.querySelector("div");
  let pendingList = document.getElementById("pending-list-items");

  //Set the checkbox label to the input text
  checkItemLabel.innerHTML = `${priorityValue}. ${todoTextInput}`;
  window.pendingItemsIds.push(newId);
  window.pendingItems.push(todoTextInput);

  //empty value in text input and numeric input
  document.getElementById("todo-text-input").value = "";
  document.getElementById("priority-value").value = "";

  //Add item to the pending list and inc count
  window.pendingItemsCount++;
  checkItemDiv.id = newId;

  //append template content to the pending list
  let newItem = checkItem.content.cloneNode(true).firstElementChild;
  newItem.setAttribute("data-priority", priorityValue);

  let inserted = false;
  for (let child of pendingList.children) {
    let childPriority = parseInt(child.getAttribute("data-priority"), 10);
    if (priorityValue < childPriority) {
      pendingList.insertBefore(newItem, child);
      inserted = true;
      break;
    }
  }
  if (!inserted) {
    pendingList.appendChild(newItem);
  }

  makeDraggable(newItem);
}

async function addTodoToPendingList(event) {
  event.preventDefault();
  const todoTextInput = document.getElementById("todo-text-input").value.trim();
  const priorityValue = document.getElementById("priority-value").value;
  const errorDiv = document.getElementById("error-input");

  if (todoTextInput.length == 0) {
    errorDiv.innerHTML = "Please input todo name";
    errorDiv.style.display = "block";
    return;
  }

  if (todoTextInput.length >= 500) {
    errorDiv.innerHTML = "Todo name must be between 1-500 characters";
    errorDiv.style.display = "block";
    return;
  }

  const duplicates = window.pendingItems.filter((item) => {
    return item.toLowerCase() == todoTextInput.toLowerCase();
  });

  if (duplicates.length != 0) {
    errorDiv.innerHTML = "Can't add duplicated pending todos names";
    errorDiv.style.display = "block";
    return;
  }

  errorDiv.style.display = "none";

  const priorityNumber = parseInt(priorityValue, 10);
  const reponse = await insertTodo({
    priority: priorityNumber,
    name: todoTextInput,
    status: "pending",
  });
  addNewPendingTodo(reponse.id, todoTextInput, priorityNumber);

  console.log(
    `Successfully added new todo with text: ${todoTextInput} with priority ${priorityValue} to the database`
  );
}

async function addCompletedTodo(checkItemId, checkItemLabel) {
  //empty pending list to show empty effect
  let pendingListItems = document.getElementById("pending-list-items");
  if (pendingListItems.childElementCount == 0) pendingListItems.innerHTML = "";

  let completedItem = document.getElementById("completed-check-item");
  let completedItemLabel = completedItem.content.querySelector("label");

  //Set the completed label to the checkboxtext
  completedItemLabel.innerHTML = checkItemLabel;

  //remove item from pending list and database
  window.pendingItemsIds = window.pendingItemsIds.filter((item) => {
    return item != checkItemId;
  });

  //Add item to the completed list and inc count
  window.completedItemsCount++;

  //append template content to the completed list
  let completedList = document.getElementById("completed-list-items");
  let templateContent = completedItem.content;
  completedList.prepend(templateContent.cloneNode(true));
}

async function addTodoToCompletedList(element) {
  const checkItemId = element.parentElement.id;
  const checkItemLabel = element.parentElement.querySelector("label").innerHTML;

  let checkItem = document.getElementById(checkItemId);
  checkItem.remove();

  await addCompletedTodo(checkItemId, checkItemLabel);

  await updateTodo(checkItemId, {
    status: "completed",
  });

  const newId = `completed-check-item-id-${window.completedItemsCount}`;
  element.parentElement.querySelector("label").id = newId;
}

function searchTodoItems(inputId, listId) {
  const searchText = document.getElementById(inputId).value.toLowerCase();
  const list = document.getElementById(listId);
  const items = list.children;
  const shouldShowAll = searchText.length === 0;

  for (let item of items) {
    const label = item.querySelector("label");
    const text = label
      ? label.textContent.toLowerCase()
      : item.textContent.toLowerCase();
    item.style.display =
      shouldShowAll || text.includes(searchText) ? "flex" : "none";
  }
}

async function deleteAllData() {
  await deleteAllTodos();
  location.reload();
}
