import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import SettingsClient from "./SettingsClient";

export default async function SystemSettingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>System Settings</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Configure global platform behaviors and API endpoints.</p>
      </div>

      <SettingsClient />
    </div>
  );
}
