// // EditorLogin.tsx
// import React, { useState } from 'react';
// //import { useNavigate } from 'react-router-dom';
// import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
// import { Alert, AlertDescription } from "@/components/ui/alert";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

// interface LoginFormData {
//   email: string;
//   password: string;
// }

// interface ForgotPasswordData {
//   email: string;
// }

// const EditorLogin: React.FC = () => {
//   //const navigate = useNavigate();
//   const [loginData, setLoginData] = useState<LoginFormData>({
//     email: '',
//     password: '',
//   });
//   const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordData>({
//     email: '',
//   });
//   const [isLoading, setIsLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>('');
//   const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
//   const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

//   const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setLoginData(prev => ({
//       ...prev,
//       [name]: value
//     }));
//     setError('');
//   };

//   const handleForgotPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForgotPasswordData({ email: e.target.value });
//     setError('');
//   };

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch('/api/editor/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(loginData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Login failed');
//       }

//       // Store the token
//       localStorage.setItem('editorToken', data.token);
      
//       // Redirect to editor dashboard
//      // navigate('/editor/dashboard');
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const handleForgotPassword = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setIsLoading(true);
//     setError('');

//     try {
//       // Replace with your actual API endpoint
//       const response = await fetch('/api/editor/forgot-password', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify(forgotPasswordData),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.message || 'Failed to send reset email');
//       }

//       setResetEmailSent(true);
//     } catch (err) {
//       setError(err instanceof Error ? err.message : 'Failed to send reset email. Please try again.');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   return (
  
//       <Card className="w-full max-w-md">
//         <CardHeader className="space-y-1">
//           <CardTitle className="text-2xl font-bold text-center">Editor Login</CardTitle>
//           <CardDescription className="text-center text-gray-500">
//             Enter your credentials to access the editor dashboard
//           </CardDescription>
//         </CardHeader>
        
//         <CardContent>
//           <form onSubmit={handleLogin} className="space-y-4">
//             {error && (
//               <Alert variant="destructive">
//                 <AlertCircle className="h-4 w-4" />
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}

//             <div className="space-y-4">
//               <div className="space-y-2">
//                 <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
//                   Email address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <Input
//                     id="email"
//                     name="email"
//                     type="email"
//                     autoComplete="email"
//                     required
//                     value={loginData.email}
//                     onChange={handleLoginChange}
//                     className="pl-10"
//                     placeholder="editor@example.com"
//                   />
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
//                   <Input
//                     id="password"
//                     name="password"
//                     type="password"
//                     autoComplete="current-password"
//                     required
//                     value={loginData.password}
//                     onChange={handleLoginChange}
//                     className="pl-10"
//                     placeholder="••••••••"
//                   />
//                 </div>
//               </div>
//             </div>

//             <Button
//               type="submit"
//               disabled={isLoading}
//               className="w-full"
//             >
//               {isLoading ? (
//                 <span className="flex items-center justify-center">
//                   <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
//                   Signing in...
//                 </span>
//               ) : (
//                 <span className="flex items-center justify-center">
//                   Sign in
//                   <ArrowRight className="ml-2 h-4 w-4" />
//                 </span>
//               )}
//             </Button>
//           </form>
//         </CardContent>

//         <CardFooter className="flex justify-center">
//           <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
//             <DialogTrigger asChild>
//               <Button variant="link" className="text-sm text-indigo-600 hover:text-indigo-500">
//                 Forgot your password?
//               </Button>
//             </DialogTrigger>
//             <DialogContent>
//               <DialogHeader>
//                 <DialogTitle>Reset Password</DialogTitle>
//                 <DialogDescription>
//                   Enter your email address and we'll send you a link to reset your password.
//                 </DialogDescription>
//               </DialogHeader>
              
//               {resetEmailSent ? (
//                 <div className="text-center py-4">
//                   <Alert>
//                     <AlertDescription className="text-green-600">
//                       If an account exists with that email, you will receive password reset instructions.
//                     </AlertDescription>
//                   </Alert>
//                 </div>
//               ) : (
//                 <form onSubmit={handleForgotPassword} className="space-y-4">
//                   <div className="space-y-2">
//                     <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 block">
//                       Email address
//                     </label>
//                     <Input
//                       id="reset-email"
//                       type="email"
//                       required
//                       value={forgotPasswordData.email}
//                       onChange={handleForgotPasswordChange}
//                       placeholder="Enter your email"
//                     />
//                   </div>
//                   <Button
//                     type="submit"
//                     disabled={isLoading}
//                     className="w-full"
//                   >
//                     {isLoading ? 'Sending...' : 'Send Reset Link'}
//                   </Button>
//                 </form>
//               )}
//             </DialogContent>
//           </Dialog>
//         </CardFooter>
//       </Card>
   
//   );
// };

// export default EditorLogin;



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Mail, Lock, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface LoginFormData {
  email: string;
  password: string;
}

interface ForgotPasswordData {
  email: string;
}

const EditorLogin: React.FC = () => {
    const navigate = useNavigate();
  const [loginData, setLoginData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  const [forgotPasswordData, setForgotPasswordData] = useState<ForgotPasswordData>({
    email: '',
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [resetEmailSent, setResetEmailSent] = useState<boolean>(false);
  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);

  // Hardcoded credentials
  const VALID_EMAIL = 'Sundaram123@gmail.com';
  const VALID_PASSWORD = 'Sundaram@123';

  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleForgotPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForgotPasswordData({ email: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (loginData.email === VALID_EMAIL && loginData.password === VALID_PASSWORD) {
      // Successful login
      localStorage.setItem('editorToken', 'dummy-token-12345');
      // Here you would typically redirect to dashboard
      navigate('/dashboard');
    } else {
      setError('Invalid email or password');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (forgotPasswordData.email === VALID_EMAIL) {
      setResetEmailSent(true);
    } else {
      setError('Email not found');
    }
    
    setIsLoading(false);
  };

  return (
    <Card className="w-full max-w-md font-poppins">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Editor Login</CardTitle>
        <CardDescription className="text-center text-gray-500">
          Enter your credentials to access the editor dashboard
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 block">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={loginData.email}
                  onChange={handleLoginChange}
                  className="pl-10"
                  placeholder="editor@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 block">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Signing in...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                Sign in
                <ArrowRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex justify-center">
        <Dialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
          <DialogTrigger asChild>
            <Button variant="link" className="text-sm text-indigo-600 hover:text-indigo-500">
              Forgot your password?
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reset Password</DialogTitle>
              <DialogDescription>
                Enter your email address and we'll send you a link to reset your password.
              </DialogDescription>
            </DialogHeader>
            
            {resetEmailSent ? (
              <div className="text-center py-4">
                <Alert>
                  <AlertDescription className="text-green-600">
                    If an account exists with that email, you will receive password reset instructions.
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reset-email" className="text-sm font-medium text-gray-700 block">
                    Email address
                  </label>
                  <Input
                    id="reset-email"
                    type="email"
                    required
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordChange}
                    placeholder="Enter your email"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Link'}
                </Button>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};

export default EditorLogin;