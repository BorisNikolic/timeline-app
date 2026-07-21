/**
 * Healing Tent — static content (hardcoded; this offering never changes mid-event).
 *
 * The Healing Tent is the big stretch tent where practitioners hold space for
 * drop-in therapies. There's no timeline — they're simply present across the
 * gathering, so this screen is an informational directory, NOT a schedule.
 *
 * The photos are the designer's finished promo cards (1280×1600, 4:5) with the
 * name + method + Pyramid branding printed on them; the gallery shows each card,
 * and tapping opens a detail view with the biography. `name`/`method`/`bio` come
 * from the practitioners' doc.
 *
 * To add someone later: drop a 4:5 image in ReactNative/assets/healers/ and set
 * photo: require('../../assets/healers/<file>.jpg')  (photo:null → themed text tile).
 */

export const HEALING_ZONE = {
  eyebrow: 'SOVRA EDITION · WELLNESS',
  title: 'Healing Zone',
  lead:
    'The Healing Zone is open throughout the entire festival week, offering ' +
    'individual 1-on-1 sessions with experienced practitioners across a range ' +
    'of healing techniques.',
  note:
    'The Healing Zone is separate from the Healing Days programme. Healing Days ' +
    'includes workshops, ceremonies and group experiences covered by your ' +
    'Healing Days or Infinite Vibes festival ticket. Healing Zone sessions are ' +
    'personal 1-on-1 treatments available for an additional fee.',
  booking:
    'Sessions can be booked directly at the Healing Zone during the festival.',
};

