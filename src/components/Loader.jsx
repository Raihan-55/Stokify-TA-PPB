import React from "react";
import { Loader2 } from "lucide-react";

export default function Loader() {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm transition-opacity animate-fadein">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-blue-500" size={48} />
        <span className="text-lg text-white font-semibold animate-pulse">Loading...</span>
      </div>
    </div>
  );
}
