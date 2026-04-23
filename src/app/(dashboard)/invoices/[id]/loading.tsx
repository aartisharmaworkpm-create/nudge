export default function Loading() {
  return (
    <div className="p-6 max-w-5xl mx-auto animate-pulse">
      <div className="h-4 w-24 bg-gray-200 rounded mb-5" />
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex justify-between mb-4">
              <div>
                <div className="h-6 w-36 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="h-6 w-20 bg-gray-100 rounded-full" />
            </div>
            <div className="grid grid-cols-2 gap-3 py-3 border-t border-b border-gray-100 mb-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i}>
                  <div className="h-3 w-12 bg-gray-100 rounded mb-1" />
                  <div className="h-5 w-20 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-28 bg-gray-200 rounded-lg" />
              <div className="h-9 w-20 bg-gray-100 rounded-lg" />
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="h-4 w-24 bg-gray-200 rounded mb-3" />
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
        <div className="lg:col-span-3 bg-white border border-gray-200 rounded-2xl p-5">
          <div className="h-4 w-36 bg-gray-200 rounded mb-4" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3 mb-4">
              <div className="w-3 h-3 rounded-full bg-gray-200 mt-1 flex-shrink-0" />
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-1.5" />
                <div className="h-3 w-32 bg-gray-100 rounded" />
              </div>
              <div className="h-3 w-16 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
