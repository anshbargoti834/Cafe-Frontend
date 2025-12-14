import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
// 1. IMPORT SERVER_URL (Just like Menu page)
import { endpoints, SERVER_URL } from '../services/api';
import { ReservationPayload } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../components/PageHeader';
import { HiUser, HiPhone, HiMail, HiCalendar } from 'react-icons/hi';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const TIME_SLOTS = [
  "08:00-09:00", "09:00-10:00", "10:00-11:00", "11:00-12:00",
  "12:00-13:00", "13:00-14:00", "14:00-15:00", "15:00-16:00",
  "16:00-17:00", "17:00-18:00", "18:00-19:00", "19:00-20:00"
];

// 2. ADD THE IMAGE HELPER (Safe for Vercel)
const getImageUrl = (imagePath: string) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http')) return imagePath; // Returns Unsplash links as-is
  let cleanPath = imagePath.replace(/\\/g, '/');
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  return `${SERVER_URL}${encodeURI(cleanPath)}`;
};

const Reservation = () => {
  const { register, handleSubmit, watch, setValue, control, formState: { errors }, reset } = useForm<ReservationPayload>();
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [availability, setAvailability] = useState<number | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);

  const selectedDateObj = watch('date');
  const selectedSlot = watch('timeSlot');

  const formatDateForApi = (date: Date | string) => {
    if (!date) return "";
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSlotPast = (slot: string) => {
    if (!selectedDateObj) return false;
    const today = new Date();
    const checkDate = new Date(selectedDateObj);
    const todayStr = today.toDateString();
    const checkStr = checkDate.toDateString();

    if (todayStr !== checkStr) return false;

    const currentHour = today.getHours();
    const slotStartHour = parseInt(slot.split(':')[0]);
    return slotStartHour <= currentHour; 
  };

  useEffect(() => {
    let cancelled = false;
    const checkSeats = async () => {
      const dateStr = formatDateForApi(selectedDateObj);
      if (!dateStr || !selectedSlot) { setAvailability(null); return; }
      try {
        setIsCheckingAvailability(true);
        const res = await endpoints.reservations.checkAvailability(dateStr, selectedSlot);
        if (!cancelled) setAvailability(res.data.remainingSeats);
      } catch (err) { if (!cancelled) setAvailability(null); } 
      finally { if (!cancelled) setIsCheckingAvailability(false); }
    };
    checkSeats();
    return () => { cancelled = true; };
  }, [selectedDateObj, selectedSlot]);

  const onSubmit = async (data: ReservationPayload) => {
    setStatus('checking'); setErrorMsg('');
    try {
      const payload = { ...data, date: formatDateForApi(data.date) };
      
      if (payload.date && payload.timeSlot) {
        try {
            const res = await endpoints.reservations.checkAvailability(payload.date, payload.timeSlot);
            if (res.data.remainingSeats < payload.numberOfGuests) {
                setStatus('error'); setErrorMsg('Not enough seats available.'); return;
            }
        } catch(e) {}
      }
      await endpoints.reservations.create(payload);
      setStatus('success');
      setAvailability(prev => prev !== null ? Math.max(0, (prev - (payload.numberOfGuests || 1))) : null);
      setTimeout(() => { reset(); setStatus('idle'); setAvailability(null); setValue('timeSlot', ''); }, 3000);
    } catch (err: any) {
      setStatus('error'); setErrorMsg("We couldn't book your table. Please check your details.");
    }
  };

  // Styles
  const inputGroupClass = "space-y-2 w-full"; 
  const labelClass = "text-xs font-bold uppercase tracking-widest text-cafe-500 ml-1";
  const inputClass = "w-full bg-cafe-50 border border-cafe-200 text-cafe-900 px-4 py-3 rounded-sm outline-none focus:border-cafe-500 focus:bg-white focus:ring-1 focus:ring-cafe-500 transition-all font-sans placeholder-cafe-300";

  return (
    <div className="min-h-screen relative pb-20">
      
      <style>{`
        .react-datepicker-wrapper { width: 100%; display: block; }
        .react-datepicker__input-container { width: 100%; display: block; }
        .react-datepicker__header { background-color: #F5F1E8; border-bottom: 1px solid #D4C5B0; }
        .react-datepicker__current-month { color: #A38058; font-family: 'Playfair Display', serif; }
        .react-datepicker__day-name { color: #A38058; }
        .react-datepicker__day--selected { background-color: #A38058 !important; border-radius: 2px; }
        .react-datepicker__day--keyboard-selected { background-color: #C8B282 !important; border-radius: 2px; }
        .react-datepicker__day--today { font-weight: bold; color: #A38058; }
        .react-datepicker__day:hover { background-color: #E8E1D9; border-radius: 2px; }
      `}</style>

      {/* 3. WRAP THE IMAGE IN THE HELPER (Best Practice) */}
      <PageHeader 
        title="Reserve a Table" 
        subtitle="Book Your Spot" 
        image={getImageUrl("https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80")} 
      />

      <div className="relative z-20 px-4 -mt-20">
        <div className="w-full max-w-4xl mx-auto bg-white p-8 md:p-14 shadow-[0_30px_60px_rgba(0,0,0,0.3)] border-t-4 border-white relative overflow-hidden rounded-sm">
          
          <AnimatePresence mode="wait">
            {status === 'success' ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-12 bg-green-50 rounded-lg border border-green-100 text-center">
                <div className="text-5xl mb-6">🎉</div>
                <h2 className="text-2xl font-serif font-bold text-green-800 mb-2">Reservation Confirmed!</h2>
                <p className="text-green-700">We have saved your table. See you soon.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="font-sans">
                
                <h3 className="font-serif text-xl text-cafe-900 mb-8 flex items-center gap-2 border-b border-cafe-100 pb-2">
                  <HiUser className="text-cafe-500"/> Booking Details
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className={inputGroupClass}>
                    <label className={labelClass}>Full Name</label>
                    <div className="relative">
                        <input {...register("name", { required: "Name required" })} placeholder="John Doe" className={inputClass} />
                        <HiUser className="absolute right-4 top-3.5 text-cafe-300 text-lg"/>
                    </div>
                    {errors.name && <span className="text-red-500 text-xs font-bold">⚠️ {errors.name.message}</span>}
                  </div>

                  <div className={inputGroupClass}>
                    <label className={labelClass}>Email Address</label>
                    <div className="relative">
                      <input type="email" {...register("email", { required: "Email required", pattern: /^\S+@\S+$/i })} placeholder="john@example.com" className={inputClass} />
                      <HiMail className="absolute right-4 top-3.5 text-cafe-300 text-lg"/>
                    </div>
                    {errors.email && <span className="text-red-500 text-xs font-bold">⚠️ {errors.email.message}</span>}
                  </div>

                  <div className={inputGroupClass}>
                    <label className={labelClass}>Phone Number</label>
                    <div className="relative">
                      <input {...register("phone", { required: "Phone required", pattern: /^\d{10}$/ })} type="tel" placeholder="1234567890" className={inputClass} onInput={(e: any) => e.target.value = e.target.value.replace(/[^0-9]/g, '').slice(0, 10)} />
                      <HiPhone className="absolute right-4 top-3.5 text-cafe-300 text-lg"/>
                    </div>
                    {errors.phone && <span className="text-red-500 text-xs font-bold">⚠️ {errors.phone.message}</span>}
                  </div>

                  <div className={inputGroupClass}>
                    <label className={labelClass}>Guests</label>
                    <input type="number" min={1} max={20} defaultValue={1} {...register("numberOfGuests", { required: true })} className={inputClass} />
                  </div>

                  <div className={inputGroupClass}>
                    <label className={labelClass}>Date</label>
                    <div className="relative w-full">
                      <Controller
                        control={control}
                        name="date"
                        rules={{ required: "Please select a date" }}
                        render={({ field }) => (
                          <DatePicker
                            selected={field.value ? new Date(field.value) : null}
                            onChange={(date) => field.onChange(date)}
                            minDate={new Date()} 
                            placeholderText="Select Date"
                            className={inputClass} 
                            wrapperClassName="w-full"
                            dateFormat="MMMM d, yyyy"
                          />
                        )}
                      />
                      <HiCalendar className="absolute right-4 top-3.5 text-cafe-300 text-lg pointer-events-none"/>
                    </div>
                    {errors.date && <span className="text-red-500 text-xs font-bold mt-1 block">⚠️ {errors.date.message}</span>}
                  </div>
                </div>

                <div className="mb-10">
                  <label className={labelClass} style={{display:'flex', justifyContent:'space-between'}}>
                    <span>Select Time</span>
                    {selectedSlot && <span className="text-cafe-900 normal-case font-bold">{selectedSlot}</span>}
                  </label>
                  
                  <input type="hidden" {...register("timeSlot", { required: "Please select a time slot" })} />

                  {!selectedDateObj ? (
                    <div className="text-cafe-400 text-sm italic py-4 bg-cafe-50 text-center rounded-sm border border-dashed border-cafe-200 mt-2">
                      Please select a date first.
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                      {TIME_SLOTS.map(slot => {
                        const isPast = isSlotPast(slot);
                        const isSelected = selectedSlot === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isPast}
                            onClick={() => setValue("timeSlot", slot, { shouldValidate: true })}
                            className={`
                              py-3 px-2 text-sm border rounded-sm transition-all duration-200
                              ${isPast 
                                ? 'bg-gray-100 text-gray-300 border-transparent cursor-not-allowed decoration-slice' 
                                : isSelected 
                                  ? 'bg-cafe-500 text-white border-cafe-500 shadow-md font-bold' 
                                  : 'bg-white text-cafe-600 border-cafe-200 hover:border-cafe-400 hover:text-cafe-900 hover:shadow-sm'
                              }
                            `}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                   {errors.timeSlot && <span className="text-red-500 text-xs font-bold mt-2 block">⚠️ {errors.timeSlot.message}</span>}
                </div>

                <div className="flex justify-end items-center mb-8 h-8">
                    {isCheckingAvailability && <span className="text-cafe-500 text-sm italic animate-pulse">Checking availability...</span>}
                    {!isCheckingAvailability && availability !== null && (
                      <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${availability > 0 ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                          <span className={`w-2 h-2 rounded-full ${availability > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span className="text-sm font-bold uppercase tracking-wide">{availability > 0 ? `${availability} seats available` : 'Fully Booked'}</span>
                      </div>
                    )}
                </div>

                {status === 'error' && <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm text-center border border-red-100 rounded">{errorMsg}</div>}

                <button type="submit" className="w-full bg-cafe-base text-white py-5 font-serif text-lg font-bold uppercase tracking-[0.2em] hover:bg-cafe-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                  {status === 'checking' ? 'Checking Tables...' : 'Confirm Reservation'}
                </button>
              </form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Reservation;