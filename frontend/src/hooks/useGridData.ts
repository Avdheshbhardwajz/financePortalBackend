import { useState, useEffect, useCallback, useRef } from 'react'
import axios, { AxiosError, CanceledError } from 'axios'
import { useToast } from '@/hooks/use-toast'
import {  RowData, ColumnConfig } from '@/types/grid'

interface UseGridDataProps {
  tableName: string
  initialPageSize?: number
}

interface ApiResponse {
  success: boolean
  data: RowData[]
  pagination: {
    total: number
    totalPages: number
    currentPage: number
    pageSize: number
  }
}

interface ColumnPermission {
  column_name: string
  column_status: 'editable' | 'non-editable'
}

interface ColumnPermissionResponse {
  success: boolean
  column_list: ColumnPermission[]
}

export const useGridData = ({ tableName, initialPageSize = 20 }: UseGridDataProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rowData, setRowData] = useState<RowData[]>([])
  const [headers, setHeaders] = useState<string[]>([])
  const [columnConfigs, setColumnConfigs] = useState<Record<string, ColumnConfig>>({})
  const [columnPermissions, setColumnPermissions] = useState<Record<string, boolean>>({})
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: initialPageSize
  })
  
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)

  const getColumnEditType = useCallback((header: string): ColumnConfig['editType'] => {
    // First check if the column is editable based on permissions
    if (!columnPermissions[header]) {
      return 'text'
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
    return 'text'
  }, [columnPermissions])

  const formatHeaderName = useCallback((header: string): string => {
    return header
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }, [])

  const createColumnConfigs = useCallback((data: RowData) => {
    const configs: Record<string, ColumnConfig> = {}
    Object.keys(data).forEach(header => {
      configs[header] = {
        field: header,
        headerName: formatHeaderName(header),
        isEditable: false,
        editType: getColumnEditType(header)
      }
    })
    return configs
  }, [formatHeaderName, getColumnEditType])

  const fetchColumnPermissions = useCallback(async () => {
    if (!tableName) {
      console.error('Table name is required for fetching column permissions')
      return
    }

    try {
      const response = await axios.post<ColumnPermissionResponse>('http://localhost:8080/columnPermission', {
        table_name: tableName,
        action: 'get'
      })

      if (response.data.success) {
        const permissions: Record<string, boolean> = {}
        // Initialize all columns as non-editable
        if (rowData.length > 0) {
          Object.keys(rowData[0]).forEach(col => {
            permissions[col] = false
          })
        }
        // Update only the editable columns from the response
        response.data.column_list.forEach((col) => {
          permissions[col.column_name] = col.column_status === 'editable'
        })
        setColumnPermissions(permissions)
        
        // Update column configs with the new permissions
        setColumnConfigs(prev => {
          const newConfigs = { ...prev }
          Object.keys(newConfigs).forEach(key => {
            newConfigs[key] = {
              ...newConfigs[key],
              isEditable: permissions[key] || false
            }
          })
          return newConfigs
        })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch column permissions'
      console.error('Error fetching column permissions:', errorMessage)
      toast({
        title: "Error",
        description: "Failed to fetch column permissions",
        variant: "destructive",
      })
    }
  }, [tableName, toast, rowData])

  const fetchData = useCallback(async (page: number, pageSize: number) => {
    if (!tableName) {
      console.error('Table name is required')
      return
    }

    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController()

    try {
      const response = await axios.get<ApiResponse>(`http://localhost:8080/tableData/${tableName}`, {
        params: {
          page,
          pageSize
        },
        signal: abortControllerRef.current.signal
      })

      if (response.data.success) {
        setRowData(response.data.data)
        setPagination(prev => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
          currentPage: page,
          pageSize
        }))
        if (response.data.data.length > 0) {
          setColumnConfigs(createColumnConfigs(response.data.data[0]))
          setHeaders(Object.keys(response.data.data[0]))
        }
      }
    } catch (error) {
      if (error instanceof CanceledError) {
        return
      }
      console.error('Error fetching data:', error)
      throw error
    }
  }, [tableName, createColumnConfigs])

  // Initial data load when table name changes
  useEffect(() => {
    if (!tableName) return

    const controller = new AbortController()

    const loadInitialData = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        await fetchColumnPermissions()
        await fetchData(1, pagination.pageSize)
      } catch (error) {
        console.error('Error loading initial data:', error)
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.error || error.message 
          : 'Failed to load data'
        setError(errorMessage)
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()

    return () => {
      controller.abort()
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [tableName])

  // Handle pagination changes
  useEffect(() => {
    if (!tableName || pagination.currentPage === 1) return

    const controller = new AbortController()

    const loadPageData = async () => {
      setIsLoading(true)

      try {
        await fetchData(pagination.currentPage, pagination.pageSize)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load page data'
        toast({
          variant: "destructive",
          title: "Error",
          description: errorMessage
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadPageData()

    return () => {
      controller.abort()
    }
  }, [tableName, pagination.currentPage])

  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }))
  }, [])

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize: newPageSize, currentPage: 1 }))
  }, [])

  const refreshData = useCallback(() => {
    fetchData(pagination.currentPage, pagination.pageSize)
  }, [fetchData, pagination.currentPage, pagination.pageSize])

  return {
    isLoading,
    error,
    rowData,
    headers,
    columnConfigs,
    columnPermissions,
    pagination,
    handlePageChange,
    handlePageSizeChange,
    refreshData
  }
}
