import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import axios, { AxiosError } from "axios";

type AlertType = "error" | "success" | "info";

interface ColumnStatus {
  column_name: string;
  column_status: "editable" | "non-editable";
}

interface AlertState {
  show: boolean;
  message: string;
  type: AlertType;
}

interface ColumnConfiguratorProps {
  tables: string[];
}

interface ColumnResponse {
  success: boolean;
  columns?: string[];
  message?: string;
}

interface StatusResponse {
  success: boolean;
  column_list?: ColumnStatus[];
  message?: string;
}

interface ErrorResponse {
  message?: string;
}

export default function ColumnConfigurator({
  tables = [],
}: ColumnConfiguratorProps) {
  const [selectedTable, setSelectedTable] = useState("");
  const [columns, setColumns] = useState<ColumnStatus[]>([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState<AlertState>({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (selectedTable) {
      void fetchColumns(selectedTable);
    }
  }, [selectedTable]);

  const fetchColumns = async (tableName: string) => {
    try {
      setLoading(true);
      const columnsResponse = await axios.post<ColumnResponse>(
        `http://localhost:8080/fetchcolumn`,
        { table_name: tableName }
      );

      if (!columnsResponse.data.success || !columnsResponse.data.columns) {
        showAlertMessage(
          `Failed to fetch columns: ${columnsResponse.data.message || ""}`,
          "error"
        );
        return;
      }

      const allColumns = columnsResponse.data.columns.map((col: string) => ({
        column_name: col,
        column_status: "non-editable" as "editable" | "non-editable",
      }));

      try {
        const statusResponse = await axios.post<StatusResponse>(
          "http://localhost:8080/ColumnPermission",
          {
            table_name: tableName,
            action: "get",
          }
        );

        if (statusResponse.data.success && statusResponse.data.column_list) {
          const existingStatuses = new Map(
            statusResponse.data.column_list.map((col) => [
              col.column_name,
              col.column_status,
            ])
          );

          allColumns.forEach((col) => {
            const status = existingStatuses.get(col.column_name);
            if (status) {
              col.column_status = status;
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch column statuses:", error);
      }

      setColumns(allColumns);
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      showAlertMessage(
        axiosError.response?.data?.message || "Failed to fetch columns",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleColumnStatusChange = async (
    columnName: string,
    newStatus: "editable" | "non-editable"
  ) => {
    try {
      const updatedColumns = columns.map((col) =>
        col.column_name === columnName
          ? { ...col, column_status: newStatus }
          : col
      );

      const response = await axios.post<StatusResponse>(
        "http://localhost:8080/ColumnPermission",
        {
          table_name: selectedTable,
          column_list: updatedColumns,
        }
      );

      if (response.data.success) {
        setColumns(updatedColumns);
        showAlertMessage("Column status updated successfully", "success");
      } else {
        showAlertMessage(
          response.data.message || "Failed to update column status",
          "error"
        );
      }
    } catch (error) {
      const axiosError = error as AxiosError<ErrorResponse>;
      showAlertMessage(
        axiosError.response?.data?.message || "Failed to update column status",
        "error"
      );
    }
  };

  const showAlertMessage = (message: string, type: AlertType) => {
    setAlert({ show: true, message, type });
    setTimeout(
      () => setAlert({ show: false, message: "", type: "info" }),
      3000
    );
  };

  return (
    <Card className="mt-6 font-poppins">
      <CardHeader>
        <CardTitle>Column Configuration</CardTitle>
      </CardHeader>
      <CardContent>
        {alert.show && (
          <Alert
            variant={alert.type === "error" ? "destructive" : "default"}
            className="mb-4"
          >
            <AlertTitle>
              {alert.type === "error" ? "Error" : "Success"}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label>Select Table</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent className="bg-white font-poppins">
                {Array.isArray(tables) &&
                  tables.map((table) => (
                    <SelectItem key={table} value={table}>
                      {table}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="text-center">Loading...</div>
          ) : (
            selectedTable && (
              <div className="space-y-2">
                {columns.map((column) => (
                  <div
                    key={column.column_name}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span>{column.column_name}</span>
                    <Select
                      value={column.column_status}
                      onValueChange={(value: "editable" | "non-editable") =>
                        handleColumnStatusChange(column.column_name, value)
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="editable">Editable</SelectItem>
                        <SelectItem value="non-editable">
                          Non-editable
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </CardContent>
    </Card>
  );
}
