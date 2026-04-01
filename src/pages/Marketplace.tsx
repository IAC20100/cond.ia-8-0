import React, { useState } from 'react';
import { useStore } from '../store';
import { Classified } from '../types';
import { 
  ShoppingBag, Plus, Search, Filter, Tag, Phone, 
  MapPin, Clock, Image as ImageIcon, Trash2, Edit2, CheckCircle, X
} from 'lucide-react';
import { BackButton } from '../components/BackButton';
import { Modal } from '../components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { safeFormatDate } from '../utils/dateUtils';
import toast from 'react-hot-toast';

export default function Marketplace() {
  const { classifieds, addClassified, updateClassified, deleteClassified, clients } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Classified['category'] | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: 'PRODUTO' as Classified['category'],
    authorId: '',
    contactPhone: '',
    images: ''
  });

  const filteredClassifieds = classifieds.filter(c => {
    const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const author = clients.find(c => c.id === formData.authorId);
    if (!author) {
      toast.error('Selecione um morador válido');
      return;
    }

    const classifiedData = {
      title: formData.title,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : undefined,
      category: formData.category,
      authorId: author.id,
      authorName: author.name,
      contactPhone: formData.contactPhone,
      images: formData.images ? formData.images.split(',').map(s => s.trim()) : undefined
    };

    if (editingId) {
      updateClassified(editingId, classifiedData);
      toast.success('Anúncio atualizado');
    } else {
      addClassified(classifiedData);
      toast.success('Anúncio criado');
    }
    closeModal();
  };

  const openModal = (classified?: Classified) => {
    if (classified) {
      setFormData({
        title: classified.title,
        description: classified.description,
        price: classified.price?.toString() || '',
        category: classified.category,
        authorId: classified.authorId,
        contactPhone: classified.contactPhone,
        images: classified.images?.join(', ') || ''
      });
      setEditingId(classified.id);
    } else {
      setFormData({
        title: '',
        description: '',
        price: '',
        category: 'PRODUTO',
        authorId: '',
        contactPhone: '',
        images: ''
      });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'PRODUTO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'SERVICO': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CARONA': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    }
  };

  return (
    <div className="min-h-screen bg-[#004a7c] text-white -m-8 p-4 sm:p-8 md:p-12 overflow-x-hidden relative">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,1000 C300,800 400,900 1000,600 L1000,1000 L0,1000 Z" fill="white" fillOpacity="0.1" />
          <path d="M0,800 C200,600 500,700 1000,400 L1000,800 L0,800 Z" fill="white" fillOpacity="0.05" />
        </svg>
      </div>

      <header className="mb-6 md:mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6 relative z-10">
        <div className="flex items-center gap-4 md:gap-6">
          <BackButton iconSize={6} className="p-3 md:p-4" />
          <div>
            <h1 className="text-2xl md:text-6xl font-light tracking-tight">Classificados</h1>
            <p className="text-xs md:text-xl opacity-60 mt-1 md:mt-2 font-light">Marketplace do condomínio</p>
          </div>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="flex gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
              <input 
                type="text" 
                placeholder="Buscar anúncios..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl pl-10 pr-4 py-3 outline-none focus:bg-white/20 transition-all text-white placeholder:text-white/40"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value as any)}
              className="bg-white/10 border border-white/20 rounded-xl px-4 py-3 outline-none focus:bg-white/20 transition-all text-white"
            >
              <option value="ALL" className="bg-zinc-900">Todas Categorias</option>
              <option value="PRODUTO" className="bg-zinc-900">Produtos</option>
              <option value="SERVICO" className="bg-zinc-900">Serviços</option>
              <option value="CARONA" className="bg-zinc-900">Caronas</option>
              <option value="OUTRO" className="bg-zinc-900">Outros</option>
            </select>
          </div>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openModal()}
            className="bg-white text-black px-6 md:px-8 py-3 md:py-4 flex items-center justify-center gap-3 border border-white/20 transition-all group w-full md:w-auto rounded-xl font-bold"
          >
            <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform" /> 
            <span>Novo Anúncio</span>
          </motion.button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
        <AnimatePresence>
          {filteredClassifieds.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-md flex flex-col group"
            >
              <div className="h-48 bg-black/20 relative overflow-hidden">
                {item.images && item.images.length > 0 ? (
                  <img 
                    src={item.images[0]} 
                    alt={item.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <ImageIcon className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-wider uppercase border backdrop-blur-md ${getCategoryColor(item.category)}`}>
                    {item.category}
                  </span>
                  {item.status === 'SOLD' && (
                    <span className="px-3 py-1 rounded-full text-[0.625rem] font-bold tracking-wider uppercase border bg-red-500/20 text-red-400 border-red-500/30 backdrop-blur-md">
                      Vendido
                    </span>
                  )}
                </div>
              </div>
              
              <div className="p-5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold text-white line-clamp-2">{item.title}</h3>
                  {item.price !== undefined && (
                    <span className="text-lg font-black text-emerald-400 whitespace-nowrap ml-3">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.price)}
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-white/60 line-clamp-3 mb-4 flex-1">
                  {item.description}
                </p>
                
                <div className="space-y-2 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Tag className="w-3.5 h-3.5" />
                    <span>{item.authorName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{item.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-white/50">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{safeFormatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2 pt-4 border-t border-white/10">
                  <button
                    onClick={() => openModal(item)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" /> Editar
                  </button>
                  {item.status === 'ACTIVE' && (
                    <button
                      onClick={() => updateClassified(item.id, { status: 'SOLD' })}
                      className="flex-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" /> Vendido
                    </button>
                  )}
                  <button
                    onClick={() => deleteClassified(item.id)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredClassifieds.length === 0 && (
          <div className="col-span-full py-24 text-center">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-white/10 rounded-full mb-6 backdrop-blur-md border border-white/10">
              <ShoppingBag className="w-12 h-12 text-white/40" />
            </div>
            <h3 className="text-2xl font-light opacity-60">Nenhum anúncio encontrado</h3>
            <p className="opacity-40 mt-2">Seja o primeiro a anunciar algo no condomínio!</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingId ? "Editar Anúncio" : "Novo Anúncio"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Título</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
              placeholder="Ex: Bicicleta Caloi Aro 29"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Categoria</label>
              <select
                required
                value={formData.category}
                onChange={e => setFormData({...formData, category: e.target.value as any})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
              >
                <option value="PRODUTO" className="bg-zinc-900">Produto</option>
                <option value="SERVICO" className="bg-zinc-900">Serviço</option>
                <option value="CARONA" className="bg-zinc-900">Carona</option>
                <option value="OUTRO" className="bg-zinc-900">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-1">Preço (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={e => setFormData({...formData, price: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Morador (Anunciante)</label>
            <select
              required
              value={formData.authorId}
              onChange={e => {
                const client = clients.find(c => c.id === e.target.value);
                setFormData({
                  ...formData, 
                  authorId: e.target.value,
                  contactPhone: client ? client.phone : formData.contactPhone
                });
              }}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
            >
              <option value="" className="bg-zinc-900">Selecione o morador</option>
              {clients.map(client => (
                <option key={client.id} value={client.id} className="bg-zinc-900">
                  {client.name} {client.unit ? `- Apto ${client.unit}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Telefone de Contato</label>
            <input
              type="text"
              required
              value={formData.contactPhone}
              onChange={e => setFormData({...formData, contactPhone: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
              placeholder="(00) 00000-0000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">Descrição</label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none resize-none"
              placeholder="Descreva os detalhes do anúncio..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/60 mb-1">URLs das Imagens (separadas por vírgula)</label>
            <input
              type="text"
              value={formData.images}
              onChange={e => setFormData({...formData, images: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:border-white/30 outline-none"
              placeholder="https://exemplo.com/img1.jpg, https://exemplo.com/img2.jpg"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-white/60 hover:text-white transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-white text-black px-6 py-2 rounded-lg font-bold hover:bg-white/90 transition-colors"
            >
              {editingId ? 'Salvar' : 'Criar Anúncio'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
