import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, CheckCircle2, Circle, Flame, Zap } from "lucide-react";

interface FocusItem {
  id: number;
  title: string;
  startMotivation: number;
  currentMotivation: number | null;
  isComplete: boolean;
}

export function ScaPdf() {
  const { sessionId, scaId } = useParams<{ sessionId: string; scaId: string }>();
  const [, navigate] = useLocation();

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch("/api/vision/sessions/current", { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const { data: focusItems, isLoading } = useQuery<FocusItem[]>({
    queryKey: [`/api/sca/${scaId}/focus-items`],
    queryFn: async () => {
      const res = await fetch(`/api/sca/${scaId}/focus-items`, { credentials: "include" });
      if (!res.ok) return [];
      const json = await res.json();
      return json.data || [];
    },
    enabled: !!scaId,
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#D4A574] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!focusItems || focusItems.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <p className="text-[#6B7B6E] mb-4">Focus list not found</p>
        <Button onClick={() => navigate(`/vision`)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vision
        </Button>
      </div>
    );
  }

  const completedCount = focusItems.filter(f => f.isComplete).length;

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vision/${sessionId}/sca`)}
            className="text-[#6B7B6E]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="bg-[#D4A574] hover:bg-[#C49464] text-white"
              data-testid="button-print-sca"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-20 print:py-8 print:px-4">
        <div className="text-center mb-8 print:mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#D4A574] to-[#C49464] flex items-center justify-center mx-auto mb-4 print:w-12 print:h-12 print:mb-3">
            <Zap className="w-8 h-8 text-white print:w-6 print:h-6" />
          </div>
          <h1 className="text-3xl font-bold text-[#2C3E2D] mb-2 print:text-2xl">My Focus List</h1>
          <p className="text-[#6B7B6E]">Self-Concordant Actions | {completedCount}/{focusItems.length} Complete</p>
          {session && (
            <p className="text-sm text-[#8B9B8E] mt-1">{session.seasonLabel} | {new Date().toLocaleDateString()}</p>
          )}
        </div>

        <div className="mb-6 print:mb-4">
          <div className="w-full bg-[#E8E4DE] rounded-full h-3 print:h-2">
            <div 
              className="h-full bg-gradient-to-r from-[#D4A574] to-[#7C9A8E] rounded-full transition-all"
              style={{ width: `${(completedCount / focusItems.length) * 100}%` }}
            />
          </div>
          <p className="text-center text-sm text-[#6B7B6E] mt-2 print:mt-1 print:text-xs">
            {Math.round((completedCount / focusItems.length) * 100)}% Progress
          </p>
        </div>

        <div className="space-y-3 print:space-y-2">
          {focusItems.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-xl border print:p-3 print:rounded-lg ${
                item.isComplete 
                  ? 'bg-[#5B8C5A]/5 border-[#5B8C5A]/30' 
                  : 'bg-white border-[#E8E4DE]'
              }`}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 print:w-6 print:h-6">
                {item.isComplete ? (
                  <CheckCircle2 className="w-6 h-6 text-[#5B8C5A] print:w-5 print:h-5" />
                ) : (
                  <Circle className="w-6 h-6 text-[#E8E4DE] print:w-5 print:h-5" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${
                  item.isComplete ? 'text-[#5B8C5A] line-through' : 'text-[#2C3E2D]'
                }`}>
                  {index + 1}. {item.title}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 bg-[#D4A574]/10 px-2 py-1 rounded-full">
                  <Flame className="w-3 h-3 text-[#D4A574]" />
                  <span className="text-xs font-medium text-[#D4A574]">
                    {item.currentMotivation ?? item.startMotivation}/10
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 border-t border-[#E8E4DE] pt-6 print:mt-6 print:pt-4">
          <h3 className="font-bold text-[#2C3E2D] mb-3 print:text-sm">Quick Reference</h3>
          <div className="grid grid-cols-2 gap-4 text-sm print:gap-2 print:text-xs">
            <div className="bg-[#FAF8F5] rounded-lg p-3 print:p-2">
              <p className="text-[#6B7B6E] mb-1">High Motivation Items</p>
              <ul className="text-[#2C3E2D]">
                {focusItems.filter(f => (f.currentMotivation ?? f.startMotivation) >= 8 && !f.isComplete).slice(0, 3).map(f => (
                  <li key={f.id}>• {f.title}</li>
                ))}
                {focusItems.filter(f => (f.currentMotivation ?? f.startMotivation) >= 8 && !f.isComplete).length === 0 && (
                  <li className="text-[#8B9B8E]">None above 8</li>
                )}
              </ul>
            </div>
            <div className="bg-[#FAF8F5] rounded-lg p-3 print:p-2">
              <p className="text-[#6B7B6E] mb-1">Needs Attention</p>
              <ul className="text-[#2C3E2D]">
                {focusItems.filter(f => (f.currentMotivation ?? f.startMotivation) < 5 && !f.isComplete).slice(0, 3).map(f => (
                  <li key={f.id}>• {f.title}</li>
                ))}
                {focusItems.filter(f => (f.currentMotivation ?? f.startMotivation) < 5 && !f.isComplete).length === 0 && (
                  <li className="text-[#8B9B8E]">None below 5</li>
                )}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[#8B9B8E] print:mt-6">
          <p>Generated by Reawakened Vision Journey</p>
        </div>
      </div>

      <style>{`
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .print\\:hidden { display: none !important; }
          @page { margin: 0.5in; }
        }
      `}</style>
    </div>
  );
}

export default ScaPdf;
