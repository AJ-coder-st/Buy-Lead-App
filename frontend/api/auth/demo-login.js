// Mock demo login API for Vercel deployment
export default function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method === 'POST') {
    // Mock successful login response
    const mockUser = {
      id: 'demo-user-123',
      email: 'demo@buyapp.com',
      name: 'Demo User',
      role: 'admin'
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return res.status(200).json({
      success: true,
      token: mockToken,
      user: mockUser
    });
  }
  
  return res.status(405).json({ error: 'Method not allowed' });
}
