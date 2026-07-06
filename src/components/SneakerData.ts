import { Sneaker } from '../types';

export const SNEAKER_CATALOG: Sneaker[] = [
  {
    id: 'phantom-one',
    name: 'ZEROX Phantom One',
    tagline: 'Challenging gravity with multi-layered responsive suspension.',
    price: 345,
    rating: 4.9,
    reviewsCount: 142,
    description: 'Designed for the modern creator, the ZEROX Phantom One merges high-fashion architectural aesthetics with double-stacked responsive foam pods. Its premium titanium-weave upper and hand-finished pastel suede overlays deliver a bold, futuristic look that commands attention. Engineered with an active heel stabilization clip, it cushions every landing and propels you forward.',
    category: 'Limited Drop',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Pastel Sorbet',
        hex: '#FED7D7',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Charcoal Eclipse',
        hex: '#2D3748',
        image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Arctic Ice',
        hex: '#E2E8F0',
        image: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13],
    specs: {
      weight: '295 grams (Size 9)',
      cushioning: 'Dual-Zone Air-Float™ responsive pods',
      offset: '8.0 mm (Heel: 32mm / Forefoot: 24mm)',
      propulsion: 'Curved responsive composite carbon shank'
    },
    features: [
      {
        title: 'Air-Float™ Cell Tech',
        description: 'Sealed nitrogen pods embedded in the midsole release elastic rebound energy upon compression.'
      },
      {
        title: 'Lock-Down Comfort Collar',
        description: 'Sculpted anatomical padding around the ankle wraps securely to avoid lateral heel slippage.'
      },
      {
        title: 'Gold Accent Aglets',
        description: 'Each lace is crowned with a solid machined, gold-plated tip carrying the debossed ZEROX icon.'
      }
    ]
  },
  {
    id: 'apex-x',
    name: 'ZEROX Apex-X',
    tagline: 'Engineered for extreme speed, refined for absolute luxury.',
    price: 290,
    rating: 4.8,
    reviewsCount: 218,
    description: 'The ZEROX Apex-X represents the purest expression of performance speed. Inspired by high-octane racing engineering, it incorporates a carbon fiber chassis within a featherlight chassis. The bold, classic red-and-white visual profile is constructed from premium Italian leather panels, polished by hand. It delivers razor-sharp stability, dynamic energy returns, and an unmistakable presence.',
    category: 'Performance',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Racing Red',
        hex: '#E53E3E',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Liquid Gold',
        hex: '#C9A227',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Stealth Black',
        hex: '#1A202C',
        image: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 13],
    specs: {
      weight: '260 grams (Size 9)',
      cushioning: 'Apex-React Carbonized Midsole Foam',
      offset: '6.0 mm (Heel: 28mm / Forefoot: 22mm)',
      propulsion: 'Z-Plate™ 100% Autoclaved Carbon Fiber plate'
    },
    features: [
      {
        title: 'Z-Plate™ Autoclave',
        description: 'A full-length pre-preg carbon fiber composite plate optimized to transition energy smoothly and maximize launch speed.'
      },
      {
        title: 'TetherWeave™ Upper',
        description: 'Woven with high-tensile polymer threads for a breathable, breathable second-skin fit that handles sudden multi-directional cuts.'
      },
      {
        title: 'Laser-Etched Gold Heel',
        description: 'Features a metallic-finish gold heel cup that provides rigid structural lock-down and a premium cinematic shine.'
      }
    ]
  },
  {
    id: 'carbon-obsidian',
    name: 'ZEROX Carbon Obsidian',
    tagline: 'Deep luxurious suede meets clean, high-contrast performance.',
    price: 320,
    rating: 5.0,
    reviewsCount: 96,
    description: 'A masterpiece of understated luxury. Crafted from dense, velvety, oil-treated charcoal suede, the ZEROX Carbon Obsidian is built for those who move confidently in silence. It features hand-stitched detailing, subtle gold accents, and a lightweight zero-gravity cupsole that conforms perfectly to your foot over time. Elegant, minimal, and premium in every detail.',
    category: 'Luxury',
    image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Obsidian Black',
        hex: '#2D3748',
        image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Sandstone Suede',
        hex: '#EDF2F7',
        image: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Midnight Core',
        hex: '#111827',
        image: 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [7, 8, 9, 10, 11, 12, 13],
    specs: {
      weight: '315 grams (Size 9)',
      cushioning: 'Density-Mapping Bio-Form™ Core',
      offset: '4.0 mm (Heel: 24mm / Forefoot: 20mm)',
      propulsion: 'Flexible vulcanized internal flex-grid'
    },
    features: [
      {
        title: 'Premium Velour Suede',
        description: 'Sourced from legendary Tuscan tanneries, the double-brushed suede is stain-resistant and exceptionally soft.'
      },
      {
        title: 'Internal Cork Footbed',
        description: 'A sustainable Portuguese cork insole shapes itself to your arch within days, providing custom orthopedic support.'
      },
      {
        title: 'Machined Gold Hardware',
        description: 'Exquisite 24-karat gold gold-plated eyelets offer a beautiful visual contrast and robust lace channeling.'
      }
    ]
  },
  {
    id: 'zenith-high',
    name: 'ZEROX Zenith High',
    tagline: 'Rewriting court culture with futuristic aerospace materials.',
    price: 380,
    rating: 4.9,
    reviewsCount: 184,
    description: 'The ZEROX Zenith High redefines high-top sneakers with an aerospace-inspired carbon structure. Combining classic court aesthetics with architectural side panels and deep blue mesh liners, it offers complete ankle support without restricting movement. Its dynamic multi-tier lacing allows customized tension control, ensuring a snug fit for dreamers climbing towards new peaks.',
    category: 'Futuristic',
    image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Cyber Royal',
        hex: '#3182CE',
        image: 'https://images.unsplash.com/photo-1597045566677-8cf032ed6634?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Volcanic Red',
        hex: '#C53030',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Monochrome Frost',
        hex: '#CBD5E0',
        image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13],
    specs: {
      weight: '340 grams (Size 9)',
      cushioning: 'Apex-React High-Density Court Compound',
      offset: '9.0 mm (Heel: 35mm / Forefoot: 26mm)',
      propulsion: 'Interlocking structural composite chassis'
    },
    features: [
      {
        title: 'Aerospace Core Shell',
        description: 'A structural thermo-formed frame wraps around the heel, delivering incredible lateral stability for maximum safety.'
      },
      {
        title: 'Dual-Zone Tension Lacing',
        description: 'Anodized steel lock-clasps isolate lower-foot tension from ankle-support adjustment.'
      },
      {
        title: 'Reflective Carbon Ribs',
        description: 'Woven carbon fiber detailing on the side panel reflects bright cinematic lighting under camera flashes.'
      }
    ]
  },
  {
    id: 'aurora-forest',
    name: 'ZEROX Aurora Forest',
    tagline: 'Rich emerald suede engineered with a low-profile stance.',
    price: 260,
    rating: 4.7,
    reviewsCount: 88,
    description: 'An elite low-profile silhouette featuring luxurious double-brushed emerald green suede and gold leaf branding. Built for those who walk between the borders of performance skate culture and high-fashion streetwear. Engineered with a flat-ground carbon grip-pattern outsole and zero-gravity impact-absorbing insoles, it represents a bold premium lifestyle that breaks bounds.',
    category: 'Limited Drop',
    image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Emerald Suede',
        hex: '#2F855A',
        image: 'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Aurora Volt',
        hex: '#48BB78',
        image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [7, 8, 8.5, 9, 9.5, 10, 10.5, 11, 12],
    specs: {
      weight: '280 grams (Size 9)',
      cushioning: 'Shock-Absorb™ internal gel puck',
      offset: '4.0 mm (Heel: 20mm / Forefoot: 16mm)',
      propulsion: 'Reinforced low-profile gum chassis'
    },
    features: [
      {
        title: 'Tuscan Suede Sourcing',
        description: 'Handpicked raw emerald leathers treated with hydrophobic protective wax coatings.'
      },
      {
        title: 'Hex-Grip Carbon Sole',
        description: 'Features carbonized rubber in a custom honeycomb grip pattern for extreme tactile board connection.'
      },
      {
        title: 'Gold Leaf Debossing',
        description: 'The iconic ZEROX insignia is hot-stamped into the side panel using ultra-thin 24k gold leaf film.'
      }
    ]
  },
  {
    id: 'chronos-gold',
    name: 'ZEROX Chronos Gold',
    tagline: 'High-luxury visual design crafted with absolute performance.',
    price: 410,
    rating: 5.0,
    reviewsCount: 112,
    description: 'The pinnacle of the ZEROX line. The Chronos Gold features a stunning high-contrast white leather and premium gold visual frame. It is engineered with a proprietary carbon propulsion block under the foot and a transparent structural heel clip. Perfect for the global elite who demand state-of-the-art sports science combined with editorial prestige.',
    category: 'Futuristic',
    image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=85',
    colorways: [
      {
        name: 'Elite Gold',
        hex: '#D69E2E',
        image: 'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=1000&q=85'
      },
      {
        name: 'Chrono White',
        hex: '#F7FAFC',
        image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=1000&q=85'
      }
    ],
    sizes: [8, 8.5, 9, 9.5, 10, 10.5, 11, 12, 13],
    specs: {
      weight: '275 grams (Size 9)',
      cushioning: 'Apex-React Air-Spring Cushioning',
      offset: '7.0 mm (Heel: 33mm / Forefoot: 26mm)',
      propulsion: 'Z-Plate™ Speed Chassis with visual gold carbon core'
    },
    features: [
      {
        title: 'Chronos Speed Chassis',
        description: 'An exposed structural carbon fiber bridge reinforces the midfoot while dramatically reducing total weight.'
      },
      {
        title: 'Prime-Knit Premium upper',
        description: 'Precision-engineered knitting pattern provides structural support in heavy-wear zones and maximum air cooling in others.'
      },
      {
        title: 'Polished Metallic Detailing',
        description: 'Stunning triple-plated gold chrome accent panel shields the heel, reflecting light dynamically on every stride.'
      }
    ]
  }
];
