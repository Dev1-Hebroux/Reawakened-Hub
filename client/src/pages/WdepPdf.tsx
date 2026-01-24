import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Printer, Download, Target, Activity, Scale, Map } from "lucide-react";
import { getApiUrl } from "@/lib/api";

export function WdepPdf() {
  const { sessionId, wdepId } = useParams<{ sessionId: string; wdepId: string }>();
  const [, navigate] = useLocation();

  const { data: wdepData, isLoading } = useQuery({
    queryKey: [`/api/wdep/${wdepId}`],
    queryFn: async () => {
      const res = await fetch(getApiUrl(`/api/wdep/${wdepId}`), { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
    enabled: !!wdepId,
  });

  const { data: session } = useQuery({
    queryKey: ["/api/vision/sessions/current"],
    queryFn: async () => {
      const res = await fetch(getApiUrl("/api/vision/sessions/current"), { credentials: "include" });
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    },
  });

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin w-8 h-8 border-4 border-[#7C9A8E] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!wdepData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-8">
        <p className="text-[#6B7B6E] mb-4">WDEP data not found</p>
        <Button onClick={() => navigate(`/vision`)} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Vision
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="print:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 p-4 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => navigate(`/vision/${sessionId}/tools/wdep`)}
            className="text-[#6B7B6E]"
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={handlePrint}
              className="bg-[#7C9A8E] hover:bg-[#6B8B7E] text-white"
              data-testid="button-print-wdep"
            >
              <Printer className="w-4 h-4 mr-2" /> Print / Save PDF
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-8 py-20 print:py-8 print:px-4">
        <div className="text-center mb-8 print:mb-6">
          <h1 className="text-3xl font-bold text-[#2C3E2D] mb-2 print:text-2xl">WDEP One-Page Plan</h1>
          {session && (
            <p className="text-[#6B7B6E]">{session.seasonLabel} | {new Date().toLocaleDateString()}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 print:gap-4">
          <div className="border border-[#E8E4DE] rounded-xl p-5 print:p-4 print:rounded-lg">
            <div className="flex items-center gap-2 mb-4 print:mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#4A7C7C] flex items-center justify-center print:w-6 print:h-6">
                <Target className="w-4 h-4 text-white print:w-3 print:h-3" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E2D] print:text-base">W - What I Want</h2>
            </div>
            <div className="space-y-3 print:space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Deep Want</p>
                <p className="text-sm text-[#2C3E2D]">{wdepData.wants?.deepWant || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Quality World Vision</p>
                <p className="text-sm text-[#2C3E2D]">{wdepData.wants?.qualityWorld || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div className="border border-[#E8E4DE] rounded-xl p-5 print:p-4 print:rounded-lg">
            <div className="flex items-center gap-2 mb-4 print:mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#D4A574] flex items-center justify-center print:w-6 print:h-6">
                <Activity className="w-4 h-4 text-white print:w-3 print:h-3" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E2D] print:text-base">D - What I'm Doing</h2>
            </div>
            <div className="space-y-3 print:space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Current Actions</p>
                <ul className="text-sm text-[#2C3E2D] list-disc list-inside">
                  {wdepData.doing?.currentActions?.map((action: string, i: number) => (
                    <li key={i}>{action}</li>
                  )) || <li>Not specified</li>}
                </ul>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">How I'm Feeling</p>
                <p className="text-sm text-[#2C3E2D]">{wdepData.doing?.totalBehavior?.feeling || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div className="border border-[#E8E4DE] rounded-xl p-5 print:p-4 print:rounded-lg">
            <div className="flex items-center gap-2 mb-4 print:mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#7C9A8E] flex items-center justify-center print:w-6 print:h-6">
                <Scale className="w-4 h-4 text-white print:w-3 print:h-3" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E2D] print:text-base">E - Evaluation</h2>
            </div>
            <div className="space-y-3 print:space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B7B6E]">Getting Closer?</span>
                <span className="font-bold text-[#2C3E2D]">{wdepData.evaluation?.gettingCloser || 5}/10</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#6B7B6E]">Current approach helpful?</span>
                <span className="font-bold text-[#2C3E2D]">{wdepData.evaluation?.helpfulness || 5}/10</span>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Key Insight</p>
                <p className="text-sm text-[#2C3E2D]">{wdepData.evaluation?.insights || "Not specified"}</p>
              </div>
            </div>
          </div>

          <div className="border border-[#E8E4DE] rounded-xl p-5 print:p-4 print:rounded-lg">
            <div className="flex items-center gap-2 mb-4 print:mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#4A7C7C] flex items-center justify-center print:w-6 print:h-6">
                <Map className="w-4 h-4 text-white print:w-3 print:h-3" />
              </div>
              <h2 className="text-lg font-bold text-[#2C3E2D] print:text-base">P - My Plan</h2>
            </div>
            <div className="space-y-3 print:space-y-2">
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Commitments</p>
                <ul className="text-sm text-[#2C3E2D] list-disc list-inside">
                  {wdepData.plan?.commitments?.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  )) || <li>Not specified</li>}
                </ul>
              </div>
              <div className="bg-[#7C9A8E]/10 rounded-lg p-3 print:p-2">
                <p className="text-xs font-medium text-[#7C9A8E] uppercase tracking-wide mb-1">Start Now Action</p>
                <p className="text-sm font-medium text-[#2C3E2D]">{wdepData.plan?.startNowAction || "Not specified"}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[#6B7B6E] uppercase tracking-wide mb-1">Timeline</p>
                <p className="text-sm text-[#2C3E2D]">{wdepData.plan?.timeline || "Not specified"}</p>
              </div>
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

export default WdepPdf;
