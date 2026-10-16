import { MockCatalogItem } from './types';

export const MOCK_CATALOG: MockCatalogItem[] = [
  // FLIGHTS
  {
    id: 'f1',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Cebu (CEB) - Cebu Pacific',
    price: 3500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1518042459461-8b012ebbc694?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.cebupacificair.com',
    location: 'Cebu, Philippines'
  },
  {
    id: 'f2',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Davao (DVO) - Philippine Airlines',
    price: 4200,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.philippineairlines.com',
    location: 'Davao, Philippines'
  },
  {
    id: 'f3',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Boracay (MPH) - AirAsia',
    price: 3800,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.airasia.com',
    location: 'Boracay, Philippines'
  },
  {
    id: 'f4',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Singapore (SIN) - Cebu Pacific',
    price: 8500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.cebupacificair.com',
    location: 'Singapore'
  },
  {
    id: 'f5',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Tokyo (NRT) - Philippine Airlines',
    price: 18500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.philippineairlines.com',
    location: 'Tokyo, Japan'
  },
  {
    id: 'f6',
    category: 'FLIGHT',
    name: 'Cebu (CEB) to Manila (MNL) - AirAsia',
    price: 3200,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1577717903315-1691ae25ab3f?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.airasia.com',
    location: 'Manila, Philippines'
  },
  {
    id: 'f7',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Puerto Princesa (PPS) - Cebu Pacific',
    price: 4100,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1523995462485-3d171b5c8fa9?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.cebupacificair.com',
    location: 'Palawan, Philippines'
  },
  {
    id: 'f8',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Bohol (TAG) - AirAsia',
    price: 3900,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.airasia.com',
    location: 'Bohol, Philippines'
  },
  {
    id: 'f9',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Hong Kong (HKG) - Cebu Pacific',
    price: 7200,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1529921847247-8b8b1bc060f0?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.cebupacificair.com',
    location: 'Hong Kong'
  },
  {
    id: 'f10',
    category: 'FLIGHT',
    name: 'Manila (MNL) to Bangkok (BKK) - Philippine Airlines',
    price: 9500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1508009603885-24740263f3cc?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.philippineairlines.com',
    location: 'Bangkok, Thailand'
  },

  // HOTELS
  {
    id: 'h1',
    category: 'HOTEL',
    name: 'Shangri-La Mactan Resort & Spa',
    price: 15500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.booking.com',
    location: 'Cebu, Philippines'
  },
  {
    id: 'h2',
    category: 'HOTEL',
    name: 'The Lind Boracay',
    price: 18000,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.agoda.com',
    location: 'Boracay, Philippines'
  },
  {
    id: 'h3',
    category: 'HOTEL',
    name: 'The Manor at Camp John Hay',
    price: 7500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.booking.com',
    location: 'Baguio, Philippines'
  },
  {
    id: 'h4',
    category: 'HOTEL',
    name: 'El Nido Resorts Miniloc Island',
    price: 25000,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.agoda.com',
    location: 'Palawan, Philippines'
  },
  {
    id: 'h5',
    category: 'HOTEL',
    name: 'Nay Palad Hideaway',
    price: 35000,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.booking.com',
    location: 'Siargao, Philippines'
  },
  {
    id: 'h6',
    category: 'HOTEL',
    name: 'Taal Vista Hotel',
    price: 6500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1618773928120-221087cf2896?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.agoda.com',
    location: 'Tagaytay, Philippines'
  },
  {
    id: 'h7',
    category: 'HOTEL',
    name: 'Amorita Resort',
    price: 11000,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.booking.com',
    location: 'Bohol, Philippines'
  },
  {
    id: 'h8',
    category: 'HOTEL',
    name: 'Pearl Farm Beach Resort',
    price: 12500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.agoda.com',
    location: 'Davao, Philippines'
  },
  {
    id: 'h9',
    category: 'HOTEL',
    name: 'Hotel Luna',
    price: 5500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1551882547-ff40c0d509af?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.booking.com',
    location: 'Vigan, Philippines'
  },
  {
    id: 'h10',
    category: 'HOTEL',
    name: 'Courtyard by Marriott Iloilo',
    price: 6000,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.agoda.com',
    location: 'Iloilo, Philippines'
  },

  // ECOMMERCE
  {
    id: 'e1',
    category: 'ECOMMERCE',
    name: 'Apple iPhone 15 Pro (256GB) - Titanium',
    price: 76990,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.apple.com/ph',
  },
  {
    id: 'e2',
    category: 'ECOMMERCE',
    name: 'Apple MacBook Air M2 (13-inch, 256GB)',
    price: 69990,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.apple.com/ph',
  },
  {
    id: 'e3',
    category: 'ECOMMERCE',
    name: 'Sony WH-1000XM5 Wireless Noise Canceling Headphones',
    price: 19999,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.lazada.com.ph',
  },
  {
    id: 'e4',
    category: 'ECOMMERCE',
    name: 'Herschel Little America Backpack',
    price: 6490,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.shopee.ph',
  },
  {
    id: 'e5',
    category: 'ECOMMERCE',
    name: 'Nike Air Force 1 \'07',
    price: 5495,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.nike.com/ph',
  },
  {
    id: 'e6',
    category: 'ECOMMERCE',
    name: 'Garmin Forerunner 265 Smartwatch',
    price: 28990,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.lazada.com.ph',
  },
  {
    id: 'e7',
    category: 'ECOMMERCE',
    name: 'Philips Premium Airfryer XXL',
    price: 15995,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1626200419199-391ae4be7a41?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.shopee.ph',
  },
  {
    id: 'e8',
    category: 'ECOMMERCE',
    name: 'NutriBullet Pro 900W Blender',
    price: 5990,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1585237672814-7f05068bc5ce?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.lazada.com.ph',
  },
  {
    id: 'e9',
    category: 'ECOMMERCE',
    name: 'LG 27" UltraGear QHD IPS Gaming Monitor',
    price: 18500,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.lazada.com.ph',
  },
  {
    id: 'e10',
    category: 'ECOMMERCE',
    name: 'PlayStation 5 Console (Disc Edition)',
    price: 30790,
    currency: 'PHP',
    imageUrl: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?q=80&w=600&auto=format&fit=crop',
    sourceUrl: 'https://www.shopee.ph',
  }
];
