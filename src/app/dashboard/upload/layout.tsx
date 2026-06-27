import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function UploadLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;

  if (role !== 'ADMIN' && role !== 'EDITORIAL_MANAGER') {
    redirect('/dashboard/articles');
  }

  return <>{children}</>;
}
