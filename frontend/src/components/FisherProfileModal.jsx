import React from 'react';
import { User, Phone, Anchor, MapPin, ShieldCheck, X, Fish, MessageCircle } from 'lucide-react';

export default function FisherProfileModal({ fisher, catches = [], onClose, onRequestDeal }) {
  if (!fisher) return null;

  const fisherCatches = catches.filter(c =>
    (c.user && c.user.name === fisher.name) || c.userId === fisher.id
  );

  const phone = fisher.phone || '9876543210';
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/91${cleanPhone.slice(-10)}?text=${encodeURIComponent(`Hello ${fisher.name}, I found your listing on TeeraConnect and would like to buy fish from you.`)}`;

  return (
    <div className="fixed inset-0 bg-stone-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-all">
      <div className="bg-white border-2 border-stone-300 rounded-3xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 flex items-center justify-center font-bold text-stone-600"
        >
          <X size={18} />
        </button>

        {/* Profile Header */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-20 h-20 bg-ocean-teal/10 text-ocean-teal rounded-full flex items-center justify-center mx-auto border-2 border-ocean-teal/20 shadow-inner relative">
            <User size={40} className="stroke-[2]" />
            {fisher.isVerified !== false && (
              <span className="absolute bottom-0 right-0 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-sm" title="Verified Fisher">
                <ShieldCheck size={14} />
              </span>
            )}
          </div>
          <div>
            <h3 className="text-xl font-black text-stone-800 tracking-tight flex items-center justify-center gap-1.5">
              {fisher.name || 'Registered Fisherman'}
              {fisher.isVerified !== false && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-0.5">
                  Verified
                </span>
              )}
            </h3>
            <span className="text-xs font-bold text-ocean-teal bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mt-1">
              {fisher.role === 'admin' || fisher.userType === 'admin'
                ? 'Fisheries Admin'
                : fisher.role === 'buyer' || fisher.userType === 'buyer'
                  ? 'Seafood Buyer'
                  : 'Fisher Profile'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="bg-stone-50 border border-stone-200 rounded-2xl p-3.5 space-y-2 text-xs font-semibold text-stone-700">
          {(fisher.role === 'fisher' || fisher.userType === 'fisher') && (
            <div className="flex items-center justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Anchor size={14} className="text-ocean-teal" /> Boat Type:
              </span>
              <span className="font-extrabold text-stone-900">{fisher.boatType || 'Mechanized Boat'}</span>
            </div>
          )}

          {(fisher.role === 'buyer' || fisher.userType === 'buyer') && fisher.companyName && (
            <div className="flex items-center justify-between py-1 border-b border-stone-200">
              <span className="text-stone-500 font-bold flex items-center gap-1.5">
                <Anchor size={14} className="text-ocean-teal" /> Company:
              </span>
              <span className="font-extrabold text-stone-900">{fisher.companyName}</span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-stone-200">
            <span className="text-stone-500 font-bold flex items-center gap-1.5">
              <MapPin size={14} className="text-ocean-teal" /> Home Harbor:
            </span>
            <span className="font-extrabold text-stone-900">{fisher.harbor || fisher.location || 'Mangalore Harbor'}</span>
          </div>

          <div className="flex items-center justify-between py-1">
            <span className="text-stone-500 font-bold flex items-center gap-1.5">
              <Phone size={14} className="text-ocean-teal" /> Contact Phone:
            </span>
            <span className="font-extrabold text-stone-900">{phone}</span>
          </div>
        </div>

        {/* Direct Contact Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-1">
          <a
            href={`tel:${phone}`}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
          >
            <Phone size={16} />
            Direct Call
          </a>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-500 font-extrabold py-3 px-3 rounded-2xl text-xs flex items-center justify-center gap-1.5 shadow-sm active:scale-95 transition-all"
          >
            <MessageCircle size={16} />
            WhatsApp
          </a>
        </div>

        {/* Recent Catch Listings */}
        {(fisher.role === 'fisher' || fisher.userType === 'fisher') && (
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-black uppercase text-stone-400 tracking-wider flex items-center gap-1">
              <Fish size={14} /> Active Fish Catches ({fisherCatches.length})
            </h4>
            {fisherCatches.length === 0 ? (
              <p className="text-xs text-stone-400 font-semibold italic text-center py-2">No active catches listed currently.</p>
            ) : (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {fisherCatches.map(catchItem => (
                  <div key={catchItem.id} className="bg-stone-100 border border-stone-200 rounded-xl p-2.5 flex justify-between items-center text-xs">
                    <div>
                      <span className="font-extrabold text-stone-800 block">{catchItem.fishType}</span>
                      <span className="text-[10px] text-stone-500 font-bold">{catchItem.quantityKg} kg • {catchItem.location}</span>
                    </div>
                    {onRequestDeal && (
                      <button
                        onClick={() => {
                          onClose();
                          onRequestDeal(catchItem);
                        }}
                        className="bg-ocean-teal text-white font-extrabold text-[10px] px-2.5 py-1.5 rounded-lg hover:opacity-90 shadow-sm"
                      >
                        Offer Deal
                      </button>
                    )}
                  </div>
                ))}
              </div>
          )}
        </div>
        )}

      </div>
    </div>
  );
}
