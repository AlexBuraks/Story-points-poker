"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface GuideRow {
  sp: string;
  effort: string;
  deps: string;
  risk: string;
  known: string;
  unknowns: string;
  colorClass: string;
}

const GUIDE_DATA: GuideRow[] = [
  { sp: "1", effort: "Less than 2h", deps: "-", risk: "-", known: "Everything", unknowns: "-", colorClass: "bg-amber-500/20" },
  { sp: "2", effort: "Half a day", deps: "Could be", risk: "-", known: "Everything", unknowns: "-", colorClass: "bg-amber-500/20" },
  { sp: "3", effort: "Up to 2 days", deps: "Some", risk: "Little", known: "Almost everything", unknowns: "Could be", colorClass: "bg-amber-500/20" },
  { sp: "5", effort: "Few days", deps: "Many", risk: "Some", known: "Most", unknowns: "Some", colorClass: "bg-amber-500/20" },
  { sp: "8", effort: "Around a week", deps: "A lot", risk: "Much", known: "Something", unknowns: "Many", colorClass: "bg-amber-500/20" },
  { sp: "13", effort: "More than a week", deps: "Too much", risk: "A lot", known: "Almost nothing", unknowns: "Too much", colorClass: "bg-red-500/20" },
  { sp: "21", effort: "More than 2 weeks", deps: "Way too much", risk: "Way too much", known: "Nothing", unknowns: "Way too much", colorClass: "bg-red-500/20" },
];

const COLUMNS = [
  { key: "effort", label: "Effort" },
  { key: "deps", label: "Deps" },
  { key: "risk", label: "Risk" },
  { key: "known", label: "Known" },
  { key: "unknowns", label: "Unknowns" },
] as const;

// AI Mode: Story Points mapping (shows AI deflation effect)
const AI_MODE_SP_MAPPING: Record<string, string> = {
  "1": "1",
  "2": "1",
  "3": "1",
  "5": "2",
  "8": "3",
  "13": "5",
  "21": "8",
  "34": "13",
};

export function VotingGuide() {
  const [isOpen, setIsOpen] = useState(false);
  // Store the index of the selected level for each column (single-select per column)
  const [selectedLevels, setSelectedLevels] = useState<Record<string, number>>({});
  // AI Mode: toggles AI-adjusted Story Points
  const [isAiMode, setIsAiMode] = useState(false);

  // Get SP value (AI Mode or Normal)
  const getSpValue = (originalSp: string): string => {
    return isAiMode ? AI_MODE_SP_MAPPING[originalSp] : originalSp;
  };

  // Single-select logic: clicking a cell selects ONLY that cell in the column
  const handleCellClick = (columnKey: string, rowIndex: number) => {
    setSelectedLevels(prev => {
      const current = prev[columnKey];
      // Toggle off if clicking the same cell
      if (current === rowIndex) {
        const newState = { ...prev };
        delete newState[columnKey];
        return newState;
      }
      // Otherwise, select the new cell (deselect previous automatically)
      return { ...prev, [columnKey]: rowIndex };
    });
  };

  // Calculate the max SP based on selected levels (Max Score logic)
  const suggestedSpIndex = useMemo(() => {
    const indices = Object.values(selectedLevels);
    if (indices.length === 0) return -1;
    return Math.max(...indices);
  }, [selectedLevels]);

  const toggleOpen = () => setIsOpen(!isOpen);

  return (
    <Card className="border-2 border-muted">
      <CardHeader
        className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
        onClick={toggleOpen}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            Story Points Guide
            {suggestedSpIndex !== -1 && !isOpen && (
              <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                Suggested: {getSpValue(GUIDE_DATA[suggestedSpIndex].sp)} SP
              </span>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4">
          {/* AI Mode Toggle */}
          <div
            className="flex items-center gap-2 text-sm mb-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Switch
              id="ai-mode-toggle"
              checked={isAiMode}
              onCheckedChange={setIsAiMode}
            />
            <label
              htmlFor="ai-mode-toggle"
              className="cursor-pointer select-none"
            >
              I will code with AI 😎🤙
            </label>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-center p-2 font-medium border-r w-16">Story Points</th>
                  {COLUMNS.map(col => (
                    <th key={col.key} className="text-center p-2 font-medium border-r min-w-[100px]">
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {GUIDE_DATA.map((row, rowIndex) => {
                  const isResultRow = rowIndex === suggestedSpIndex;

                  return (
                    <tr
                      key={row.sp}
                      className={cn(
                        "border-b",
                        // Base background color for the row (amber/red tint)
                        row.colorClass
                      )}
                    >
                      {/* RESULT COLUMN (Story Points) - READ-ONLY */}
                      <td
                        className={cn(
                          "p-2 font-medium border-r text-center transition-colors",
                          // GREEN highlight for max SP (Output), transparent for others
                          isResultRow
                            ? "bg-green-500 text-white shadow-inner"
                            : "bg-transparent text-foreground"
                        )}
                      >
                        {getSpValue(row.sp)}
                      </td>

                      {/* INPUT COLUMNS (Effort, Deps, Risk, Known, Unknowns) - INTERACTIVE */}
                      {COLUMNS.map(col => {
                        const selectedIndex = selectedLevels[col.key];
                        // Single-select: only exact match is selected
                        const isSelected = selectedIndex === rowIndex;

                        return (
                          <td
                            key={col.key}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCellClick(col.key, rowIndex);
                            }}
                            className={cn(
                              "p-2 border-r cursor-pointer transition-colors text-center",
                              // STRICT 2-STATE SYSTEM:
                              // State 1 (Default): bg-transparent (shows row color)
                              // State 2 (Selected): bg-primary text-primary-foreground
                              isSelected
                                ? "bg-primary text-primary-foreground shadow-inner"
                                : "bg-transparent text-foreground hover:bg-black/5 dark:hover:bg-white/5"
                            )}
                          >
                            {row[col.key as keyof GuideRow]}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Break it down row */}
                <tr className="bg-red-500/20 border-b">
                  <td className="p-2 font-medium border-r text-center">{getSpValue("34")}</td>
                  <td className="p-2 text-red-600 font-medium text-center" colSpan={COLUMNS.length}>
                    🧨 Break it down!
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex justify-center items-center text-sm text-muted-foreground p-2">
            {suggestedSpIndex !== -1 && (
              <div className="bg-green-500/10 text-green-600 dark:text-green-400 px-6 py-3 rounded-md font-bold text-lg border border-green-500/20 shadow-sm animate-in fade-in zoom-in duration-300">
                Your score: {getSpValue(GUIDE_DATA[suggestedSpIndex].sp)} SP
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
