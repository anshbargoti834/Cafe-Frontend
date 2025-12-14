import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { endpoints } from '../services/api';
import { HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker } from 'react-icons/hi';
import PageHeader from '../components/PageHeader';

type ContactForm = {
  name: string;
  email: string;
  message: string;
};

const Contact = () => {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [serverError, setServerError] = useState('');

  const onSubmit = async (data: ContactForm) => {
    setStatus('submitting');
    try {
      await endpoints.contact.submit(data);
      setStatus('success');
      reset();
    } catch (err: any) {
      setStatus('error');
      const msg = err.response?.status === 429 
        ? "You're sending too many messages. Please try again in an hour." 
        : (err.response?.data?.message || "Failed to send message.");
      setServerError(msg);
    }
  };

  const inputContainerClass = "relative mt-8";
  const labelClass = "absolute -top-3 left-0 text-xs uppercase tracking-wider text-cafe-base bg-white px-1 font-bold";
  const inputClass = "w-full border-b-2 border-cafe-200 py-3 outline-none focus:border-cafe-base bg-transparent text-gray-800 transition-colors placeholder-transparent md:placeholder-gray-300";

  return (
    <div className="min-h-screen pb-20 relative">
      
      {/* HERO HEADER */}
      <PageHeader 
        title="Get in Touch" 
        subtitle="We'd love to hear from you" 
        image="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&q=80" 
      />

      {/* FLOATING CARD */}
      <div className="px-4 relative z-20 -mt-20 max-w-6xl mx-auto">
        <motion.div 
           initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
           className="bg-white shadow-[0_30px_60px_rgba(0,0,0,0.3)] rounded-sm overflow-hidden grid grid-cols-1 lg:grid-cols-2"
        >
          
          {/* LEFT COLUMN: Dark Info Panel */}
          <div className="bg-cafe-900 text-white p-10 flex flex-col gap-8 relative overflow-hidden h-full">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] pointer-events-none"></div>
            
            <div className="relative z-10">
              <span className="text-cafe-500 uppercase tracking-widest text-xs font-bold mb-2 block">Contact Info</span>
              <h3 className="font-serif text-3xl">Visit Us Today</h3>
            </div>
            
            <div className="flex flex-col gap-6 font-light relative z-10">
              <div className="flex items-start gap-5 group">
                <div className="mt-1 p-2 border border-white/20 rounded-full group-hover:bg-cafe-500 group-hover:border-cafe-500 transition-all shrink-0">
                  <HiOutlineLocationMarker className="text-xl" />
                </div>
                <div>
                  <p className="font-bold text-base mb-1">Demo Café</p>
                  <p className="text-cafe-200 text-sm leading-relaxed max-w-xs">
                    Delhi, India
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-5 group">
                <div className="p-2 border border-white/20 rounded-full group-hover:bg-cafe-500 group-hover:border-cafe-500 transition-all shrink-0">
                  <HiOutlinePhone className="text-xl" />
                </div>
                <p className="text-cafe-200 text-base">+91 98765 43210</p>
              </div>
              
              <div className="flex items-center gap-5 group">
                <div className="p-2 border border-white/20 rounded-full group-hover:bg-cafe-500 group-hover:border-cafe-500 transition-all shrink-0">
                  <HiOutlineMail className="text-xl" />
                </div>
                <p className="text-cafe-200 text-base">hello@gmail.com</p>
              </div>
            </div>

            <div className="h-48 w-full bg-cafe-800 rounded-sm overflow-hidden relative group border border-white/10 shadow-lg mt-auto lg:mt-4 z-10">
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80" 
                alt="Map location" 
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <a 
                  href="https://goo.gl/maps/PlaceHolderLink" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-cafe-500/90 backdrop-blur-sm text-white px-6 py-2 text-xs uppercase tracking-widest hover:bg-white hover:text-cafe-900 transition-colors shadow-lg font-bold"
                >
                  Open in Maps
                </a>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/10">
              <div className="flex flex-col sm:flex-row justify-between text-xs text-cafe-300 uppercase tracking-widest gap-2">
                <span>Mon - Fri: 07:00 - 20:00</span>
                <span>Sat - Sun: 08:00 - 22:00</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: White Form Panel */}
          <div className="p-10 lg:p-14 flex flex-col justify-start pt-16 bg-white h-full">
            <h3 className="font-serif text-3xl mb-2 text-cafe-900">Send a Message</h3>
            <p className="text-gray-500 mb-6 font-light text-sm">Whether you have a question about our beans or want to host an event.</p>

            <AnimatePresence mode="wait">
              {status === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 p-8 text-center rounded-sm mt-8"
                >
                  <div className="text-green-600 text-5xl mb-4 flex justify-center"><HiOutlineMail /></div>
                  <h4 className="font-serif text-xl text-green-800 mb-2">Message Sent!</h4>
                  <p className="text-green-700 text-sm">Thank you for reaching out. We will get back to you shortly.</p>
                  <button onClick={() => setStatus('idle')} className="mt-6 text-sm underline text-cafe-base hover:text-cafe-900 font-bold uppercase tracking-wide">Send another</button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                  
                  <div className={inputContainerClass}>
                    <label className={labelClass}>Your Name</label>
                    <input 
                      {...register("name", { required: "Name is required" })} 
                      className={inputClass}
                      placeholder="John Doe"
                    />
                    {/* FIXED: 'block' and 'mt-2' ensure it sits below */}
                    {errors.name && <span className="text-red-500 text-xs mt-2 block font-medium">⚠️ {errors.name.message}</span>}
                  </div>

                  <div className={inputContainerClass}>
                    <label className={labelClass}>Email Address</label>
                    <input 
                      {...register("email", { 
                        required: "Email is required",
                        pattern: { value: /^\S+@\S+$/i, message: "Invalid email address" }
                      })} 
                      className={inputClass}
                      placeholder="john@example.com"
                    />
                    {/* FIXED */}
                    {errors.email && <span className="text-red-500 text-xs mt-2 block font-medium">⚠️ {errors.email.message}</span>}
                  </div>

                  <div className="relative mt-8">
                    <label className="block text-xs uppercase tracking-wider text-cafe-base font-bold mb-2">Message</label>
                    <textarea 
                      {...register("message", { 
                        required: "Message is required",
                        minLength: { value: 10, message: "Min 10 chars" }
                      })} 
                      rows={4}
                      className="w-full bg-cafe-50 border border-cafe-200 p-4 outline-none focus:border-cafe-500 focus:bg-white transition-all resize-none text-gray-800 rounded-sm placeholder-gray-300"
                      placeholder="How can we help you?"
                    ></textarea>
                    {/* FIXED */}
                    {errors.message && <span className="text-red-500 text-xs mt-2 block font-medium">⚠️ {errors.message.message}</span>}
                  </div>

                  {status === 'error' && (
                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm text-center">
                      {serverError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={status === 'submitting'}
                    className="w-full bg-cafe-base text-white py-4 font-serif uppercase tracking-widest hover:bg-cafe-800 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed mt-2"
                  >
                    {status === 'submitting' ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </AnimatePresence>
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Contact;