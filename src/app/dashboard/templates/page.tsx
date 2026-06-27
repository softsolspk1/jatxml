import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import TemplatesClient from "./TemplatesClient";

export default async function XMLTemplatesPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return <TemplatesClient />;
}
