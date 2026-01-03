import { Loader2 } from "lucide-react";

export function PageLoader() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-10 h-10 text-[#4A7C7C] animate-spin mx-auto mb-4" />
        <p className="text-[#243656]/60 text-sm">Loading...</p>
      </div>
    </div>
  );
}
