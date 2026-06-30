import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import DoiValidatorClient from "./DoiValidatorClient";

export default async function DoiValidatorPage() {
  await getServerSession(authOptions);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--brand-blue)' }}>DOI Validator</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Check if DOIs are active and fetch their titles via Crossref.</p>
      </div>

      <DoiValidatorClient />
    </div>
  );
}
