// components/LoadingSpinner.tsx
export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-16 h-16 border-4 border-t-4 border-yellow-500 border-gray-700 rounded-full animate-spin"></div>
    </div>
  );
}