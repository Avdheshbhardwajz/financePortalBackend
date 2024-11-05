import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import AdminLogin from '@/components/Adminlogin';
import EditorLogin from '@/components/Editorlogin';
import EditorSignup from '@/components/Editorsignup';

const Auth: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('editor');
  const [showEditorSignup, setShowEditorSignup] = useState<boolean>(false);

  // Handler to toggle between login and signup
  const handleAuthToggle = () => {
    setShowEditorSignup(!showEditorSignup);
  };

  return (
    <div className="min-h-screen w-full flex font-poppins">
      {/* Left Section - Company Branding (70%) */}
      <div className="hidden lg:flex w-[70%] bg-slate-900 relative">
        {/* Overlay with company info */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white z-10 p-8">
          <div className="flex items-center gap-3 mb-8">
            {/* Replace with your company logo */}
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center">
              <span className="text-slate-900 text-2xl font-bold">L</span>
            </div>
            <span className="text-2xl font-bold">Your Company</span>
          </div>
          
          {/* Main image placeholder */}
          <div className="w-full max-w-3xl aspect-video bg-slate-800 rounded-lg mb-8 overflow-hidden">
            <img 
              src="/api/placeholder/1200/675"
              alt="Company showcase"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Company description */}
          <div className="text-center max-w-2xl">
            <h1 className="text-3xl font-bold mb-4">Welcome to Your Platform</h1>
            <p className="text-slate-300">
              Access your dashboard to manage content, track analytics, and more.
              Our platform provides powerful tools for both editors and administrators.
            </p>
          </div>
        </div>
        
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-50 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
      </div>

      {/* Right Section - Auth Forms (30%) */}
      <div className="w-full lg:w-[30%] flex flex-col items-center justify-center p-6 bg-gray-50">
        <div className="w-full max-w-md space-y-6">
          <Tabs 
            defaultValue={activeTab} 
            className="w-full"
            onValueChange={(value) => {
              setActiveTab(value);
              setShowEditorSignup(false); // Reset to login view when switching tabs
            }}
          >
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="editor" className="text-sm">
                Editor Portal
              </TabsTrigger>
              <TabsTrigger value="admin" className="text-sm">
                Admin Login
              </TabsTrigger>
            </TabsList>
            <TabsContent value="editor" className="mt-0">
              <div className="space-y-4">
                {showEditorSignup ? (
                  <>
                    <EditorSignup />
                    <div className="text-center">
                      <Button
                        variant="link"
                        onClick={handleAuthToggle}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Already have an account? Sign in
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <EditorLogin />
                    <div className="text-center mt-4">
                      <Button
                        variant="link"
                        onClick={handleAuthToggle}
                        className="text-sm text-indigo-600 hover:text-indigo-500"
                      >
                        Don't have an account? Create one
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>
            <TabsContent value="admin" className="mt-0">
              <AdminLogin />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Auth;