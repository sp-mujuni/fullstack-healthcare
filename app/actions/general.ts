"use server";

import {
  ReviewFormValues,
  reviewSchema,
} from "@/components/dialogs/review-form";
import { createAuditLog } from "@/lib/audit";
import db from "@/lib/db";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function deleteDataById(
  id: string,

  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill",
) {
  try {
    const { userId } = await auth();

    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id: id } });
        await createAuditLog({
          userId,
          recordId: id,
          action: "DELETE",
          model: "Doctor",
          details: "Deleted doctor record",
        });
        break;
      case "staff":
        await db.staff.delete({ where: { id: id } });
        await createAuditLog({
          userId,
          recordId: id,
          action: "DELETE",
          model: "Staff",
          details: "Deleted staff record",
        });
        break;
      case "patient":
        await db.patient.delete({ where: { id: id } });
        await createAuditLog({
          userId,
          recordId: id,
          action: "DELETE",
          model: "Patient",
          details: "Deleted patient record",
        });
        break;
      case "payment":
        await db.payment.delete({ where: { id: Number(id) } });
        await createAuditLog({
          userId,
          recordId: id,
          action: "DELETE",
          model: "Payment",
          details: "Deleted payment record",
        });
        break;
      case "bill":
        await db.patientBills.delete({ where: { id: Number(id) } });
        await createAuditLog({
          userId,
          recordId: id,
          action: "DELETE",
          model: "PatientBills",
          details: "Deleted bill line item",
        });
        break;
    }

    if (
      deleteType === "staff" ||
      deleteType === "patient" ||
      deleteType === "doctor"
    ) {
      const client = await clerkClient();
      await client.users.deleteUser(id);
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const { userId } = await auth();
    const validatedFields = reviewSchema.parse(values);

    const rating = await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    await createAuditLog({
      userId,
      recordId: rating.id,
      action: "CREATE",
      model: "Rating",
      details: "Submitted patient review",
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}
