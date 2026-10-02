import { useState } from "react";
import { Button, Checkbox, Input, Tag } from "antd";
import { CATEGORY_COLORS } from "@/lib/constants";

export default function TodoItem({
 todo, onToggle, onDelete, onUpdate
}) {

const [isEditing, setIsEditing] = useState(false);   // is THIS row being edited?
const [editText, setEditText] = useState(todo.title);

  function saveEdit() {
    if (editText.trim() === "") return;
    onUpdate(todo.id, { title: editText.trim() });
    setIsEditing(false);
  }

    return (<li
    style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}
    >
    <Checkbox
        checked={todo.completed}
        onChange={() => onToggle(todo.id)}
    />

    {isEditing ? (
        <>
        <Input
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onPressEnter={() => saveEdit(todo.id)}
        />
        <Button type="primary" onClick={() => saveEdit(todo.id)}>Save</Button>
        <Button onClick={() => setIsEditing(false)}>Cancel</Button>
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
        <Button onClick={() => { setEditText(todo.title); setIsEditing(true); }}>Edit</Button>
        <Button danger onClick={() => onDelete(todo.id)}>Delete</Button>
        </>
    )}
    </li>)
}