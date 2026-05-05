import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/");
  const user = await currentUser();
  if (user?.publicMetadata?.role !== "admin") redirect("/");
  return <>{children}</>;
}
