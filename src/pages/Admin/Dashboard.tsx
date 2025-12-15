import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom'; // 1. Import Link
import { endpoints } from '../../services/api';
import { HiClipboardList, HiCalendar, HiMail, HiTrendingUp } from 'react-icons/hi';

const Dashboard = () => {
  const [stats, setStats] = useState({ items: 0, reservations: 0, messages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [menuRes, resRes, contactRes] = await Promise.all([
          endpoints.menu.getAll(),
          endpoints.reservations.getAll(),
          endpoints.contact.getAll()
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

  // 2. Updated StatCard to accept 'linkTo' and act as a Link
  const StatCard = ({ title, count, icon, color, linkTo }: any) => (
    <Link 
      to={linkTo} 
      className="bg-white p-6 rounded-sm shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <div className={`p-4 rounded-full ${color} text-white shadow-sm`}>
        {icon}
      </div>
      <div>
        <p className="text-gray-500 text-xs uppercase tracking-widest font-bold">{title}</p>
        <h3 className="text-3xl font-serif text-gray-800 mt-1">
          {loading ? '...' : count}
        </h3>
        <span className="text-xs text-blue-500 font-medium mt-1 inline-block">View Details &rarr;</span>
      </div>
    </Link>
  );

  return (
    <div>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* 3. Added 'linkTo' props - Update these paths if your routes are named differently */}
        <StatCard 
          title="Total Menu Items" 
          count={stats.items} 
          icon={<HiClipboardList className="text-2xl"/>} 
          color="bg-blue-500"
          linkTo="/Admin/MenuManager" 
        />
        
        <StatCard 
          title="Total Reservations" 
          count={stats.reservations} 
          icon={<HiCalendar className="text-2xl"/>} 
          color="bg-purple-500"
          linkTo="/Admin/Reservations" 
        />
        
        <StatCard 
          title="Inbox Messages" 
          count={stats.messages} 
          icon={<HiMail className="text-2xl"/>} 
          color="bg-orange-500"
          linkTo="/Admin/Messages" 
        />
      </div>

      {/* Placeholder for Recent Activity */}
      <div className="bg-white p-8 rounded-sm shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <HiTrendingUp className="text-cafe-500"/> System Status
        </h3>
        <p className="text-gray-500 text-sm">
          Everything is running smoothly. Click on the cards above to manage your café data.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;