export default function Loading() {
  return (
    <div className="p-8 max-w-5xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="h-7 w-32 bg-gray-200 rounded-lg mb-2" />
          <div className="h-4 w-24 bg-gray-100 rounded" />
        </div>
        <div className="h-9 w-32 bg-gray-200 rounded-lg" />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-2xl px-5 py-4">
            <div className="w-8 h-8 bg-gray-100 rounded-xl mb-3" />
            <div className="h-7 w-16 bg-gray-200 rounded mb-1.5" />
            <div className="h-3 w-20 bg-gray-100 rounded" />
          </div>
        ))}
      </div>

      {/* Invoice list skeleton */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100">
          <div className="h-4 w-48 bg-gray-100 rounded" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-100 last:border-0">
            <div className="w-9 h-9 rounded-full bg-gray-100 flex-shrink-0" />
            <div className="flex-1">
              <div className="h-4 w-36 bg-gray-200 rounded mb-1.5" />
              <div className="h-3 w-48 bg-gray-100 rounded" />
            </div>
            <div className="text-right">
              <div className="h-5 w-20 bg-gray-200 rounded mb-1" />
              <div className="h-3 w-12 bg-gray-100 rounded ml-auto" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
