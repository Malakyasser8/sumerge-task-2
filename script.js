let pendingItems = [];
let pendingItemsIds = [];
let pendingItemsCount = 0;
let completedItemsCount = 0;
let selectedItem = null;

// firebase functions
const baseUrl = `https://firestore.googleapis.com/v1beta1/projects/sumerge-task-3-todo-list/databases/(default)/documents/todos`;
async function deleteTodo(itemId) {
  try {
    const response = await fetch(`${baseUrl}/${itemId}`, {
      method: "DELETE",
      headers: {},
    });

    const data = await response.json();
    console.log(`Deleted data of document id: ${itemId}`);
  } catch (error) {
    console.log(`Error while deleting doc. Error: ${error}`);
  }
}

async function updateTodo(itemId, newBody) {
  try {
    const response = await fetch(
      `${baseUrl}/${itemId}?updateMask.fieldPaths=status`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fields: {
            status: { stringValue: newBody.status },
          },
        }),
      }
    );

    const data = await response.json();
    console.log(
      `Updated data of document id: ${itemId} with data: ${JSON.stringify(
        data
      )}`
    );
  } catch (error) {
    console.log(`Error while deleting all docs. Error: ${error}`);
  }
}

async function insertTodo(newItem) {
  try {
    const response = await fetch(baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: {
          name: { stringValue: newItem.name },
          priority: { integerValue: String(newItem.priority) },
          status: { stringValue: newItem.status },
        },
      }),
    });

    const data = await response.json();
    return { id: data.name.split("/").pop(), ...newItem };
  } catch (error) {
    console.log(`Error while inserting a new todo. Error: ${error}`);
  }
}

async function getAllTodos() {
  try {
    const response = await fetch(baseUrl, {
      method: "GET",
      headers: {},
    });

    const data = await response.json();
    const list = data.documents?.map((doc) => {
      const fields = doc.fields || {};
      return {
        id: doc.name?.split("/").pop() || "",
        name: fields.name?.stringValue || "",
        priority: parseInt(fields.priority?.integerValue || "1"),
        status: fields.status?.stringValue || "pending",
      };
    });

    console.log(list);

    return list || [];
  } catch (error) {
    console.log(`Error while getting all docs. Error: ${error}`);
  }
}

async function deleteAllTodos() {
  try {
    const list = await getAllTodos();
    for (const item of list) {
      await deleteTodo(item.id);
    }
  } catch (error) {
    console.log(`Error while deleting all docs. Error: ${error}`);
  }
}

//js functions
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

function addNewPendingTodo(newId, todoTextInput, priorityValue) {
  let checkItem = document.getElementById("pending-check-item");
  let checkItemLabel = checkItem.content.querySelector(
    "#pending-check-item-label"
  );
  let checkItemDiv = checkItem.content.querySelector("div");
  let pendingList = document.getElementById("pending-list-items");

  //Set the checkbox label to the input text
  checkItemLabel.innerHTML = `${priorityValue}. ${todoTextInput}`;
  pendingItemsIds.push(newId);
  pendingItems.push(todoTextInput);

  //empty value in text input and numeric input
  document.getElementById("todo-text-input").value = "";
  document.getElementById("priority-value").value = "";

  //Add item to the pending list and inc count
  pendingItemsCount++;
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

  const duplicates = pendingItems.filter((item) => {
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
  pendingItemsIds = pendingItemsIds.filter((item) => {
    return item != checkItemId;
  });

  //Add item to the completed list and inc count
  completedItemsCount++;

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

  const newId = `completed-check-item-id-${completedItemsCount}`;
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
