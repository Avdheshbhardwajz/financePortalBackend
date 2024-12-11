import { useState, useEffect, KeyboardEvent, ChangeEvent } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import axios, { AxiosError } from 'axios'

interface DropdownOption {
  value: string;
}

interface DropdownManagerProps {
  tables: string[];
}

interface AlertState {
  show: boolean;
  message: string;
  type: 'error' | 'success' | 'info';
}

interface FetchColumnResponse {
  success: boolean;
  columns?: string[];
  message?: string;
}

interface FetchDropdownResponse {
  success: boolean;
  data?: string[];
  message?: string;
}

interface UpdateDropdownResponse {
  success: boolean;
  message?: string;
}

export default function DropdownManager({ tables = [] }: DropdownManagerProps) {
  const [selectedTable, setSelectedTable] = useState<string>('')
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState<string>('')
  const [options, setOptions] = useState<DropdownOption[]>([])
  const [newOption, setNewOption] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const [alert, setAlert] = useState<AlertState>({ 
    show: false, 
    message: '', 
    type: 'info' 
  })

  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedTable)
      setSelectedColumn('')
      setOptions([])
    }
  }, [selectedTable])

  useEffect(() => {
    if (selectedTable && selectedColumn) {
      fetchExistingOptions()
    }
  }, [selectedTable, selectedColumn])

  const fetchColumns = async (tableName: string): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.post<FetchColumnResponse>(`http://localhost:8080/fetchcolumn`, {
        table_name: tableName
      })

      if (response.data.success && response.data.columns) {
        setColumns(response.data.columns)
      } else {
        showAlert('Failed to fetch columns', 'error')
      }
    } catch (error) {
      showAlert('Error fetching columns', 'error')
    } finally {
      setLoading(false)
    }
  }

  const fetchExistingOptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.post<FetchDropdownResponse>('http://localhost:8080/fetchcolumnDropdown', {
        table_name: selectedTable,
        column_name: selectedColumn
      })

      if (response.data.success && response.data.data) {
        const existingOptions = Array.isArray(response.data.data) 
          ? response.data.data.map((opt: string) => ({ value: opt }))
          : []
        setOptions(existingOptions)
        if (existingOptions.length > 0) {
          showAlert(`Loaded ${existingOptions.length} existing options`, 'success')
        }
      } else {
        setOptions([])
      }
    } catch (error) {
      const axiosError = error as AxiosError
      if (axiosError.response?.status === 404) {
        setOptions([])
      } else {
        showAlert('Error fetching existing options', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = (): void => {
    if (!newOption.trim()) {
      showAlert('Option cannot be empty', 'error')
      return
    }

    if (options.some(opt => opt.value.toLowerCase() === newOption.toLowerCase())) {
      showAlert('Option already exists', 'error')
      return
    }

    setOptions([...options, { value: newOption.trim() }])
    setNewOption('')
  }

  const handleRemoveOption = (optionToRemove: string): void => {
    setOptions(options.filter(opt => opt.value !== optionToRemove))
  }

  const handleSaveOptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const response = await axios.post<UpdateDropdownResponse>('http://localhost:8080/updatecolumnDropdown', {
        table_name: selectedTable,
        column_name: selectedColumn,
        dropdown_options: options.map(opt => opt.value)
      })

      if (response.data.success) {
        showAlert('Options saved successfully', 'success')
        fetchExistingOptions()
      } else {
        showAlert(response.data.message || 'Failed to save options', 'error')
      }
    } catch (error) {
      showAlert('Error saving options', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === 'Enter') {
      handleAddOption()
    }
  }

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setNewOption(e.target.value)
  }

  const showAlert = (message: string, type: AlertState['type']): void => {
    setAlert({ show: true, message, type })
    setTimeout(() => setAlert({ show: false, message: '', type: 'info' }), 3000)
  }

  return (
    <Card className="mt-6 font-poppins">
      <CardHeader>
        <CardTitle>Dropdown Options Manager</CardTitle>
      </CardHeader>
      <CardContent>
        {alert.show && (
          <Alert 
            variant={alert.type === 'error' ? 'destructive' : 'default'} 
            className="mb-4"
          >
            <AlertTitle>
              {alert.type === 'error' ? 'Error' : 'Success'}
            </AlertTitle>
            <AlertDescription>{alert.message}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Select Table</Label>
            <Select value={selectedTable} onValueChange={setSelectedTable}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTable && (
            <div className="space-y-2">
              <Label>Select Column</Label>
              <Select 
                value={selectedColumn} 
                onValueChange={setSelectedColumn}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a column" />
                </SelectTrigger>
                <SelectContent className='bg-white'>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {selectedColumn && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new option"
                  value={newOption}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                />
                <Button 
                  onClick={handleAddOption}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {options.length > 0 && (
                <div className="text-sm text-gray-500 mb-2">
                  {options.length} option{options.length !== 1 ? 's' : ''} available
                </div>
              )}
              
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {options.map((option, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100"
                  >
                    <span>{option.value}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveOption(option.value)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                onClick={handleSaveOptions}
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Options'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
