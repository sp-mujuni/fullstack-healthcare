import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const PatientSelfPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  redirect(`/patient/${userId}`);
};

export default PatientSelfPage;
