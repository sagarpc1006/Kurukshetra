// Centralized Mock Data for EcoTrail Authenticated Home & Travel Planning
// Structured for seamless future replacement with Django REST Framework & PostgreSQL

export const mockTravelPreferences = {
  ecoPriority: 'High',
  ecoPriorityDescription: 'Prioritize low-emission trains & certified eco-stays',
  budget: '₹10,000',
  budgetRaw: 10000,
  transportPreference: 'Public Transport',
  transportModes: ['Electric Rail', 'Shared EV', 'Walking Routes'],
  accessibility: 'Required',
  accessibilityDetails: ['Step-free access', 'Verified elevators', 'Audio assistance'],
};

export const mockRecentTrips = [
  {
    id: 'trip-1',
    origin: 'Pune',
    destination: 'Goa',
    duration: '3 Days',
    travelDates: '18 Oct — 21 Oct',
    transport: 'Vande Bharat Electric Rail',
    totalCost: '₹7,650',
    costValue: 7650,
    carbonEmissions: '31 kg CO₂',
    carbonSaved: '84 kg CO₂ saved vs flight',
    ecoScore: 91,
    status: 'Completed',
    stays: 'Earthling Eco Resort (Verified Clean & Accessible)',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=600&q=80',
  },
  {
    id: 'trip-2',
    origin: 'Mumbai',
    destination: 'Munnar',
    duration: '4 Days',
    travelDates: '04 Nov — 08 Nov',
    transport: 'Overnight Rail + Electric Cab',
    totalCost: '₹9,200',
    costValue: 9200,
    carbonEmissions: '42 kg CO₂',
    carbonSaved: '110 kg CO₂ saved vs flight',
    ecoScore: 88,
    status: 'Saved',
    stays: 'Tea Valley Low-Impact Lodge',
    coverImage: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=600&q=80',
  },
];

export const mockEcoImpact = {
  co2SavedKg: 24.6,
  greenTripsCount: 3,
  treesEquivalent: 4,
  coalAvoidedKg: 11.2,
  isExample: true, // Clearly marked as example preview until real backend trips exist
};

export const mockEcoScore = {
  overallScore: 91,
  maxScore: 100,
  level: 'Eco Pioneer',
  breakdown: [
    { label: 'Carbon Emissions', weight: '40%', score: 95, icon: '🌿' },
    { label: 'Accessibility', weight: '30%', score: 92, icon: '♿' },
    { label: 'Cost Efficiency', weight: '15%', score: 86, icon: '💰' },
    { label: 'Travel Time', weight: '15%', score: 85, icon: '⏱️' },
  ],
  formulaNote: 'Calculated as: 40% Carbon + 30% Accessibility + 15% Cost + 15% Time',
};

export const quickPrompts = [
  {
    id: 'greenest',
    icon: '🌱',
    tag: 'Greenest route',
    query: 'Find the greenest way to Goa with verified low-emission stays',
  },
  {
    id: 'budget',
    icon: '💰',
    tag: 'Budget travel',
    query: 'Plan a scenic 3-day trip under ₹10,000 using public transport',
  },
  {
    id: 'accessible',
    icon: '♿',
    tag: 'Accessible travel',
    query: 'Plan an accessible trip to Mumbai with step-free transport and hotels',
  },
  {
    id: 'carbon',
    icon: '🌍',
    tag: 'Carbon budget',
    query: 'Plan a weekend trip with carbon footprint strictly under 20 kg CO₂',
  },
  {
    id: 'weather',
    icon: '☀️',
    tag: 'Weather-aware',
    query: 'Plan my trip based on pleasant weather and lower seasonal crowds',
  },
];

export const mockTravelRecommendation = {
  query: 'Pune to Goa for 3 days under ₹10,000',
  assistantCommentary: "Great choice! I've crafted an Eco-Twin itinerary that balances cost, comfort, carbon emissions, and accessibility.",
  route: {
    origin: 'Pune Junction',
    destination: 'Madgaon, Goa',
    recommendedTransport: 'Konkan Scenic Rail (Electric AC Chair Car)',
    duration: '6 hrs 45 mins',
    price: '₹1,420 (Round-trip transport)',
    totalEstimatedBudget: '₹7,850 for 3 days',
    carbonEmissions: '19.4 kg CO₂',
    carbonComparison: '−78% vs flight (saves 68 kg CO₂)',
    ecoScore: 93,
    accessibility: 'Step-free boarding, dedicated ramps, accessible restroom coaches',
  },
  ecoTwinComparison: {
    regularOption: {
      title: 'Standard Flight + City Cab',
      cost: '₹7,200 travel alone',
      emissions: '92 kg CO₂',
      accessibility: 'Varies by terminal / baggage wait required',
    },
    ecoOption: {
      title: 'Konkan Eco-Rail + Local Electric Ferry',
      cost: '₹1,420 travel (₹5,780 saved for local experiences)',
      emissions: '19.4 kg CO₂',
      accessibility: 'Guaranteed ramp access & vetted accessible stays',
    },
  },
  suggestedStay: {
    name: 'Palolem Sol Eco-Cottages',
    rating: '4.9 ★',
    tag: 'Solar-powered · Zero single-use plastic',
    pricePerNight: '₹2,100/night',
  },
};
