import TodoItem from "@/components/TodoItem";

export default function TodoList({
 todos, onToggle, onDelete, onUpdate
}) {
    return (
      <ul style={{ listStyle: "none", padding: 0 }}>
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onUpdate={onUpdate}
          />
        ))}
      </ul>
    );
}