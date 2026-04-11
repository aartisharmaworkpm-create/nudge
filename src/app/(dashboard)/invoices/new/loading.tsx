export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="mb-5">
        <div className="h-7 w-32 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
              <div className="h-9 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
          <div className="h-3 w-24 bg-gray-100 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <div className="h-3 w-20 bg-gray-100 rounded mb-2" />
              <div className="h-9 bg-gray-100 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
