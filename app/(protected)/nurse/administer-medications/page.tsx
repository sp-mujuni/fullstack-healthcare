import { ViewAction } from "@/components/action-options";
import { AppointmentStatusIndicator } from "@/components/appointment-status-indicator";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import db from "@/lib/db";
import { format } from "date-fns";

type PageProps = {
  searchParams?: Promise<{ [key: string]: string | undefined }>;
};

const columns = [
  { header: "Patient", key: "patient" },
  { header: "Doctor", key: "doctor", className: "hidden md:table-cell" },
  { header: "Date", key: "date", className: "hidden lg:table-cell" },
  { header: "Status", key: "status" },
  { header: "Action", key: "action" },
];

const NurseMedicationPage = async (props: PageProps) => {
  const searchParams = await props.searchParams;
  const search = (searchParams?.q || "").trim();

  const appointments = await db.appointment.findMany({
    where: {
      status: { in: ["SCHEDULED", "COMPLETED"] },
      OR: search
        ? [
            {
              patient: {
                first_name: { contains: search, mode: "insensitive" },
              },
            },
            {
              patient: { last_name: { contains: search, mode: "insensitive" } },
            },
            { doctor: { name: { contains: search, mode: "insensitive" } } },
          ]
        : undefined,
    },
    include: {
      patient: { select: { first_name: true, last_name: true } },
      doctor: { select: { name: true } },
    },
    orderBy: { appointment_date: "desc" },
    take: 100,
  });

  const renderRow = (item: {
    id: number;
    appointment_date: Date;
    status: "PENDING" | "SCHEDULED" | "CANCELLED" | "COMPLETED";
    patient: { first_name: string; last_name: string };
    doctor: { name: string };
  }) => (
    <tr
      key={item.id}
      className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
    >
      <td className="py-2 xl:py-4">
        {item.patient.first_name} {item.patient.last_name}
      </td>
      <td className="hidden md:table-cell">Dr. {item.doctor.name}</td>
      <td className="hidden lg:table-cell">
        {format(item.appointment_date, "yyyy-MM-dd")}
      </td>
      <td>
        <AppointmentStatusIndicator status={item.status} />
      </td>
      <td>
        <ViewAction href={`/record/appointments/${item.id}`} />
      </td>
    </tr>
  );

  return (
    <div className="bg-white rounded-xl p-2 md:p-4 2xl:p-6">
      <div className="w-full lg:w-fit mb-4">
        <SearchInput />
      </div>

      <Table columns={columns} data={appointments} renderRow={renderRow} />
    </div>
  );
};

export default NurseMedicationPage;
