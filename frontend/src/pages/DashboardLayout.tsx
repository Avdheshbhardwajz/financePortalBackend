'use client'

import { useState } from 'react'
import { Menu, LogOut, Upload, FileUp } from 'lucide-react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import GridTable from '@/components/GridTable'
import MainContent from '@/components/MainContent'
import logo from "../assets/Logo.png";

interface TableInfo {
  name: string;
  filename: string;
}


interface SelectedTableState {
  name: string | null;
  filename: string | null;
}

//const tables = ['Users', 'Products', 'Orders', 'Analytics', 'Settings']


export default function DashboardLayout() {

  const tableData: TableInfo[] = [


    { name: "Organization", filename: "organization" },
    { name: "Product", filename: "Product" },        // Updated to match Product.csv
    { name: "Employee", filename: "employee" },
    { name: "Broker", filename: "broker" },       // Updated to match rm_broker.csv
    { name: "Transaction", filename: "transaction" },
  
  
  ];
  

  const [selectedTable, setSelectedTable] = useState<SelectedTableState>({ 
    name: null, 
    filename: null 
  });
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleUpload = () => {
    if (file) {
      // Here you would typically send the file to your server
      console.log('Uploading file:', file.name)
      // Reset the file state after upload
      setFile(null)
    }
  }

  return (
    <div className="flex flex-col h-screen font-poppins bg-gray-100 ">
      {/* Header */}
      <header className="bg-white shadow-md p-4 flex items-center justify-between w-full">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="mr-4"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <img src={logo} alt="Sundaram Logo" className="w-[50%] mr-2" />
        </div>
        <div className="flex items-center space-x-4">
          <Dialog>
            <DialogTrigger asChild>
              
              <Button variant="outline" className="flex items-center">
              <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-white font-poppins">
              <DialogHeader>
                <DialogTitle>Import CSV File</DialogTitle>
                <DialogDescription>
                  Upload a CSV file to update data in bulk.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="csv-file" className="text-right">
                    CSV File
                  </Label>
                  <Input
                    id="csv-file"
                    type="file"
                    accept=".csv"
                    onChange={handleFileChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button onClick={handleUpload} disabled={!file}>
                  <FileUp className="mr-2 h-4 w-4" />
                  Upload
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <img
                  src="/placeholder.svg?height=32&width=32"
                  alt="Profile"
                  className="rounded-full"
                />
                <span className="sr-only">Open user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={`bg-white w-64 shadow-lg transition-all duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="p-4">
            <h2 className="text-xl font-semibold text-[#00529B] mb-4">Select Tables</h2>
            <nav>
              {tableData.map((table , index) => (
                <Button
                  key={index}
                  onClick={() => setSelectedTable({ 
                    name: table.name, 
                    filename: table.filename 
                  })}
                  variant="ghost"
                  className="w-full justify-start text-left mb-2 hover:bg-[#00529B] hover:text-white"
                >
                  {table.name}
                </Button>
              ))}
            </nav>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 ">
          {/* <h2 className="text-2xl font-semibold text-gray-800 mb-4">Welcome to the Dashboard</h2>
          <p className="text-gray-600">Select a table from the sidebar to view its contents.</p> */}
          {selectedTable.name && selectedTable.filename  ? (
            
            <GridTable tableName={selectedTable.filename} />
          ) : (
           <MainContent />
            
          )}
        </main>
      </div>
    </div>
  )
}