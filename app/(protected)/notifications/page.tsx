import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/lib/db";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

type FeedItem = {
  id: string;
  type: "APPOINTMENT" | "BILLING" | "REVIEW";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
};

const NotificationsPage = async () => {
  const [pendingAppointments, unpaidPayments, latestReviews] = await Promise.all([
    db.appointment.findMany({
      where: { status: "PENDING" },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        patient: { select: { first_name: true, last_name: true } },
      },
    }),
    db.payment.findMany({
      where: { status: { in: ["UNPAID", "PART"] } },
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        patient: { select: { first_name: true, last_name: true } },
      },
    }),
    db.rating.findMany({
      orderBy: { created_at: "desc" },
      take: 10,
      include: {
        patient: { select: { first_name: true, last_name: true } },
      },
    }),
  ]);

  const feed: FeedItem[] = [
    ...pendingAppointments.map((item) => ({
      id: `appointment-${item.id}`,
      type: "APPOINTMENT" as const,
      title: "Pending appointment requires action",
      description: `${item.patient.first_name} ${item.patient.last_name} booked ${item.type}`,
      href: `/record/appointments/${item.id}`,
      createdAt: item.created_at,
    })),
    ...unpaidPayments.map((item) => ({
      id: `payment-${item.id}`,
      type: "BILLING" as const,
      title: "Outstanding payment detected",
      description: `${item.patient.first_name} ${item.patient.last_name} has an unpaid bill`,
      href: `/record/appointments/${item.appointment_id}`,
      createdAt: item.created_at,
    })),
    ...latestReviews.map((item) => ({
      id: `review-${item.id}`,
      type: "REVIEW" as const,
      title: "New patient review submitted",
      description: `${item.patient.first_name} ${item.patient.last_name} left a ${item.rating}/5 rating`,
      href: "/patient/self",
      createdAt: item.created_at,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div className="space-y-4 p-2 md:p-4 2xl:p-6">
      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Notifications Center</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-yellow-100/60">
              <p className="text-sm text-gray-500">Pending Appointments</p>
              <p className="text-2xl font-semibold">{pendingAppointments.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-red-100/60">
              <p className="text-sm text-gray-500">Outstanding Bills</p>
              <p className="text-2xl font-semibold">{unpaidPayments.length}</p>
            </div>
            <div className="p-4 rounded-lg bg-blue-100/60">
              <p className="text-sm text-gray-500">Latest Reviews</p>
              <p className="text-2xl font-semibold">{latestReviews.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none">
        <CardHeader>
          <CardTitle>Activity Feed</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {feed.length === 0 && (
              <p className="text-sm text-gray-500">No new notifications.</p>
            )}

            {feed.map((item) => (
              <Link
                href={item.href}
                key={item.id}
                className="block p-3 rounded-md border border-gray-100 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium text-sm md:text-base">{item.title}</p>
                  <span className="text-xs text-gray-500">{item.type}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {formatDistanceToNow(item.createdAt, { addSuffix: true })}
                </p>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
