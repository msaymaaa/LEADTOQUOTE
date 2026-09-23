import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Lead } from '../../types';
import { User, Mail, Phone, Wrench, MapPin, DollarSign, Calendar, FileText, AlertCircle } from 'lucide-react';

interface NewLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateLead: (lead: Lead) => void;
}

export const NewLeadModal: React.FC<NewLeadModalProps> = ({
  isOpen,
  onClose,
  onCreateLead
}) => {
  const [formData, setFormData] = useState({
    customerName: '',
    email: '',
    phone: '',
    serviceType: 'AC System Repair',
    location: 'Lahore, Pakistan',
    address: '',
    estimatedBudget: '45000',
    preferredDate: '2026-09-25',
    description: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.customerName.trim()) {
      errs.customerName = 'Customer name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errs.email = 'Invalid email address format';
    }
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    }
    if (!formData.description.trim()) {
      errs.description = 'Please provide a service description';
    }
    if (!formData.estimatedBudget || Number(formData.estimatedBudget) <= 0) {
      errs.estimatedBudget = 'Please enter a valid estimated budget';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newLead: Lead = {
      id: `LD-${Math.floor(100 + Math.random() * 900)}`,
      customerName: formData.customerName,
      email: formData.email,
      phone: formData.phone,
      serviceType: formData.serviceType,
      location: formData.location,
      address: formData.address || `${formData.location}`,
      estimatedValue: Number(formData.estimatedBudget),
      status: 'New',
      createdAt: 'Just now',
      preferredDate: formData.preferredDate,
      description: formData.description,
      timeline: [
        {
          title: 'Lead Ingested',
          time: 'Just now',
          note: 'Created manually in Dispatch Center'
        }
      ]
    };

    onCreateLead(newLead);
    onClose();
    // Reset
    setFormData({
      customerName: '',
      email: '',
      phone: '',
      serviceType: 'AC System Repair',
      location: 'Lahore, Pakistan',
      address: '',
      estimatedBudget: '45000',
      preferredDate: '2026-09-25',
      description: ''
    });
    setErrors({});
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Customer Lead"
      subtitle="Intake customer request into the operational pipeline"
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(errors).length > 0 && (
          <div className="p-3 rounded-xl bg-[#FF647C]/10 border border-[#FF647C]/30 flex items-center gap-2 text-xs text-[#FF647C]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>Please correct the highlighted fields before creating the lead.</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Customer Name */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Customer Full Name <span className="text-[#FF647C]">*</span>
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
              <input
                type="text"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Sandra Bullock"
                className={`w-full bg-[#151F33] border ${
                  errors.customerName ? 'border-[#FF647C]' : 'border-[#18243A]'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]`}
              />
            </div>
            {errors.customerName && (
              <span className="text-[10px] text-[#FF647C] mt-1 block">{errors.customerName}</span>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Email Address <span className="text-[#FF647C]">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sandra@enterprise.com"
                className={`w-full bg-[#151F33] border ${
                  errors.email ? 'border-[#FF647C]' : 'border-[#18243A]'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]`}
              />
            </div>
            {errors.email && (
              <span className="text-[10px] text-[#FF647C] mt-1 block">{errors.email}</span>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Phone Number <span className="text-[#FF647C]">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(512) 555-0199"
                className={`w-full bg-[#151F33] border ${
                  errors.phone ? 'border-[#FF647C]' : 'border-[#18243A]'
                } rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]`}
              />
            </div>
            {errors.phone && (
              <span className="text-[10px] text-[#FF647C] mt-1 block">{errors.phone}</span>
            )}
          </div>

          {/* Service Type */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Service Category
            </label>
            <div className="relative">
              <Wrench className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
              <select
                value={formData.serviceType}
                onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
              >
                <option value="AC System Repair">AC System Repair</option>
                <option value="Electrical Inspection">Electrical Inspection</option>
                <option value="Plumbing Repair">Plumbing Repair</option>
                <option value="Chiller Maintenance">Chiller Maintenance</option>
                <option value="Heat Pump Replacement">Heat Pump Replacement</option>
                <option value="Commercial EV Station Setup">Commercial EV Station Setup</option>
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Location City
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Lahore, Pakistan"
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>

          {/* Estimated Budget */}
          <div>
            <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
              Estimated Budget (PKR)
            </label>
            <div className="relative">
              <span className="text-[10px] font-bold text-[#91A0B8] absolute left-3 top-1/2 -translate-y-1/2">PKR</span>
              <input
                type="number"
                value={formData.estimatedBudget}
                onChange={(e) => setFormData({ ...formData, estimatedBudget: e.target.value })}
                className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-12 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
              />
            </div>
          </div>
        </div>

        {/* Street Address */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
            Service Street Address
          </label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Main Boulevard, Gulberg III, Lahore"
            className="w-full bg-[#151F33] border border-[#18243A] rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
          />
        </div>

        {/* Preferred Date */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
            Preferred Service Date
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#91A0B8]" />
            <input
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              className="w-full bg-[#151F33] border border-[#18243A] rounded-xl pl-9 pr-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF]"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-semibold text-[#91A0B8] mb-1">
            Request Description & Issue Symptoms <span className="text-[#FF647C]">*</span>
          </label>
          <textarea
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Describe the failure symptoms, access requirements, or urgent concerns..."
            className={`w-full bg-[#151F33] border ${
              errors.description ? 'border-[#FF647C]' : 'border-[#18243A]'
            } rounded-xl px-3 py-2 text-xs text-[#F4F7FB] focus:outline-none focus:border-[#6C63FF] resize-none`}
          />
          {errors.description && (
            <span className="text-[10px] text-[#FF647C] mt-1 block">{errors.description}</span>
          )}
        </div>

        {/* Action buttons */}
        <div className="pt-4 border-t border-[#18243A] flex items-center justify-end gap-3">
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
            Create Lead
          </button>
        </div>
      </form>
    </Modal>
  );
};
