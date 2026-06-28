import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import UserTableClient from "./UserTableClient";
import AddUserForm from "./AddUserForm";

export default async function UsersManagementPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || (session.user as any).role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, email: true, role: true, status: true, lastLogin: true, createdAt: true }
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>User Management</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage access, roles, and platform users.</p>
        </div>
      </div>

      <AddUserForm />
      <UserTableClient initialUsers={users} />
    </div>
  );
}
