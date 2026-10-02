"use client";

import { useState } from "react";
import { Segmented } from "antd";
import useTodos from "@/hooks/useTodos";
import AddTodo from "@/components/AddTodo";
import Filters from "@/components/Filters";
import TodoList from "@/components/TodoList";
import TodoPagination from "@/components/TodoPagination";
import ImportExport from "@/components/ImportExport";
import TodoCalendar from "@/components/TodoCalendar";

export default function Home() {
  const { todos, addTodo, importTodos, deleteTodo, toggleTodo, updateTodo } = useTodos();

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");
  const [view, setView] = useState("list");   // "list" or "calendar"

  const query = search.trim().toLowerCase();
  const filtered = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? todo.completed : !todo.completed);
    return matchesSearch && matchesStatus;
  });

  const sorted =
    sortOrder === "none"
      ? [...filtered].reverse()
      : filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return sortOrder === "asc"
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
        });

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);

  return (
    <main style={{ padding: 40, maxWidth: 1000 }}>
      <h1>My To-Do App</h1>
      <ImportExport 
        todos={todos}
        importTodos={importTodos}
      />
      <AddTodo onAdd={addTodo} />
      <Filters
        search={search}
        statusFilter={statusFilter}
        sortOrder={sortOrder}
        onSearchChange={(value) => { setSearch(value); setPage(1); }}
        onStatusChange={(value) => { setStatusFilter(value); setPage(1); }}
        onSortChange={(value) => setSortOrder(value)}
      />
      <Segmented
        value={view}
        onChange={(value) => setView(value)}
        options={[
          { value: "list", label: "List" },
          { value: "calendar", label: "Calendar" },
        ]}
        style={{ marginBottom: 16 }}
      />
      {view === "list" ? (
        <>
          <TodoList todos={pageItems} onToggle={toggleTodo} onDelete={deleteTodo} onUpdate={updateTodo} />
          <TodoPagination
              currentPage={currentPage}
              pageSize={pageSize}
              total={sorted.length}
              totalPages={totalPages}
              onChange={(p, size) => {
                setPage(size !== pageSize ? 1 : p);  // changing page size → back to page 1
                setPageSize(size);
              }}
          />
        </>
      ) : (
        <TodoCalendar todos={sorted} />
      )}
    </main>
  );
}