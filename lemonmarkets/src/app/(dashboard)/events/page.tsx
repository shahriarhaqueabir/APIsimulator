"use client";

import { useState } from "react";
import { useEvents } from "@/hooks/use-events";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { DetailPanel } from "@/components/detail-panel";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { ErrorBoundary } from "@/components/error-boundary";
import { TableSkeleton } from "@/components/data-skeleton";
import type { LemonEvent } from "@/types/lemon";
import type { Column } from "@/components/data-table";

export default function EventsPage() {
  const { data: events, isLoading } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<LemonEvent | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = (events ?? []).filter((event) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      event.type.toLowerCase().includes(q) ||
      event.id.toLowerCase().includes(q) ||
      JSON.stringify(event.payload).toLowerCase().includes(q)
    );
  });

  const columns: Column<LemonEvent>[] = [
    {
      key: "type",
      label: "Type",
      render: (ev) => <code className="text-xs">{ev.type}</code>,
    },
    { key: "id", label: "Event ID", className: "w-[200px]" },
    {
      key: "created_at",
      label: "Timestamp",
      render: (ev) => new Date(ev.created_at).toLocaleString(),
    },
  ];

  const webhookColumns: Column<{
    id: string;
    eventType: string;
    status: string;
    createdAt: string;
  }>[] = [
    { key: "eventType", label: "Event Type" },
    {
      key: "status",
      label: "Status",
      render: (wh) => <StatusBadge status={wh.status} />,
    },
    {
      key: "createdAt",
      label: "Received",
      render: (wh) => new Date(wh.createdAt).toLocaleString(),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Events</h1>
          <div className="text-sm text-muted-foreground">
            Auto-refreshing every 10s
          </div>
        </div>

        <Tabs defaultValue="events">
          <TabsList>
            <TabsTrigger value="events">Event Stream</TabsTrigger>
            <TabsTrigger value="webhooks">Webhook Log</TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-4">
            <Input
              placeholder="Search events by type, ID, or payload..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-md"
            />

            {isLoading ? (
              <TableSkeleton rows={8} columns={3} />
            ) : (
              <DataTable
                columns={columns}
                data={filtered}
                onRowClick={(ev) => setSelectedEvent(ev)}
                emptyMessage="No events found."
              />
            )}

            <DetailPanel
              open={!!selectedEvent}
              onOpenChange={(open) => {
                if (!open) setSelectedEvent(null);
              }}
              title={`Event: ${selectedEvent?.type ?? ""}`}
            >
              {selectedEvent && (
                <div className="space-y-4">
                  <div className="text-sm font-medium">Raw Payload</div>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[500px]">
                    {JSON.stringify(selectedEvent, null, 2)}
                  </pre>
                </div>
              )}
            </DetailPanel>
          </TabsContent>

          <TabsContent value="webhooks">
            <p className="text-muted-foreground mb-4">
              Incoming webhooks are stored here for inspection. Set up your
              lemon.markets webhook to point to <code>/api/webhooks/lemon</code>.
            </p>
            <DataTable
              columns={webhookColumns}
              data={[]}
              emptyMessage="No webhooks received yet. Configure a webhook endpoint in your lemon.markets dashboard."
            />
          </TabsContent>
        </Tabs>
      </div>
    </ErrorBoundary>
  );
}
