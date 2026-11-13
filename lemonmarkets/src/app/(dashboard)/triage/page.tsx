"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { detectIssues, getGuide, getAllGuides } from "@/lib/triage-engine";
import { StatusBadge } from "@/components/status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ErrorBoundary } from "@/components/error-boundary";
import { CardSkeleton } from "@/components/data-skeleton";
import type { IssueType, TriageGuide, TriageStep } from "@/types/triage";

export default function TriagePage() {
  const { data: orders, isLoading } = useOrders();
  const [activeGuide, setActiveGuide] = useState<TriageGuide | null>(null);

  const issues = orders ? detectIssues(orders) : [];
  const guides = getAllGuides();

  const openGuide = (type: IssueType) => {
    const guide = getGuide(type);
    if (guide) setActiveGuide(guide);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Triage Center</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Active Issues */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Active Issues</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <CardSkeleton />
                ) : issues.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-green-600 font-medium">
                      No issues detected
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      All monitored orders are functioning normally.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {issues.map((issue, i) => {
                      const guide = getGuide(issue.type);
                      return (
                        <div
                          key={i}
                          className="flex items-start justify-between p-3 rounded border"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <StatusBadge
                                status={guide?.severity ?? "medium"}
                              />
                              <span className="font-medium text-sm">
                                {guide?.title ?? issue.type}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {issue.description}
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openGuide(issue.type)}
                          >
                            Triage →
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* All Playbooks */}
            <Card>
              <CardHeader>
                <CardTitle>All Triage Playbooks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {guides.map((guide) => (
                    <div
                      key={guide.issueType}
                      className="flex items-center justify-between p-2 rounded hover:bg-muted/50 cursor-pointer"
                      onClick={() => setActiveGuide(guide)}
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{guide.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {guide.steps.length} steps ·{" "}
                          {guide.steps.filter((s) => s.apiCheck).length} API
                          checks
                        </div>
                      </div>
                      <Badge variant="outline">{guide.severity}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Guide Panel */}
          <div className="lg:col-span-1">
            {activeGuide ? (
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">
                      {activeGuide.title}
                    </CardTitle>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setActiveGuide(null)}
                    >
                      ✕
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {activeGuide.description}
                  </p>
                  <div className="space-y-4">
                    {activeGuide.steps.map((step, i) => (
                      <div key={step.id} className="space-y-2">
                        <div className="flex items-start gap-2">
                          <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <div className="text-sm font-medium">
                              {step.label}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {step.description}
                            </p>
                            {step.apiCheck && (
                              <div className="mt-2">
                                <code className="text-xs bg-muted px-1.5 py-0.5 rounded">
                                  {step.apiCheck}
                                </code>
                              </div>
                            )}
                            {step.hint && (
                              <div className="mt-2 text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 p-2 rounded">
                                💡 {step.hint}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t">
                    <Button className="w-full" variant="outline">
                      ✓ Mark as Resolved
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Select an issue or playbook to begin guided troubleshooting.
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}
