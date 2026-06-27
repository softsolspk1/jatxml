import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

import AddUserForm from './AddUserForm';
import UserTableClient from './UserTableClient';

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  
  // Only Admins should see the full settings
  if (!session || (session.user as any).role !== 'ADMIN') {
    return (
      <div>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Users</h1>
        <div className="card">
          <p style={{ color: 'var(--text-secondary)' }}>You do not have permission to view this page. Administrator access required.</p>
        </div>
      </div>
    );
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div>
      <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)', marginBottom: '30px' }}>Users & Roles Management</h1>
      
      <AddUserForm />

      <UserTableClient initialUsers={users} />
    </div>
  );
}
