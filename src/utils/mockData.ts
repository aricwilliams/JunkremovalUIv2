import { Customer, Job, Lead, Crew, PricingItem, Analytics } from '../types';

export const generateMockData = () => {
  const customers: Customer[] = [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '(555) 123-4567',
      address: '123 Front St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      created: new Date('2024-01-15'),
      status: 'completed',
      tags: ['VIP', 'recurring'],
      notes: 'Prefers morning appointments'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      phone: '(555) 987-6543',
      address: '456 Market St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      created: new Date('2024-01-20'),
      status: 'scheduled',
      tags: ['hot lead'],
      notes: 'Large cleanout job'
    },
    {
      id: '3',
      name: 'Michael Brown',
      email: 'mike.brown@email.com',
      phone: '(555) 456-7890',
      address: '789 Wrightsville Ave',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      created: new Date('2024-01-25'),
      status: 'quoted',
      tags: ['follow-up'],
      notes: 'Beach house cleanout'
    },
    {
      id: '4',
      name: 'Jennifer Davis',
      email: 'jen.davis@email.com',
      phone: '(555) 234-5678',
      address: '321 Oleander Dr',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      created: new Date('2024-02-01'),
      status: 'new',
      tags: ['urgent'],
      notes: 'Estate cleanout near UNCW'
    },
    {
      id: '5',
      name: 'Robert Wilson',
      email: 'bob.wilson@email.com',
      phone: '(555) 345-6789',
      address: '654 College Rd',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      created: new Date('2024-02-05'),
      status: 'completed',
      tags: ['commercial'],
      notes: 'Student housing cleanout'
    }
  ];

  const jobs: Job[] = [
    {
      id: '1',
      customerId: '1',
      customerName: 'John Smith',
      customerPhone: '(555) 123-4567',
      customerEmail: 'john.smith@email.com',
      address: '123 Front St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      latitude: 34.2257,
      longitude: -77.9447,
      scheduledDate: new Date('2024-01-25'),
      timeSlot: '9:00 AM - 11:00 AM',
      estimatedHours: 2,
      items: [
        { id: '1', name: 'Couch', category: 'furniture', quantity: 1, basePrice: 50, difficulty: 'medium', estimatedTime: 30 },
        { id: '2', name: 'Mattress', category: 'furniture', quantity: 1, basePrice: 35, difficulty: 'easy', estimatedTime: 15 }
      ],
      status: 'completed',
      crewId: '1',
      totalEstimate: 125,
      actualTotal: 125,
      notes: 'Downtown apartment cleanout',
      beforePhotos: ['https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg?auto=compress&cs=tinysrgb&w=300'],
      afterPhotos: ['https://images.pexels.com/photos/1571463/pexels-photo-1571463.jpeg?auto=compress&cs=tinysrgb&w=300'],
      created: new Date('2024-01-20'),
      updated: new Date('2024-01-25')
    },
    {
      id: '2',
      customerId: '2',
      customerName: 'Sarah Johnson',
      customerPhone: '(555) 987-6543',
      customerEmail: 'sarah.j@email.com',
      address: '456 Market St',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28401',
      latitude: 34.2357,
      longitude: -77.9347,
      scheduledDate: new Date(),
      timeSlot: '2:00 PM - 4:00 PM',
      estimatedHours: 3,
      items: [
        { id: '3', name: 'Refrigerator', category: 'appliances', quantity: 1, basePrice: 75, difficulty: 'hard', estimatedTime: 45 },
        { id: '4', name: 'TV (Large)', category: 'electronics', quantity: 2, basePrice: 40, difficulty: 'medium', estimatedTime: 20 }
      ],
      status: 'scheduled',
      crewId: '2',
      totalEstimate: 155,
      notes: 'Historic district home renovation',
      beforePhotos: [],
      afterPhotos: [],
      created: new Date('2024-01-22'),
      updated: new Date('2024-01-22')
    },
    {
      id: '3',
      customerId: '3',
      customerName: 'Michael Brown',
      customerPhone: '(555) 456-7890',
      customerEmail: 'mike.brown@email.com',
      address: '789 Wrightsville Ave',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      latitude: 34.2157,
      longitude: -77.9547,
      scheduledDate: new Date(new Date().getTime() + 24 * 60 * 60 * 1000),
      timeSlot: '10:00 AM - 12:00 PM',
      estimatedHours: 4,
      items: [
        { id: '1', name: 'Couch', category: 'furniture', quantity: 2, basePrice: 50, difficulty: 'medium', estimatedTime: 30 },
        { id: '2', name: 'Mattress', category: 'furniture', quantity: 3, basePrice: 35, difficulty: 'easy', estimatedTime: 15 },
        { id: '5', name: 'Desk', category: 'furniture', quantity: 1, basePrice: 45, difficulty: 'medium', estimatedTime: 25 }
      ],
      status: 'scheduled',
      crewId: '1',
      totalEstimate: 250,
      notes: 'Beach house cleanout',
      beforePhotos: [],
      afterPhotos: [],
      created: new Date('2024-01-25'),
      updated: new Date('2024-01-25')
    },
    {
      id: '4',
      customerId: '4',
      customerName: 'Jennifer Davis',
      customerPhone: '(555) 234-5678',
      customerEmail: 'jen.davis@email.com',
      address: '321 Oleander Dr',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      latitude: 34.2457,
      longitude: -77.9247,
      scheduledDate: new Date(new Date().getTime() + 2 * 24 * 60 * 60 * 1000),
      timeSlot: '1:00 PM - 3:00 PM',
      estimatedHours: 5,
      items: [
        { id: '6', name: 'Washer/Dryer', category: 'appliances', quantity: 1, basePrice: 65, difficulty: 'hard', estimatedTime: 35 },
        { id: '7', name: 'Hot Tub', category: 'outdoor', quantity: 1, basePrice: 200, difficulty: 'hard', estimatedTime: 120 },
        { id: '8', name: 'Exercise Equipment', category: 'fitness', quantity: 2, basePrice: 55, difficulty: 'medium', estimatedTime: 30 }
      ],
      status: 'in-progress',
      crewId: '3',
      totalEstimate: 430,
      notes: 'Estate cleanout near UNCW',
      beforePhotos: [],
      afterPhotos: [],
      created: new Date('2024-02-01'),
      updated: new Date('2024-02-01')
    },
    {
      id: '5',
      customerId: '5',
      customerName: 'Robert Wilson',
      customerPhone: '(555) 345-6789',
      customerEmail: 'bob.wilson@email.com',
      address: '654 College Rd',
      city: 'Wilmington',
      state: 'NC',
      zipCode: '28403',
      latitude: 34.2057,
      longitude: -77.9647,
      scheduledDate: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      timeSlot: '11:00 AM - 1:00 PM',
      estimatedHours: 3,
      items: [
        { id: '1', name: 'Couch', category: 'furniture', quantity: 3, basePrice: 50, difficulty: 'medium', estimatedTime: 30 },
        { id: '4', name: 'TV (Large)', category: 'electronics', quantity: 4, basePrice: 40, difficulty: 'medium', estimatedTime: 20 },
        { id: '5', name: 'Desk', category: 'furniture', quantity: 2, basePrice: 45, difficulty: 'medium', estimatedTime: 25 }
      ],
      status: 'completed',
      crewId: '1',
      totalEstimate: 350,
      actualTotal: 350,
      notes: 'Student housing cleanout',
      beforePhotos: [],
      afterPhotos: [],
      created: new Date('2024-02-05'),
      updated: new Date('2024-02-06')
    }
  ];

  const leads: Lead[] = [
    {
      id: '1',
      name: 'Mike Wilson',
      email: 'mike.wilson@email.com',
      phone: '(555) 456-7890',
      address: '789 Pine St, Chapel Hill, NC',
      source: 'google',
      status: 'new',
      created: new Date(),
      notes: 'Basement cleanout needed',
      estimatedValue: 300
    },
    {
      id: '2',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@email.com',
      phone: '(555) 567-8901',
      address: '321 Cedar Ln, Cary, NC',
      source: 'yelp',
      status: 'contacted',
      created: new Date(new Date().getTime() - 24 * 60 * 60 * 1000),
      notes: 'Garage cleanout, very interested',
      estimatedValue: 450
    },
    {
      id: '3',
      name: 'David Martinez',
      email: 'david.martinez@email.com',
      phone: '(555) 678-9012',
      address: '987 Birch Ave, Apex, NC',
      source: 'referral',
      status: 'quoted',
      created: new Date(new Date().getTime() - 2 * 24 * 60 * 60 * 1000),
      notes: 'Office furniture removal',
      estimatedValue: 600
    },
    {
      id: '4',
      name: 'Amy Thompson',
      email: 'amy.thompson@email.com',
      phone: '(555) 789-0123',
      address: '456 Spruce St, Morrisville, NC',
      source: 'website',
      status: 'new',
      created: new Date(new Date().getTime() - 3 * 24 * 60 * 60 * 1000),
      notes: 'Hot tub removal',
      estimatedValue: 200
    },
    {
      id: '5',
      name: 'Chris Parker',
      email: 'chris.parker@email.com',
      phone: '(555) 890-1234',
      address: '123 Willow Rd, Holly Springs, NC',
      source: 'facebook',
      status: 'lost',
      created: new Date(new Date().getTime() - 5 * 24 * 60 * 60 * 1000),
      notes: 'Went with competitor',
      estimatedValue: 350
    }
  ];

  const crews: Crew[] = [
    {
      id: '1',
      name: 'Alpha Team',
      members: ['John Doe', 'Jane Smith'],
      capacity: 2,
      isAvailable: true
    },
    {
      id: '2',
      name: 'Beta Team',
      members: ['Bob Johnson', 'Alice Brown'],
      capacity: 2,
      isAvailable: false,
      currentJob: '2'
    },
    {
      id: '3',
      name: 'Gamma Team',
      members: ['Charlie Wilson', 'Diana Ross'],
      capacity: 2,
      isAvailable: true
    }
  ];

  const pricingItems: PricingItem[] = [
    {
      id: '1',
      name: 'Couch/Sofa',
      category: 'furniture',
      basePrice: 50,
      pricePerUnit: 50,
      estimatedTime: 30,
      difficulty: 'medium',
      description: 'Standard couch or sofa removal'
    },
    {
      id: '2',
      name: 'Mattress',
      category: 'furniture',
      basePrice: 35,
      pricePerUnit: 35,
      estimatedTime: 15,
      difficulty: 'easy',
      description: 'Mattress removal and disposal'
    },
    {
      id: '3',
      name: 'Refrigerator',
      category: 'appliances',
      basePrice: 75,
      pricePerUnit: 75,
      estimatedTime: 45,
      difficulty: 'hard',
      description: 'Refrigerator removal with proper disposal'
    },
    {
      id: '4',
      name: 'TV (Large)',
      category: 'electronics',
      basePrice: 40,
      pricePerUnit: 40,
      estimatedTime: 20,
      difficulty: 'medium',
      description: 'Large TV removal and recycling'
    },
    {
      id: '5',
      name: 'Desk',
      category: 'furniture',
      basePrice: 45,
      pricePerUnit: 45,
      estimatedTime: 25,
      difficulty: 'medium',
      description: 'Office or home desk removal'
    },
    {
      id: '6',
      name: 'Washer/Dryer',
      category: 'appliances',
      basePrice: 65,
      pricePerUnit: 65,
      estimatedTime: 35,
      difficulty: 'hard',
      description: 'Washing machine or dryer removal'
    },
    {
      id: '7',
      name: 'Hot Tub',
      category: 'outdoor',
      basePrice: 200,
      pricePerUnit: 200,
      estimatedTime: 120,
      difficulty: 'hard',
      description: 'Hot tub removal and disposal'
    },
    {
      id: '8',
      name: 'Exercise Equipment',
      category: 'fitness',
      basePrice: 55,
      pricePerUnit: 55,
      estimatedTime: 30,
      difficulty: 'medium',
      description: 'Treadmill, weights, etc.'
    }
  ];

  const analytics: Analytics = {
    totalRevenue: 45600,
    totalJobs: 156,
    averageJobValue: 292,
    completionRate: 0.94,
    customerSatisfaction: 4.7,
    monthlyRevenue: [6200, 7800, 8200, 6900, 8400, 8000],
    jobsBySource: {
      'google': 42,
      'yelp': 28,
      'referral': 35,
      'website': 24,
      'facebook': 18,
      'other': 9
    },
    topServices: [
      { name: 'Full Cleanout', count: 45, revenue: 18500 },
      { name: 'Furniture Removal', count: 62, revenue: 12800 },
      { name: 'Appliance Removal', count: 38, revenue: 9400 },
      { name: 'Electronics Disposal', count: 28, revenue: 4900 }
    ]
  };

  return {
    customers,
    jobs,
    leads,
    crews,
    pricingItems,
    analytics
  };
};