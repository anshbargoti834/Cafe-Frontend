import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { endpoints } from '../../services/api'; 
import { HiLockClosed, HiArrowRight } from 'react-icons/hi';
import api from '../../services/api';

const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', data);
      if (res.data.success) {
        login(res.data.token);
        navigate('/admin/dashboard'); 
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid username or password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans">
      
      {/* 1. LEFT SIDE: Visual Atmosphere */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-cafe-900 overflow-hidden items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-cafe-900 via-transparent to-transparent"></div>
        
        <div className="relative z-10 text-center px-12">
          <h1 className="font-serif text-6xl text-white mb-6 tracking-tight">Demo</h1>
          <p className="text-cafe-200 text-lg font-light tracking-wide max-w-md mx-auto leading-relaxed">
            "Quality is not an act, it is a habit." <br/> Welcome back to your command center.
          </p>
        </div>
      </div>

      {/* 2. RIGHT SIDE: The Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-8">
        <div className="max-w-md w-full">
          
          <div className="text-center mb-10">
             <div className="w-16 h-16 bg-cafe-100 rounded-full flex items-center justify-center mx-auto mb-4 text-cafe-600 text-2xl">
               <HiLockClosed />
             </div>
             <h2 className="text-3xl font-serif text-gray-900 font-bold">Admin Sign In</h2>
             <p className="text-gray-500 mt-2 text-sm">Enter your credentials to access the dashboard.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Username Input */}
            <div>
              <label className="block text-xs font-bold text-cafe-900 uppercase tracking-widest mb-2">Username</label>
              <input 
                {...register("username", { required: "Username is required" })}
                className="w-full bg-white border border-gray-300 text-gray-900 text-lg px-4 py-4 rounded-sm outline-none focus:border-cafe-500 focus:ring-1 focus:ring-cafe-500 transition-all placeholder-gray-300 shadow-sm"
                placeholder="admin"
                autoComplete="off"
              />
              {errors.username && <span className="text-red-500 text-xs mt-1 block">⚠️ Username is required</span>}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-bold text-cafe-900 uppercase tracking-widest mb-2">Password</label>
              <input 
                type="password"
                {...register("password", { required: "Password is required" })}
                className="w-full bg-white border border-gray-300 text-gray-900 text-lg px-4 py-4 rounded-sm outline-none focus:border-cafe-500 focus:ring-1 focus:ring-cafe-500 transition-all placeholder-gray-300 shadow-sm"
                placeholder="••••••••"
              />
              {errors.password && <span className="text-red-500 text-xs mt-1 block">⚠️ Password is required</span>}
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 text-sm rounded-r-sm">
                <p className="font-bold">Access Denied</p>
                <p>{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button 
              disabled={isLoading}
              className="w-full bg-cafe-900 text-white py-4 text-sm font-bold uppercase tracking-[0.2em] hover:bg-cafe-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="animate-pulse">Verifying...</span>
              ) : (
                <>
                  Enter Dashboard <HiArrowRight className="group-hover:translate-x-1 transition-transform"/>
                </>
              )}
            </button>
          </form>

          <p className="text-center text-gray-400 text-xs mt-8">
            &copy; 2025 Demo Café System. Secure Connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;