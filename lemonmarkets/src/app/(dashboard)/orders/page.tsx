"use client";

import { useState } from "react";
import { useOrders } from "@/hooks/use-orders";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { ErrorBoundary } from "@/components/error-boundary";
import { TableSkeleton } from "@/components/data-skeleton";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DetailPanel } from "@/components/detail-panel";
import type { LemonOrder } from "@/types/lemon";
import type { Column } from "@/components/data-table";

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<LemonOrder | null>(null);

  const filtered = (orders ?? []).filter((order) => {
    if (statusFilter !== "all" && order.status !== statusFilter) return false;
    if (
      searchQuery &&
      !order.isin.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !order.id.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const columns: Column<LemonOrder>[] = [
    { key: "id", label: "Order ID", className: "w-[180px]" },
    { key: "isin", label: "ISIN", className: "w-[130px]" },
    {
      key: "side",
      label: "Side",
      render: (order) => (
        <span
          className={order.side === "buy" ? "text-green-600" : "text-red-600"}
        >
          {order.side.toUpperCase()}
        </span>
      ),
    },
    { key: "quantity", label: "Qty" },
    {
      key: "status",
      label: "Status",
      render: (order) => <StatusBadge status={order.status} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (order) => new Date(order.created_at).toLocaleString(),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Orders</h1>
          <div className="text-sm text-muted-foreground">
            Auto-refreshing every 10s
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Input
            placeholder="Search by ISIN or Order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              if (value) setStatusFilter(value);
            }}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="filled">Filled</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <TableSkeleton rows={10} columns={5} />
        ) : (
          <DataTable
            columns={columns}
            data={filtered}
            onRowClick={(order) => setSelectedOrder(order)}
            emptyMessage="No orders found matching the current filters."
          />
        )}

        <DetailPanel
          open={!!selectedOrder}
          onOpenChange={(open) => {
            if (!open) setSelectedOrder(null);
          }}
          title={`Order ${selectedOrder?.id?.slice(0, 8) ?? ""}`}
        >
          {selectedOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Status</div>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">ISIN</div>
                <div className="text-sm font-mono">{selectedOrder.isin}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Side</div>
                <div className="text-sm">{selectedOrder.side}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Quantity</div>
                <div className="text-sm">{selectedOrder.quantity}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Created</div>
                <div className="text-sm">
                  {new Date(selectedOrder.created_at).toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Raw Data</div>
                <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-[400px]">
                  {JSON.stringify(selectedOrder, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </DetailPanel>
      </div>
    </ErrorBoundary>
  );
}
