let pendingItems = [];
// const completedItems = [];
let pendingItemsCount = 0;
let completedItemsCount = 0;

let selectedItem = null;

document.addEventListener("DOMContentLoaded", function () {
  pendingList = document.getElementById("pending-list-items");
  completedList = document.getElementById("completed-list-items");

  completedList.addEventListener("dragover", function (e) {
    e.preventDefault();
    completedList.classList.add("drag-over");
  });

  completedList.addEventListener("dragleave", function () {
    completedList.classList.remove("drag-over");
  });

  completedList.addEventListener("drop", function (e) {
    e.preventDefault();
    completedList.classList.remove("drag-over");

    if (selectedItem) {
      console.log(selectedItem.querySelector("input"));
      addTodoToCompletedList(selectedItem.querySelector("input"));
      selectedItem = null;
    }
  });
});

function makeDraggable(element) {
  element.setAttribute("draggable", "true");

  element.addEventListener("dragstart", function (e) {
    selectedItem = element;
  });
}

function addTodoToPendingList(event) {
  event.preventDefault();
  const todoTextInput = document.getElementById("todo-text-input").value;
  const errorDiv = document.getElementById("error-input");

  if (todoTextInput.length == 0) {
    errorDiv.style.display = "block";
    return;
  }

  const duplicates = pendingItems.filter((item) => {
    return item == todoTextInput;
  });

  if (duplicates.length != 0) {
    errorDiv.innerHTML = "Can't Add Duplicated Pending Todos";
    errorDiv.style.display = "block";
    return;
  }

  errorDiv.style.display = "none";

  let checkItem = document.getElementById("pending-check-item");
  let checkItemLabel = checkItem.content.querySelector(
    "#pending-check-item-label"
  );
  let checkItemDiv = checkItem.content.querySelector("div");
  let pendingList = document.getElementById("pending-list-items");

  //Set the checkbox label to the input text
  checkItemLabel.innerHTML = todoTextInput;
  pendingItems.push(todoTextInput);

  //empty value in text input
  document.getElementById("todo-text-input").value = "";

  //Add item to the pending list and inc count
  pendingItemsCount++;
  const newId = `pending-check-item-id-${pendingItemsCount}`;
  checkItemDiv.id = newId;

  //append template content to the pending list
  let templateContent = checkItem.content;
  pendingList.appendChild(templateContent.cloneNode(true));

  makeDraggable(pendingList.lastElementChild);

  console.log(`Added new todo with text: ${todoTextInput} to the pending list`);
}

function addTodoToCompletedList(element) {
  console.log("element");
  console.log(element);
  const checkItemId = element.parentElement.id;
  const checkItemLabel = element.parentElement.querySelector("label").innerHTML;
  let checkItem = document.getElementById(checkItemId);
  checkItem.remove();

  let completedItem = document.getElementById("completed-check-item");
  let completedItemLabel = completedItem.content.querySelector("label");

  //Set the completed label to the checkboxtext
  completedItemLabel.innerHTML = checkItemLabel;

  //remove item from pending
  pendingItems = pendingItems.filter((item) => {
    return item != checkItemLabel;
  });

  //Add item to the completed list and inc count
  completedItemsCount++;
  const newId = `completed-check-item-id-${pendingItemsCount}`;
  element.parentElement.querySelector("label").id = newId;

  //append template content to the completed list
  let completedList = document.getElementById("completed-list-items");
  let templateContent = completedItem.content;
  completedList.appendChild(templateContent.cloneNode(true));
}

function searchTodoItems(inputId, listId) {
  const searchText = document.getElementById(inputId).value.toLowerCase();
  const list = document.getElementById(listId);
  const items = list.children;
  console.log(searchText);
  const shouldShowAll = searchText.length === 0;

  for (let item of items) {
    const label = item.querySelector("label");
    const text = label
      ? label.textContent.toLowerCase()
      : item.textContent.toLowerCase();

    console.log(text);

    item.style.display =
      shouldShowAll || text.includes(searchText) ? "flex" : "none";
  }
}
