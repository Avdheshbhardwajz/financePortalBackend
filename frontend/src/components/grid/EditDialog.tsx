import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from 'lucide-react'
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface DropdownOption {
  columnName: string;
  options: string[];
}

interface EditDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedRowData: any
  editedData: any
  columnConfigs: { [key: string]: any }
  validationErrors: { [key: string]: string }
  onSave: () => void
  onInputChange: (field: string, value: any) => void
  isSaving: boolean
  error: string | null
  dropdownOptions: DropdownOption[]
}

export function EditDialog({
  isOpen,
  onClose,
  selectedRowData,
  editedData,
  columnConfigs,
  validationErrors,
  onSave,
  onInputChange,
  isSaving,
  error,
  dropdownOptions
}: EditDialogProps) {
  if (!selectedRowData || !editedData) return null;

  const getDropdownOptionsForColumn = (columnName: string) => {
    return dropdownOptions.find(opt => opt.columnName === columnName)?.options || [];
  };

  const isDropdownColumn = (columnName: string) => {
    return dropdownOptions.some(opt => opt.columnName === columnName);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[40%] min-w-[450px] bg-white font-poppins h-[80vh] p-0 flex flex-col">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Edit Row</DialogTitle>
        </DialogHeader>
        <div className="flex-grow overflow-hidden">
          <ScrollArea className="h-full px-6 py-2">
            <div className="grid gap-4">
              {Object.entries(columnConfigs).map(([field, config]) => (
                <div key={field} className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor={field} className="text-right">
                    {config.displayName}
                  </Label>
                  <div className="col-span-3">
                    {isDropdownColumn(field) ? (
                      <Select
                        value={editedData[field] || ''}
                        onValueChange={(value) => onInputChange(field, value)}
                        disabled={config.readOnly}
                      >
                        <SelectTrigger className={validationErrors[field] ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent className="bg-white font-poppins" >
                          {getDropdownOptionsForColumn(field).map((option) => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        id={field}
                        value={editedData[field] || ''}
                        onChange={(e) => onInputChange(field, e.target.value)}
                        className={`${validationErrors[field] ? 'border-red-500' : ''} ${config.readOnly ? 'bg-gray-100' : ''}`}
                        disabled={config.readOnly}
                      />
                    )}
                    {validationErrors[field] && (
                      <span className="text-sm text-red-500">
                        {validationErrors[field]}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
        {error && (
          <Alert variant="destructive" className="mx-6 my-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="flex justify-end space-x-2 p-6 border-t bg-white">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
