import React from 'react';
import { ShoppingBag, CheckCircle2, XCircle, Clock, Phone, User, Building2, Scale, DollarSign, MessageSquare } from 'lucide-react';

export default function DealsInbox({ user, deals = [], onUpdateDealStatus, onViewFisherProfile }) {
  if (!user) {
    return (
      <div className="bg-white border-2 border-stone-200 rounded-3xl p-6 text-center space-y-3 shadow-md">
        <ShoppingBag size={40} className="mx-auto text-stone-400 stroke-[1.5]" />
        <h3 className="text-lg font-black text-stone-800">Deals & Buyer Connect</h3>
        <p className="text-xs text-stone-500 font-semibold">Please log in to view pending purchase deal proposals and connect with seafood buyers.</p>
      </div>
    );
  }

  const isFisher = user.role === 'fisher' || user.userType === 'fisher';
  const isBuyer = user.role === 'buyer' || user.userType === 'buyer';

  // Filter deals based on user role
  const relevantDeals = deals.filter(deal => {
    if (isBuyer) {
      return deal.buyerId === user.id || deal.buyer?.phone === user.phone;
    }
     if (isFisher) {
      return deal.catchReport?.userId === user.id || deal.catchReport?.user?.phone === user.phone;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-3xl p-4 shadow-lg border border-stone-800 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center font-black text-white shadow-md">
            <ShoppingBag size={20} />
          </div>
          <div>
            <span className="text-[9px] font-extrabold text-stone-400 uppercase tracking-widest block">SEAFOOD DEALS</span>
            <h3 className="text-md font-black tracking-tight">
              {isBuyer ? 'My Purchase Offers' : 'Incoming Buyer Deals'}
            </h3>
          </div>
        </div>
        <span className="text-[10px] font-extrabold bg-stone-800 border border-stone-700 text-stone-300 px-2.5 py-1 rounded-xl">
          {relevantDeals.length} Deals
        </span>
      </div>

      {relevantDeals.length === 0 ? (
        <div className="text-center py-10 bg-white border-2 border-stone-200 rounded-3xl text-stone-500 font-semibold text-xs space-y-2">
          <p className="font-bold text-stone-700">No active deal proposals found.</p>
          <p className="text-[11px] text-stone-400">
            {isBuyer ? 'Browse fish catch listings in the Market tab and click "Offer Deal" to send proposals.' : 'When seafood buyers submit purchase proposals for your catch, they will appear here.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {relevantDeals.map(deal => {
            const catchItem = deal.catchReport || {};
            const buyerInfo = deal.buyer || {};
            const fisherInfo = catchItem.user || {};
            const status = deal.status || 'pending';

            return (
              <div 
                key={deal.id} 
                className="bg-white border-2 border-stone-200 rounded-2xl p-4 space-y-3 shadow-sm"
              >
                {/* Header: Status + Date */}
                <div className="flex justify-between items-center border-b border-stone-100 pb-2">
                  <div className="flex items-center gap-1.5">
                    {status === 'pending' && (
                      <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <Clock size={12} /> Pending Review
                      </span>
                    )}
                    {status === 'accepted' && (
                      <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle2 size={12} /> Accepted Deal
                      </span>
                    )}
                    {status === 'declined' && (
                      <span className="bg-rose-100 text-rose-900 border border-rose-300 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                        <XCircle size={12} /> Offer Declined
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-bold text-stone-400">
                    {deal.createdAt ? new Date(deal.createdAt).toLocaleDateString('en-IN') : 'Today'}
                  </span>
                </div>

                {/* Catch Info & Buyer Info */}
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-stone-900 text-base">{catchItem.fishType || 'Fresh Catch'}</h4>
                      <span className="text-stone-500 font-bold block text-[11px]">{catchItem.location || 'Harbor'}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-ocean-teal font-black text-sm block">₹{deal.proposedPricePerKg} / kg</span>
                      <span className="text-stone-500 font-extrabold text-[11px]">{deal.requestedQtyKg} kg requested</span>
                    </div>
                  </div>

                  {/* Notes if available */}
                  {deal.notes && (
                    <div className="bg-stone-50 border border-stone-200 rounded-xl p-2 text-[11px] font-semibold text-stone-600 italic">
                      "{deal.notes}"
                    </div>
                  )}

                  {/* Party Information */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-2.5 flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-1.5 font-bold text-stone-700">
                      <Building2 size={14} className="text-ocean-teal" />
                      <span>Buyer: {buyerInfo.companyName ? `${buyerInfo.companyName} (${buyerInfo.name || 'Trader'})` : (buyerInfo.name || 'Seafood Buyer')}</span>
                    </div>
                    {buyerInfo.phone && (
                      <a
                        href={`tel:${buyerInfo.phone}`}
                        className="bg-stone-200 hover:bg-stone-300 text-stone-800 font-extrabold px-2 py-1 rounded-lg flex items-center gap-1"
                      >
                        <Phone size={10} /> Call
                      </a>
                    )}
                  </div>
                </div>

                {/* Action Buttons for Fisher */}
                {isFisher && status === 'pending' && (
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-stone-100">
                    <button
                      onClick={() => onUpdateDealStatus(deal.id, 'accepted')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm transition-all"
                    >
                      <CheckCircle2 size={14} /> Accept Offer
                    </button>
                    <button
                      onClick={() => onUpdateDealStatus(deal.id, 'declined')}
                      className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 font-extrabold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <XCircle size={14} /> Decline Offer
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
