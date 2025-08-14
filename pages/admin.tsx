// File: /pages/admin.tsx
// This is the final, corrected version of your admin page.

import AdminDashboard from '@/components/AdminDashboard'; // Corrected path
import AdminGate from '@/components/AdminGate';       // Corrected path

export default function AdminPage() {
  return (
    <AdminGate>
      <div className="container mx-auto p-4 md:p-8">
        <AdminDashboard />
      </div>
    </AdminGate>
  );
}