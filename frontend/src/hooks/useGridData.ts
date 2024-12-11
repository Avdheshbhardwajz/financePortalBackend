import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { useToast } from '@/hooks/use-toast'
import { GridResponse, RowData, ColumnConfig } from '@/types/grid'
import { fetchColumnStatus } from '@/services/api'

interface UseGridDataProps {
  tableName: string
  initialPageSize?: number
}

export const useGridData = ({ tableName, initialPageSize = 20 }: UseGridDataProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowData, setRowData] = useState<RowData[]>([])
  const [columnConfigs, setColumnConfigs] = useState<{ [key: string]: ColumnConfig }>({})
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: initialPageSize
  })
  
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const getColumnEditType = useCallback((header: string, isEditable: boolean): string => {
    if (!isEditable) {
      return '';
    }

    if (header.includes('date') || header.includes('_on')) {
      return 'date calendar'
    }
    if (header.includes('email')) {
      return 'email'
    }
    if (header.includes('phone') || header.includes('telephone') || header.includes('fax')) {
      return 'phone'
    }
    if (header.includes('pin')) {
      return 'number'
    }
    if (header.includes('state') || header.includes('zone') || header.includes('category')) {
      return 'dropdown'
    }
    return 'text free text'
  }, [])

  const fetchTableData = useCallback(async (editableColumns: Set<string>) => {
    try {
      const response = await axios.get<GridResponse>(`http://localhost:8080/tableData/${tableName}`, {
        params: {
          page: pagination.currentPage,
          pageSize: pagination.pageSize,
        },
        signal: abortControllerRef.current?.signal,
      })

      const { data, headers } = response.data

      // Create column configs using the editableColumns information
      const configs = headers.reduce((acc, header) => {
        const isEditable = editableColumns.has(header)
        acc[header] = {
          field: header,
          headerName: header.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          isEditable: isEditable,
          editType: getColumnEditType(header, isEditable)
        }
        return acc
      }, {} as { [key: string]: ColumnConfig })

      setColumnConfigs(configs)
      setRowData(data)
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages
      }))
    } catch (error: any) {
      if (error.name === 'AbortError') return
      throw error
    }
  }, [tableName, pagination.currentPage, pagination.pageSize, getColumnEditType])

  const fetchData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      setIsLoading(true)
      setError(null)

      // First, fetch column status
      const columnStatusResponse = await fetchColumnStatus(tableName)
      
      // Create a set of editable columns
      const editableColumns = new Set(
        columnStatusResponse.column_list
          .filter(col => col.column_status === 'editable')
          .map(col => col.column_name)
      )

      // Then fetch table data with editable columns information
      await fetchTableData(editableColumns)
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to fetch data'
      setError(errorMessage)
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      abortControllerRef.current = null
    }
  }, [tableName, fetchTableData, toast])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }))
    fetchData()
  }, [fetchData])

  const handlePageSizeChange = useCallback((size: number) => {
    setPagination(prev => ({
      ...prev,
      pageSize: size,
      currentPage: 1
    }))
    fetchData()
  }, [fetchData])

  const refreshData = useCallback(() => {
    fetchData()
  }, [fetchData])

  useEffect(() => {
    fetchData()
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [fetchData])

  return {
    isLoading,
    error,
    rowData,
    columnConfigs,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refreshData
  }
}
