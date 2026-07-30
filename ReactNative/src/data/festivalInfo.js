/**
 * Festival information content for the Info screen.
 * Sourced from the organizer's FESTIVAL GUIDE (2026 SOVRA edition, updated).
 *
 * Each section has: id, title, icon (InfoIcon name), and `content` — an array of
 * blocks. A block is either a plain string (rendered as a paragraph) or a typed
 * object:
 *   { t: 'sub',     text }            → sub-heading inside the section
 *   { t: 'note',    text }            → highlighted callout
 *   { t: 'hours',   rows: [[l, r]] }  → two-column day → time table
 *   { t: 'steps',   items: [...] }    → numbered steps
 *   { t: 'bullets', items: [...] }    → bulleted list
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * Essential Info, Stages & Venues and the FAQ are app-authored and not in the
 * guide; everything else mirrors the guide. The Healing Zone booking flow is
 * intentionally omitted (organizer request) — the Healing Zone has its own screen.
 * Gate hours: the guide's "Thu 6 – Sat 9 Aug" is a day/date slip (9 Aug is a
 * Sunday) — corrected here to "Thu 6 – Sat 8 Aug", with Sun 9 Aug on its own row.
 * ─────────────────────────────────────────────────────────────────────────────
 */

export const festivalSections = [
  {
    id: 'essential',
    title: 'Essential Info',
    icon: 'star',
    content: [
      'Gates open at 14:00 on Sunday, August 2 — the day before the programme begins.',
      'Your wristband shows you have a ticket. Depending on which one you bought, it grants access to part of the festival or the whole event. Keep it on at all times — lost wristbands cannot be replaced.',
      'Please bring a valid photo ID (passport or driver\'s license). You will need it at check-in and may be asked to show it at any time.',
      'The festival is cashless. Pick up your festival card at the Info / Office point (registration) — marked on the map — and pay at every point on site with it, no cash or bank cards at the bars or stands. Top up with cash or card at any Top-Up station.',
    ],
  },
  {
    id: 'working-hours',
    title: 'Working Hours',
    icon: 'clock',
    content: [
      { t: 'sub', text: 'Gate' },
      { t: 'hours', rows: [
        ['Sun 2 Aug', '14:00 – 00:00'],
        ['Mon 3 – Wed 5 Aug', '08:00 – 00:00'],
        ['Thu 6 – Sat 8 Aug', '08:00 – 02:00'],
        ['Sun 9 Aug', '08:00 – 16:00'],
      ] },
      { t: 'note', text: 'If you arrive during late-night hours when the gate is closed, our gate staff will contact the responsible team member to help you with entry.' },

      { t: 'sub', text: 'Pyramid Village Camp' },
      { t: 'hours', rows: [
        ['Sun 2 – Mon 10 Aug', '14:00 – 20:00'],
      ] },

      { t: 'sub', text: 'Info, Office, Accommodation & Adventure Tours' },
      { t: 'hours', rows: [
        ['Sun 2 Aug', '14:00 – 00:00'],
        ['Mon 3 – Sun 9 Aug', '08:00 – 00:00'],
      ] },

      { t: 'sub', text: 'Tokens & Cashless Top-Up' },
      { t: 'hours', rows: [
        ['Sun 2 Aug', '14:00 – 00:00'],
        ['Mon 3 – Wed 5 Aug', '08:00 – 00:00'],
        ['Thu 6 – Sun 9 Aug', '24h'],
      ] },

      { t: 'sub', text: 'Food Court' },
      { t: 'hours', rows: [
        ['Sun 2 Aug', '14:00 – 00:00'],
        ['Mon 3 – Sun 9 Aug', '08:00 – 02:00'],
      ] },
      { t: 'note', text: 'Food Court breaks — Sun 2 Aug: 19:00–20:00. Mon 3 – Sun 9 Aug: 13:00–14:00 & 19:00–20:00.' },

      { t: 'sub', text: 'Fresh & Café' },
      { t: 'hours', rows: [
        ['Mon 3 – Sun 9 Aug', '07:00 – 00:00'],
      ] },

      { t: 'sub', text: 'TOK Stage Bar' },
      { t: 'hours', rows: [
        ['Mon 3 – Wed 5 Aug', '08:00 – 01:00'],
        ['Thu 6 – Sun 9 Aug', '24h'],
        ['Mon 10 Aug', 'until 08:00'],
      ] },

      { t: 'sub', text: 'KOLO Stage Bar' },
      { t: 'hours', rows: [
        ['Thu 6 Aug', '17:00 – 06:00'],
        ['Fri 7 – Sat 8 Aug', '14:00 – 06:00'],
        ['Sat 8 – Sun 9 Aug', '14:00 – 19:00'],
      ] },

      { t: 'sub', text: 'Psy-Care & First Aid' },
      { t: 'hours', rows: [
        ['Sun 2 – Mon 10 Aug', '24h'],
      ] },
    ],
  },
  {
    id: 'cashless',
    title: 'Cashless & Payments',
    icon: 'card',
    content: [
      'Pyramid Festival is fully cashless. Your festival card is your wallet for the whole event.',

      { t: 'sub', text: 'Get your festival card' },
      { t: 'steps', items: [
        'Go to the Info / Office point (registration desk) — give your name and email.',
        'You\'ll receive your festival card — it\'s your wallet for the event.',
        'Use it to pay for everything — no cash or bank cards at the bars or stands.',
      ] },

      { t: 'sub', text: 'Top up' },
      { t: 'steps', items: [
        'Go to any Top-Up station.',
        'Pay with cash or card.',
        'One top-up = max 10,000 RSD. Tokens are non-refundable, so we recommend topping up smaller amounts.',
        'Tap and hold your card when staff tells you to — wait for the confirmation beep.',
      ] },

      { t: 'sub', text: 'Buying food & drinks' },
      { t: 'steps', items: [
        'Order at the bar.',
        'You\'ll see your order and price on screen.',
        'Tap and hold your card.',
        'When the green light shows, your payment is complete — your remaining balance is displayed too.',
      ] },

      { t: 'sub', text: 'Check your balance' },
      'At any Top-Up station or cashier, just tap your card to see your balance.',

      { t: 'sub', text: 'Good to know' },
      { t: 'bullets', items: [
        '1 token = 1 RSD.',
        'Lost or stolen cards cannot be replaced.',
        'Broken card? Bring all the pieces and we\'ll replace it.',
        'If your card isn\'t working, visit the info point.',
      ] },
    ],
  },
  {
    id: 'food-drink',
    title: 'Food & Drink',
    icon: 'food',
    content: [
      'All meals are served at the Food Court, our on-site restaurant — marked on the festival map.',
      'The menu covers regular, vegetarian and vegan options (no gluten-free options are available).',
      'Fresh & Café is open daily for lighter bites and coffee.',
      'Free drinking water is available at refill stations across Pyramid Village. Bring a reusable bottle!',
      'For all cooking and food preparation, use the Community Kitchen — open flames and stoves are not allowed elsewhere on site.',

      { t: 'sub', text: 'Bringing your own food' },
      { t: 'bullets', items: [
        'You may bring small quantities of food for personal use — enough for normal daily meals during your stay.',
        'Food for babies and young children is always permitted.',
        'If you have special dietary requirements, allergies, medical conditions or specific nutritional needs, you may bring the food your diet requires.',
        'Large quantities, commercial supplies, or food intended for distribution or resale are not permitted.',
      ] },
      { t: 'note', text: 'Bringing outside drinks into the festival grounds is not permitted.' },
    ],
  },
  {
    id: 'accommodation',
    title: 'Accommodation & Camping',
    icon: 'tent',
    content: [
      { t: 'sub', text: 'Village Camping & Tipi Tents' },
      'Travel light and arrive without your own camping equipment with our prepared accommodation options inside Pyramid Village.',
      'Choose between Village Camping packages for solo travelers, couples and groups, or the comfort of a Pyramid Village Tipi Tent.',
      'All options include prepared sleeping arrangements, so you can focus on the music, workshops, adventures and the festival experience.',
      'Book your Village Camping or Tipi Tent online, or visit the Info Point during the festival for availability and assistance.',

      { t: 'sub', text: 'Camper Vans & Roof Tents' },
      'Stay inside Pyramid Village with our dedicated area for camper vans, converted vehicles and roof tents.',
      'Parking is free for valid festival ticket holders and available from August 2 at 14:00. Spaces are limited and allocated first-come, first-served.',
      'Please follow the camper area rules and help us keep Pyramid Village clean, safe and comfortable for everyone.',

      { t: 'sub', text: 'Parking' },
      'Free parking is available for all Pyramid Festival visitors.',
    ],
  },
  {
    id: 'transport',
    title: 'Getting There & Transport',
    icon: 'car',
    content: [
      { t: 'sub', text: 'By car & parking' },
      'Free parking is available for all Pyramid Festival visitors, including camper vans. Carpool where you can.',

      { t: 'sub', text: 'Pyramid Shuttle — Belgrade → Festival' },
      { t: 'bullets', items: [
        'Departures: 2 & 6 August from Belgrade Nikola Tesla Airport (16:00) and Sava Center (17:00).',
        'Price: 35 € per person.',
      ] },

      { t: 'sub', text: 'Pyramid Shuttle — Festival → Belgrade' },
      { t: 'bullets', items: [
        'Departures: 6 & 9 August at 22:00 from the festival entrance.',
        'Price: 35 € per person.',
      ] },

      { t: 'sub', text: 'Public bus — Boljevac → Belgrade' },
      { t: 'hours', rows: [
        ['Mon – Fri', '03:10 · 04:45 · 05:50 · 07:55 · 09:45 · 15:25 · 16:20'],
        ['Saturday', '05:50 · 09:45 · 15:25 · 16:20'],
        ['Sunday', '03:10 · 05:50 · 09:45 · 15:25 · 16:20'],
      ] },
      { t: 'note', text: 'Please check the latest timetable before your journey, as departure times may change.' },

      { t: 'sub', text: 'Pyramid Taxi' },
      'Need a ride to or from the festival? Pyramid Taxi operates on a regular route between Pyramid Festival and Boljevac, with return trips throughout the festival.',
      { t: 'bullets', items: [
        'More information is available at the Festival Gate and the Info Point.',
        'If you\'re in Boljevac and looking for a ride back to the festival, simply look for vehicles displaying Pyramid Taxi stickers.',
      ] },
    ],
  },
  {
    id: 'adventure-tours',
    title: 'Rtanj Adventure Tours',
    icon: 'mountain',
    content: [
      { t: 'sub', text: 'Adventure — 7 August · Vrelo & Bogovinska Cave' },
      'Discover two of the most fascinating natural sites in the Rtanj region on a guided excursion. Visit the peaceful spring at the foot of Rtanj Mountain and explore one of Serbia\'s longest and most impressive caves.',
      { t: 'bullets', items: [
        'Includes transportation and a local guide.',
        'Price: 29 € per person.',
      ] },

      { t: 'sub', text: 'Adventure Plus — 7 August · Night Ascent of Rtanj' },
      'Climb Rtanj Mountain under the stars and witness an unforgettable sunrise from one of Serbia\'s most iconic peaks. Guided by experienced mountain guides, this is one of the most unique experiences of Pyramid Festival.',
      { t: 'bullets', items: [
        'Includes transportation and professional mountain guides.',
        'Price: 59 € per person.',
      ] },

      'Book your Rtanj tour online or directly at the Info Point during the festival.',
    ],
  },
  {
    id: 'health-safety',
    title: 'Health & Safety',
    icon: 'health',
    content: [
      { t: 'sub', text: 'Psy-Care & Harm Reduction' },
      'Our Re Generation team provides 24/7 peer-led psy-care and harm reduction throughout Pyramid Festival. Whether you\'re feeling overwhelmed, need a safe space to talk, or just want some guidance, our experienced team is here to support you through any challenging moments.',
      'Remember to look after your body, your mind, and each other.',

      { t: 'sub', text: 'Medical & First Aid' },
      'A medical team and first aid station are available throughout the festival, marked on the festival map.',

      { t: 'sub', text: 'Lost & Found' },
      'Report or collect lost items at the Info / Office point, marked on the festival map.',
    ],
  },
  {
    id: 'sustainability',
    title: 'Pyramid Village Etiquette',
    icon: 'leaf',
    content: [
      'Sustainability is about making daily choices and having a collective impact. Here\'s how you can help keep Rtanj clean, protected, and magical for everyone.',

      { t: 'sub', text: 'Bring your own (BYO)' },
      { t: 'bullets', items: [
        'Bring your bottle, cup, plate & cutlery — reduce single-use waste.',
        'Refill water for free at our stations across the site.',
      ] },
      { t: 'note', title: 'Bring Your Own Reusables & Get 5% OFF Your Entire Order!', text: 'Bring your own cup, bowl, container or cutlery and enjoy a discount while helping us reduce waste.' },

      { t: 'sub', text: 'Avoid single-use plastics' },
      { t: 'bullets', items: [
        'No plastic bottles — join the refillution.',
        'Where single-use is unavoidable we use biodegradable or paper, but reusable is always better.',
        'Keep your Pyramid cup and swap it at the bar — together we\'re saving 42,000+ cups in 7 days!',
      ] },

      { t: 'sub', text: 'Respect the water' },
      { t: 'bullets', items: [
        'Shower water passes through a natural biofilter — use only biodegradable soaps & cosmetics. Chemicals harm the system and your health.',
        'Use water mindfully — it\'s a shared resource.',
        'No chemical cleaning or personal-care products anywhere in Pyramid Village — free natural shampoos, soaps and detergents are available in the showers and shared kitchen.',
      ] },

      { t: 'sub', text: 'Compost toilets — turn poop into soil' },
      { t: 'bullets', items: [
        'Use the compost toilets: no flush, no chemicals.',
        'Goes in: human waste, toilet paper, a scoop of sawdust.',
        'Keep out: wet wipes, tampons, pads, diapers, trash.',
        'Always close the lid and sanitize your hands.',
        'These toilets help create healthy soil — from waste to growth!',
      ] },

      { t: 'sub', text: 'Organic waste & composting' },
      { t: 'bullets', items: [
        'Drop only raw, plant-based scraps in compost bins: veggie peels, coffee grounds, eggshells.',
        'No cooked food, oils, or animal products — we collect food waste separately.',
        'Chop scraps and add sawdust to keep things balanced and odor-free.',
      ] },

      { t: 'sub', text: 'Fire safety = mountain safety' },
      { t: 'bullets', items: [
        'No open fires or stoves — the risk is too high.',
        'Use the Community Kitchen for all cooking and food preparation.',
        'Smokers: use portable ashtrays — no butts on the ground!',
      ] },

      { t: 'sub', text: 'Responsible camping' },
      { t: 'bullets', items: [
        'Leave your spot clean — take everything you brought with you.',
        '"Leave nothing but good energy" isn\'t just a saying — it\'s a responsibility.',
        'Respect the land, animals, locals, and your fellow campers.',
        'Keep noise down, especially at night. Portable speakers and amplified music are not allowed in the camping areas — let everyone enjoy the peace and rest that make Pyramid Village special.',
      ] },

      { t: 'sub', text: 'Solar power & digital detox' },
      { t: 'bullets', items: [
        'Recharge your phone at our solar-powered charging stations.',
        'But also unplug from your screen and plug into nature.',
        'Take time to recharge your own batteries — the mountain is the best source of energy.',
      ] },
    ],
  },
  {
    id: 'rules',
    title: 'Rules & Prohibited Items',
    icon: 'shield',
    content: [
      { t: 'sub', text: 'Strictly prohibited — illegal & dangerous' },
      { t: 'bullets', items: [
        'Illegal drugs and controlled substances',
        'Weapons of any kind',
        'Knives, axes, machetes or other sharp objects that can be used as weapons',
        'Explosives',
        'Fireworks, flares and smoke bombs',
        'Dangerous chemicals or hazardous materials',
      ] },

      { t: 'sub', text: 'Strictly prohibited — fire & safety' },
      { t: 'bullets', items: [
        'Campfires, camping stoves and gas burners',
        'Open flames, candles and fire torches',
        'Charcoal grills / BBQs',
        'Fuel containers and fire accelerants',
      ] },

      { t: 'sub', text: 'Strictly prohibited — glass & hazardous objects' },
      { t: 'bullets', items: [
        'Glass bottles, jars and containers',
        'Mirrors or other dangerous glass objects',
      ] },

      { t: 'sub', text: 'Strictly prohibited — flying devices' },
      { t: 'bullets', items: [
        'Drones',
        'Remote-controlled aircraft and vehicles',
      ] },

      { t: 'sub', text: 'Strictly prohibited — power & sound' },
      { t: 'bullets', items: [
        'Petrol or diesel generators',
        'Large sound systems and professional PA equipment',
      ] },

      { t: 'sub', text: 'Strictly prohibited — commercial activity' },
      { t: 'bullets', items: [
        'Goods intended for unauthorized sale',
        'Promotional materials, flags, flyers and commercial banners',
        'Merchandise without organizer approval',
      ] },

      { t: 'sub', text: 'Strictly prohibited — recording equipment' },
      { t: 'bullets', items: [
        'Professional photo or video equipment without accreditation',
        'Commercial audio recording equipment',
      ] },

      { t: 'sub', text: 'Strictly prohibited — other' },
      { t: 'bullets', items: [
        'Anything security considers dangerous',
        'Anything intended to disturb other visitors',
        'Anything prohibited by Serbian law',
      ] },

      { t: 'sub', text: 'Restricted items' },
      { t: 'bullets', items: [
        'Bringing outside drinks into the festival grounds is not permitted.',
        'Pets are allowed under the full responsibility of their owners. Owners must keep them under control and properly supervised at all times, and must not let them disturb other visitors or the festival environment.',
        'Bags, vehicles and personal belongings are subject to security inspection at any entrance.',
      ] },

      { t: 'sub', text: 'At the gate, security may' },
      { t: 'bullets', items: [
        'Search all bags, vehicles and personal belongings.',
        'Require prohibited items to be left outside the entrance — Pyramid Festival does not provide storage or accept responsibility for them.',
        'Deny entry without refund to anyone who breaks the rules, tries to enter with prohibited items, or poses a risk to the safety of others.',
      ] },

      { t: 'sub', text: 'Please also leave at home' },
      { t: 'bullets', items: [
        'Laser pointers',
        'Nitrous oxide canisters',
        'Large Bluetooth speakers / soundboxes',
        'Fire poi, staffs or pyrotechnic props (unless officially authorized)',
        'Firewood, chainsaws or other power tools',
        'Airsoft guns, bows and crossbows',
        'Sky lanterns, confetti cannons and pyrotechnic devices',
      ] },
    ],
  },
  {
    id: 'faq',
    title: 'FAQ',
    icon: 'help',
    content: [
      'Q: When and where is Pyramid Festival?\nA: August 3–9, 2026 at Pyramid Village, Ilino, Rtanj Mountain, Serbia. The campsite opens August 2 at 14:00.',
      'Q: What is this year\'s theme?\nA: The 2026 edition centers on SOVRA — a large communal table where people gather to share food, stories, and celebrate together. It reflects unity, hospitality, and the simple act of bringing people together.',
      'Q: Is the festival family-friendly?\nA: Yes. Children under 12 enter free with a parent or guardian. The Kids Garden offers youth-focused activities, and hearing protection is mandatory for all children near the music stages.',
      'Q: Where can I buy tickets?\nA: On the Tickets page at pyramidfestival.com. A limited number are also available at the festival entrance, subject to availability.',
      'Q: Can I buy tickets at the entrance?\nA: Yes. Gate prices vary by arrival day and go down as fewer festival days remain. Gate tickets cover all remaining days, not single days.',
      'Q: Are one-day tickets available?\nA: One-day tickets are available only for August 6 and 9 (the final Healing Days and Tribal Days). All other days require a multi-day ticket.',
      'Q: Can I pay by card at the entrance?\nA: Yes. Card and cash are both accepted at the entrance.',
      'Q: Do festival tickets include camping?\nA: Yes. All festival tickets include access to the camping area. The campsite opens on August 2, 2026 at 14:00.',
      'Q: What accommodation options are available?\nA: Free regular camping, Tipi Tents, and various tent rental packages — all listed on the Accommodation page.',
      'Q: Can I bring my own food and drinks?\nA: You may bring small quantities of food for personal use (baby food and food for special dietary needs are always allowed). Commercial quantities and outside drinks are not permitted.',
      'Q: Is there free drinking water?\nA: Yes. Free water stations are spread throughout Pyramid Village. Bring a reusable bottle to refill.',
      'Q: Are showers available?\nA: Yes. Free showers are available for all festival visitors.',
      'Q: What food options are available?\nA: The Food Court offers regular, vegetarian and vegan meals. Campers can also prepare simple meals in the Community Kitchen.',
      'Q: Is there medical assistance on site?\nA: Yes. A medical team and first aid station are available throughout the festival, and our Re Generation team provides 24/7 psy-care and harm reduction. Both are marked on the festival map.',
      'Q: Are pets allowed?\nA: Pets are allowed under the full responsibility of their owners. Owners must keep them under control and properly supervised at all times, and must not let them disturb other visitors or the festival environment.',
      'Q: How do I get to the festival?\nA: By car (free parking), the Pyramid Shuttle from Belgrade, or public bus via Boljevac. See the Getting There & Transport section.',
      'Q: Is parking available?\nA: Yes. Parking is free for all visitors, including camper vans.',
      'Q: Is there shuttle transport?\nA: Yes. The Pyramid Shuttle connects Belgrade ↔ Festival. See the Getting There & Transport section.',
    ],
  },
];

export default festivalSections;
