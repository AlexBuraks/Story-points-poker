"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// Компонент с подсказкой по системе голосования
export function VotingGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="border-2 border-muted">
      <CardHeader 
        className="cursor-pointer hover:bg-muted/50 transition-colors p-4"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Story Points Guide</CardTitle>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="pt-0 pb-4 px-4">
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-semibold border-r">Story Points</th>
                  <th className="text-left p-2 font-semibold border-r">Effort</th>
                  <th className="text-left p-2 font-semibold border-r">Deps</th>
                  <th className="text-left p-2 font-semibold border-r">Risk</th>
                  <th className="text-left p-2 font-semibold border-r">Known</th>
                  <th className="text-left p-2 font-semibold">Unknowns</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b bg-amber-500/20">
                  <td className="p-2 font-bold border-r">1</td>
                  <td className="p-2 border-r">Less than 2h</td>
                  <td className="p-2 border-r">-</td>
                  <td className="p-2 border-r">-</td>
                  <td className="p-2 border-r">Everything</td>
                  <td className="p-2">-</td>
                </tr>
                <tr className="border-b bg-amber-500/20">
                  <td className="p-2 font-bold border-r">2</td>
                  <td className="p-2 border-r">Half a day</td>
                  <td className="p-2 border-r">Could be</td>
                  <td className="p-2 border-r">-</td>
                  <td className="p-2 border-r">Everything</td>
                  <td className="p-2">-</td>
                </tr>
                <tr className="border-b bg-amber-500/20">
                  <td className="p-2 font-bold border-r">3</td>
                  <td className="p-2 border-r">Up to 2 days</td>
                  <td className="p-2 border-r">Some</td>
                  <td className="p-2 border-r">Little</td>
                  <td className="p-2 border-r">Almost everything</td>
                  <td className="p-2">Could be</td>
                </tr>
                <tr className="border-b bg-amber-500/20">
                  <td className="p-2 font-bold border-r">5</td>
                  <td className="p-2 border-r">Few days</td>
                  <td className="p-2 border-r">Many</td>
                  <td className="p-2 border-r">Some</td>
                  <td className="p-2 border-r">Most</td>
                  <td className="p-2">Some</td>
                </tr>
                <tr className="border-b bg-amber-500/20">
                  <td className="p-2 font-bold border-r">8</td>
                  <td className="p-2 border-r">Around a week</td>
                  <td className="p-2 border-r">A lot</td>
                  <td className="p-2 border-r">Much</td>
                  <td className="p-2 border-r">Something</td>
                  <td className="p-2">Many</td>
                </tr>
                <tr className="border-b bg-red-500/20">
                  <td className="p-2 font-bold border-r">13</td>
                  <td className="p-2 border-r">More than a week</td>
                  <td className="p-2 border-r">Too much</td>
                  <td className="p-2 border-r">A lot</td>
                  <td className="p-2 border-r">Almost nothing</td>
                  <td className="p-2">Too much</td>
                </tr>
                <tr className="border-b bg-red-500/20">
                  <td className="p-2 font-bold border-r">21</td>
                  <td className="p-2 border-r">More than 2 weeks</td>
                  <td className="p-2 border-r">Way too much</td>
                  <td className="p-2 border-r">Way too much</td>
                  <td className="p-2 border-r">Nothing</td>
                  <td className="p-2">Way too much</td>
                </tr>
                <tr className="bg-red-500/20">
                  <td className="p-2 font-bold border-r">34</td>
                  <td className="p-2 text-red-600 font-semibold" colSpan={5}>🧨 Break it down!</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 text-sm text-muted-foreground space-y-1">
            <p><strong>?</strong> - Need more information to estimate</p>
            <p><strong>☕️</strong> - Need a break</p>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
