"use client";

import { useState } from "react";
import { Button, Checkbox, DatePicker, Input, message, Pagination, Select, Tag, Upload } from "antd";
import dayjs from "dayjs";
import useTodos from "@/hooks/useTodos";
import * as XLSX from "xlsx";

const CATEGORY_COLORS = {
  Work: "blue",
  Personal: "green",
  Urgent: "red",
};

export default function Home() {
  const { todos, addTodo, importTodos, deleteTodo, toggleTodo, updateTodo } = useTodos();
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState(null);
  // editing state: which task is being edited, and its draft text
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [messageApi, contextHolder] = message.useMessage();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("none");

  // 1. SEARCH + 2. FILTER: keep a task only if it matches both
  const query = search.trim().toLowerCase();
  const filtered = todos.filter((todo) => {
    const matchesSearch = todo.title.toLowerCase().includes(query);
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "completed" ? todo.completed : !todo.completed);
    return matchesSearch && matchesStatus;
  });

  // 3. SORT by due date (tasks with no date always go last)
  const sorted =
    sortOrder === "none"
      ? filtered
      : filtered.sort((a, b) => {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return sortOrder === "asc"
            ? a.dueDate.localeCompare(b.dueDate)
            : b.dueDate.localeCompare(a.dueDate);
        });

  // 4. PAGINATE: now from "sorted", not "todos"
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = sorted.slice(start, start + pageSize);


  function handleAdd() {
    if (text.trim() === "") return;
    const dateString = dueDate ? dueDate.format("YYYY-MM-DD") : null;
    addTodo(text.trim(), category, dateString);
    setText("");
    setDueDate(null);
  }

  function handleExport() {
    // 1. Turn each task into one spreadsheet row
    const rows = todos.map((todo) => ({
      Title: todo.title,
      Category: todo.category,
      "Due Date": todo.dueDate ?? "",
      Status: todo.completed ? "Completed" : "Incomplete",
    }));

    // 2. Rows → sheet
    const sheet = XLSX.utils.json_to_sheet(rows);

    // 3. Sheet → workbook (the Excel file)
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, sheet, "Tasks");

    // 4. Download it
    XLSX.writeFile(workbook, "todo-report.xlsx");
  }

  async function handleImport(file) {
    try {
      // 1. File → workbook → first sheet → rows
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { cellDates: true });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

      // 2. Clean each row into task fields
      const imported = rows
        .map((row) => {
          const date = row["Due Date"] ? dayjs(row["Due Date"]) : null;
          return {
            title: String(row.Title ?? "").trim(),
            category: ["Work", "Personal", "Urgent"].includes(row.Category)
              ? row.Category
              : "Personal",
            dueDate: date && date.isValid() ? date.format("YYYY-MM-DD") : null,
            completed: row.Status === "Completed",
          };
        })
        .filter((task) => task.title !== "");   // skip rows with no title

      // 3. Add them, or explain why not
      if (imported.length === 0) {
        messageApi.warning("No tasks found. The file needs a 'Title' column.");
        return;
      }
      importTodos(imported);
      messageApi.success(`Imported ${imported.length} task(s)`);
    } catch {
      messageApi.error("Could not read that file. Please use a .csv or .xlsx file.");
    }
  }

  function startEdit(todo) {
    setEditingId(todo.id);
    setEditText(todo.title);
  }

  function saveEdit(id) {
    if (editText.trim() === "") return;
    updateTodo(id, { title: editText.trim() });
    setEditingId(null);
  }

  return (
    <main style={{ padding: 40, maxWidth: 800 }}>
      <h1>My To-Do App</h1>
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {contextHolder}
        <Upload
          accept=".csv,.xlsx,.xls"
          showUploadList={false}
          beforeUpload={(file) => {
            handleImport(file);
            return Upload.LIST_IGNORE;
          }}
        >
          <Button>Import CSV / Excel</Button>
        </Upload>
        <Button onClick={handleExport} disabled={todos.length === 0}>
          Export to Excel
        </Button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPressEnter={handleAdd}
          placeholder="What needs to be done?"
        />
        <Select
          value={category}
          onChange={(value) => setCategory(value)}
          style={{ width: 130 }}
          options={[
            { value: "Work", label: "Work" },
            { value: "Personal", label: "Personal" },
            { value: "Urgent", label: "Urgent" },
          ]}
        />
        <DatePicker
          value={dueDate}
          onChange={(date) => setDueDate(date)}
          placeholder="Due date"
        />
        <Button type="primary" onClick={handleAdd}>Add</Button>
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <Input
          allowClear
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
        <Select
          value={statusFilter}
          onChange={(value) => { setStatusFilter(value); setPage(1); }}
          style={{ width: 150 }}
          options={[
            { value: "all", label: "All tasks" },
            { value: "incomplete", label: "Incomplete" },
            { value: "completed", label: "Completed" },
          ]}
        />
        <Select
          value={sortOrder}
          onChange={(value) => setSortOrder(value)}
          style={{ width: 190 }}
          options={[
            { value: "none", label: "Sort: order added" },
            { value: "asc", label: "Due date ↑ (earliest)" },
            { value: "desc", label: "Due date ↓ (latest)" },
          ]}
        />
      </div>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {pageItems.map((todo) => (
          <li
            key={todo.id}
            style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
          >
            <Checkbox
              checked={todo.completed}
              onChange={() => toggleTodo(todo.id)}
            />

            {editingId === todo.id ? (
              <>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onPressEnter={() => saveEdit(todo.id)}
                />
                <Button type="primary" onClick={() => saveEdit(todo.id)}>Save</Button>
                <Button onClick={() => setEditingId(null)}>Cancel</Button>
              </>
            ) : (
              <>
                <span
                  style={{
                    flex: 1,
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}
                >
                  {todo.title}
                </span>
                <Tag color={CATEGORY_COLORS[todo.category]}>{todo.category}</Tag>
                <span style={{ color: "#888", minWidth: 90 }}>
                  {todo.dueDate ? todo.dueDate : "No date"}
                </span>
                <Button onClick={() => startEdit(todo)}>Edit</Button>
                <Button danger onClick={() => deleteTodo(todo.id)}>Delete</Button>
              </>
            )}
          </li>
        ))}
      </ul>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Page {currentPage} of {totalPages}</span>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={sorted.length}
          showSizeChanger
          pageSizeOptions={[5, 10, 15, 20]}
          onChange={(p, size) => {
            setPage(size !== pageSize ? 1 : p);  // changing page size → back to page 1
            setPageSize(size);
          }}
          itemRender={(pageNumber, type, originalElement) => {
          if (type === "prev") return <Button size="small">Previous</Button>;
          if (type === "next") return <Button size="small">Next</Button>;
          return originalElement;   // page numbers stay as normal
        }}
        />
      </div>
    </main>
  );
}