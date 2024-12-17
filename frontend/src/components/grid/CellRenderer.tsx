import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ICellRendererParams } from "ag-grid-community";

interface CellRendererProps extends ICellRendererParams {
  isPending?: boolean;
  isDateField?: boolean;
  editType?: string;
  value: string | number | null | undefined;
}

export const CellRenderer = ({
  value,
  isPending = false,
  isDateField = false,
  editType,
}: CellRendererProps) => {
  const formatValue = () => {
    if (!value && value !== 0) return "-";

    if (isDateField) {
      try {
        const date = new Date(value);
        return date.toLocaleDateString();
      } catch {
        return value;
      }
    }

    if (editType === "number") {
      return typeof value === "number" ? value.toLocaleString() : value;
    }

    return value;
  };

  return (
    <div className="flex items-center gap-2">
      <span className={isPending ? "text-blue-600 font-medium" : ""}>
        {formatValue()}
      </span>
      {isPending && (
        <Badge variant="outline" className="h-5 px-1">
          <Clock className="h-3 w-3 text-blue-600" />
        </Badge>
      )}
    </div>
  );
};
