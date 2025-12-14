import { useEffect, useState } from 'react';
import { endpoints } from '../../services/api';
import { HiClipboardList, HiCalendar, HiMail, HiTrendingUp } from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState({ items: 0, reservations: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  // Fetch counts from backend (We will need to update backend to support this later, 
  // for now, we can just fetch the lists and count the length)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [menuRes, resRes, contactRes] = await Promise.all([
          endpoints.menu.getAll(),
          endpoints.reservations.getAll(), // Admin only endpoint
          endpoints.contact.getAll()       // Admin only endpoint
        ]);
        
        setStats({
          items: menuRes.data.items?.length || 0,
          reservations: resRes.data.reservations?.length || 0,
          messages: contactRes.data.items?.length || 0
        });
      } catch (error) {
        console.error("Failed to load stats", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const StatCard = ({ title, count, icon, color }: any) => (
    <div className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`p-4 rounded-full ${color} text-white`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">{title}</p>
        <h3 className="text-3xl font-serif text-gray-800 mt-1">
          {loading ? '...' : count}
        </h3>
      </div>
    </div>
  );

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard 
          title="Total Menu Items" 
          count={stats.items} 
          icon={<HiClipboardList className="text-2xl"/>} 
          color="bg-blue-500"
        />
        <StatCard 
          title="Total Reservations" 
          count={stats.reservations} 
          icon={<HiCalendar className="text-2xl"/>} 
          color="bg-purple-500"
        />
        <StatCard 
          title="Inbox Messages" 
          count={stats.messages} 
          icon={<HiMail className="text-2xl"/>} 
          color="bg-orange-500"
        />
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiTrendingUp className="text-cafe-500"/> System Status
        </h3>
        <p className="text-gray-500 text-sm">
          Everything is running smoothly. Select a tab from the sidebar to manage your café.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;