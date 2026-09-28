import { Input, Select } from "antd";

export default function Filters({
  search,
  statusFilter,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
}) {
  return (
    <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
      <Input
        allowClear
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <Select
        value={statusFilter}
        onChange={(value) => onStatusChange(value)}
        style={{ width: 150 }}
        options={[
          { value: "all", label: "All tasks" },
          { value: "incomplete", label: "Incomplete" },
          { value: "completed", label: "Completed" },
        ]}
      />
      <Select
        value={sortOrder}
        onChange={(value) => onSortChange(value)}
        style={{ width: 190 }}
        options={[
          { value: "none", label: "Sort: newest first" },
          { value: "asc", label: "Due date ↑ (earliest)" },
          { value: "desc", label: "Due date ↓ (latest)" },
        ]}
      />
    </div>
  );
}