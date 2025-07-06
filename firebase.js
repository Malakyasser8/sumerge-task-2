import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

let app;
let db;
let todosCollection;

export async function initFirebase() {
  try {
    const firebaseConfig = {
      apiKey: "AIzaSyCBmENHVczw_URDm00gMnohezionXsj9L0",
      authDomain: "sumerge-task-3-todo-list.firebaseapp.com",
      databaseURL:
        "https://sumerge-task-3-todo-list-default-rtdb.firebaseio.com",
      projectId: "sumerge-task-3-todo-list",
      storageBucket: "sumerge-task-3-todo-list.firebasestorage.app",
      messagingSenderId: "252068927259",
      appId: "1:252068927259:web:d7bfb7fa0b078061d7e5be",
    };

    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    todosCollection = collection(db, "todos");
  } catch (error) {
    console.log(`Failed to inilialize firebase. Error: ${error}`);
  }
}

export async function deleteTodo(itemId) {
  try {
    const docRef = doc(db, "todos", itemId);
    await deleteDoc(docRef);
  } catch (error) {
    console.log(`Error while deleting all docs. Error: ${error}`);
  }
}

export async function updateTodo(itemId, newBody) {
  try {
    const docRef = doc(db, "todos", itemId);
    await updateDoc(docRef, newBody);
  } catch (error) {
    console.log(`Error while deleting all docs. Error: ${error}`);
  }
}

export async function insertTodo(newItem) {
  try {
    const newDocRef = await addDoc(todosCollection, newItem);
    console.log(newDocRef);
    return newDocRef;
  } catch (error) {
    console.log(`Error while inserting a new todo. Error: ${error}`);
  }
}

export async function getAllTodos() {
  try {
    const todosSnapshot = await getDocs(todosCollection);
    const list = todosSnapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    console.log(list);

    return list;
  } catch (error) {
    console.log(`Error while getting all docs. Error: ${error}`);
  }
}

export async function deleteAllTodos() {
  try {
    const todosSnapshot = await getDocs(todosCollection);
    const list = todosSnapshot.docs.map((d) => ({ id: d.id }));

    for (const item of list) {
      await deleteTodo(item.id);
    }
  } catch (error) {
    console.log(`Error while deleting all docs. Error: ${error}`);
  }
}
