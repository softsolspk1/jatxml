import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import ActivateDoiClient from "./ActivateDoiClient";
import { redirect } from "next/navigation";

export default async function ActivateDoiPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    redirect('/login');
  }

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>Activate DOIs (Crossref)</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Paste one or multiple DOIs to generate their XML metadata from the database and push them to Crossref for activation.</p>
      </div>

      <ActivateDoiClient />
    </div>
  );
}
