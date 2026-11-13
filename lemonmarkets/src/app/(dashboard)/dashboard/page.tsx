"use client";

import { useOrders } from "@/hooks/use-orders";
import { useSpaces } from "@/hooks/use-spaces";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { StatCardSkeleton, TableSkeleton } from "@/components/data-skeleton";
import { detectIssues } from "@/lib/triage-engine";

export default function DashboardPage() {
  const { data: orders, isLoading: ordersLoading } = useOrders();
  const { data: spaces, isLoading: spacesLoading } = useSpaces();

  const today = new Date().toISOString().split("T")[0];
  const todayOrders =
    orders?.filter((o) => o.created_at?.startsWith(today)) ?? [];
  const failedOrders = todayOrders.filter((o) => o.status === "failed");
  const detectedIssues = orders ? detectIssues(orders) : [];

  const isLoading = ordersLoading || spacesLoading;

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Orders Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <div className="text-2xl font-bold">{todayOrders.length}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Failed Today
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-red-600">
                  {failedOrders.length}
                </div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Active Clients
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <div className="text-2xl font-bold">{spaces?.length ?? 0}</div>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">
                Open Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <StatCardSkeleton />
              ) : (
                <div className="text-2xl font-bold text-yellow-600">
                  {detectedIssues.length}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <TableSkeleton rows={5} columns={4} />
              ) : (
                <div className="space-y-3">
                  {orders?.slice(0, 5).map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-2 rounded border"
                    >
                      <div className="space-y-0.5">
                        <div className="text-sm font-medium">{order.isin}</div>
                        <div className="text-xs text-muted-foreground">
                          {order.side} · {order.quantity}
                        </div>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                  )) ?? (
                    <p className="text-sm text-muted-foreground">
                      No orders loaded yet.
                    </p>
                  )}
                </div>
              )}
              <div className="mt-4">
                <a
                  href="/orders"
                  className="inline-flex shrink-0 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted h-7 gap-1 px-2.5 text-[0.8rem]"
                >
                  View All Orders →
                </a>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <a
                href="/orders"
                className="flex w-full items-center justify-start rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                📋 Order Monitor — track live order lifecycle
              </a>
              <a
                href="/accounts"
                className="flex w-full items-center justify-start rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                👤 Accounts — view onboarding status
              </a>
              <a
                href="/events"
                className="flex w-full items-center justify-start rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                🔌 Events — inspect event stream and webhooks
              </a>
              <a
                href="/triage"
                className="flex w-full items-center justify-start rounded-lg px-2.5 py-1.5 text-sm hover:bg-muted transition-colors"
              >
                🔍 Triage Center — guided troubleshooting
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </ErrorBoundary>
  );
}
