import { Lead, Quote, Job, Technician, Customer, Invoice } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'LD-101',
    customerName: 'Michael Carter',
    email: 'm.carter@austincrest.com',
    phone: '(512) 840-2914',
    serviceType: 'AC System Repair',
    location: 'Austin, TX',
    address: '742 Barton Springs Rd, Austin, TX 78704',
    estimatedValue: 1240,
    status: 'Quoted',
    createdAt: 'Sep 18, 2026',
    preferredDate: 'Sep 22, 2026',
    description: 'Compressor unit short-cycling and rattling during hot afternoon peaks. Needs immediate diagnostic and refrigerant coil test.',
    timeline: [
      { title: 'Inquiry Submitted', time: 'Sep 18, 09:15 AM', note: 'Customer completed online emergency request' },
      { title: 'Technician Triaged', time: 'Sep 18, 10:00 AM', note: 'Flagged for Tier 2 HVAC diagnostic' },
      { title: 'Quotation QT-1042 Sent', time: 'Sep 18, 11:30 AM', note: 'Sent formal quote for customer approval' }
    ]
  },
  {
    id: 'LD-102',
    customerName: 'Sarah Williams',
    email: 'sarah.w@williamsholdings.org',
    phone: '(713) 492-7710',
    serviceType: 'Electrical Inspection',
    location: 'Houston, TX',
    address: '1200 Post Oak Blvd, Houston, TX 77056',
    estimatedValue: 2850,
    status: 'Converted',
    createdAt: 'Sep 17, 2026',
    preferredDate: 'Sep 21, 2026',
    description: 'Full commercial 400A panel audit following breaker trips during machinery startup. Needs thermal imaging and breaker replacements.',
    timeline: [
      { title: 'Request Logged', time: 'Sep 17, 08:30 AM', note: 'Facility manager direct call' },
      { title: 'Quote QT-1041 Approved', time: 'Sep 17, 02:15 PM', note: 'Approved with purchase order #PO-9912' },
      { title: 'Dispatched', time: 'Sep 17, 03:00 PM', note: 'Converted to JOB-2045' }
    ]
  },
  {
    id: 'LD-103',
    customerName: 'David Miller',
    email: 'david.miller@dallastech.net',
    phone: '(214) 738-9901',
    serviceType: 'Plumbing Repair',
    location: 'Dallas, TX',
    address: '3819 Maple Ave, Dallas, TX 75219',
    estimatedValue: 620,
    status: 'New',
    createdAt: 'Sep 19, 2026',
    preferredDate: 'Sep 23, 2026',
    description: 'Main pressure regulator squealing and backflow preventer dripping in mechanical room basement.',
    timeline: [
      { title: 'New Request Received', time: 'Sep 19, 06:45 AM', note: 'Automated portal intake' }
    ]
  },
  {
    id: 'LD-104',
    customerName: 'Robert Chen',
    email: 'r.chen@baysidemanor.com',
    phone: '(512) 670-3419',
    serviceType: 'Chiller Maintenance',
    location: 'Austin, TX',
    address: '220 Congress Ave, Austin, TX 78701',
    estimatedValue: 4200,
    status: 'Qualified',
    createdAt: 'Sep 16, 2026',
    preferredDate: 'Sep 24, 2026',
    description: 'Quarterly preventative service for two 50-ton rooftop water-cooled chillers before seasonal changeover.',
    timeline: [
      { title: 'Inbound Call', time: 'Sep 16, 11:20 AM', note: 'Commercial property management client' },
      { title: 'Site Survey Completed', time: 'Sep 17, 09:00 AM', note: 'Scope confirmed by Senior Tech Wilson' }
    ]
  },
  {
    id: 'LD-105',
    customerName: 'Elena Rostova',
    email: 'elena@luxurylivingtx.com',
    phone: '(210) 554-8832',
    serviceType: 'Smart Automation & Lighting',
    location: 'San Antonio, TX',
    address: '1540 River Walk Suite 300, San Antonio, TX 78205',
    estimatedValue: 3450,
    status: 'Contacted',
    createdAt: 'Sep 18, 2026',
    preferredDate: 'Sep 25, 2026',
    description: 'Lutron panel integration with backup generator automatic transfer switch. Client wants consultation call.',
    timeline: [
      { title: 'Lead Captured', time: 'Sep 18, 01:10 PM', note: 'Web quote builder submission' },
      { title: 'Phone Call Made', time: 'Sep 18, 03:45 PM', note: 'Left voicemail with preliminary pricing guide' }
    ]
  },
  {
    id: 'LD-106',
    customerName: 'Marcus Vance',
    email: 'vance.m@vancebistro.com',
    phone: '(817) 402-1198',
    serviceType: 'Commercial Kitchen Hood & Pipe Check',
    location: 'Fort Worth, TX',
    address: '408 W 7th St, Fort Worth, TX 76102',
    estimatedValue: 1890,
    status: 'Qualified',
    createdAt: 'Sep 15, 2026',
    preferredDate: 'Sep 21, 2026',
    description: 'Annual certification required by health authority. Needs pressure leak down testing and grease trap valve check.',
    timeline: [
      { title: 'Intake Registered', time: 'Sep 15, 10:15 AM', note: 'High priority restaurant compliance inspection' },
      { title: 'Scope Validated', time: 'Sep 16, 02:00 PM', note: 'Ready for official estimate draft' }
    ]
  },
  {
    id: 'LD-107',
    customerName: 'Jessica Taylor',
    email: 'jtaylor@taylordesign.studio',
    phone: '(512) 993-2281',
    serviceType: 'Heat Pump Replacement',
    location: 'Austin, TX',
    address: '1108 S Lamar Blvd, Austin, TX 78704',
    estimatedValue: 5600,
    status: 'Quoted',
    createdAt: 'Sep 14, 2026',
    preferredDate: 'Sep 23, 2026',
    description: 'Dual-zone high-efficiency inverter heat pump installation with smart thermostat zone controllers.',
    timeline: [
      { title: 'Inquiry Ingested', time: 'Sep 14, 04:20 PM', note: 'Referral from architect partner' },
      { title: 'Quote QT-1043 Dispatched', time: 'Sep 15, 11:00 AM', note: 'Awaiting homeowner board sign-off' }
    ]
  },
  {
    id: 'LD-108',
    customerName: 'Brandon Walsh',
    email: 'bwalsh@beverlylogistics.com',
    phone: '(713) 621-0044',
    serviceType: 'Commercial EV Station Setup',
    location: 'Houston, TX',
    address: '8800 Kempwood Dr, Houston, TX 77080',
    estimatedValue: 7800,
    status: 'New',
    createdAt: 'Sep 19, 2026',
    preferredDate: 'Sep 28, 2026',
    description: 'Dual 48A Level 2 commercial fleet vehicle chargers with conduit run across distribution warehouse parking.',
    timeline: [
      { title: 'Direct Enterprise Lead', time: 'Sep 19, 08:00 AM', note: 'Fleet transition grant program participant' }
    ]
  }
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 'QT-1042',
    leadId: 'LD-101',
    customerName: 'Michael Carter',
    customerEmail: 'm.carter@austincrest.com',
    customerPhone: '(512) 840-2914',
    serviceTitle: 'AC System Repair & Coil Replacement',
    serviceDescription: 'Complete diagnostic, replacement of burned dual-run capacitor, contactor switch, leak repair on condenser line, and 410A refrigerant charge.',
    location: 'Austin, TX',
    createdAt: 'Sep 18, 2026',
    validUntil: 'Oct 02, 2026',
    status: 'Awaiting Approval',
    lineItems: [
      { id: 'li-1', description: 'Certified HVAC Field Labor (2.5 hrs)', category: 'Labor', quantity: 2.5, unitPrice: 200, total: 500 },
      { id: 'li-2', description: 'Heavy-Duty 45/5 MFD Dual Run Capacitor & Contactor', category: 'Parts', quantity: 1, unitPrice: 195, total: 195 },
      { id: 'li-3', description: 'R-410A Refrigerant Recharge (3 lbs)', category: 'Parts', quantity: 3, unitPrice: 75, total: 225 },
      { id: 'li-4', description: 'Expedited Urban Dispatch & Vehicle Tool Fee', category: 'Travel', quantity: 1, unitPrice: 80, total: 80 },
      { id: 'li-5', description: 'Digital Airflow & Delta-T Efficiency Certification', category: 'Additional Services', quantity: 1, unitPrice: 0, total: 0 }
    ],
    subtotal: 1000,
    tax: 96,
    total: 1096,
    notes: 'Warranty includes 12-month parts and 90-day labor guarantee. Diagnostic fee waived upon approval.'
  },
  {
    id: 'QT-1041',
    leadId: 'LD-102',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah.w@williamsholdings.org',
    customerPhone: '(713) 492-7710',
    serviceTitle: 'Commercial 400A Electrical Audit & Upgrades',
    serviceDescription: 'Infrared thermography, circuit branch load balancing, installation of two 100A surge suppression modules, and main grounding grid verification.',
    location: 'Houston, TX',
    createdAt: 'Sep 16, 2026',
    validUntil: 'Sep 30, 2026',
    status: 'Approved',
    lineItems: [
      { id: 'li-11', description: 'Master Electrician Field Diagnostics & Load Calculations', category: 'Labor', quantity: 6, unitPrice: 220, total: 1320 },
      { id: 'li-12', description: 'Type 1 Surge Protective Device (SPD) Heavy Duty Panel', category: 'Parts', quantity: 2, unitPrice: 580, total: 1160 },
      { id: 'li-13', description: 'Copper Grounding Rods & Low-Impedance Bonding', category: 'Parts', quantity: 1, unitPrice: 190, total: 190 },
      { id: 'li-14', description: 'Regional Van Dispatch & Specialized Test Equipment', category: 'Travel', quantity: 1, unitPrice: 90, total: 90 },
      { id: 'li-15', description: 'State Fire Marshal Compliance Documentation', category: 'Additional Services', quantity: 1, unitPrice: 90, total: 90 }
    ],
    subtotal: 2850,
    tax: 235,
    total: 3085,
    notes: 'Approved via corporate purchase order PO-9912. Converted to Job JOB-2045.'
  },
  {
    id: 'QT-1043',
    leadId: 'LD-107',
    customerName: 'Jessica Taylor',
    customerEmail: 'jtaylor@taylordesign.studio',
    customerPhone: '(512) 993-2281',
    serviceTitle: 'Dual-Zone Inverter Heat Pump Retrofit',
    serviceDescription: 'Decommission old electric resistance furnace, install high SEER2 cold-climate variable speed inverter heat pump with Wi-Fi communicating controls.',
    location: 'Austin, TX',
    createdAt: 'Sep 15, 2026',
    validUntil: 'Sep 29, 2026',
    status: 'Awaiting Approval',
    lineItems: [
      { id: 'li-21', description: 'Multi-tech Mechanical Installation Crew (8 hrs)', category: 'Labor', quantity: 8, unitPrice: 250, total: 2000 },
      { id: 'li-22', description: 'High-Efficiency Outdoor Condenser & Air Handler Pair', category: 'Parts', quantity: 1, unitPrice: 3100, total: 3100 },
      { id: 'li-23', description: 'Insulated Line Set, Disconnect Box & Whip', category: 'Parts', quantity: 1, unitPrice: 320, total: 320 },
      { id: 'li-24', description: 'City Mechanical Permit & Code Inspection Prep', category: 'Additional Services', quantity: 1, unitPrice: 180, total: 180 }
    ],
    subtotal: 5600,
    tax: 462,
    total: 6062,
    notes: 'Eligible for federal clean energy tax credit and Austin Energy local rebates.'
  },
  {
    id: 'QT-1040',
    customerName: 'Robert Chen',
    customerEmail: 'r.chen@baysidemanor.com',
    customerPhone: '(512) 670-3419',
    serviceTitle: 'Quarterly Chiller Maintenance & Descaling',
    serviceDescription: 'Condenser tube chemical cleaning, eddy current baseline testing, oil analysis, and vibration sensor alignment on primary centrifugal pump.',
    location: 'Austin, TX',
    createdAt: 'Sep 12, 2026',
    validUntil: 'Sep 26, 2026',
    status: 'Approved',
    lineItems: [
      { id: 'li-31', description: 'Industrial Chiller Specialist & Tech Apprentice', category: 'Labor', quantity: 12, unitPrice: 195, total: 2340 },
      { id: 'li-32', description: 'Eco-safe Biodegradable Scale Dissolver & Passivator', category: 'Parts', quantity: 1, unitPrice: 650, total: 650 },
      { id: 'li-33', description: 'Spectrographic Lubricant Analysis Laboratory Fee', category: 'Parts', quantity: 2, unitPrice: 180, total: 360 },
      { id: 'li-34', description: 'Heavy Machinery Rigging & Safety Lockout Access', category: 'Additional Services', quantity: 1, unitPrice: 850, total: 850 }
    ],
    subtotal: 4200,
    tax: 346.5,
    total: 4546.5,
    notes: 'Work scheduled during low building occupancy weekend hours.'
  },
  {
    id: 'QT-1039',
    customerName: 'Marcus Vance',
    customerEmail: 'vance.m@vancebistro.com',
    customerPhone: '(817) 402-1198',
    serviceTitle: 'Commercial Kitchen Hood Fire Dampers Service',
    serviceDescription: 'Actuator motor replacement on exhaust rooftop fan and safety solenoid valve retrofit.',
    location: 'Fort Worth, TX',
    createdAt: 'Sep 10, 2026',
    validUntil: 'Sep 24, 2026',
    status: 'Sent',
    lineItems: [
      { id: 'li-41', description: 'Certified Ventilation Technician Labor', category: 'Labor', quantity: 4, unitPrice: 185, total: 740 },
      { id: 'li-42', description: 'Commercial High-Temp Actuator Motor Assembly', category: 'Parts', quantity: 1, unitPrice: 950, total: 950 },
      { id: 'li-43', description: 'Truck Dispatch to Tarrant County', category: 'Travel', quantity: 1, unitPrice: 100, total: 100 },
      { id: 'li-44', description: 'NFPA 96 Compliance Tagging', category: 'Additional Services', quantity: 1, unitPrice: 100, total: 100 }
    ],
    subtotal: 1890,
    tax: 155.93,
    total: 2045.93,
    notes: 'Draft awaiting customer confirmation before scheduled health inspector visit.'
  },
  {
    id: 'QT-1038',
    customerName: 'Arthur Pendelton',
    customerEmail: 'arthur.p@pendeltonwarehousing.com',
    customerPhone: '(214) 555-0182',
    serviceTitle: 'Warehouse Bay 4 High-Bay Lighting Replacement',
    serviceDescription: 'Replace 24 legacy metal-halide lamps with instant-on commercial LED fixtures.',
    location: 'Dallas, TX',
    createdAt: 'Sep 02, 2026',
    validUntil: 'Sep 16, 2026',
    status: 'Declined',
    declineReason: 'Customer decided to defer lighting overhaul until next fiscal budget cycle.',
    lineItems: [
      { id: 'li-51', description: 'Scissor Lift & Electrical Crew Operation', category: 'Labor', quantity: 8, unitPrice: 210, total: 1680 },
      { id: 'li-52', description: 'Industrial High-Bay 200W LED Fixtures (Pack of 24)', category: 'Parts', quantity: 24, unitPrice: 110, total: 2640 },
      { id: 'li-53', description: 'Equipment Rental & Safe Disposal of Mercury Lamps', category: 'Additional Services', quantity: 1, unitPrice: 420, total: 420 }
    ],
    subtotal: 4740,
    tax: 391.05,
    total: 5131.05,
    notes: 'Client requested revisitation in Q1 2027.'
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: 'JOB-2048',
    quoteId: 'QT-1042',
    title: 'AC System Repair & Dual Capacitor Swapping',
    customerName: 'Michael Carter',
    customerPhone: '(512) 840-2914',
    location: 'Austin, TX (742 Barton Springs Rd)',
    technicianId: 'TECH-01',
    technicianName: 'James Wilson',
    status: 'In Progress',
    scheduledDate: 'Sep 22, 2026',
    scheduledTime: '10:30 AM',
    estimatedDuration: '2.5 Hours',
    priority: 'High',
    description: 'Diagnose intermittent compressor shutdown, replace capacitor and contactor, verify refrigerant pressure curve, and test subcooling temperature.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 18, 02:40 PM', completed: true, active: false, assignee: 'Michael Carter' },
      { stage: 'Technician Assigned', timestamp: 'Sep 19, 08:30 AM', completed: true, active: false, assignee: 'Dispatcher Sarah' },
      { stage: 'Technician En Route', timestamp: 'Sep 22, 10:05 AM', completed: true, active: false, assignee: 'James Wilson' },
      { stage: 'Work Started', timestamp: 'Sep 22, 10:30 AM', completed: true, active: true, assignee: 'James Wilson' },
      { stage: 'Work Completed', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Customer Confirmation', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Invoice Generated', timestamp: 'Pending', completed: false, active: false }
    ],
    evidence: [
      {
        id: 'ev-1',
        title: 'Initial Diagnostic: Bulged Run Capacitor',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
        timestamp: 'Sep 22, 10:38 AM',
        type: 'Before'
      },
      {
        id: 'ev-2',
        title: 'Manifold Gauge Pressure Diagnostic (Suction/Head)',
        url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60',
        timestamp: 'Sep 22, 10:52 AM',
        type: 'During'
      }
    ]
  },
  {
    id: 'JOB-2045',
    quoteId: 'QT-1041',
    title: 'Commercial 400A Electrical Panel Audit & SPD Setup',
    customerName: 'Sarah Williams',
    customerPhone: '(713) 492-7710',
    location: 'Houston, TX (1200 Post Oak Blvd)',
    technicianId: 'TECH-02',
    technicianName: 'Maria Lopez',
    status: 'Assigned',
    scheduledDate: 'Sep 21, 2026',
    scheduledTime: '08:00 AM',
    estimatedDuration: '6 Hours',
    priority: 'Urgent',
    description: 'Perform full thermographic panel scan, balance three-phase breaker loads, install dual 100A surge arresters, test neutral bonding.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 17, 02:15 PM', completed: true, active: false, assignee: 'Sarah Williams' },
      { stage: 'Technician Assigned', timestamp: 'Sep 17, 03:00 PM', completed: true, active: true, assignee: 'Lead Dispatcher' },
      { stage: 'Technician En Route', timestamp: 'Sep 21, 07:30 AM', completed: false, active: false },
      { stage: 'Work Started', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Work Completed', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Customer Confirmation', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Invoice Generated', timestamp: 'Pending', completed: false, active: false }
    ],
    evidence: []
  },
  {
    id: 'JOB-2044',
    quoteId: 'QT-1040',
    title: 'Commercial Chiller Annual Maintenance',
    customerName: 'Robert Chen',
    customerPhone: '(512) 670-3419',
    location: 'Austin, TX (220 Congress Ave)',
    technicianId: 'TECH-01',
    technicianName: 'James Wilson',
    status: 'Scheduled',
    scheduledDate: 'Sep 24, 2026',
    scheduledTime: '07:00 AM',
    estimatedDuration: '8 Hours',
    priority: 'Normal',
    description: 'Drain condenser water box, run rotary tube cleaner with biodegradable passivator, collect oil samples for spectrographic lab test.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 14, 11:00 AM', completed: true, active: false },
      { stage: 'Technician Assigned', timestamp: 'Sep 15, 09:00 AM', completed: true, active: false, assignee: 'James Wilson' },
      { stage: 'Technician En Route', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Work Started', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Work Completed', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Customer Confirmation', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Invoice Generated', timestamp: 'Pending', completed: false, active: false }
    ],
    evidence: []
  },
  {
    id: 'JOB-2040',
    title: 'Hydronic Boiler Loop Valve Replacement',
    customerName: 'Carlos Ramirez',
    customerPhone: '(210) 991-4433',
    location: 'San Antonio, TX (410 Broadway St)',
    technicianId: 'TECH-04',
    technicianName: 'Devon Reed',
    status: 'Awaiting Completion',
    scheduledDate: 'Sep 19, 2026',
    scheduledTime: '01:00 PM',
    estimatedDuration: '4 Hours',
    priority: 'Normal',
    description: 'Isolate zone 3 heating loop, replace failing 2-inch bronze motorized ball valve, bleed air at highest radiator terminal.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 16, 09:00 AM', completed: true, active: false },
      { stage: 'Technician Assigned', timestamp: 'Sep 16, 11:30 AM', completed: true, active: false },
      { stage: 'Technician En Route', timestamp: 'Sep 19, 12:40 PM', completed: true, active: false },
      { stage: 'Work Started', timestamp: 'Sep 19, 01:05 PM', completed: true, active: false },
      { stage: 'Work Completed', timestamp: 'Sep 19, 04:30 PM', completed: true, active: true },
      { stage: 'Customer Confirmation', timestamp: 'Pending', completed: false, active: false },
      { stage: 'Invoice Generated', timestamp: 'Pending', completed: false, active: false }
    ],
    evidence: [
      {
        id: 'ev-3',
        title: 'New Bronze Zone Valve Torqued & Sealed',
        url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60',
        timestamp: 'Sep 19, 04:15 PM',
        type: 'After'
      }
    ]
  },
  {
    id: 'JOB-2038',
    title: 'Precision Server Room Air Conditioning Maintenance',
    customerName: 'Austin Data Hub',
    customerPhone: '(512) 440-9812',
    location: 'Austin, TX (901 E 5th St)',
    technicianId: 'TECH-01',
    technicianName: 'James Wilson',
    status: 'Completed',
    scheduledDate: 'Sep 16, 2026',
    scheduledTime: '09:00 AM',
    estimatedDuration: '3 Hours',
    priority: 'High',
    description: 'Replaced dual high-static fan belts, calibrated humidity sensors, tested N+1 redundant glycol circulation pumps.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 13, 08:00 AM', completed: true, active: false },
      { stage: 'Technician Assigned', timestamp: 'Sep 13, 10:00 AM', completed: true, active: false },
      { stage: 'Technician En Route', timestamp: 'Sep 16, 08:45 AM', completed: true, active: false },
      { stage: 'Work Started', timestamp: 'Sep 16, 09:05 AM', completed: true, active: false },
      { stage: 'Work Completed', timestamp: 'Sep 16, 11:45 AM', completed: true, active: false },
      { stage: 'Customer Confirmation', timestamp: 'Sep 16, 12:00 PM', completed: true, active: false },
      { stage: 'Invoice Generated', timestamp: 'Sep 16, 12:30 PM', completed: true, active: false }
    ],
    evidence: [
      {
        id: 'ev-4',
        title: 'Calibrated CRAC Humidity Sensor Readout',
        url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
        timestamp: 'Sep 16, 11:40 AM',
        type: 'After'
      }
    ]
  },
  {
    id: 'JOB-2035',
    title: 'Emergency Main Sewer Hydro-Jetting',
    customerName: 'Lone Star Hospitality Group',
    customerPhone: '(713) 555-8910',
    location: 'Houston, TX (3401 Kirby Dr)',
    technicianId: 'TECH-05',
    technicianName: 'Samira Patel',
    status: 'Completed',
    scheduledDate: 'Sep 14, 2026',
    scheduledTime: '06:30 AM',
    estimatedDuration: '4 Hours',
    priority: 'Urgent',
    description: 'Cleared heavy grease buildup in 6-inch lateral line using 4000 PSI hydro-jetting rig with rotary carbide cutter head.',
    timeline: [
      { stage: 'Quote Approved', timestamp: 'Sep 14, 05:45 AM', completed: true, active: false },
      { stage: 'Technician Assigned', timestamp: 'Sep 14, 06:00 AM', completed: true, active: false },
      { stage: 'Technician En Route', timestamp: 'Sep 14, 06:10 AM', completed: true, active: false },
      { stage: 'Work Started', timestamp: 'Sep 14, 06:35 AM', completed: true, active: false },
      { stage: 'Work Completed', timestamp: 'Sep 14, 10:15 AM', completed: true, active: false },
      { stage: 'Customer Confirmation', timestamp: 'Sep 14, 10:30 AM', completed: true, active: false },
      { stage: 'Invoice Generated', timestamp: 'Sep 14, 10:45 AM', completed: true, active: false }
    ],
    evidence: [
      {
        id: 'ev-5',
        title: 'Inspection Camera Screen Post-Jetting',
        url: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=500&auto=format&fit=crop&q=60',
        timestamp: 'Sep 14, 10:10 AM',
        type: 'After'
      }
    ]
  }
];

