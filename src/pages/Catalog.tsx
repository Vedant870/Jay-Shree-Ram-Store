import React from 'react';
import { ProductCard } from '../components/ProductCard.tsx';
import { Search, MessageSquare, Send, X, Package, ArrowRight, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from '@google/genai';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext.tsx';
import { useLanguage } from '../contexts/LanguageContext.tsx';
import { apiClient } from '../lib/api.ts';

export default function Catalog() {
  const { total, count } = useCart();
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [products, setProducts] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const loadProducts = async () => {
      setErrorMessage(null);

      try {
        const productsData = await apiClient.getProducts();
        setProducts(productsData);
      } catch (error: any) {
        console.error('Failed to load products:', error);
        setProducts([]);
        setErrorMessage(error?.message || 'Unable to load products right now.');
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const [selectedCompany, setSelectedCompany] = React.useState<string | null>(null);
  const [stockFilter, setStockFilter] = React.useState<'All' | 'In Stock' | 'Out of Stock'>('All');
  const [isAiOpen, setIsAiOpen] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');
  const [chatHistory, setChatHistory] = React.useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [isTyping, setIsTyping] = React.useState(false);

  const companies = Array.from(new Set(products.map((p) => p.company)));

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.company.toLowerCase().includes(search.toLowerCase());
    const matchesCompany = selectedCompany ? p.company === selectedCompany : true;
    const matchesStock = stockFilter === 'All' ? true : stockFilter === 'In Stock' ? p.stock > 0 : p.stock <= 0;
    return matchesSearch && matchesCompany && matchesStock;
  });

  const handleAiChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatHistory((prev) => [...prev, { role: 'user', text: userText }]);
    setChatMessage('');
    setIsTyping(true);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('API Key missing');
      }

      const ai = new GoogleGenAI({ apiKey });
      const context = JSON.stringify(
        filteredProducts.map((p) => ({
          name: p.name,
          company: p.company,
          price: p.offerPrice,
          stock: p.stock,
        }))
      );

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `You are the Product Specialist for Jay Shree Ram Distributors.
        Context: ${context}.
        User Question: ${userText}.
        Provide a helpful, professional response based on the inventory.`,
      });

      setChatHistory((prev) => [...prev, { role: 'ai', text: response.text || "I couldn't find an answer for that." }]);
    } catch (error) {
      console.error(error);
      setChatHistory((prev) => [
        ...prev,
        { role: 'ai', text: "I'm having trouble connecting to my brain. Please check the API key or try again later." },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col bg-paper">
      <div className="px-10 pt-10">
        <div className="bg-saffron rounded-[40px] p-12 text-white relative overflow-hidden shadow-2xl shadow-saffron/10">
          <div className="relative z-10">
            <h2 className="text-4xl font-serif font-bold italic mb-4">Aaj ka stock</h2>
            <p className="text-white/80 text-sm max-w-xl">Company select karein · MRP vs best price compare karein · seedha cart mein add karein.</p>
          </div>
          <div className="absolute right-[-5%] top-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <section className="flex-1 p-10 flex flex-col relative">
        <div className="space-y-10 mb-10">
          {errorMessage && <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm font-medium text-red-600">{errorMessage}</div>}

          <div className="flex flex-col md:flex-row gap-6 items-center">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search products..."
                className="bg-white border border-slate-100 rounded-2xl py-4 px-12 w-full text-sm shadow-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 transition-all font-medium text-slate-600"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search className="absolute left-5 top-4 text-slate-300" size={20} />
            </div>

            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-2xl">
              {(['All', 'In Stock', 'Out of Stock'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setStockFilter(f)}
                  className={`px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-xl ${
                    stockFilter === f ? 'bg-white text-saffron shadow-sm' : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setSelectedCompany(null)}
              className={`flex-shrink-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                selectedCompany === null ? 'bg-saffron text-white shadow-lg shadow-saffron/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              All
            </button>
            {companies.map((company) => (
              <button
                key={company}
                onClick={() => setSelectedCompany(company)}
                className={`flex-shrink-0 px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  selectedCompany === company ? 'bg-saffron text-white shadow-lg shadow-saffron/20' : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'
                }`}
              >
                {company} <span className="opacity-50 ml-1">({products.filter((p) => p.company === company).length})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {loading ? (
            Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-[40px] border border-slate-100 animate-pulse space-y-4">
                  <div className="aspect-square bg-slate-50 rounded-[32px]"></div>
                  <div className="h-4 bg-slate-50 rounded w-3/4"></div>
                  <div className="h-3 bg-slate-50 rounded w-1/2"></div>
                </div>
              ))
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredProducts.map((product) => (
                <motion.div layout key={product.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="relative">
                  <ProductCard product={product} />
                  {product.stock > 0 && product.stock < 10 && (
                    <div className="absolute top-4 right-4 bg-red-500 text-white text-[8px] font-bold px-2 py-1 rounded-full uppercase tracking-widest z-10 animate-pulse">Low Stock</div>
                  )}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] rounded-[40px] z-20 flex items-center justify-center p-6 text-center">
                      <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Stock status</p>
                        <p className="text-sm font-bold text-red-500 italic">Out of Stock</p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {filteredProducts.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 grayscale opacity-40">
            <Package size={80} className="mb-4" />
            <p className="font-serif italic text-2xl">No items matched your exploration.</p>
          </div>
        )}
      </section>

      <AnimatePresence>
        {count > 0 && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} exit={{ y: 100 }} className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-2xl z-40">
            <div className="bg-slate-900 text-white p-4 pr-6 rounded-full shadow-2xl flex items-center justify-between gap-6 border border-white/10 backdrop-blur-xl">
              <div className="flex items-center gap-6 pl-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-saffron rounded-full flex items-center justify-center shadow-lg shadow-saffron/40">
                    <ShoppingCart size={20} />
                  </div>
                  <span className="absolute -top-1 -right-1 bg-white text-saffron text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-slate-900 px-1">{count}</span>
                </div>
                <div>
                  <p className="text-white font-bold text-xl">₹{total.toLocaleString()}</p>
                  <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">{count} items in bag</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/cart')}
                className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-saffron hover:text-white transition-all flex items-center gap-2 shadow-xl"
              >
                View Cart <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isAiOpen && (
        <button onClick={() => setIsAiOpen(true)} className="fixed bottom-14 right-10 w-16 h-16 bg-slate-900 border-4 border-white text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-40">
          <MessageSquare size={28} />
        </button>
      )}

      <AnimatePresence>
        {isAiOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed right-0 top-20 bottom-0 w-[420px] bg-white border-l border-orange-100 shadow-2xl flex flex-col z-50 rounded-tl-[40px] overflow-hidden">
            <div className="p-8 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h3 className="font-serif text-2xl italic">Assistant</h3>
                <p className="text-[9px] uppercase font-bold tracking-widest text-saffron mt-1 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-saffron rounded-full animate-pulse"></span> Analyzing Data
                </p>
              </div>
              <button onClick={() => setIsAiOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
              {chatHistory.map((chat, i) => (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={i} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[90%] px-5 py-4 rounded-[24px] text-sm leading-relaxed shadow-sm ${
                      chat.role === 'user' ? 'bg-saffron text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-100'
                    }`}
                  >
                    {chat.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white px-5 py-4 rounded-full shadow-sm border border-slate-100 flex gap-1">
                    {[0, 0.2, 0.4].map((d) => (
                      <span key={d} className="w-1 h-1 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}></span>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="p-6 bg-white border-t border-slate-100">
              <form onSubmit={handleAiChat} className="flex gap-4">
                <input
                  type="text"
                  placeholder="Ask about catalogs..."
                  className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-saffron/10 focus:border-saffron transition-all"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                />
                <button className="bg-slate-900 text-white p-4 rounded-2xl shadow-lg hover:bg-saffron transition-all">
                  <Send size={20} />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
