'use client'

import React, { useEffect, useState } from "react"
import { AgGridReact } from "ag-grid-react"
import "ag-grid-community/styles/ag-grid.css"
import "ag-grid-community/styles/ag-theme-alpine.css"
import Papa from "papaparse"
import { ColDef, ICellRendererParams } from 'ag-grid-community'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface GridTableProps {
  tableName: string
}

interface RowData {
  [key: string]: string | number | null | undefined
}

interface PendingChanges {
  [key: string]: string[]
}

interface CustomCellRendererParams extends ICellRendererParams {
  data: RowData ; 
  colDef: ColDef; 
}

export default function GridTable({ tableName }: GridTableProps) {
  const [rowData, setRowData] = useState<RowData[]>([])
  const [colDefs, setColDefs] = useState<ColDef[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRowData, setSelectedRowData] = useState<RowData | null>(null)
  const [editedData, setEditedData] = useState<RowData>({})
  const [pendingChanges, setPendingChanges] = useState<PendingChanges>({})
  const [editableFields, setEditableFields] = useState<string[]>([])
  const { toast } = useToast()

  useEffect(() => {
    const csvFile = `../assets/csv/${tableName.toLowerCase().replace(/ /g, "_")}.csv`
    Papa.parse(csvFile, {
      download: true,
      header: true,
      complete: (result: Papa.ParseResult<RowData>) => {
        const data = result.data
        if (data.length > 0) {
          const columns: ColDef[] = Object.keys(data[0]).map((key) => ({
            field: key,
            filter: true,
            cellRenderer: (params: CustomCellRendererParams) => {
              const rowId = params.node?.id || ''
              const field = params.colDef.field || ''
              const isPending = pendingChanges[rowId]?.includes(field)
              
              return (
                <div className="flex items-center gap-2">
                  <span>{params.value}</span>
                  {isPending && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">
                            Pending
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Change pending approval</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              )
            },
            cellStyle: { padding: '8px' },
          }))

          columns.push({
            headerName: "Actions",
            field: "actions",
            cellRenderer: (params: CustomCellRendererParams) => (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleEditButtonClick(params.data)}
                className="flex items-center gap-2"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            ),
            width: 120,
            filter: false,
          })

          setColDefs(columns)
          setRowData(data)
        }
      },
      error: (err: Error) => {
        console.error("Error parsing CSV file: ", err)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load data. Please try again later.",
        })
      },
    })
  }, [tableName, pendingChanges, toast])

  const handleEditButtonClick = (data: RowData) => {
    const emptyFields = Object.entries(data)
      .filter(([, value]) => {
        return !value || 
               value === "" || 
               value === null || 
               value === undefined || 
               (typeof value === "string" && value.trim() === "")
      })
      .map(([key]) => key)
      .filter((key) => key !== "actions")

    setEditableFields(emptyFields)
    setSelectedRowData(data)
    setEditedData({ ...data })
    setIsModalOpen(true)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    if (name === "numericField" && isNaN(Number(value))) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid number",
      })
      return
    }

    setEditedData({ ...editedData, [name]: value })

    const rowId = String(rowData.indexOf(selectedRowData as RowData))
    setPendingChanges((prevChanges) => ({
      ...prevChanges,
      [rowId]: [...(prevChanges[rowId] || []), name],
    }))
  }

  const handleSave = () => {
    const updatedRowData = rowData.map((row) =>
      row === selectedRowData ? editedData : row
    )
    setRowData(updatedRowData)
    setIsModalOpen(false)
    toast({
      title: "Changes Pending",
      description: "Your edited data will reflect here once admin approves it.",
    })
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{tableName}</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="ag-theme-alpine h-[600px] w-full rounded-md border">
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            pagination={true}
            paginationPageSize={10}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            suppressMenuHide={true}
            defaultColDef={{
              sortable: true,
              resizable: true,
              flex: 1,
            }}
            rowSelection="single"
            animateRows={true}
            className="font-poppins"
          />
        </div>

        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white font-poppins ">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Edit Row</DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[60vh] px-1">
              {selectedRowData && (
                <div className="grid gap-4 py-4">
                  {colDefs.map((col, index) => {
                    if (col.field === "actions") return null
                    
                    const isEditable = editableFields.includes(col.field || '')
                    const field = col.field || ''
                    
                    return (
                      <div key={index} className="grid gap-2">
                        <Label htmlFor={field} className="font-medium">
                          {field}
                          {isEditable && (
                            <Badge variant="secondary" className="ml-2 text-xs">
                              Editable
                            </Badge>
                          )}
                        </Label>
                        {isEditable ? (
                          <Input
                            id={field}
                            name={field}
                            value={editedData[field] || ""}
                            onChange={handleInputChange}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        ) : (
                          <Input
                            id={field}
                            value={editedData[field] || ""}
                            disabled
                            className="bg-gray-100 text-gray-600"
                          />
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </ScrollArea>

            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
                Save changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}