// Order follows the designer's list (alphabetical by first name).
export const HEALERS = [
  {
    id: 'aleksandra-arenina',
    name: 'Aleksandra Arenina',
    method: 'Sound Healing, Yin & Hatha Yoga',
    photo: require('../../assets/healers/aleksandra-arenina.jpg'),
    bio: `With over 700 hours of specialised training at the Patanjali International Yoga Foundation in India, Aleksandra offers a grounding blend of Yin & Hatha Yoga and Sound Healing. These sessions focus on mindful movement and breath awareness, helping practitioners of all levels reconnect with their bodies and restore inner balance. Using the resonant frequencies of Tibetan bowls, the practice gently releases tension and guides the nervous system into a state of deep meditation. Discover a sanctuary of clarity and harmony as you synchronise your spirit through these ancient vibrational arts.`,
  },
  {
    id: 'aleksandar-djordjevic',
    name: 'Aleksandar Đorđević',
    method: 'Holistic Integration',
    photo: require('../../assets/healers/aleksandar-djordjevic.jpg'),
    bio: `Aleksandar Đorđević, Usui Reiki Master and lifelong practitioner of intuitive bodywork known as Kostolomac, offers a unique blend of physical and energetic realignment. His practice integrates trigger point therapy and soft fascial Gua Sha with the mental clarity of Rapé and the emotional grounding of EFT. Specifically designed to provide a sanctuary within the festival's intensity, these sessions harmonise the body, mind, and soul through presence and sacred elements like Palo Santo. Rather than "fixing," Aleksandar's work invites a deep return to your innate wholeness and natural inner alignment.`,
  },
  {
    id: 'ana-gak',
    name: 'Ana Gak',
    method: 'Transformational Coaching',
    photo: require('../../assets/healers/ana-gak.jpg'),
    bio: `Ana Gak is a transformational coach with over 12 years of experience and 4,500+ sessions, specialising in bridging the gap between external success and internal alignment. Her unique approach integrates evidence-based psychology and modalities (CBT, ACT, MBSR) with Evolutionary Astrology, Human Design, Energetics and somatic practices to help individuals navigate profound life transitions. By moving from "either/or" thinking to a "both/and" living, sessions provide the clarity and sustainable tools needed to integrate your cosmic identity with embodied self-awareness. Whether through coaching or intuitive readings, Ana creates a safe space for deep, sustainable personal evolution.`,
  },
  {
    id: 'doris-turcinovic',
    name: 'Doris Turčinović',
    method: 'Lymph Modelling & Massage',
    photo: require('../../assets/healers/doris-turcinovic.jpg'),
    bio: `Doris Turčinović is an internationally certified massage therapist specialising in lymphatic modelling, a transformative practice designed to clear toxins and release trauma stored within the fascia. Trained at the American Academy of Massage and the Manuela Shala school, she focuses on boosting the immune system and providing instant physical and mental relief. Her holistic treatments address the stress and "debris" our bodies accumulate, offering a deep, restorative cleansing for both the body and face. Experience a unique detoxification that restores vitality and lightness in a single, targeted session.`,
  },
  {
    id: 'dusan-aragonski',
    name: 'Dušan Aragonski',
    method: 'Nutritional Consulting',
    photo: require('../../assets/healers/dusan-aragonski.jpg'),
    bio: `Combining a Master's degree in Nutrition with a background in Biochemistry, Dušan Aragonski offers evidence-based guidance to help you build a sustainable and trusting relationship with food. With over six years of private practice, his approach focuses on regulating energy and appetite through realistic lifestyle coaching and collaborative goal-setting. Participants can expect practical, science-backed strategies designed to create lasting changes that fit seamlessly into everyday life. Discover how to nourish your body and calm your mind through the power of informed, mindful nutrition.`,
  },
  {
    id: 'gem-fernandez',
    name: 'Gem Fernandez',
    method: '1:1 Tibetan Sound & Energy Realignment and immersive sound baths',
    photo: require('../../assets/healers/gem-fernandez.jpg'),
    bio: `A worldwide experienced healer from Bali, Gem Fernandez offers deeply personalised sessions that blend Tibetan singing bowls with intuitive energy realignment and Theta healing. By placing bowls directly on the body, she identifies and releases blockages to restore balance within the nervous system and energetic field. Each unique session concludes with an oracle reading and frequency lifting, providing the profound emotional release and mental clarity needed for deep integration. Gem's intuitive approach meets you exactly where you are, guiding you back to a state of total rest and inner harmony.`,
  },
  {
    id: 'kristijan-tomic',
    name: 'Kristijan Tomić',
    method: 'Acupuncture, Bioenergy',
    photo: require('../../assets/healers/kristijan-tomic.jpg'),
    bio: `A licensed acupuncturist (Lic.Accu) from Xian Tian University, Kristijan Tomić integrates ancient healing traditions with modern neurodynamics to provide profound pain relief and spiritual recuperation. His holistic approach addresses chronic conditions and stress, with a specialised focus on fertility and prenatal counselling to help heal generational traumas. Through a blend of bioenergy and neurosensory therapy, Kristijan guides you toward neurological balance and deep mental well-being.`,
  },
  {
    id: 'maja-jakovljevic',
    name: 'Maja Jakovljević',
    method: 'Thai Yoga Massage',
    photo: require('../../assets/healers/maja-jakovljevic.jpg'),
    bio: `Maja Jakovljević, a graduate of the Himalayan Zen School, offers a transformative blend of stretching, acupressure, and energetic work through traditional Thai Yoga Massage. Her sessions combine deep compression with joint mobilisation to release physical tension, deepen the breath, and restore a profound sense of lightness. Specially trained in dynamic techniques and focused neck and back care, Maja creates a space where the body feels both deeply worked and gently nurtured. This practice is an invitation to move beyond simple relaxation and truly reconnect with your body on a deeper, more mindful level.`,
  },
  {
    id: 'marija-bojicic',
    name: 'Marija Bojičić',
    method: 'Bowen Therapy',
    photo: require('../../assets/healers/marija-bojicic.jpg'),
    bio: `Marija Bojičić is a dedicated Bowen therapist who integrates her expertise as a BARS practitioner and NLP practitioner to support the body's innate healing capacity. Her sessions focus on the Bowen technique — a gentle, holistic bodywork method designed to release deep-seated stress and provide effective pain relief. This practice promotes profound relaxation and is uniquely adaptable, allowing for powerful results in both individual and group settings. By calming the nervous system, Marija helps restore physical balance and encourages a natural state of well-being.`,
  },
  {
    id: 'marija-ivankovic',
    name: 'Marija Ivanković',
    method: 'Evolutionary Floritherapy',
    photo: require('../../assets/healers/marija-ivankovic.jpg'),
    bio: `Marija Ivanković is an Evolutionary Floritherapy practitioner and Usui Reiki Master dedicated to the sacred art of soul awakening. Through the subtle pathway of flower essences, she creates a safe, intuitive container that helps you strip away false identities and remember your true essence. This approach nurtures self-discovery and innate wisdom, shifting the focus from perceived flaws toward your creative power and higher potential. It is a profound invitation to reclaim your authentic inner voice and express it with courage in the world.`,
  },
  {
    id: 'marko-pavlovski',
    name: 'Marko Pavlovski',
    method: 'Reiki, Massage, Drum Healing',
    photo: require('../../assets/healers/marko-pavlovski.jpg'),
    bio: `Marko Pavlovski, a dedicated Reiki Master and massage therapist, offers a multifaceted approach to restoring peace across all levels of being. By combining the gentle flow of Reiki with therapeutic touch and the grounding vibrations of drum healing, he facilitates a deep release of physical and energetic tension. These sessions are designed to harmonise your internal rhythm and calm the mind, creating a sanctuary for total relaxation. Experience a profound sense of stillness as Marko guides your body and spirit back into a state of natural equilibrium.`,
  },
  {
    id: 'radica-milanova',
    name: 'Radica Milanova',
    method: 'Tesla Healing Metamorphosis',
    photo: require('../../assets/healers/radica-milanova.jpg'),
    bio: `Radica Milanova is a certified practitioner of Tesla Healing Metamorphosis, a profound contactless method that works within the body's high-vibrational etheric field. By facilitating this energetic resonance, she helps restore balance across the physical, mental, and emotional levels, encouraging the natural regeneration of tissues. This practice is designed to calm the nervous system and clear blockages, leaving the organism in a state of deep peace and heightened inner wisdom. Experience a transformative shift as your entire being realigns with its optimal frequency.`,
  },
  {
    id: 'rotem-sibylla-shefa',
    name: 'Rotem Sibylla Shefa',
    method: 'Birthday Charts by the Mayan Calendar',
    photo: require('../../assets/healers/rotem-sibylla-shefa.jpg'),
    bio: `Discover your cosmic identity and unlock the keys to your inner self. With over 25 years of dedicated practice, Rotem-Sibylla decodes Gregorian birthdates into sacred Mayan symbols using the Tzolkin and Dreamspell calendars to unveil your soul's blueprint. Since 2012, she has guided individuals across Europe and Israel to reconnect with their cosmic identity. This knowledge helps us synchronise with natural time in our everyday lives, illuminating our destiny path. Discover your unique Galactic Signature in a space of deep wisdom and insight.`,
  },
];
