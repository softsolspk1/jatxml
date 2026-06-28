import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import ReportsClient from "./ReportsClient";

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  // Fetch some aggregate data
  const totalArticles = await db.article.count();
  const successfulSubmissions = await db.article.count({ where: { status: 'SUBMITTED' } });
  const failedValidations = await db.article.count({ where: { status: 'VALIDATION_FAILED' } });

  const initialLogs = await db.systemLog.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true } }
    }
  });

  return (
    <ReportsClient 
      initialLogs={initialLogs} 
      stats={{ totalArticles, successfulSubmissions, failedValidations }} 
    />
  );
}
