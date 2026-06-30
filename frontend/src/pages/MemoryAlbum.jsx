import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, Search, Plus, Trash2, Edit3, Grid, 
  Clock, Play, Pause, X, Tag, Calendar, Image as ImageIcon 
} from 'lucide-react';

const MemoryAlbum = ({ onNext }) => {
  const { token } = useAuth();
  
  // Memories and State
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'timeline'
  const [filterFavOnly, setFilterFavOnly] = useState(false);
  const [selectedTag, setSelectedTag] = useState('');
  
  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  
  // Form States
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isFavorite, setIsFavorite] = useState(false);
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  // Slideshow States
  const [isSlideshowActive, setIsSlideshowActive] = useState(false);
  const [slideshowIndex, setSlideshowIndex] = useState(0);
  const [slideshowPlay, setSlideshowPlay] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL 
    ? `${import.meta.env.VITE_API_URL}/memories` 
    : `${window.location.protocol}//${window.location.hostname}:5000/api/memories`;

  // Fetch memories
  const fetchMemories = async () => {
    setLoading(true);
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      if (data.success) {
        setMemories(data.data);
      } else {
        throw new Error(data.message || 'Fetch failed');
      }
    } catch (err) {
      console.warn('API error, using mock local storage memories');
      // Client-only hardcoded fallback
      const localMems = localStorage.getItem('mock_memories');
      if (localMems) {
        setMemories(JSON.parse(localMems));
      } else {
        const defaultMems = [
          {
            _id: 'mock-mem-1',
            imageUrl: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=800',
            description: 'The beginning of our magical friendship journey!',
            date: '2025-09-10',
            tags: ['Friendship', 'Journey', 'Beginning'],
            isFavorite: true
          },
          {
            _id: 'mock-mem-2',
            imageUrl: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=800',
            description: 'Laughter, stars, and beautiful moments we will keep forever.',
            date: '2026-02-14',
            tags: ['Laughter', 'Moments', 'Magical'],
            isFavorite: false
          }
        ];
        localStorage.setItem('mock_memories', JSON.stringify(defaultMems));
        setMemories(defaultMems);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMemories();
  }, []);

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Create Memory
  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile && !imagePreview) {
      setFormError('Please choose a photo');
      return;
    }
    if (!description || !date) {
      setFormError('Please enter description and date');
      return;
    }

    setFormError('');
    setFormLoading(true);

    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    // Create form data
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    formData.append('description', description);
    formData.append('date', date);
    formData.append('tags', JSON.stringify(tagsArr));
    formData.append('isFavorite', isFavorite);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => [...prev, data.data]);
        setShowUploadModal(false);
        resetForm();
      } else {
        setFormError(data.message || 'Upload failed');
      }
    } catch (err) {
      // Local mock fallback upload
      const newMockMem = {
        _id: 'mock-mem-' + Date.now(),
        imageUrl: imagePreview || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?q=80&w=800',
        description,
        date,
        tags: tagsArr,
        isFavorite: isFavorite
      };
      const updated = [...memories, newMockMem];
      setMemories(updated);
      localStorage.setItem('mock_memories', JSON.stringify(updated));
      setShowUploadModal(false);
      resetForm();
    }
    setFormLoading(false);
  };

  // Toggle favorite
  const handleToggleFavorite = async (id, currentVal) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isFavorite: !currentVal })
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.map(m => m._id === id ? { ...m, isFavorite: !currentVal } : m));
      }
    } catch (err) {
      // Local fallback
      const updated = memories.map(m => m._id === id ? { ...m, isFavorite: !currentVal } : m);
      setMemories(updated);
      localStorage.setItem('mock_memories', JSON.stringify(updated));
    }
  };

  // Delete Memory — now uses styled modal instead of window.confirm
  const handleDeleteMemory = async (id) => {
    setPendingDeleteId(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    const id = pendingDeleteId;
    setShowDeleteModal(false);
    setPendingDeleteId(null);
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m._id !== id));
      }
    } catch (err) {
      const updated = memories.filter(m => m._id !== id);
      setMemories(updated);
      localStorage.setItem('mock_memories', JSON.stringify(updated));
    }
  };

  // Open Edit Modal
  const openEditModal = (item) => {
    setCurrentEditItem(item);
    setDescription(item.description);
    setDate(item.date);
    setTagsInput(item.tags.join(', '));
    setIsFavorite(item.isFavorite);
    setShowEditModal(true);
  };

  // Submit Edit Memory
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!description || !date) {
      setFormError('Please fill in description and date');
      return;
    }
    setFormLoading(true);
    const tagsArr = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    try {
      const res = await fetch(`${API_URL}/${currentEditItem._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          description,
          date,
          tags: tagsArr,
          isFavorite
        })
      });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.map(m => m._id === currentEditItem._id ? data.data : m));
        setShowEditModal(false);
        resetForm();
      }
    } catch (err) {
      // Local fallback
      const updated = memories.map(m => m._id === currentEditItem._id 
        ? { ...m, description, date, tags: tagsArr, isFavorite } 
        : m
      );
      setMemories(updated);
      localStorage.setItem('mock_memories', JSON.stringify(updated));
      setShowEditModal(false);
      resetForm();
    }
    setFormLoading(false);
  };

  const resetForm = () => {
    setImageFile(null);
    setImagePreview('');
    setDescription('');
    setDate('');
    setTagsInput('');
    setIsFavorite(false);
    setFormError('');
    setCurrentEditItem(null);
  };

  // Auto-playing Slideshow Loop
  useEffect(() => {
    let timer;
    if (isSlideshowActive && slideshowPlay && memories.length > 0) {
      timer = setInterval(() => {
        setSlideshowIndex(prev => (prev + 1) % memories.length);
      }, 3500); // changes slides every 3.5 seconds
    }
    return () => clearInterval(timer);
  }, [isSlideshowActive, slideshowPlay, memories.length]);

  // Extract all unique tags
  const allTags = Array.from(
    new Set(memories.flatMap(m => m.tags || []))
  );

  // Filter and search memories
  const filteredMemories = memories
    .filter(m => {
      const matchesSearch = m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesFav = filterFavOnly ? m.isFavorite : true;
      const matchesTag = selectedTag ? m.tags.includes(selectedTag) : true;
      return matchesSearch && matchesFav && matchesTag;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date)); // chronological order

  // Duplicate memories for seamless infinite loop (need at least 2 full sets)
  const marqueeItems = memories.length > 0
    ? [...memories, ...memories, ...memories]
    : [];

  return (
    <div className="relative w-full min-h-screen bg-slate-950 text-white font-sans pt-6 pb-24 px-6 overflow-x-hidden">
      {/* Decorative aurora colors */}
      <div className="absolute top-1/4 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── Slow Cinematic Image Strip ── */}
      {memories.length > 0 && (
        <div className="w-full overflow-hidden mb-10 mt-20 relative">
          {/* left fade */}
          <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-slate-950 to-transparent z-10 pointer-events-none" />
          {/* right fade */}
          <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-slate-950 to-transparent z-10 pointer-events-none" />

          <style>{`
            @keyframes marquee-slide {
              0%   { transform: translateX(0); }
              100% { transform: translateX(-33.333%); }
            }
            .marquee-track {
              display: flex;
              gap: 16px;
              width: max-content;
              animation: marquee-slide ${Math.max(memories.length * 6, 30)}s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}</style>

          <div className="marquee-track">
            {marqueeItems.map((item, idx) => (
              <div
                key={`${item._id}-${idx}`}
                className="relative flex-shrink-0 w-52 h-36 rounded-2xl overflow-hidden border border-white/10 shadow-lg group cursor-pointer"
              >
                <img
                  src={item.imageUrl}
                  alt={item.description}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* subtle overlay with description on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                  <p className="text-white text-[10px] font-light leading-snug line-clamp-2">{item.description}</p>
                </div>
                {item.isFavorite && (
                  <span className="absolute top-2 right-2 text-pink-400">
                    <Heart size={12} fill="currentColor" />
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Header */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-white/5 pb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.3em] text-amber-400 font-bold">Memory Album</span>
          <h1 className="text-3xl md:text-5xl font-black mt-2 tracking-tight bg-gradient-to-r from-white via-amber-200 to-pink-200 bg-clip-text text-transparent">
            Your Forever Memories ✨
          </h1>
          <p className="text-white/50 text-sm mt-3 font-light max-w-lg">
            Add and capture your favorite moments here. These memories are locked in our MERN storage universe.
          </p>
        </div>

        {/* View mode toggle panel */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Action buttons */}
          <button
            onClick={() => setIsSlideshowActive(true)}
            className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-purple-500/20"
          >
            <Play size={14} /> Slideshow Mode
          </button>
          
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-amber-500 hover:scale-[1.02] rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer shadow-md shadow-pink-500/20"
          >
            <Plus size={14} /> Upload Memory
          </button>
        </div>
      </div>

      {/* Filters & Search Control Bar */}
      <div className="max-w-6xl mx-auto bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-8 flex flex-col md:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80 group">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-pink-400 transition-colors" />
          <input
            type="text"
            placeholder="Search description or tag..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-slate-900/60 border border-white/10 rounded-xl text-xs text-white placeholder-white/35 focus:outline-none focus:border-pink-500 transition-colors font-sans"
          />
        </div>

        {/* Tag Filters list */}
        <div className="flex flex-wrap items-center gap-2 flex-grow overflow-x-auto max-w-full">
          <button
            onClick={() => setSelectedTag('')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              !selectedTag ? 'bg-white/20 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
            }`}
          >
            All Tags
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors ${
                selectedTag === tag ? 'bg-pink-600 text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              <Tag size={10} /> {tag}
            </button>
          ))}
        </div>

        {/* Layout Modes */}
        <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-white/10 pt-3 md:pt-0 md:pl-4 w-full md:w-auto justify-end">
          <button
            onClick={() => setFilterFavOnly(!filterFavOnly)}
            className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors ${
              filterFavOnly 
                ? 'bg-pink-600/20 border-pink-500 text-pink-400' 
                : 'bg-transparent border-white/10 text-white/60 hover:border-white/20'
            }`}
          >
            <Heart size={12} fill={filterFavOnly ? "currentColor" : "none"} /> Favorites Only
          </button>

          <div className="flex bg-slate-950/60 border border-white/10 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <Grid size={14} />
            </button>
            <button
              onClick={() => setViewMode('timeline')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white'
              }`}
            >
              <Clock size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Grid / Masonry Layout */}
      <div className="max-w-6xl mx-auto min-h-[300px]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/40 gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-pink-500 border-t-transparent animate-spin" />
            <span className="text-xs">Loading Memories...</span>
          </div>
        ) : filteredMemories.length === 0 ? (
          <div className="text-center py-20 bg-white/5 border border-dashed border-white/10 rounded-3xl text-white/30 text-sm">
            No memories match your filter criteria. Go upload some! ✨
          </div>
        ) : viewMode === 'grid' ? (
          /* Pinterest Masonry layout using CSS column properties */
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence>
              {filteredMemories.map(item => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="break-inside-avoid relative bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur-xl group hover:border-pink-500/35 transition-all duration-300 overflow-hidden"
                >
                  {/* Image wrapper */}
                  <div className="relative rounded-2xl overflow-hidden mb-4 shadow-md bg-slate-900 border border-white/5">
                    <img
                      src={item.imageUrl}
                      alt={item.description}
                      loading="lazy"
                      className="w-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    />
                    
                    {/* Hover controls overlay */}
                    <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                      <button
                        onClick={() => openEditModal(item)}
                        className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(item._id)}
                        className="w-10 h-10 rounded-full bg-pink-900/60 hover:bg-pink-700/80 border border-pink-500/30 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Heart button */}
                    <button
                      onClick={() => handleToggleFavorite(item._id, item.isFavorite)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/50 hover:bg-slate-900 border border-white/10 flex items-center justify-center cursor-pointer text-pink-500 transition-transform active:scale-90"
                    >
                      <Heart size={14} fill={item.isFavorite ? "currentColor" : "none"} />
                    </button>
                  </div>

                  {/* Info details */}
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[10px] text-white/40 flex items-center gap-1 font-semibold uppercase">
                      <Calendar size={10} /> {item.date}
                    </span>
                  </div>

                  <p className="text-white/80 text-xs md:text-sm mt-2 leading-relaxed font-light font-sans">
                    {item.description}
                  </p>

                  {/* Tags list */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-white/5">
                      {item.tags.map(t => (
                        <span key={t} className="text-[9px] font-semibold tracking-wide bg-white/5 text-purple-300 px-2 py-0.5 rounded-full border border-white/5">
                          #{t}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          /* Chronological Timeline list */
          <div className="relative pl-8 border-l border-white/10 flex flex-col gap-10">
            {filteredMemories.map((item, idx) => (
              <div key={item._id} className="relative flex flex-col md:flex-row gap-6">
                {/* Timeline ball */}
                <div className="absolute -left-[41px] top-1.5 w-6 h-6 rounded-full bg-slate-950 border-2 border-amber-500 flex items-center justify-center">
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>

                <div className="w-full md:w-48 text-white/50 text-sm font-semibold pt-1 uppercase flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-500" /> {item.date}
                </div>

                <div className="flex-grow bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col sm:flex-row gap-5">
                  <img
                    src={item.imageUrl}
                    alt={item.description}
                    loading="lazy"
                    className="w-full sm:w-32 h-28 object-cover rounded-xl border border-white/5"
                  />
                  <div className="flex flex-col justify-between flex-grow">
                    <div>
                      <p className="text-sm font-light leading-relaxed">{item.description}</p>
                      {item.tags && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {item.tags.map(t => (
                            <span key={t} className="text-[9px] bg-white/5 text-purple-200 px-2 py-0.5 rounded-full border border-white/5">
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-white/5 mt-4 pt-3 text-xs">
                      <button
                        onClick={() => handleToggleFavorite(item._id, item.isFavorite)}
                        className="text-pink-500 flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <Heart size={12} fill={item.isFavorite ? "currentColor" : "none"} /> 
                        {item.isFavorite ? 'Favorited' : 'Add to Favorites'}
                      </button>

                      <div className="flex gap-3">
                        <button onClick={() => openEditModal(item)} className="text-white/50 hover:text-white flex items-center gap-1 cursor-pointer">
                          <Edit3 size={12} /> Edit
                        </button>
                        <button onClick={() => handleDeleteMemory(item._id)} className="text-pink-400 hover:text-pink-300 flex items-center gap-1 cursor-pointer">
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Button to go to Feedback */}
      <div className="max-w-6xl mx-auto flex justify-center mt-20">
        <motion.button
          whileHover={{ scale: 1.03, boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}
          whileTap={{ scale: 0.97 }}
          onClick={onNext}
          className="px-8 py-3.5 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold rounded-full border border-white/10 shadow-lg tracking-wide cursor-pointer flex items-center gap-2"
        >
          Let's Give Feedback ❤️
        </motion.button>
      </div>

      {/* MODAL: Upload Memory */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => { setShowUploadModal(false); resetForm(); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <button 
                onClick={() => { setShowUploadModal(false); resetForm(); }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ImageIcon size={20} className="text-pink-500" /> Upload a New Memory
              </h3>

              {formError && (
                <div className="p-3 mb-4 text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl text-center">
                  {formError}
                </div>
              )}

              <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
                {/* Photo upload box */}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 hover:border-pink-500/30 rounded-2xl p-4 bg-slate-950/40 relative cursor-pointer group min-h-[140px]">
                  {imagePreview ? (
                    <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                      <img src={imagePreview} alt="preview" className="w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full hover:bg-black text-white"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer gap-2 py-4">
                      <Plus size={24} className="text-white/40 group-hover:text-pink-500 group-hover:scale-110 transition-all" />
                      <span className="text-xs text-white/50 group-hover:text-white/80">Choose Photo to Upload</span>
                      <span className="text-[10px] text-white/30 font-light">Supports JPG, PNG, WEBP</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                  )}
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Description</label>
                  <textarea
                    rows="3"
                    placeholder="Describe this special memory..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white placeholder-white/30 focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Date of Memory</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-sans"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    placeholder="e.g. Friendship, Fun, Birthday"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Favorite Toggle checkbox */}
                <label className="flex items-center gap-2 py-1 text-xs text-white/70 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="accent-pink-500 rounded border-white/10"
                  />
                  <span>Mark as favorite memory ❤️</span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center"
                >
                  {formLoading ? 'Uploading Momento...' : 'Save to Digital Album ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Edit Memory */}
      <AnimatePresence>
        {showEditModal && currentEditItem && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => { setShowEditModal(false); resetForm(); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" 
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative z-10 w-full max-w-lg bg-slate-900 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-xl shadow-2xl overflow-y-auto max-h-[85vh]"
            >
              <button 
                onClick={() => { setShowEditModal(false); resetForm(); }}
                className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>

              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Edit3 size={20} className="text-pink-500" /> Edit Memory Details
              </h3>

              {formError && (
                <div className="p-3 mb-4 text-xs text-pink-400 bg-pink-500/10 border border-pink-500/20 rounded-xl text-center">
                  {formError}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
                {/* Image preview read-only */}
                <div className="relative w-full max-h-48 overflow-hidden rounded-xl">
                  <img src={currentEditItem.imageUrl} alt="edit" className="w-full object-cover" />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Description</label>
                  <textarea
                    rows="3"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                    required
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Date of Memory</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500 font-sans"
                    required
                  />
                </div>

                {/* Tags */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-white/60 font-semibold uppercase">Tags (comma separated)</label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full p-3 bg-slate-950/60 border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-pink-500"
                  />
                </div>

                {/* Favorite Toggle checkbox */}
                <label className="flex items-center gap-2 py-1 text-xs text-white/70 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFavorite}
                    onChange={(e) => setIsFavorite(e.target.checked)}
                    className="accent-pink-500 rounded border-white/10"
                  />
                  <span>Mark as favorite memory ❤️</span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full py-3.5 mt-2 bg-gradient-to-r from-pink-500 to-amber-500 text-white font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center"
                >
                  {formLoading ? 'Saving...' : 'Update Details ✨'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: Fullscreen Slideshow Mode */}
      <AnimatePresence>
        {isSlideshowActive && (
          <div className="fixed inset-0 z-[200] bg-slate-950 flex flex-col justify-between p-6 select-none">
            {/* Close buttons & Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4 z-10">
              <div>
                <span className="text-[10px] text-pink-500 uppercase tracking-widest font-black">Memory Slideshow</span>
                <h4 className="text-sm font-bold text-white/80">Reliving the beautiful chapters</h4>
              </div>
              <button 
                onClick={() => setIsSlideshowActive(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Main Image Slideshow Container */}
            <div className="flex-grow flex items-center justify-center relative my-6">
              {memories.length > 0 ? (
                <div className="w-full max-w-3xl flex flex-col items-center gap-4">
                  {/* Photo Frame */}
                  <div className="relative w-full h-[60vh] rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-slate-900 flex items-center justify-center">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={slideshowIndex}
                        src={memories[slideshowIndex].imageUrl}
                        alt="slideshow"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        className="max-w-full max-h-full object-contain"
                      />
                    </AnimatePresence>

                    {/* Gradient caption bottom */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6 text-center">
                      <p className="text-[10px] text-pink-400 font-bold uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
                        <Calendar size={12} /> {memories[slideshowIndex].date}
                      </p>
                      <p className="text-white text-base md:text-lg font-serif italic max-w-xl mx-auto font-light leading-relaxed">
                        "{memories[slideshowIndex].description}"
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-white/40">No memories to display.</div>
              )}
            </div>

            {/* Slideshow Control Panel HUD */}
            <div className="flex items-center justify-center gap-6 z-10 py-4 border-t border-white/5">
              <button
                onClick={() => setSlideshowIndex(prev => (prev - 1 + memories.length) % memories.length)}
                className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold"
              >
                Previous
              </button>
              
              <button
                onClick={() => setSlideshowPlay(!slideshowPlay)}
                className="w-12 h-12 rounded-full bg-pink-600 hover:bg-pink-500 text-white flex items-center justify-center shadow-lg shadow-pink-500/20"
              >
                {slideshowPlay ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
              </button>
              
              <button
                onClick={() => setSlideshowIndex(prev => (prev + 1) % memories.length)}
                className="px-4 py-2 border border-white/10 hover:border-white/20 rounded-xl text-xs font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </AnimatePresence>
      {/* MODAL: Styled Delete Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 20 }}
              className="relative z-10 w-full max-w-sm bg-slate-900 border border-white/10 p-7 rounded-3xl backdrop-blur-xl shadow-2xl text-center"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-2xl">
                🗑️
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Delete this memory?</h3>
              <p className="text-white/50 text-xs leading-relaxed mb-6">
                This action is permanent. This memory will be removed from your album and Cloudinary forever.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => { setShowDeleteModal(false); setPendingDeleteId(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-white/70 hover:text-white hover:border-white/20 text-sm font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-red-500 text-white text-sm font-bold shadow-lg shadow-pink-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Yes, Delete Forever
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MemoryAlbum;
