import { Calendar, Tag } from "antd";
import { CATEGORY_COLORS } from "@/lib/constants";

export default function TodoCalendar({ todos }) {
  // Ant Design calls this once for every square on the calendar
  function cellRender(date, info) {
    if (info.type !== "date") return info.originNode;   // only change day squares, not the month/year views

    const day = date.format("YYYY-MM-DD");               // same format as todo.dueDate
    const dayTodos = todos.filter((todo) => todo.dueDate === day);

    return (
      <div>
        {dayTodos.map((todo) => (
          <Tag
            key={todo.id}
            color={CATEGORY_COLORS[todo.category]}
            style={{
              display: "block",
              marginBottom: 2,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.title}
          </Tag>
        ))}
      </div>
    );
  }

  return <Calendar cellRender={cellRender} />;
}
