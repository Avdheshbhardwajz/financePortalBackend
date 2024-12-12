import { useState, useEffect } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus, X } from 'lucide-react'
import axios from 'axios'

interface DropdownOption {
  value: string;
}

interface ColumnDropdownOption {
  columnName: string;
  options: string[];
}

interface DropdownManagerProps {
  tables: string[];
}

export default function DropdownManager({ tables = [] }: DropdownManagerProps) {
  const [selectedTable, setSelectedTable] = useState('')
  const [columns, setColumns] = useState<string[]>([])
  const [selectedColumn, setSelectedColumn] = useState('')
  const [options, setOptions] = useState<DropdownOption[]>([])
  const [newOption, setNewOption] = useState('')
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' as 'info' | 'error' | 'success' })

  // Fetch columns when table is selected
  useEffect(() => {
    if (selectedTable) {
      fetchColumns(selectedTable)
      setSelectedColumn('') // Reset column selection when table changes
      setOptions([]) // Clear options when table changes
    }
  }, [selectedTable])

  // Fetch existing options when column is selected
  useEffect(() => {
    if (selectedTable && selectedColumn) {
      fetchExistingOptions()
    }
  }, [selectedTable, selectedColumn])

  const fetchColumns = async (tableName: string) => {
    try {
      setLoading(true)
      const response = await axios.post(`http://localhost:8080/fetchcolumn`, {
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

  const fetchExistingOptions = async () => {
    try {
      setLoading(true)
      const response = await axios.post('http://localhost:8080/fetchColumnDropDown', {
        table_name: selectedTable,
        columnName: selectedColumn
      })

      if (response.data.success && response.data.data) {
        const existingOptions = response.data.data.map((opt: string) => ({ value: opt }))
        setOptions(existingOptions)
        if (existingOptions.length > 0) {
          showAlert(`Loaded ${existingOptions.length} existing options`, 'success')
        }
      } else {
        setOptions([])
        if (response.data.message) {
          showAlert(response.data.message, 'info')
        }
      }
    } catch (error: any) {
      console.error('Error fetching options:', error)
      showAlert(error.response?.data?.message || 'Error fetching existing options', 'error')
      setOptions([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddOption = () => {
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

  const handleRemoveOption = (optionToRemove: string) => {
    setOptions(options.filter(opt => opt.value !== optionToRemove))
  }

  const handleSaveOptions = async () => {
    try {
      setLoading(true)

      // First, fetch all existing dropdown options for the table
      const existingOptionsResponse = await axios.post('http://localhost:8080/fetchColumnDropDown', {
        table_name: selectedTable,
        columnName: selectedColumn
      });

      let existingTableOptions: ColumnDropdownOption[] = [];
      
      // If we get a success response and have existing options
      if (existingOptionsResponse.data.success && existingOptionsResponse.data.data) {
        // Keep the existing options for other columns
        existingTableOptions = existingOptionsResponse.data.dropdown_options || [];
      }

      // Remove any existing options for the current column (if they exist)
      existingTableOptions = existingTableOptions.filter(
        option => option.columnName !== selectedColumn
      );

      // Add the new options for the current column
      const newColumnOption: ColumnDropdownOption = {
        columnName: selectedColumn,
        options: options.map(opt => opt.value)
      };

      // Combine existing and new options
      const allOptions = [...existingTableOptions, newColumnOption];

      // Save all options
      const response = await axios.post('http://localhost:8080/updateColumnDropDown', {
        table_name: selectedTable,
        dropdown_options: allOptions
      });

      if (response.data.success) {
        showAlert('Options saved successfully', 'success');
        fetchExistingOptions();
      } else {
        showAlert(response.data.message || 'Failed to save options', 'error');
      }
    } catch (error: any) {
      console.error('Error saving options:', error);
      showAlert(error.response?.data?.message || 'Error saving options', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showAlert = (message: string, type: 'error' | 'success' | 'info') => {
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
          {/* Table Selection */}
          <div className="space-y-2 font-poppins">
            <Label>Select Table</Label>
            <Select value={selectedTable} onValueChange={(value) => {
              setSelectedTable(value)
              setSelectedColumn('')
              setOptions([])
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select a table" />
              </SelectTrigger>
              <SelectContent className='bg-white font-poppins'>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column Selection */}
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
                <SelectContent className='bg-white font-poppins'>
                  {columns.map((column) => (
                    <SelectItem key={column} value={column}>
                      {column}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Options Management */}
          {selectedColumn && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add new option"
                  value={newOption}
                  onChange={(e) => setNewOption(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddOption()
                    }
                  }}
                />
                <Button 
                  onClick={handleAddOption}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </Button>
              </div>

              {/* Options List with count */}
              {options.length > 0 && (
                <div className="text-sm text-gray-500 mb-2">
                  {options.length} option{options.length !== 1 ? 's' : ''} available
                </div>
              )}
              
              {/* Options List */}
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

              {/* Save Button */}
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
