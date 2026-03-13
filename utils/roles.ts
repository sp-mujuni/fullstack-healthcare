import { Roles } from "@/types/globals"; // Make sure Roles is exported as an enum or object, not just a type
import { auth } from "@clerk/nextjs/server";

export const checkRole = async (role: Roles) => {
  const { sessionClaims } = await auth();

  return sessionClaims?.metadata?.role === role.toLowerCase();
};

export const getRole = async () => {
  const { sessionClaims } = await auth();

  const role = sessionClaims?.metadata?.role?.toLowerCase() || "patient";

  return role;
};
