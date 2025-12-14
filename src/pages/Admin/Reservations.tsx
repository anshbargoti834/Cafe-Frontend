import { useEffect, useState } from 'react';
import { endpoints } from '../../services/api';
import { HiCalendar, HiTrash, HiUserGroup, HiPhone, HiClock, HiCheckCircle } from 'react-icons/hi';
import { format, isToday, isFuture, parseISO, isPast as isDatePast } from 'date-fns';

// Types
interface Reservation {
  _id: string;
  name: string;
  email: string;
  phone: string;
  date: string; 
  timeSlot: string;
  numberOfGuests: number;
  createdAt: string;
}

const Reservations = () => {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [filter, setFilter] = useState<'all' | 'today' | 'upcoming'>('today');
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      const res = await endpoints.reservations.getAll();
      setReservations(res.data.reservations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, []);

  // Use the API from endpoints
  // Note: Ensure your api.ts has the delete method hooked up
  const api = endpoints.reservations as any; 

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to cancel this reservation?")) {
      await api.delete(id); // Make sure api.ts supports delete(id)
      fetchReservations();
    }
  };

  // --- NEW: SMART TIME LOGIC ---
  const isReservationPast = (resDateStr: string, timeSlot: string) => {
    const today = new Date();
    const resDate = parseISO(resDateStr);

    // 1. If date is in the past (yesterday), it's past
    if (isDatePast(resDate) && !isToday(resDate)) return true;

    // 2. If date is future, it's NOT past
    if (isFuture(resDate)) return false;

    // 3. If date is TODAY, check the hour
    // Format "13:00-14:00" -> Extract "13"
    const slotStartHour = parseInt(timeSlot.split(':')[0]);
    const currentHour = today.getHours();

    // If current hour is greater than slot start hour, it's considered "started/past"
    // e.g., if it's 14:00 (2 PM), the 13:00 (1 PM) slot is past.
    return slotStartHour <= currentHour;
  };

  const filteredData = reservations.filter(res => {
    const resDate = parseISO(res.date);
    if (filter === 'today') return isToday(resDate);
    if (filter === 'upcoming') return isFuture(resDate);
    return true; 
  }).sort((a, b) => {
     // Optional: Sort by time slot so morning is top, evening is bottom
     return a.timeSlot.localeCompare(b.timeSlot);
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-800">Reservations Book</h1>
          <p className="text-sm text-gray-500">Manage table bookings and guest lists.</p>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-sm">
          {['today', 'upcoming', 'all'].map((f) => (
             <button
               key={f}
               onClick={() => setFilter(f as any)}
               className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-sm transition-all ${
                 filter === f ? 'bg-white text-cafe-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
               }`}
             >
               {f}
             </button>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-sm border border-gray-100 rounded-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading bookings...</div>
        ) : filteredData.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <HiCalendar className="text-gray-300 text-2xl"/>
            </div>
            <p className="text-gray-500">No bookings found for this filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Guest</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Party Size</th>
                  <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredData.map((res) => {
                  const isPast = isReservationPast(res.date, res.timeSlot);
                  
                  return (
                    <tr 
                      key={res._id} 
                      className={`transition-colors ${isPast ? 'bg-gray-50 opacity-60 grayscale' : 'hover:bg-yellow-50/30'}`}
                    >
                      {/* 1. STATUS COLUMN */}
                      <td className="px-6 py-4">
                        {isPast ? (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gray-200 text-gray-600 text-[10px] font-bold uppercase tracking-wide">
                             <HiCheckCircle /> Completed
                           </span>
                        ) : (
                           <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-[10px] font-bold uppercase tracking-wide">
                             <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> Scheduled
                           </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <p className={`font-bold ${isPast ? 'text-gray-600' : 'text-gray-900'}`}>{res.name}</p>
                        <span className="text-xs text-gray-400">ID: {res._id.slice(-6)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <HiCalendar className="text-cafe-400"/>
                          {format(parseISO(res.date), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1 font-mono bg-gray-100 inline-block px-2 py-1 rounded">
                          <HiClock className="text-cafe-400"/>
                          {res.timeSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <HiUserGroup className="text-gray-400"/>
                          <span className="font-bold text-gray-700">{res.numberOfGuests}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <HiPhone className="text-gray-400"/> {res.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleDelete(res._id)}
                          className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-full transition-all"
                          title="Cancel Reservation"
                        >
                          <HiTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reservations;