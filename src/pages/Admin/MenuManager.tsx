import { useEffect, useState, useMemo, memo, useCallback } from 'react';
import { useForm } from 'react-hook-form';
// 1. IMPORT SERVER_URL HERE
import { endpoints, SERVER_URL } from '../../services/api';
import { MenuItem } from '../../types';
import { HiPlus, HiPencil, HiTrash, HiSearch, HiPhotograph, HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const CATEGORIES = ['Coffee', 'Dessert', 'Bakery', 'Special', 'Breakfast'];
const ITEMS_PER_PAGE = 6; 

// --- 2. UPDATED HELPER: Image URL ---
const getImageUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  
  // Normalize slashes
  let cleanPath = path.replace(/\\/g, '/');
  // Ensure it starts with a slash
  if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
  
  // Use the dynamic SERVER_URL (Works on Vercel & Localhost)
  return `${SERVER_URL}${encodeURI(cleanPath)}`;
};

// --- OPTIMIZED CARD ---
const MenuCard = memo(({ item, onEdit, onDelete }: { item: MenuItem, onEdit: (i: MenuItem) => void, onDelete: (id: string) => void }) => {
  return (
    <div 
      // PERFORMANCE FIX: Forces browser to be efficient
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 400px' }}
      className={`bg-white rounded-lg shadow-sm border ${!item.isAvailable ? 'border-red-200 opacity-75' : 'border-gray-100'} overflow-hidden group hover:shadow-md transition-all flex flex-col`}
    >
      {/* Image Area */}
      <div className="h-48 sm:h-56 bg-gray-100 relative overflow-hidden">
        {item.image ? (
          <img 
            src={getImageUrl(item.image)} 
            alt={item.name} 
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
            crossOrigin="anonymous"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=No+Image"; 
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400"><HiPhotograph className="text-4xl"/></div>
        )}
        <div className={`absolute top-2 right-2 px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-sm ${item.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {item.isAvailable ? 'Active' : 'Hidden'}
        </div>
      </div>

      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h3>
          <span className="text-cafe-600 font-serif font-bold whitespace-nowrap ml-2">${item.price}</span>
        </div>
        <p className="text-xs text-gray-500 mb-4 line-clamp-2 flex-grow">{item.description}</p>
        
        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t border-gray-100 mt-auto">
          <button 
            onClick={() => onEdit(item)}
            className="flex-1 bg-gray-50 text-gray-600 py-2.5 rounded-md text-xs font-bold uppercase hover:bg-cafe-50 hover:text-cafe-600 transition-colors flex items-center justify-center gap-1 active:scale-95"
          >
            <HiPencil className="text-sm" /> Edit
          </button>
          <button 
            onClick={() => onDelete(item._id)}
            className="flex-1 bg-red-50 text-red-600 py-2.5 rounded-md text-xs font-bold uppercase hover:bg-red-100 transition-colors flex items-center justify-center gap-1 active:scale-95"
          >
            <HiTrash className="text-sm" /> Del
          </button>
        </div>
      </div>
    </div>
  );
});

const MenuManager = () => {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const imageFile = watch('imageFile');

  // FETCH ITEMS
  const fetchItems = async () => {
    try {
      const res = await endpoints.menu.getAll();
      setItems(res.data.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  // IMAGE PREVIEW
  useEffect(() => {
    if (imageFile && imageFile.length > 0) {
      const file = imageFile[0];
      const objectUrl = URL.createObjectURL(file);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [imageFile]);

  // OPEN MODAL
  const openModal = useCallback((item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setValue('name', item.name);
      setValue('price', item.price);
      setValue('category', item.category);
      setValue('description', item.description);
      setValue('isAvailable', item.isAvailable);
      // Use helper for existing images
      setPreview(getImageUrl(item.image)); 
    } else {
      setEditingItem(null);
      reset();
      setPreview(null);
    }
    setIsModalOpen(true);
  }, [setValue, reset]);

  // SUBMIT
  const onSubmit = async (data: any) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('name', data.name);
    formData.append('price', data.price);
    formData.append('category', data.category);
    formData.append('description', data.description);
    formData.append('isAvailable', data.isAvailable === false ? 'false' : 'true');

    if (data.imageFile && data.imageFile[0]) {
      formData.append('image', data.imageFile[0]);
    } else if (editingItem) {
      formData.append('image', editingItem.image); 
    }

    try {
      if (editingItem) {
        await endpoints.menu.update(editingItem._id, formData);
      } else {
        await endpoints.menu.create(formData);
      }
      await fetchItems(); 
      setIsModalOpen(false);
      reset();
    } catch (err) {
      alert("Failed to save item. Check console.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // DELETE
  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      await endpoints.menu.delete(id);
      fetchItems();
    }
  }, []);

  // FILTERING & PAGINATION
  const filteredItems = useMemo(() => {
    return items.filter(i => i.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [items, searchTerm]);

  useEffect(() => { setCurrentPage(1); }, [searchTerm]);

  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredItems.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredItems, currentPage]);


  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* RESPONSIVE HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <div className="text-center md:text-left w-full md:w-auto">
          <h1 className="text-2xl font-serif font-bold text-gray-800">Menu Manager</h1>
          <p className="text-sm text-gray-500">Manage your dishes.</p>
        </div>
        
        <button 
          onClick={() => openModal()} 
          className="w-full md:w-auto bg-cafe-900 text-white px-6 py-3 rounded-md font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 hover:bg-cafe-800 transition-all shadow-lg active:scale-95"
        >
          <HiPlus className="text-lg" /> Add Dish
        </button>
      </div>

      {/* SEARCH BAR */}
      <div className="relative mb-6">
        <HiSearch className="absolute left-4 top-3.5 text-gray-400 text-lg" />
        <input 
          type="text" 
          placeholder="Search items..." 
          className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-md focus:border-cafe-500 outline-none transition-all shadow-sm"
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* RESPONSIVE GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {currentItems.map(item => (
          <MenuCard 
            key={item._id} 
            item={item} 
            onEdit={openModal} 
            onDelete={handleDelete} 
          />
        ))}
      </div>

      {/* PAGINATION CONTROLS */}
      {filteredItems.length > ITEMS_PER_PAGE && (
        <div className="flex justify-center items-center gap-4 py-8 mt-4 border-t border-gray-100">
            <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-3 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
            >
                <HiChevronLeft className="text-lg" />
            </button>
            <span className="text-sm font-bold text-gray-700">
                {currentPage} / {totalPages}
            </span>
            <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-3 border rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed bg-white shadow-sm"
            >
                <HiChevronRight className="text-lg" />
            </button>
        </div>
      )}

      {/* RESPONSIVE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4">
          <div className="bg-white w-full md:max-w-2xl md:rounded-lg rounded-t-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 md:fade-in md:zoom-in duration-200 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-cafe-900 text-white px-6 py-4 flex justify-between items-center flex-shrink-0">
              <h3 className="font-serif font-bold tracking-wide">{editingItem ? 'Edit Dish' : 'Add New Dish'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/70 hover:text-white p-1"><HiX className="text-xl"/></button>
            </div>

            {/* Modal Body: Scrollable */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto">
              <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                
                {/* Image Section */}
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center relative overflow-hidden group">
                    {preview ? (
                      <img src={preview} alt="Preview" className="w-full h-full object-cover" crossOrigin="anonymous"/>
                    ) : (
                      <div className="text-center p-4">
                        <HiPhotograph className="text-3xl text-gray-300 mx-auto mb-2"/>
                        <span className="text-xs text-gray-500">Tap to upload</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      accept="image/*"
                      {...register("imageFile")}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <span className="text-white text-xs font-bold uppercase">Change</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-400 mt-2 hidden md:block">Click image to upload</p>
                </div>

                {/* Form Fields */}
                <div className="w-full md:w-2/3 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Name</label>
                      <input {...register("name", { required: true })} className="w-full border border-gray-300 p-2.5 rounded-md outline-none focus:border-cafe-500 focus:ring-1 focus:ring-cafe-500" placeholder="e.g. Latte" />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Price ($)</label>
                      <input type="number" step="0.01" {...register("price", { required: true })} className="w-full border border-gray-300 p-2.5 rounded-md outline-none focus:border-cafe-500 focus:ring-1 focus:ring-cafe-500" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                    <select {...register("category")} className="w-full border border-gray-300 p-2.5 rounded-md outline-none focus:border-cafe-500 bg-white">
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                    <textarea {...register("description")} rows={3} className="w-full border border-gray-300 p-2.5 rounded-md outline-none focus:border-cafe-500 resize-none"></textarea>
                  </div>

                  <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-md border border-gray-100">
                    <input type="checkbox" {...register("isAvailable")} className="w-5 h-5 text-cafe-600 rounded focus:ring-cafe-500" defaultChecked />
                    <label className="text-sm text-gray-700 font-medium">Available for Order?</label>
                  </div>
                </div>
              </div>

              {/* Responsive Footer Buttons */}
              <div className="mt-8 flex flex-col-reverse md:flex-row justify-end gap-3 pt-4 border-t border-gray-100">
                <button type="button" onClick={() => setIsModalOpen(false)} className="w-full md:w-auto px-6 py-3 text-sm font-bold text-gray-500 hover:text-gray-800 bg-gray-100 md:bg-transparent rounded-md">Cancel</button>
                <button type="submit" disabled={loading} className="w-full md:w-auto bg-cafe-500 text-white px-8 py-3 rounded-md text-sm font-bold uppercase tracking-wider hover:bg-cafe-600 shadow-lg disabled:opacity-50 active:scale-95 transition-transform">
                  {loading ? 'Saving...' : 'Save Item'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
};

export default MenuManager;