"use client";

import { useState } from "react";
import { useSpaces } from "@/hooks/use-spaces";
import { useDocuments } from "@/hooks/use-documents";
import { DataTable } from "@/components/data-table";
import { StatusBadge } from "@/components/status-badge";
import { DetailPanel } from "@/components/detail-panel";
import { ErrorBoundary } from "@/components/error-boundary";
import { TableSkeleton } from "@/components/data-skeleton";
import type { Column } from "@/components/data-table";
import type { LemonSpace } from "@/types/lemon";

export default function AccountsPage() {
  const { data: spaces, isLoading: spacesLoading } = useSpaces();
  const { data: documents, isLoading: docsLoading } = useDocuments();
  const [selectedSpace, setSelectedSpace] = useState<LemonSpace | null>(null);
  const isLoading = spacesLoading || docsLoading;

  const spaceDocs = selectedSpace
    ? (documents ?? []).filter((d) => d.space_id === selectedSpace.id)
    : [];

  const getSpaceStatus = (spaceId: string): string => {
    const docs = (documents ?? []).filter((d) => d.space_id === spaceId);
    if (docs.length === 0) return "pending";
    if (docs.some((d) => d.status === "rejected")) return "rejected";
    if (docs.every((d) => d.status === "approved")) return "approved";
    return "pending";
  };

  const columns: Column<LemonSpace>[] = [
    { key: "name", label: "Client Name" },
    {
      key: "id",
      label: "Status",
      render: (space) => <StatusBadge status={getSpaceStatus(space.id)} />,
    },
    {
      key: "created_at",
      label: "Created",
      render: (space) => new Date(space.created_at).toLocaleDateString(),
    },
  ];

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Accounts</h1>

        {isLoading ? (
          <TableSkeleton rows={5} columns={3} />
        ) : (
          <DataTable
            columns={columns}
            data={spaces ?? []}
            onRowClick={(space) => setSelectedSpace(space)}
            emptyMessage="No accounts found."
          />
        )}

        <DetailPanel
          open={!!selectedSpace}
          onOpenChange={(open) => {
            if (!open) setSelectedSpace(null);
          }}
          title={`${selectedSpace?.name ?? ""} — Documents`}
        >
          {spaceDocs.length === 0 ? (
            <p className="text-muted-foreground">
              No documents found for this space.
            </p>
          ) : (
            <div className="space-y-4">
              {spaceDocs.map((doc) => (
                <div key={doc.id} className="p-3 rounded border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{doc.type}</div>
                    <StatusBadge status={doc.status} />
                  </div>
                  {doc.reject_reason && (
                    <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950 p-2 rounded">
                      Reason: {doc.reject_reason}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(doc.created_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </DetailPanel>
      </div>
    </ErrorBoundary>
  );
}
