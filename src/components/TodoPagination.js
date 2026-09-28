import { Pagination, Button} from "antd";

export default function TodoPagination({
  currentPage,
  totalPages,
  total,
  pageSize,
  onChange
}) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Page {currentPage} of {totalPages}</span>
        <Pagination
          current={currentPage}
          pageSize={pageSize}
          total={total}
          showSizeChanger
          pageSizeOptions={[5, 10, 15, 20]}
          onChange={onChange}
          itemRender={(pageNumber, type, originalElement) => {
          if (type === "prev") return <Button size="small">Previous</Button>;
          if (type === "next") return <Button size="small">Next</Button>;
          return originalElement;   // page numbers stay as normal
        }}
        />
      </div>
  );
}