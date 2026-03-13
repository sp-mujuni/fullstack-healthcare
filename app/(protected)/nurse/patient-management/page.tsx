import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { ViewAction } from "@/components/action-options";
import { DATA_LIMIT } from "@/utils/seetings";
import { getAllPatients } from "@/utils/services/patient";
import { Patient } from "@prisma/client";

const columns = [
  { header: "Patient", key: "name" },
  { header: "Phone", key: "phone", className: "hidden md:table-cell" },
  { header: "Email", key: "email", className: "hidden lg:table-cell" },
  { header: "Action", key: "action" },
];

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

const NursePatientManagementPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const page = searchParams?.p || "1";
  const search = searchParams?.q || "";

  const { data, totalPages, totalRecords, currentPage } = await getAllPatients({
    page,
    limit: DATA_LIMIT,
    search,
  });

  const renderRow = (item: Patient) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="py-2 xl:py-4">
        <div className="flex items-center gap-3">
          <ProfileImage
            url={item.img || ""}
            name={`${item.first_name} ${item.last_name}`}
            bgColor={item.colorCode || "#E5E7EB"}
          />
          <div>
            <p className="font-medium">
              {item.first_name} {item.last_name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {item.gender.toLowerCase()}
            </p>
          </div>
        </div>
      </td>
      <td className="hidden md:table-cell">{item.phone}</td>
      <td className="hidden lg:table-cell">{item.email}</td>
      <td>
        <ViewAction href={`/patient/${item.id}`} />
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
      <div className="w-full lg:w-fit mb-4">
        <SearchInput />
      </div>

      <Table columns={columns} data={data || []} renderRow={renderRow} />

      {(totalRecords || 0) > 0 && (
        <Pagination
          totalPages={totalPages}
          currentPage={currentPage}
          totalRecords={totalRecords}
          limit={DATA_LIMIT}
        />
      )}
    </div>
  );
};

export default NursePatientManagementPage;
