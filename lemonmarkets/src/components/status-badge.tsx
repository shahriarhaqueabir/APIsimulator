import { cn } from "@/lib/utils"

const statusStyles: Record<string, string> = {
  // Order statuses
  filled: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  open: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  canceled: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  failed: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  // Document statuses
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  pending: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  // Issue severity
  critical: "bg-red-200 text-red-900 dark:bg-red-800 dark:text-red-100",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
  // Generic
  received: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100",
  processed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        statusStyles[status] || "bg-gray-100 text-gray-800"
      )}
    >
      {status}
    </span>
  )
}
