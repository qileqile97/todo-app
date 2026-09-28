import { Button, message, Upload } from "antd";
import dayjs from "dayjs";
import * as XLSX from "xlsx";

export default function ImportExport({
 todos, importTodos
}) {

const [messageApi, contextHolder] = message.useMessage();

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

    return (
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
    );
}