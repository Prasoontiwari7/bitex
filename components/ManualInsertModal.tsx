
import React, { useState } from 'react';
import BiteButton from './BiteButton';

interface ManualInsertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { customerName: string; amount: number; guestCount: number; rating: number }) => void;
}

const ManualInsertModal: React.FC<ManualInsertModalProps> = ({ isOpen, onClose, onSave }) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    customerName: '',
    amount: '',
    guestCount: '2',
    rating: '5'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      customerName: formData.customerName,
      amount: parseFloat(formData.amount),
      guestCount: parseInt(formData.guestCount),
      rating: parseFloat(formData.rating)
    });
    setFormData({ customerName: '', amount: '', guestCount: '2', rating: '5' });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      <div className="relative bg-white rounded-[32px] shadow-2xl w-full max-w-md p-8 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Manual Transaction</h2>
            <p className="text-sm text-slate-500 font-medium">Record a new walk-in order</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Guest Identification</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Alex Johnson"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 focus:border-amber-400 focus:bg-white outline-none transition-all font-medium text-slate-700"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Total Bill (₹)</label>
              <input 
                required
                type="number" 
                placeholder="0.00"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 focus:border-amber-400 focus:bg-white outline-none transition-all font-medium text-slate-700"
                value={formData.amount}
                onChange={e => setFormData({...formData, amount: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Party Size</label>
              <select 
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3 focus:border-amber-400 focus:bg-white outline-none transition-all font-medium text-slate-700 appearance-none"
                value={formData.guestCount}
                onChange={e => setFormData({...formData, guestCount: e.target.value})}
              >
                {[1,2,3,4,5,6,7,8].map(n => <option key={n} value={n}>{n} Guests</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Satisfaction Rating</label>
            <div className="flex justify-between items-center bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-3">
              {[1,2,3,4,5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star.toString()})}
                  className={`text-2xl transition-transform hover:scale-125 ${parseInt(formData.rating) >= star ? 'text-amber-400' : 'text-slate-200'}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <BiteButton className="flex-1 py-4 text-base" variant="primary">Submit Record</BiteButton>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualInsertModal;
