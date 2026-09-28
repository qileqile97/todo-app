import { useState } from "react";
import { Button, DatePicker, Input, Select } from "antd";

export default function AddTodo({ onAdd }) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState("Personal");
  const [dueDate, setDueDate] = useState(null);

  function handleAdd() {
    if (text.trim() === "") return;
    const dateString = dueDate ? dueDate.format("YYYY-MM-DD") : null;
    onAdd(text.trim(), category, dateString);
    setText("");
    setDueDate(null);
  }

  return (
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
  );
}