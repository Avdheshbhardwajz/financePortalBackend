import { useMemo, useState, useCallback, memo, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import { Button } from "@/components/ui/button";
import { EditDialog } from "./EditDialog";
import { AddDialog } from "./AddDialog";
import { ColDef, ICellRendererParams } from "ag-grid-community";
import { Pencil, Plus } from "lucide-react";
import { useGridData } from "@/hooks/useGridData";
import { submitRequestData } from "@/services/api";
import { RequestDataPayload } from "@/types/requestData";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosError } from "axios";
import { RowData } from "@/types/grid";
import { ColumnConfig } from "@/types/grid";

interface DropdownOption {
  columnName: string;
  options: string[];
}

interface GridTableProps {
  tableName: string;
  initialPageSize?: number;
}

interface DropdownResponse {
  success: boolean;
  data: DropdownOption[];
}

export const GridTable = memo(
  ({ tableName, initialPageSize = 20 }: GridTableProps) => {
    const {
      isLoading,
      error,
      rowData,
      columnConfigs,
      columnPermissions,
      pagination,
      handlePageChange,
      handlePageSizeChange,
      refreshData,
    } = useGridData({ tableName, initialPageSize });

    const [selectedRow, setSelectedRow] = useState<RowData | null>(null);
    const [editedData, setEditedData] = useState<RowData | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [validationErrors, setValidationErrors] = useState<
      Record<string, string>
    >({});
    const [isSaving, setIsSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [dropdownOptions, setDropdownOptions] = useState<DropdownOption[]>(
      []
    );
    //const [gridApi, setGridApi] = useState<GridApi | null>(null)

    useEffect(() => {
      const fetchDropdownOptions = async () => {
        try {
          const response = await axios.post<DropdownResponse>(
            "http://localhost:8080/fetchDropdownOptions",
            { table_name: tableName }
          );

          if (response.data.success && response.data.data) {
            setDropdownOptions(response.data.data);
          }
        } catch (error) {
          const axiosError = error as AxiosError;
          console.error("Error fetching dropdown options:", axiosError.message);
        }
      };

      if (tableName) {
        fetchDropdownOptions();
      }
    }, [tableName]);

    const handleEditClick = useCallback(
      (row: RowData) => {
        const hasEditableColumns = Object.values(columnPermissions).some(
          (isEditable) => isEditable
        );
        if (!hasEditableColumns) {
          toast({
            title: "Cannot Edit",
            description: "None of the columns are editable for this table",
            variant: "destructive",
          });
          return;
        }

        setSelectedRow(row);
        setEditedData({ ...row });
        setValidationErrors({});
        setIsEditDialogOpen(true);
      },
      [columnPermissions]
    );

    const handleCloseEdit = useCallback(() => {
      setIsEditDialogOpen(false);
      setSelectedRow(null);
      setEditedData(null);
      setValidationErrors({});
      setSaveError(null);
    }, []);

    const handleInputChange = useCallback(
      (field: string, value: string) => {
        if (!columnPermissions[field]) return;

        setEditedData((prev) =>
          prev
            ? {
                ...prev,
                [field]: value,
              }
            : null
        );

        setValidationErrors((prev) => ({
          ...prev,
          [field]: "",
        }));
      },
      [columnPermissions]
    );

    const handleEditSave = useCallback(async () => {
      try {
        if (!selectedRow || !editedData) return;

        setIsSaving(true);
        setSaveError(null);

        const userData = JSON.parse(localStorage.getItem("userData") || "{}");
        const payload: RequestDataPayload = {
          table_name: tableName,
          old_values: selectedRow,
          new_values: editedData,
          maker_id: userData.user_id || "",
          comments: "",
        };

        await submitRequestData(payload);
        refreshData();
        handleCloseEdit();
      } catch (error) {
        const err = error as Error;
        console.error("Error saving changes:", err.message);
        setSaveError("Failed to save changes. Please try again.");
      } finally {
        setIsSaving(false);
      }
    }, [refreshData, selectedRow, editedData, tableName, handleCloseEdit]);

    const handleAddSuccess = useCallback(() => {
      refreshData();
      setIsAddDialogOpen(false);
    }, [refreshData]);

    const columnDefs = useMemo<ColDef[]>(() => {
      return [
        {
          headerName: "Actions",
          field: "actions",
          width: 100,
          cellRenderer: (params: ICellRendererParams) => {
            const hasEditableColumns = Object.values(columnPermissions).some(
              (isEditable) => isEditable
            );

            return (
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => params.data && handleEditClick(params.data)}
                  disabled={!hasEditableColumns}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            );
          },
        },
        ...Object.entries(columnConfigs).map(([field, config]) => ({
          field,
          headerName: config.displayName || config.headerName,
          sortable: true,
          filter: true,
          editable: false,
          cellStyle: () => ({
            backgroundColor: !columnPermissions[field] ? "#f5f5f5" : "white",
            cursor: columnPermissions[field] ? "pointer" : "not-allowed",
          }),
        })),
      ];
    }, [columnConfigs, handleEditClick, columnPermissions]);

    // const onGridReady = useCallback((params: { api: GridApi }) => {
    //   setGridApi(params.api);
    // }, []);

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-600">Loading data...</div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-red-600">{error}</div>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold capitalize">
            {tableName.replace(/_/g, " ")}
          </h2>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add New
          </Button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="ag-theme-alpine w-full h-[calc(100vh-16rem)] font-poppins">
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              suppressPaginationPanel={true}
              suppressScrollOnNewData={true}
              enableCellTextSelection={true}
              animateRows={true}
              // onGridReady={onGridReady}
            />
          </div>

          <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="border rounded p-1 text-sm"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage <= 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>

        <EditDialog
          isOpen={isEditDialogOpen}
          onClose={handleCloseEdit}
          selectedRowData={selectedRow}
          editedData={editedData}
          columnConfigs={columnConfigs as { [key: string]: ColumnConfig }}
          validationErrors={validationErrors}
          onSave={handleEditSave}
          onInputChange={handleInputChange}
          isSaving={isSaving}
          error={saveError}
          dropdownOptions={dropdownOptions}
        />

        <AddDialog
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          columnConfigs={columnConfigs}
          tableName={tableName}
          onSuccess={handleAddSuccess}
        />
      </div>
    );
  }
);

GridTable.displayName = "GridTable";
