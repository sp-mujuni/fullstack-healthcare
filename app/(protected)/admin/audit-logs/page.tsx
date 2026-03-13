import { Table } from "@/components/tables/table";
import SearchInput from "@/components/search-input";
import db from "@/lib/db";
import { DATA_LIMIT } from "@/utils/seetings";
import { Pagination } from "@/components/pagination";
import { format } from "date-fns";
import { History } from "lucide-react";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

const columns = [
  { header: "User", key: "user" },
  { header: "Action", key: "action" },
  { header: "Model", key: "model" },
  { header: "Record", key: "record", className: "hidden md:table-cell" },
  { header: "Details", key: "details", className: "hidden xl:table-cell" },
  { header: "Timestamp", key: "timestamp", className: "hidden lg:table-cell" },
];

const AuditLogPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const page = Number(searchParams?.p || "1");
  const search = (searchParams?.q || "").trim();

  const skip = (page - 1) * DATA_LIMIT;

  const where = search
    ? {
        OR: [
          { user_id: { contains: search, mode: "insensitive" as const } },
          { model: { contains: search, mode: "insensitive" as const } },
          { action: { contains: search, mode: "insensitive" as const } },
          { details: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, totalRecords] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { created_at: "desc" },
      skip,
      take: DATA_LIMIT,
    }),
    db.auditLog.count({ where }),
  ]);

  const totalPages = Math.ceil(totalRecords / DATA_LIMIT);

  const renderRow = (item: {
    id: number;
    user_id: string;
    action: string;
    model: string;
    record_id: string;
    details: string | null;
    created_at: Date;
  }) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="py-2 xl:py-4">{item.user_id}</td>
      <td className="font-medium text-blue-700">{item.action}</td>
      <td>{item.model}</td>
      <td className="hidden md:table-cell">{item.record_id}</td>
      <td className="hidden xl:table-cell max-w-80 truncate">
        {item.details || "-"}
      </td>
      <td className="hidden lg:table-cell">
        {format(item.created_at, "yyyy-MM-dd HH:mm:ss")}
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <History size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">
            audit events
          </span>
        </div>

        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />

        {totalRecords > 0 && (
          <Pagination
            totalPages={totalPages}
            currentPage={page}
            totalRecords={totalRecords}
            limit={DATA_LIMIT}
          />
        )}
      </div>
    </div>
  );
};

export default AuditLogPage;
