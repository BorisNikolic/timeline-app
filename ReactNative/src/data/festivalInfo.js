/**
 * Festival information content for the Info screen.
 * Sourced from the organizer's FESTIVAL GUIDE (2026 SOVRA edition).
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
 * TODO(guide) — provisional content, pending organizer decisions (docx comments):
 *   [0]  "Pyramid Village Camp" working-hours row — unclear what this refers to.
 *   [1]  Tokens "Thu–Sun 24h" — written as 00:00–24:00 for consistency; confirm.
 *   [2]  Psy-Care "14:00–14:00" — assumed 24h; confirm.
 *   [3-6] BYO: cups are NOT sold. Using Dragana's resolved copy (5% discount for
 *         own reusable cup/mug/bowl). Confirm exactly how the discount applies.
 *   [7]  Cup "swap / 42,000 cups" line dropped — idea unclear.
 *   [8]  "Food & drinks not allowed" vs Community Kitchen / cooking areas — clarify
 *         (bringing outside food vs cooking on-site).
 *   [12] Public bus — add a link to the official timetable if one exists.
 *   [13] Psy-Care copy reworded (original flagged as AI-sounding); confirm tone.
 *   [15-16] Glass/jars/candles/small stoves kept under STRICTLY PROHIBITED; decide
 *         whether some belong in the softer "please also leave at home" list.
 *   [24-25] Confiscated items (returnable?) + "refuse entry without refund" reason.
 *   [26] Healing Zone booking section intentionally OMITTED ("ovo ne gledajte").
 * RESOLVED and applied: [14] knife wording, [17-23] "Pet allowed" + pet rules.
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
      'The festival is cashless. Pick up your festival card at registration and pay at every point on site with it — no cash or bank cards at the bars or stands. Top up with cash or card at any Top-Up station.',
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
        ['Thu 6 – Sat 9 Aug', '08:00 – 02:00'],
        ['Sun 9 Aug', '08:00 – 16:00'],
      ] },
      { t: 'note', text: 'If you arrive during late-night hours when the gate is closed, our gate staff will contact the responsible team member to help you with entry.' },

      // TODO(guide) [0]: what exactly is "Pyramid Village Camp"?
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
        ['Thu 6 – Sun 9 Aug', '00:00 – 24:00'], // TODO(guide) [1]: guide says "24h"
      ] },

      { t: 'sub', text: 'Food Court' },
      { t: 'hours', rows: [
        ['Sun 2 Aug', '14:00 – 00:00'],
        ['Mon 3 – Sun 9 Aug', '08:00 – 02:00'],
      ] },

      { t: 'sub', text: 'Fresh & Café' },
      { t: 'hours', rows: [
        ['Mon 3 – Sun 9 Aug', '08:00 – 00:00'],
      ] },

      { t: 'sub', text: 'TOK Stage Bar' },
      { t: 'hours', rows: [
        ['Mon 3 – Wed 5 Aug', '08:00 – 01:00'],
        ['Thu 6 – Sun 9 Aug', '00:00 – 24:00'], // guide says "24h"
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
        ['Sun 2 – Mon 10 Aug', '24h'], // TODO(guide) [2]: guide says "14:00–14:00"
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
        'Go to the registration desk — give your name and email.',
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
    id: 'stages',
    title: 'Stages & Venues',
    icon: 'music',
    content: [
      'The programme unfolds across several stages and zones, each with its own character.',
      'Tok is the main stage for the headline sets, with Kolo as the second music stage.',
      'Art Zone, Workshop Zone, Kids Garden and the Healing Zone round out the days with talks, movement, workshops and rest.',
      'Check the Lineup tab for full stage schedules, set times, and to set reminders for your must-see acts.',
      'Stages run from early afternoon into the early hours. Exact opening and closing times vary by day.',
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
      // TODO(guide) [8]: reconcile with "food & drinks not allowed" in Restricted Items.
      'Campers can also prepare simple meals in the Community Kitchen.',
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
      'All options include prepared sleeping arrangements, so you can focus on the music, workshops, adventures and the festival experience. Visit the Accommodation page for full details and available packages.',

      { t: 'sub', text: 'Camper Vans & Roof Tents' },
      'Stay inside Pyramid Village with our dedicated area for camper vans, converted vehicles and roof tents.',
      'Parking is free for valid festival ticket holders and available from August 2 at 14:00. Spaces are limited and allocated first-come, first-served.',
      'Campers have access to all festival facilities — water refill points, showers, toilets, the Food Court, bars, and medical / Psy-Care services.',
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
      'Follow signs from the main road to Pyramid Village. Parking is free for all visitors, including camper vans. Carpooling is encouraged — share the ride where you can.',

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

      { t: 'sub', text: 'Pyramid Shuttle — Ozora → Pyramid' },
      { t: 'bullets', items: [
        'Departure: 2 August 2026 at 22:00 from the main gate parking area of Ozora Festival.',
        'Price: 70 € per person.',
      ] },

      { t: 'sub', text: 'Public bus — Boljevac → Belgrade' },
      { t: 'hours', rows: [
        ['Mon – Fri', '03:10 · 04:45 · 05:50 · 07:55 · 09:45 · 15:25 · 16:20'],
        ['Saturday', '05:50 · 09:45 · 15:25 · 16:20'],
        ['Sunday', '03:10 · 05:50 · 09:45 · 15:25 · 16:20'],
      ] },
      // TODO(guide) [12]: add a link to the official timetable if available.
      { t: 'note', text: 'Please check the latest timetable before your journey, as departure times may change.' },
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
      'Climb Rtanj Mountain under the stars and witness an unforgettable sunrise from one of Serbia\'s most iconic peaks, guided by experienced mountain guides.',
      { t: 'bullets', items: [
        'Includes transportation and professional mountain guides.',
        'Price: 59 € per person.',
      ] },

      'Book your Rtanj tour at the Info & Office point or on pyramidfestival.com.',
    ],
  },
  {
    id: 'health-safety',
    title: 'Health & Safety',
    icon: 'health',
    content: [
      // TODO(guide) [13]: original copy flagged as AI-sounding — reworded, confirm tone.
      { t: 'sub', text: 'Psy-Care & Harm Reduction' },
      'Our Re Generation team runs peer-led Psy-Care and harm reduction, on site 24/7. If you feel overwhelmed, need a calm place to talk, or just want a bit of guidance, come find us — no judgement, just support.',
      'Look after your body and mind, and look after each other. The Psy-Care tent also handles first aid and is marked on the festival map.',

      { t: 'sub', text: 'Lost & Found' },
      'Report or collect lost items at the Info / Office point, marked on the festival map.',
    ],
  },
  {
    id: 'sustainability',
    title: 'Leave No Trace',
    icon: 'leaf',
    content: [
      'Sustainability is about daily choices and collective impact. Here\'s how you can help keep Rtanj clean, protected, and magical for everyone.',

      { t: 'sub', text: 'Bring your own (BYO)' },
      // TODO(guide) [3-7]: cups are NOT sold; using resolved 5%-discount copy.
      { t: 'bullets', items: [
        'Bring your bottle, cup, plate & cutlery. Seven days, several meals and drinks a day — bringing your own adds up to a real difference.',
        'Refill water for free at our stations across the site.',
        'Get a 5% discount on food and drinks when you bring your own reusable cup, mug, or bowl.',
      ] },

      { t: 'sub', text: 'Avoid single-use plastics' },
      { t: 'bullets', items: [
        'No plastic bottles — refilling is the way.',
        'Where single-use is unavoidable we use biodegradable or paper, but reusable is always better.',
      ] },

      { t: 'sub', text: 'Respect the water' },
      { t: 'bullets', items: [
        'Shower water passes through a natural biofilter — use only biodegradable soaps & cosmetics. Chemicals harm the system and your health.',
        'Use water mindfully — it\'s a shared resource.',
        'No chemical cleaning or personal-care products anywhere in Pyramid Village.',
      ] },

      { t: 'sub', text: 'Compost toilets — turn poop into soil' },
      { t: 'bullets', items: [
        'Use the compost toilets: no flush, no chemicals.',
        'Goes in: human waste, toilet paper, a scoop of sawdust.',
        'Keep out: wet wipes, tampons, pads, diapers, trash.',
        'Always close the lid and sanitize your hands.',
      ] },

      { t: 'sub', text: 'Organic waste & composting' },
      { t: 'bullets', items: [
        'Drop only raw, plant-based scraps in compost bins: veggie peels, coffee grounds, eggshells.',
        'No cooked food, oils, or animal products — we collect food waste separately.',
        'Chop scraps and add sawdust to keep things balanced and odor-free.',
      ] },

      { t: 'sub', text: 'Fire safety = mountain safety' },
      // TODO(guide) [8]: "designated cooking areas" vs "no food/drinks allowed" — clarify.
      { t: 'bullets', items: [
        'No open fires or stoves — the risk is too high.',
        'Use designated cooking areas only.',
        'Smokers: use portable ashtrays — no butts on the ground!',
      ] },

      { t: 'sub', text: 'Responsible camping' },
      { t: 'bullets', items: [
        'Leave your spot clean — take everything you brought.',
        'Respect the land, the animals and the locals — Rtanj is home to more than just us.',
      ] },

      { t: 'sub', text: 'Solar power & digital detox' },
      { t: 'bullets', items: [
        'Recharge your phone at our solar-powered charging stations.',
        'And unplug from your screen — the mountain is the best source of energy.',
      ] },

      // TODO(guide) [9]: closing line reworded from the original.
      'Every choice adds up. Let\'s celebrate consciously and leave no waste behind.',
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
        'Knives, axes, machetes or other sharp objects that can be used as weapons', // resolved [14]
        'Explosives',
        'Fireworks, flares and smoke bombs',
        'Dangerous chemicals or hazardous materials',
      ] },

      { t: 'sub', text: 'Strictly prohibited — fire & safety' },
      { t: 'bullets', items: [
        'Campfires, camping stoves, gas burners',
        'Open flames, candles, fire torches',
        'Charcoal grills / BBQs',
        'Fuel containers and fire accelerants',
      ] },

      // TODO(guide) [15-16]: decide if glass/jars/candles/small stoves belong here
      // (strictly prohibited) or in the softer "please also leave at home" list.
      { t: 'sub', text: 'Strictly prohibited — glass & other' },
      { t: 'bullets', items: [
        'Glass bottles, jars, containers, mirrors and other dangerous glass objects',
        'Drones, remote-controlled aircraft and vehicles',
        'Petrol or diesel generators, large sound systems, professional PA equipment',
        'Goods for unauthorized sale, promotional materials, flags, flyers and commercial banners, merchandise without organizer approval',
        'Professional photo/video or commercial audio recording equipment without accreditation',
        'Anything security considers dangerous, anything meant to disturb others, and anything prohibited by Serbian law',
      ] },

      { t: 'sub', text: 'Restricted items' },
      // TODO(guide) [8]: reconcile "food & drinks not allowed" with Community Kitchen.
      'Food and drinks are not allowed.',
      // Pets: resolved thread [17-23] → "Pet allowed" + rules.
      'Pets are allowed, but owners are fully financially and criminally liable for their dog. Dogs must be vaccinated; large or unpredictable dogs must be leashed and muzzled at all times. Security reserves the right to remove both dog and owner if the situation requires it.',
      'Bags, vehicles and personal belongings are subject to security inspection at any entrance.',

      { t: 'sub', text: 'At the gate, security may' },
      // TODO(guide) [24-25]: clarify confiscated-item return + refusal-without-refund reason.
      { t: 'bullets', items: [
        'Search all bags, vehicles and personal belongings.',
        'Confiscate prohibited items.',
        'Refuse entry without refund.',
        'Remove any visitor who violates the rules or endangers the safety and experience of others.',
      ] },

      { t: 'sub', text: 'Please also leave at home' },
      { t: 'bullets', items: [
        'Laser pointers',
        'Nitrous oxide canisters',
        'Large Bluetooth speakers / soundboxes',
        'Fire poi, staffs or pyrotechnic props (unless officially authorized)',
        'Firewood, chainsaws or other power tools',
        'Firearms, airsoft guns, bows and crossbows',
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
      'Q: Can I pay by card at the entrance?\nA: No. Tickets bought at the festival entrance can only be paid in cash.',
      'Q: Do festival tickets include camping?\nA: Yes. All festival tickets include access to the camping area. The campsite opens on August 2, 2026 at 14:00.',
      'Q: What accommodation options are available?\nA: Free regular camping, Tipi Tents, and various tent rental packages — all listed on the Accommodation page.',
      'Q: Is there free drinking water?\nA: Yes. Free water stations are spread throughout Pyramid Village. Bring a reusable bottle to refill.',
      'Q: Are showers available?\nA: Yes. Free showers are available for all festival visitors.',
      'Q: What food options are available?\nA: The Food Court offers regular, vegetarian and vegan meals. Campers can also prepare simple meals in the Community Kitchen.',
      'Q: Is there medical assistance on site?\nA: Yes. Our Psy-Care tent provides first aid and emotional/psychological support, 24/7. It is marked on the festival map.',
      'Q: Are pets allowed?\nA: Pets are allowed, but owners are fully responsible for them. Dogs must be vaccinated, and large or unpredictable dogs must be leashed and muzzled at all times.',
      'Q: How do I get to the festival?\nA: By car (free parking), the Pyramid Shuttle from Belgrade or Ozora, or public bus via Boljevac. See the Getting There & Transport section.',
      'Q: Is parking available?\nA: Yes. Parking is free for all visitors, including camper vans.',
      'Q: Is there shuttle transport?\nA: Yes. Shuttles connect Belgrade ↔ Festival and Ozora Festival → Pyramid Festival. See the Getting There & Transport section.',
    ],
  },
];

export default festivalSections;
