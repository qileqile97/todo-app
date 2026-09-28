import { useState, useEffect } from "react";

const STORAGE_KEY = "todos";

export default function useTodos() {
  const [todos, setTodos] = useState([]);
  const [loaded, setLoaded] = useState(false);

  // ← NEW: LOAD once, when the page first opens
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);    // read the text (or null if nothing saved)
    if (saved) {
      setTodos(JSON.parse(saved));                      // text → array
    }
    setLoaded(true);                                    // loading done, saving is now allowed
  }, []);

  // ← NEW: SAVE every time todos changes
  useEffect(() => {
    if (!loaded) return;                                // don't save before loading (trap 2)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos)); // array → text
  }, [todos, loaded]);


  function addTodo(title, category, dueDate) {
    const newTodo = {
      id: crypto.randomUUID(),
      title: title,
      category: category,
      dueDate: dueDate,
      completed: false,
    };
    setTodos([...todos, newTodo]);
  }

  // DELETE: keep every task EXCEPT the one with this id
  function deleteTodo(id) {
    setTodos(todos.filter((todo) => todo.id !== id));
  }

  // COMPLETE: flip completed true <-> false on the matching task
  function toggleTodo(id) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  }

  // EDIT: apply changes (e.g. { title: "new text" }) to the matching task
  function updateTodo(id, changes) {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, ...changes } : todo
      )
    );
  }

  // IMPORT: add many tasks at once
  function importTodos(rows) {
    const newTodos = rows.map((row) => ({
      id: crypto.randomUUID(),
      title: row.title,
      category: row.category,
      dueDate: row.dueDate,
      completed: row.completed,
    }));
    setTodos([...todos, ...newTodos]);
  }

  return { todos, addTodo, importTodos, deleteTodo, toggleTodo, updateTodo };
}