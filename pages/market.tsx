import MarketTable from '../components/MarketTable';
import ListItemForm from '../components/ListItemForm';
import AuthGuard from '../components/AuthGuard';

export default function MarketPage() {
  return (
    <AuthGuard>
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-center text-gray-100 mb-8">The Global Market</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Active Listings</h2>
            <MarketTable />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-200 mb-4">Sell an Item</h2>
            <ListItemForm />
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}