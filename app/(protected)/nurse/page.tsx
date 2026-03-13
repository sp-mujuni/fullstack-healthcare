import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { getNurseDashboardStats } from "@/utils/services/staff";
import { BriefcaseBusiness, CalendarClock, User, Users } from "lucide-react";
import React from "react";

const NurseDashboard = async () => {
  const {
    appointmentCounts,
    availableDoctors,
    last5Records,
    monthlyData,
    totalAppointments,
    totalDoctors,
    totalPatients,
    todayAppointments,
  } = await getNurseDashboardStats();

  const cardData = [
    {
      title: "Patients",
      value: totalPatients,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Total registered patients",
      link: "/record/patients",
    },
    {
      title: "Doctors",
      value: totalDoctors,
      icon: User,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Total active doctors",
      link: "/record/doctors",
    },
    {
      title: "Appointments",
      value: totalAppointments,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "Total appointments",
      link: "/record/appointments",
    },
    {
      title: "Today",
      value: todayAppointments,
      icon: CalendarClock,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Appointments for today",
      link: "/record/appointments",
    },
  ];

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-lg xl:text-2xl font-semibold">
              Nurse Dashboard
            </h1>
          </div>

          <div className="w-full flex flex-wrap gap-2">
            {cardData.map((el, index) => (
              <StatCard
                key={index}
                title={el.title}
                value={el.value || 0}
                icon={el.icon}
                className={el.className}
                iconClassName={el.iconClassName}
                note={el.note}
                link={el.link}
              />
            ))}
          </div>
        </div>

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData || []} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records || []} />
        </div>
      </div>

      <div className="w-full xl:w-[30%]">
        <div className="w-full h-[450px] mb-8">
          <StatSummary
            data={appointmentCounts}
            total={totalAppointments || 0}
          />
        </div>

        <AvailableDoctors data={availableDoctors as any} />
      </div>
    </div>
  );
};

export default NurseDashboard;
