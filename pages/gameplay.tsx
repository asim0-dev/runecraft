import ProfileBar from '../components/ProfileBar';
import InventoryGrid from '../components/InventoryGrid';
import ActionButtons from '../components/ActionButtons';
import AuthGuard from '../components/AuthGuard';

export default function GameplayPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-8">
        <div className="space-y-8">
          <ProfileBar />
          <h2 className="text-2xl font-bold text-gray-200">Your Inventory</h2>
          <InventoryGrid />
          <h2 className="text-2xl font-bold text-gray-200">Actions</h2>
          <ActionButtons />
        </div>
      </div>
    </AuthGuard>
  );
}