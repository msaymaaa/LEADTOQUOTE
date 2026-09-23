import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Quote, QuoteLineItem } from '../../types';
import { Plus, Trash2, DollarSign, Calculator, User, FileText } from 'lucide-react';
import { formatPKR } from '../../lib/currency';

interface NewQuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateQuote: (quote: Quote) => void;
  defaultCustomer?: { name: string; email: string; phone: string; service: string; location: string };
}

export const NewQuoteModal: React.FC<NewQuoteModalProps> = ({
  isOpen,
  onClose,
  onCreateQuote,
  defaultCustomer
}) => {
  const [customerName, setCustomerName] = useState(defaultCustomer?.name || 'Taylor Logistics Corp');
  const [customerEmail, setCustomerEmail] = useState(defaultCustomer?.email || 'admin@taylorlogistics.com');
  const [customerPhone, setCustomerPhone] = useState(defaultCustomer?.phone || '+92 300 5554421');
  const [serviceTitle, setServiceTitle] = useState(defaultCustomer?.service || 'HVAC Rooftop Unit Retrofit');
  const [serviceDescription, setServiceDescription] = useState(
    'Demolition of legacy mechanical compressor and installation of high-efficiency commercial unit.'
  );
  const [location, setLocation] = useState(defaultCustomer?.location || 'Lahore, Pakistan');

  const [items, setItems] = useState<QuoteLineItem[]>([
    { id: '1', description: 'Certified Field Technician Labor (4 hrs)', category: 'Labor', quantity: 4, unitPrice: 5000, total: 20000 },
    { id: '2', description: 'Commercial Compressor & Dual Motor Kit', category: 'Parts', quantity: 1, unitPrice: 45000, total: 45000 },
    { id: '3', description: 'Dispatch & Refrigerant Evacuation Tooling', category: 'Travel', quantity: 1, unitPrice: 5000, total: 5000 }
  ]);

  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'Labor' | 'Parts' | 'Travel' | 'Additional Services'>('Labor');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemRate, setNewItemRate] = useState(5000);

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = Math.round(subtotal * 0.0825);
  const total = subtotal + tax;

  const handleAddItem = () => {
    if (!newItemDesc.trim()) return;
    const newItem: QuoteLineItem = {
      id: String(Date.now()),
      description: newItemDesc,
      category: newItemCategory,
      quantity: Number(newItemQty),
      unitPrice: Number(newItemRate),
      total: Number(newItemQty) * Number(newItemRate)
    };
    setItems([...items, newItem]);
    setNewItemDesc('');
    setNewItemQty(1);
    setNewItemRate(150);
  };

  const handleRemoveItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newQuote: Quote = {
      id: `QT-${Math.floor(1050 + Math.random() * 50)}`,
      customerName,
      customerEmail,
      customerPhone,
      serviceTitle,
      serviceDescription,
      location,
      createdAt: 'Sep 19, 2026',
      validUntil: 'Oct 03, 2026',
      status: 'Awaiting Approval',
      lineItems: items,
      subtotal,
      tax,
      total,
      notes: 'Standard 30-day quotation terms with manufacturer warranty.'
    };

    onCreateQuote(newQuote);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create Commercial Quotation"
      subtitle="Assemble labor, materials, and generate official customer quote"
      maxWidth="3xl"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Customer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Customer Name</label>
            <input
              type="text"
              required
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Customer Email</label>
            <input
              type="email"
              required
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Service Location</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
        </div>

        {/* Service Title */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">Service Headline</label>
          <input
            type="text"
            required
            value={serviceTitle}
            onChange={(e) => setServiceTitle(e.target.value)}
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
          />
        </div>

        {/* Line Items List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#F4F7FB] uppercase tracking-wider">
              Line Items ({items.length})
            </span>
          </div>

          <div className="rounded-xl border border-[#18243A] bg-[#080D18] overflow-hidden mb-3">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0D1424] text-[#91A0B8] border-b border-[#18243A]">
                <tr>
                  <th className="py-2 px-3">Description</th>
                  <th className="py-2 px-3">Type</th>
                  <th className="py-2 px-3 text-center">Qty</th>
                  <th className="py-2 px-3 text-right">Rate</th>
                  <th className="py-2 px-3 text-right">Total</th>
                  <th className="py-2 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#18243A]/50">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2.5 px-3 font-medium text-[#F4F7FB]">{item.description}</td>
                    <td className="py-2.5 px-3 text-[#91A0B8]">{item.category}</td>
                    <td className="py-2.5 px-3 text-center text-[#91A0B8]">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-[#91A0B8]">{formatPKR(item.unitPrice)}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-[#F4F7FB]">{formatPKR(item.total)}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="p-1 text-[#FF647C] hover:bg-[#FF647C]/10 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Item Row */}
          <div className="p-3 rounded-xl bg-[#0D1424] border border-[#18243A] flex flex-wrap gap-2 items-center">
            <input
              type="text"
              placeholder="Add item description..."
              value={newItemDesc}
              onChange={(e) => setNewItemDesc(e.target.value)}
              className="flex-1 min-w-[180px] bg-[#151F33] border border-[#18243A] rounded-lg px-2.5 py-1.5 text-xs text-[#F4F7FB]"
            />
            <select
              value={newItemCategory}
              onChange={(e) => setNewItemCategory(e.target.value as any)}
              className="bg-[#151F33] border border-[#18243A] rounded-lg px-2 py-1.5 text-xs text-[#F4F7FB]"
            >
              <option value="Labor">Labor</option>
              <option value="Parts">Parts</option>
              <option value="Travel">Travel</option>
              <option value="Additional Services">Additional</option>
            </select>
            <input
              type="number"
              min="1"
              value={newItemQty}
              onChange={(e) => setNewItemQty(Number(e.target.value))}
              className="w-16 bg-[#151F33] border border-[#18243A] rounded-lg px-2 py-1.5 text-xs text-[#F4F7FB] text-center"
            />
            <input
              type="number"
              min="0"
              value={newItemRate}
              onChange={(e) => setNewItemRate(Number(e.target.value))}
              className="w-24 bg-[#151F33] border border-[#18243A] rounded-lg px-2 py-1.5 text-xs text-[#F4F7FB] text-right font-mono"
              placeholder="Rate (PKR)"
            />
            <button
              type="button"
              onClick={handleAddItem}
              className="px-3 py-1.5 rounded-lg bg-[#39D9FF] hover:bg-[#39D9FF]/90 text-black font-semibold text-xs transition-all flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </button>
          </div>
        </div>

        {/* Pricing Summary */}
        <div className="p-4 rounded-xl bg-[#080D18] border border-[#18243A] flex justify-end">
          <div className="w-64 space-y-1 text-xs">
            <div className="flex justify-between text-[#91A0B8]">
              <span>Subtotal:</span>
              <span className="font-mono">{formatPKR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-[#91A0B8]">
              <span>Estimated Tax:</span>
              <span className="font-mono">{formatPKR(tax)}</span>
            </div>
            <div className="pt-2 border-t border-[#18243A] flex justify-between font-bold text-sm text-[#F4F7FB]">
              <span>Grand Total:</span>
              <span className="font-mono text-base text-[#35D07F]">
                {formatPKR(total)}
              </span>
            </div>
          </div>
        </div>

        {/* Form Footer */}
        <div className="pt-3 border-t border-[#18243A] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-[#91A0B8] hover:text-[#F4F7FB] hover:bg-[#151F33] rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-[#6C63FF] hover:bg-[#6C63FF]/90 rounded-xl shadow-lg shadow-[#6C63FF]/20 transition-all cursor-pointer"
          >
            Generate & Dispatch Quote
          </button>
        </div>
      </form>
    </Modal>
  );
};