export const INITIAL_TECHNICIANS: Technician[] = [
  {
    id: 'TECH-01',
    name: 'James Wilson',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    specialization: 'HVAC & Refrigeration Specialist',
    phone: '(512) 774-0192',
    email: 'j.wilson@leadtoquote.ops',
    availability: 'On Job',
    currentJobId: 'JOB-2048',
    currentJobTitle: 'AC System Repair (Michael Carter)',
    currentJob: 'JOB-2048 AC System Repair',
    skills: ['HVAC Diagnostic', 'R-410A Systems', 'Compressor Testing', 'Controls'],
    jobsCompleted: 142,
    rating: 4.9,
    activeJobsCount: 3,
    certification: 'EPA Universal 608 & NATE Master Certified'
  },
  {
    id: 'TECH-02',
    name: 'Maria Lopez',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    specialization: 'Master Industrial Electrician',
    phone: '(713) 890-4412',
    email: 'm.lopez@leadtoquote.ops',
    availability: 'On Job',
    currentJobId: 'JOB-2045',
    currentJobTitle: 'Commercial 400A Panel Audit (Sarah Williams)',
    currentJob: 'JOB-2045 Commercial 400A Panel Audit',
    skills: ['Three-Phase Power', '400A Panels', 'Thermal Imaging', 'Surge Systems'],
    jobsCompleted: 118,
    rating: 4.95,
    activeJobsCount: 2,
    certification: 'Texas Master Electrician License #TECL-49102'
  },
  {
    id: 'TECH-03',
    name: 'Kevin Brooks',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    specialization: 'Commercial Piping & Backflow Specialist',
    phone: '(214) 662-8190',
    email: 'k.brooks@leadtoquote.ops',
    availability: 'Available',
    currentJob: 'Standby Dispatch Ready',
    skills: ['Backflow Testing', 'Pressure Regulators', 'Hydro-Jetting', 'Sewer Cam'],
    jobsCompleted: 87,
    rating: 4.85,
    activeJobsCount: 0,
    certification: 'ASSE 5110 Backflow Prevention Assembly Tester'
  },
  {
    id: 'TECH-04',
    name: 'Devon Reed',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    specialization: 'Hydronic Heating & Gas Systems',
    phone: '(210) 414-9920',
    email: 'd.reed@leadtoquote.ops',
    availability: 'On Job',
    currentJobId: 'JOB-2040',
    currentJobTitle: 'Hydronic Boiler Loop Valve Replacement',
    currentJob: 'JOB-2040 Hydronic Boiler Valve',
    skills: ['Hydronic Boilers', 'ASME Welding', 'Gas Piping', 'Heat Exchangers'],
    jobsCompleted: 94,
    rating: 4.88,
    activeJobsCount: 1,
    certification: 'State Board Licensed Plumber & ASME Welder'
  },
  {
    id: 'TECH-05',
    name: 'Samira Patel',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    specialization: 'Building Automation & Controls Engineer',
    phone: '(512) 331-7782',
    email: 's.patel@leadtoquote.ops',
    availability: 'Available',
    currentJob: 'Standby Dispatch Ready',
    skills: ['Niagara 4', 'BACnet Networks', 'VFD Tuning', 'Building IoT'],
    jobsCompleted: 64,
    rating: 4.92,
    activeJobsCount: 0,
    certification: 'Niagara 4 Certified & BACnet Controls Specialist'
  }
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: 'CUST-01',
    name: 'Michael Carter',
    company: 'Austin Crest Residence & Suites',
    email: 'm.carter@austincrest.com',
    phone: '(512) 840-2914',
    address: '742 Barton Springs Rd',
    location: 'Austin, TX',
    activeJobsCount: 1,
    totalSpent: 4850,
    lastServiceDate: 'Sep 18, 2026',
    status: 'Active',
    notes: 'Gate access code #4491. Prefers morning appointments between 9 AM - 12 PM.'
  },
  {
    id: 'CUST-02',
    name: 'Sarah Williams',
    company: 'Williams Holdings Management Corp',
    email: 'sarah.w@williamsholdings.org',
    phone: '(713) 492-7710',
    address: '1200 Post Oak Blvd',
    location: 'Houston, TX',
    activeJobsCount: 1,
    totalSpent: 18400,
    lastServiceDate: 'Sep 17, 2026',
    status: 'Vip',
    notes: 'Direct contact for multi-tenant commercial plaza. Invoices paid on Net 15 terms.'
  },
  {
    id: 'CUST-03',
    name: 'David Miller',
    company: 'Miller Residential Properties',
    email: 'david.miller@dallastech.net',
    phone: '(214) 738-9901',
    address: '3819 Maple Ave',
    location: 'Dallas, TX',
    activeJobsCount: 0,
    totalSpent: 2150,
    lastServiceDate: 'Aug 04, 2026',
    status: 'Active',
    notes: 'Interested in annual preventative maintenance agreement for 4 duplex units.'
  },
  {
    id: 'CUST-04',
    name: 'Robert Chen',
    company: 'Bayside Manor Hospitality',
    email: 'r.chen@baysidemanor.com',
    phone: '(512) 670-3419',
    address: '220 Congress Ave',
    location: 'Austin, TX',
    activeJobsCount: 1,
    totalSpent: 12900,
    lastServiceDate: 'Sep 12, 2026',
    status: 'Vip',
    notes: 'Requires 24-hr advance notice to security desk before rooftop crane/ladder access.'
  },
  {
    id: 'CUST-05',
    name: 'Elena Rostova',
    company: 'Luxury Living Design Studio',
    email: 'elena@luxurylivingtx.com',
    phone: '(210) 554-8832',
    address: '1540 River Walk Suite 300',
    location: 'San Antonio, TX',
    activeJobsCount: 0,
    totalSpent: 3200,
    lastServiceDate: 'Jul 28, 2026',
    status: 'Active',
    notes: 'Architectural client frequently recommending us for high-end home remodels.'
  },
  {
    id: 'CUST-06',
    name: 'Marcus Vance',
    company: 'Vance Bistro & Grill Group',
    email: 'vance.m@vancebistro.com',
    phone: '(817) 402-1198',
    address: '408 W 7th St',
    location: 'Fort Worth, TX',
    activeJobsCount: 0,
    totalSpent: 5900,
    lastServiceDate: 'Aug 15, 2026',
    status: 'Active',
    notes: 'Restaurant operations. Scheduled inspections must avoid lunch/dinner service rush.'
  },
  {
    id: 'CUST-07',
    name: 'Jessica Taylor',
    company: 'Taylor Architectural Design',
    email: 'jtaylor@taylordesign.studio',
    phone: '(512) 993-2281',
    address: '1108 S Lamar Blvd',
    location: 'Austin, TX',
    activeJobsCount: 0,
    totalSpent: 1200,
    lastServiceDate: 'Sep 14, 2026',
    status: 'Active',
    notes: 'Currently considering dual-zone heat pump proposal QT-1043.'
  },
  {
    id: 'CUST-08',
    name: 'Brandon Walsh',
    company: 'Beverly Freight & Logistics',
    email: 'bwalsh@beverlylogistics.com',
    phone: '(713) 621-0044',
    address: '8800 Kempwood Dr',
    location: 'Houston, TX',
    activeJobsCount: 0,
    totalSpent: 9400,
    lastServiceDate: 'Jun 19, 2026',
    status: 'Active',
    notes: 'Warehouse facility manager. New inquiry for Level 2 EV charging fleet infrastructure.'
  }
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'INV-3042',
    quoteId: 'QT-1042',
    jobId: 'JOB-2048',
    customerName: 'Michael Carter',
    customerEmail: 'm.carter@austincrest.com',
    customerAddress: '742 Barton Springs Rd, Austin, TX 78704',
    issueDate: 'Sep 22, 2026',
    dueDate: 'Sep 30, 2026',
    amount: 1096,
    status: 'Sent',
    lineItems: [
      { description: 'Certified HVAC Field Diagnostic & Repair Labor (2.5 hrs)', quantity: 2.5, unitPrice: 200, total: 500 },
      { description: 'Heavy-Duty 45/5 MFD Dual Run Capacitor & Contactor Switch', quantity: 1, unitPrice: 195, total: 195 },
      { description: 'R-410A Refrigerant Recharge (3 lbs)', quantity: 3, unitPrice: 75, total: 225 },
      { description: 'Expedited Urban Dispatch & Vehicle Tool Fee', quantity: 1, unitPrice: 80, total: 80 }
    ],
    subtotal: 1000,
    tax: 96,
    total: 1096
  },
  {
    id: 'INV-3040',
    quoteId: 'QT-1041',
    jobId: 'JOB-2045',
    customerName: 'Sarah Williams',
    customerEmail: 'sarah.w@williamsholdings.org',
    customerAddress: '1200 Post Oak Blvd, Houston, TX 77056',
    issueDate: 'Sep 17, 2026',
    dueDate: 'Oct 02, 2026',
    amount: 3085,
    status: 'Sent',
    lineItems: [
      { description: 'Master Electrician Field Diagnostics & Load Calculations', quantity: 6, unitPrice: 220, total: 1320 },
      { description: 'Type 1 Surge Protective Device (SPD) Panel Units', quantity: 2, unitPrice: 580, total: 1160 },
      { description: 'Copper Grounding Rods & Low-Impedance Bonding', quantity: 1, unitPrice: 190, total: 190 },
      { description: 'Van Dispatch & Specialized Test Equipment', quantity: 1, unitPrice: 90, total: 90 },
      { description: 'State Fire Marshal Compliance Documentation', quantity: 1, unitPrice: 90, total: 90 }
    ],
    subtotal: 2850,
    tax: 235,
    total: 3085
  },
  {
    id: 'INV-3038',
    quoteId: 'QT-1035',
    jobId: 'JOB-2038',
    customerName: 'Austin Data Hub',
    customerEmail: 'billing@austindatahub.com',
    customerAddress: '901 E 5th St, Austin, TX 78702',
    issueDate: 'Sep 16, 2026',
    dueDate: 'Sep 23, 2026',
    paidDate: 'Sep 17, 2026',
    amount: 1450,
    status: 'Paid',
    lineItems: [
      { description: 'High-Static Dual Fan Belts Replacement & Glycol Test', quantity: 1, unitPrice: 850, total: 850 },
      { description: 'Calibrated Humidity Sensors & Direct Digital Control Tune', quantity: 1, unitPrice: 480, total: 480 },
      { description: 'Trip Charge & Emergency Response Dispatch', quantity: 1, unitPrice: 120, total: 120 }
    ],
    subtotal: 1450,
    tax: 0,
    total: 1450
  },
  {
    id: 'INV-3035',
    quoteId: 'QT-1032',
    jobId: 'JOB-2035',
    customerName: 'Lone Star Hospitality Group',
    customerEmail: 'ap@lonestarhospitality.com',
    customerAddress: '3401 Kirby Dr, Houston, TX 77098',
    issueDate: 'Sep 14, 2026',
    dueDate: 'Sep 21, 2026',
    paidDate: 'Sep 15, 2026',
    amount: 2240,
    status: 'Paid',
    lineItems: [
      { description: 'Emergency High-Pressure Commercial Hydro-Jetting (4 hrs)', quantity: 4, unitPrice: 380, total: 1520 },
      { description: 'Digital Sewer Pipe Video Camera Inspection & Recording', quantity: 1, unitPrice: 520, total: 520 },
      { description: 'Bio-Enzymatic Line Degreaser Treatment', quantity: 1, unitPrice: 200, total: 200 }
    ],
    subtotal: 2240,
    tax: 0,
    total: 2240
  },
  {
    id: 'INV-3031',
    quoteId: 'QT-1028',
    jobId: 'JOB-2029',
    customerName: 'Robert Chen',
    customerEmail: 'r.chen@baysidemanor.com',
    customerAddress: '220 Congress Ave, Austin, TX 78701',
    issueDate: 'Aug 28, 2026',
    dueDate: 'Sep 11, 2026',
    amount: 3850,
    status: 'Overdue',
    lineItems: [
      { description: 'Primary Chiller Refrigerant Leak Isolation & Brazing', quantity: 1, unitPrice: 2400, total: 2400 },
      { description: 'Replacement Filter-Drier Core & Vacuum Dehydration', quantity: 1, unitPrice: 1150, total: 1150 },
      { description: 'Hazardous Refrigerant Reclamation Environmental Surcharge', quantity: 1, unitPrice: 300, total: 300 }
    ],
    subtotal: 3850,
    tax: 0,
    total: 3850
  },
  {
    id: 'INV-3030',
    quoteId: 'QT-1025',
    jobId: 'JOB-2022',
    customerName: 'Carlos Ramirez',
    customerEmail: 'carlos@ramirezproperties.com',
    customerAddress: '410 Broadway St, San Antonio, TX 78205',
    issueDate: 'Aug 24, 2026',
    dueDate: 'Sep 07, 2026',
    paidDate: 'Aug 30, 2026',
    amount: 1720,
    status: 'Paid',
    lineItems: [
      { description: 'Commercial Water Heater Thermocouple & Burner Assembly', quantity: 1, unitPrice: 1100, total: 1100 },
      { description: 'City Plumbing Safety Re-Inspection & Compliance Certificate', quantity: 1, unitPrice: 480, total: 480 },
      { description: 'Materials Disposal & Recycling', quantity: 1, unitPrice: 140, total: 140 }
    ],
    subtotal: 1720,
    tax: 0,
    total: 1720
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Quote QT-1042 Awaiting Approval',
    message: 'Michael Carter opened quote online for AC System Repair',
    time: '12m ago',
    read: false,
    type: 'quote' as const
  },
  {
    id: 'n2',
    title: 'Job JOB-2048 In Progress',
    message: 'James Wilson checked into Barton Springs Rd site',
    time: '45m ago',
    read: false,
    type: 'job' as const
  },
  {
    id: 'n3',
    title: 'Payment Settled for INV-3038',
    message: 'PKR 145,000 settled via commercial bank transfer',
    time: '2h ago',
    read: true,
    type: 'invoice' as const
  },
  {
    id: 'n4',
    title: 'New Lead Ingested',
    message: 'David Miller requested emergency main pressure regulator diagnostic',
    time: '3h ago',
    read: true,
    type: 'lead' as const
  }
];

