import React, { useState } from 'react';
import { ShoppingBag, X, CheckCircle2, DollarSign, Scale, FileText } from 'lucide-react';

export default function BuyerDealModal({ catchItem, buyer, onClose, onSubmitDeal }) {
  if (!catchItem) return null;

  const [proposedPrice, setProposedPrice] = useState('');
  const [requestedQty, setRequestedQty] = useState(catchItem.quantityKg ? String(catchItem.quantityKg) : '');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const fisherName = catchItem.user?.name || 'Fisherman';

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pPrice = parseFloat(proposedPrice);
    const rQty = parseFloat(requestedQty);

    if (isNaN(pPrice) || pPrice <= 0) {
      setError('Please enter a valid proposed price per kg.');
      return;
    }
    if (isNaN(rQty) || rQty <= 0) {
      setError('Please enter a valid requested quantity in kg.');
      return;
    }

    setLoading(true);
    setError('');

    const dealData = {
      catchReportId: catchItem.id,
      buyerId: buyer ? buyer.id : 'buyer-anon',
      proposedPricePerKg: pPrice,
      requestedQtyKg: rQty,
      notes: notes.trim() || null
    };

    const ok = await onSubmitDeal(dealData);
    setLoading(false);
    if (ok !== false) {
      onClose();
    } else {
      setError('Failed to submit deal proposal. Please try again.');
    }
  };

  const totalEstimatedCost = (parseFloat(proposedPrice) || 0) * (parseFloat(requestedQty) || 0);

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white border-2 border-stone-300 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center font-bold text-stone-600"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-center space-y-1">
          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-2 border border-amber-200">
            <ShoppingBag size={24} className="stroke-[2.5]" />
          </div>
          <h3 className="text-xl font-black text-stone-800 tracking-tight">Request Purchase Deal</h3>
          <p className="text-xs font-semibold text-stone-500">Send purchase offer to {fisherName}</p>
        </div>

        {/* Selected Catch Card Summary */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3 flex justify-between items-center text-xs">
          <div>
            <span className="font-extrabold text-stone-900 block text-sm">{catchItem.fishType}</span>
            <span className="text-stone-500 font-bold">{catchItem.location}</span>
          </div>
          <span className="bg-teal-50 text-ocean-teal border border-teal-200 font-black px-2.5 py-1 rounded-xl">
            Avail: {catchItem.quantityKg} kg
          </span>
        </div>

        {error && (
          <p className="text-xs text-ocean-red font-black bg-red-50 border border-red-200 p-2.5 rounded-xl">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <DollarSign size={14} className="text-ocean-teal" /> Proposed Price per kg (₹)
            </label>
            <input
              type="number"
              step="any"
              min="1"
              placeholder="e.g. 240"
              value={proposedPrice}
              onChange={(e) => setProposedPrice(e.target.value)}
              className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <Scale size={14} className="text-ocean-teal" /> Requested Quantity (kg)
            </label>
            <input
              type="number"
              step="any"
              min="0.1"
              max={catchItem.quantityKg || 10000}
              placeholder={`Max ${catchItem.quantityKg || 'N/A'} kg`}
              value={requestedQty}
              onChange={(e) => setRequestedQty(e.target.value)}
              className="bg-stone-50 border-2 border-stone-200 p-2.5 rounded-xl font-bold text-stone-800"
              required
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold text-stone-600 flex items-center gap-1">
              <FileText size={14} className="text-ocean-teal" /> Additional Terms / Notes (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Can pick up directly at dock by 5:00 PM."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-stone-50 border-2 border-stone-200 p-2 rounded-xl text-xs font-semibold text-stone-800"
            />
          </div>

          {/* Total Calculation Banner */}
          {totalEstimatedCost > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
              <span className="font-bold text-emerald-900">Total Proposed Offer:</span>
              <span className="font-black text-emerald-900 text-sm">₹{totalEstimatedCost.toLocaleString('en-IN')}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3.5 mt-2 flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all disabled:opacity-50"
          >
            <CheckCircle2 size={18} />
            {loading ? 'Sending Proposal...' : 'Submit Deal Offer'}
          </button>
        </form>

      </div>
    </div>
  );
}
