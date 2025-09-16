// Mock buyers API for Vercel deployment
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Mock buyers data
  const mockBuyers = [
    {
      id: '1',
      fullName: 'John Doe',
      email: 'john@example.com',
      phone: '9876543210',
      city: 'Chandigarh',
      propertyType: 'Apartment',
      bhk: 'Three',
      purpose: 'Buy',
      budgetMin: 5000000,
      budgetMax: 7000000,
      timeline: 'ZeroToThree',
      source: 'Website',
      status: 'New',
      notes: 'Looking for 3BHK apartment',
      tags: [],
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      fullName: 'Priya Sharma',
      email: 'priya@example.com',
      phone: '9811122233',
      city: 'Mohali',
      propertyType: 'Villa',
      bhk: 'Four',
      purpose: 'Buy',
      budgetMin: 12000000,
      budgetMax: 15000000,
      timeline: 'ThreeToSix',
      source: 'Referral',
      status: 'Contacted',
      notes: 'Prefers sea-facing villa',
      tags: [],
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-16T09:15:00Z'
    }
  ];
  
  if (req.method === 'GET') {
    const { page = 1, limit = 10, search = '', city = '', propertyType = '', status = '' } = req.query;
    
    let filteredBuyers = [...mockBuyers];
    
    // Apply filters
    if (search) {
      filteredBuyers = filteredBuyers.filter(buyer => 
        buyer.fullName.toLowerCase().includes(search.toLowerCase()) ||
        buyer.email.toLowerCase().includes(search.toLowerCase()) ||
        buyer.phone.includes(search)
      );
    }
    
    if (city) {
      filteredBuyers = filteredBuyers.filter(buyer => buyer.city === city);
    }
    
    if (propertyType) {
      filteredBuyers = filteredBuyers.filter(buyer => buyer.propertyType === propertyType);
    }
    
    if (status) {
      filteredBuyers = filteredBuyers.filter(buyer => buyer.status === status);
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBuyers = filteredBuyers.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      data: paginatedBuyers,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredBuyers.length,
        pages: Math.ceil(filteredBuyers.length / limit)
      }
    });
  }
  
  if (req.method === 'POST') {
    const newBuyer = {
      id: String(mockBuyers.length + 1),
      ...req.body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    return res.status(201).json({
      success: true,
      data: newBuyer
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
