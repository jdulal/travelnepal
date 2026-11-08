import bcrypt from "bcryptjs";
import {
  destinations,
  trips,
  stories,
  reviews,
  communityPosts,
  coupons,
  addons,
  faqs,
  testimonials,
  settingsSeed,
} from "./content.mjs";

const json = (v) => JSON.stringify(v ?? null);
const pad = (n) => String(n).padStart(2, "0");
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

function addDays(days, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return d;
}

export async function seed(db) {
  console.log("Seeding Nepal Travel…");

  const adminHash = bcrypt.hashSync("Nepal@2026", 10);
  const demoHash = bcrypt.hashSync("Traveler@2026", 10);
  const commonHash = bcrypt.hashSync("Traveler@2026", 10);

  await db.query(
    `INSERT INTO users (name, username, email, password_hash, phone, country, role, status) VALUES ?`,
    [[
      ["Nepal Travel Admin", "admin", "admin@nepaltravel.com", adminHash, "+977 1 441 2345", "Nepal", "admin", "active"],
      ["Aayush Sharma", "aayush", "aayush@example.com", demoHash, "+977 980 111 2233", "Nepal", "user", "active"],
      ["Priya Gurung", "priya", "priya@example.com", commonHash, null, "Australia", "user", "active"],
      ["Michael Chen", "michael", "michael@example.com", commonHash, null, "Canada", "user", "active"],
      ["Sarah Bennett", "sarah", "sarah@example.com", commonHash, null, "United Kingdom", "user", "active"],
      ["Rajesh Thapa", "rajesh", "rajesh@example.com", commonHash, null, "Nepal", "user", "active"],
      ["Emma Wilson", "emma", "emma@example.com", commonHash, null, "United Kingdom", "user", "active"],
      ["Hiroshi Tanaka", "hiroshi", "hiroshi@example.com", commonHash, null, "Japan", "user", "active"],
      ["Sofia Rossi", "sofia", "sofia@example.com", commonHash, null, "Italy", "user", "active"],
    ]]
  );

  const [userRows] = await db.query("SELECT id, email, name FROM users");
  const userId = Object.fromEntries(userRows.map((u) => [u.email, u.id]));

  const destId = {};
  for (const d of destinations) {
    const [r] = await db.query(
      `INSERT INTO destinations (name, slug, region, province, tagline, summary, description, hero_image, thumbnail, altitude, best_season, featured, sort_order, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?, 'active')`,
      [d.name, d.slug, d.region, d.province, d.tagline, d.summary, d.description, d.hero_image, d.thumbnail, d.altitude, d.best_season, d.featured, d.sort_order]
    );
    destId[d.slug] = r.insertId;
  }

  const tripId = {};
  for (const t of trips) {
    const [r] = await db.query(
      `INSERT INTO trips (destination_id, title, slug, category, summary, description, duration_days, difficulty, max_altitude, group_size,
        price, sale_price, rating, review_count, hero_image, gallery, highlights, inclusions, exclusions, best_season, departure_city, permit_info, status, featured)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 'published', ?)`,
      [
        destId[t.destination] ?? null, t.title, t.slug, t.category, t.summary, t.description, t.duration_days,
        t.difficulty, t.max_altitude ?? null, t.group_size, t.price, t.sale_price ?? null, t.rating, t.review_count,
        t.hero_image, json(t.gallery ?? [t.hero_image]), json(t.highlights), json(t.inclusions), json(t.exclusions),
        t.best_season, "Kathmandu", t.permit_info ?? null, t.featured ?? 0,
      ]
    );
    const id = r.insertId;
    tripId[t.slug] = id;

    const dayRows = t.days.map((d, i) => [id, i + 1, d[0], d[1], d[2], d[3], d[4]]);
    await db.query(
      `INSERT INTO trip_days (trip_id, day_number, title, description, accommodation, meals, altitude) VALUES ?`,
      [dayRows]
    );

    const baseDate = new Date();
    for (let m = 0; m < 6; m++) {
      const start = addDays(21 + m * 30 + ((id * 7) % 10));
      const end = addDays(21 + m * 30 + ((id * 7) % 10) + Math.max(t.duration_days - 1, 0));
      const booked = (id * 3 + m * 2) % 9;
      await db.query(
        `INSERT INTO trip_departures (trip_id, start_date, end_date, seats_total, seats_booked, price, status) VALUES (?,?,?,?,?,?,?)`,
        [id, isoDate(start), isoDate(end), 12, booked, t.sale_price ?? t.price, booked >= 10 ? "full" : "open"]
      );
    }
  }

  for (const a of addons) {
    await db.query(`INSERT INTO addons (name, description, price, active) VALUES (?,?,?,1)`, [a.name, a.description, a.price]);
  }

  for (const s of stories) {
    await db.query(
      `INSERT INTO stories (destination_id, title, slug, excerpt, body, cover_image, author_name, author_role, category, read_time, status, published_at)
       VALUES (?,?,?,?,?,?,?,?,?,?, 'published', ?)`,
      [destId[s.destination] ?? null, s.title, s.slug, s.excerpt, s.body, s.cover_image, s.author_name, s.author_role, s.category, s.read_time, addDays(-(stories.indexOf(s) * 9 + 4))]
    );
  }

  for (const r of reviews) {
    await db.query(
      `INSERT INTO reviews (trip_id, user_id, name, rating, title, body, status, created_at) VALUES (?,?,?,?,?,?, 'approved', ?)`,
      [tripId[r.trip], userId["aayush@example.com"] ?? null, r.name, r.rating, r.title, r.body, addDays(-(reviews.indexOf(r) * 4 + 2))]
    );
  }

  for (const p of communityPosts) {
    const [r] = await db.query(
      `INSERT INTO posts (user_id, destination_id, title, body, image, status, created_at) VALUES (?,?,?,?,?, 'published', ?)`,
      [userId[`${p.author.split(" ")[0].toLowerCase()}@example.com`] ?? userId["aayush@example.com"], destId[p.destination] ?? null, p.title, p.body, p.image, addDays(-(communityPosts.indexOf(p) * 3 + 1))]
    );
    const postId = r.insertId;
    const commenters = [
      ["Priya Gurung", "This is so helpful, thank you for sharing!"],
      ["Michael Chen", "Adding this to my list for next season."],
      ["Sarah Bennett", "We were there around the same time — completely agree."],
    ];
    for (let i = 0; i < 2; i++) {
      const c = commenters[(postId + i) % commenters.length];
      await db.query(`INSERT INTO post_comments (post_id, user_id, body) VALUES (?,?,?)`, [postId, userId["aayush@example.com"], c[1]]);
    }
    await db.query(`INSERT INTO post_likes (post_id, user_id) VALUES (?,?)`, [postId, userId["priya@example.com"] ?? userId["aayush@example.com"]]);
  }

  // Bookings for the demo user
  const today = new Date();
  const bookingSeeds = [
    { ref: "NT-EBC-2401", slug: "everest-base-camp-trek", name: "Aayush Sharma", email: "aayush@example.com", travelers: 2, days: 40, status: "confirmed", pay: "paid", method: "esewa", total: 338000, discount: 0 },
    { ref: "NT-ABC-2402", slug: "annapurna-base-camp-trek", name: "Aayush Sharma", email: "aayush@example.com", travelers: 1, days: 25, status: "pending", pay: "unpaid", method: null, total: 111600, discount: 12400 },
    { ref: "NT-CHT-2312", slug: "chitwan-jungle-safari", name: "Aayush Sharma", email: "aayush@example.com", travelers: 3, days: -60, status: "completed", pay: "paid", method: "khalti", total: 114000, discount: 0 },
  ];

  for (const b of bookingSeeds) {
    const [departures] = await db.query(
      `SELECT id, start_date FROM trip_departures WHERE trip_id = ? AND status = 'open' ORDER BY start_date LIMIT 1`,
      [tripId[b.slug]]
    );
    const base = b.days > 0 ? addDays(b.days) : addDays(b.days);
    const [r] = await db.query(
      `INSERT INTO bookings (reference, user_id, trip_id, departure_id, full_name, email, phone, nationality, travelers, start_date,
        addons, subtotal, discount, total, coupon_code, special_requests, status, payment_status, payment_method, created_at)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        b.ref, userId["aayush@example.com"], tripId[b.slug], departures[0]?.id ?? null, b.name, b.email, "+977 980 111 2233",
        "Nepal", b.travelers, isoDate(base), json([{ name: "Airport transfer (private)", price: 2500 }]),
        b.total + b.discount, b.discount, b.total, b.discount ? "NEPAL10" : null,
        b.slug === "everest-base-camp-trek" ? "Please arrange a female guide if possible. Vegetarian meals." : null,
        b.status, b.pay, b.method, addDays(-(b.days > 0 ? 2 : 65)),
      ]
    );
    if (b.pay === "paid") {
      await db.query(
        `INSERT INTO payments (booking_id, method, amount, transaction_ref, status, paid_at) VALUES (?,?,?,?, 'success', ?)`,
        [r.insertId, b.method, b.total, "TXN" + Math.floor(100000 + Math.random() * 899999), addDays(-(b.days > 0 ? 2 : 65))]
      );
    }
  }

  await db.query(`INSERT INTO saved_trips (user_id, trip_id) VALUES ?`, [[
    [userId["aayush@example.com"], tripId["upper-mustang-trek"]],
    [userId["aayush@example.com"], tripId["langtang-valley-trek"]],
    [userId["aayush@example.com"], tripId["bandipur-village-escape"]],
  ]]);

  const samplePlan = {
    title: "5 days in Pokhara & the Annapurna foothills",
    destination: "Pokhara",
    days: 5,
    travelers: 2,
    budget_tier: "mid",
    summary: "A balanced 5-day plan with lake time, a short trek to Australian Camp and a sunrise at Sarangkot.",
    itinerary: [
      { day: 1, title: "Arrive in Pokhara", morning: "Fly or drive from Kathmandu.", afternoon: "Check in, walk Lakeside and hire a boat on Phewa Lake.", evening: "Dinner at a lakeside restaurant.", meals: ["Dinner"], stay: "Lakeside hotel", cost: 6000 },
      { day: 2, title: "Sarangkot & old Pokhara", morning: "Sunrise drive to Sarangkot.", afternoon: "Bindhyabasini temple, old bazaar and Tibetan settlement.", evening: "Sunset at the World Peace Pagoda.", meals: ["Breakfast"], stay: "Lakeside hotel", cost: 4500 },
      { day: 3, title: "Trek to Australian Camp", morning: "Drive to Kande and walk to Australian Camp.", afternoon: "Lunch with mountain views and descend to Dhampus.", evening: "Transfer to Pokhara.", meals: ["Breakfast", "Lunch"], stay: "Lakeside hotel", cost: 7500 },
      { day: 4, title: "Adventure day", morning: "Tandem paragliding from Sarangkot.", afternoon: "Kayaking on Phewa Lake.", evening: "Free evening.", meals: ["Breakfast"], stay: "Lakeside hotel", cost: 12000 },
      { day: 5, title: "Departure", morning: "Free morning for cafes and shopping.", afternoon: "Transfer to the airport or bus park.", evening: "Depart.", meals: ["Breakfast"], stay: "—", cost: 2000 },
    ],
    totals: { per_person: 32000, group: 64000, currency: "NPR" },
    tips: ["Book paragliding a day ahead in peak season.", "Carry cash for teahouses on the Australian Camp trail.", "Mornings are clearest for mountain views."],
  };

  await db.query(
    `INSERT INTO plans (user_id, token, title, destination, days, travelers, budget_tier, interests, plan_json, source)
     VALUES (?,?,?,?,?,?,?,?,?, 'local')`,
    [userId["aayush@example.com"], "pln_" + Math.random().toString(36).slice(2, 12), samplePlan.title, "Pokhara", 5, 2, "mid", json(["Trekking", "Lakes", "Adventure"]), json(samplePlan)]
  );

  const [conv] = await db.query(
    `INSERT INTO conversations (user_id, title, created_at, updated_at) VALUES (?,?,?,?)`,
    [userId["aayush@example.com"], "Everest Base Camp in October", addDays(-14), addDays(-13)]
  );
  await db.query(`INSERT INTO messages (conversation_id, role, content, created_at) VALUES ?`, [[
    [conv.insertId, "user", "I'm planning Everest Base Camp in October. I have 16 days and a mid-range budget. Is that enough?", addDays(-14)],
    [conv.insertId, "assistant", "Yes — 16 days is comfortable for EBC. A standard 14-day itinerary leaves you two buffer days for weather delays at Lukla. October is peak season with clear skies but cold nights above 4,000 m. Budget around NPR 170,000–190,000 per person for a guided teahouse trek, including permits and domestic flights. Would you like me to draft a day-by-day plan?", addDays(-14)],
  ]]);

  await db.query(`INSERT INTO expenses (user_id, label, category, amount, currency, spent_on) VALUES ?`, [[
    [userId["aayush@example.com"], "Thamel guesthouse", "stay", 4500, "NPR", isoDate(addDays(-12))],
    [userId["aayush@example.com"], "Dal bhat & tea", "food", 850, "NPR", isoDate(addDays(-12))],
    [userId["aayush@example.com"], "Taxi to airport", "transport", 700, "NPR", isoDate(addDays(-11))],
    [userId["aayush@example.com"], "Poon Hill permit", "activities", 3000, "NPR", isoDate(addDays(-8))],
    [userId["aayush@example.com"], "Singing bowl souvenir", "shopping", 2200, "NPR", isoDate(addDays(-5))],
  ]]);

  await db.query(`INSERT INTO scans (user_id, type, title, summary, result_json, created_at) VALUES ?`, [[
    [userId["aayush@example.com"], "landmark", "Boudhanath Stupa", "One of the largest Buddhist stupas in the world, a UNESCO site in Kathmandu.", json({ confidence: 0.94, location: "Kathmandu", tips: ["Walk the kora clockwise", "Best light at sunset"] }), addDays(-10)],
    [userId["aayush@example.com"], "receipt", "Sunrise Guesthouse receipt", "Detected total NPR 4,500 for 2 nights.", json({ vendor: "Sunrise Guesthouse", total: 4500, currency: "NPR", items: [{ label: "Room x2", amount: 4000 }, { label: "Breakfast", amount: 500 }] }), addDays(-9)],
    [userId["aayush@example.com"], "food", "Dal bhat plate", "A balanced Nepali meal: high carbohydrate, moderate protein, low fat.", json({ calories: 620, protein: 19, carbs: 98, fat: 12, allergens: [] }), addDays(-6)],
  ]]);

  for (const c of coupons) {
    await db.query(
      `INSERT INTO coupons (code, type, value, min_spend, max_uses, used_count, expires_at, active) VALUES (?,?,?,?,?,?,?,?)`,
      [c.code, c.type, c.value, c.min_spend, c.max_uses, c.used_count, c.expires_at, c.active]
    );
  }

  await db.query(`INSERT INTO inquiries (name, email, phone, subject, message, status, created_at) VALUES ?`, [[
    ["Laura Martínez", "laura@example.com", "+34 600 000 000", "Private Annapurna departure in April", "Hello, we are a group of 4 friends looking for a private ABC trek in the first week of April. Could you send a quote?", "new", addDays(-2)],
    ["Tom Becker", "tom@example.com", null, "Chitwan lodge upgrade", "Is it possible to upgrade to a deluxe room for 2 nights in Chitwan? Travelling 12–14 December.", "read", addDays(-5)],
    ["Priya Gurung", "priya@example.com", "+61 400 000 000", "Solo female trekking guide", "Do you have female guides available for the Langtang trek? I would prefer a female guide if possible.", "replied", addDays(-9)],
  ]]);

  await db.query(`INSERT INTO newsletter_subscribers (email) VALUES ?`, [[
    ["traveler1@example.com"], ["traveler2@example.com"], ["traveler3@example.com"], ["traveler4@example.com"], ["traveler5@example.com"],
  ]]);

  await db.query(`INSERT INTO faqs (question, answer, category, sort_order, active) VALUES ?`, [faqs.map((f, i) => [f.q, f.a, f.category, i + 1, 1])]);
  await db.query(`INSERT INTO testimonials (name, location, quote, rating, trip_title, active) VALUES ?`, [testimonials.map((t) => [t.name, t.location, t.quote, t.rating, t.trip_title, 1])]);

  await db.query(`INSERT INTO settings (setting_key, setting_value) VALUES ?`, [Object.entries(settingsSeed)]);

  await db.query(`INSERT INTO notifications (user_id, title, message, link, read_at) VALUES ?`, [[
    [userId["aayush@example.com"], "Your Everest trek is confirmed", "Booking NT-EBC-2401 is confirmed. Your guide will contact you 7 days before departure.", "/dashboard/bookings", null],
    [userId["aayush@example.com"], "Payment received", "We received NPR 338,000 for NT-EBC-2401. Thank you!", "/dashboard/bookings", addDays(-1)],
    [userId["aayush@example.com"], "New reply from Nepal Travel", "A member of our team replied to your inquiry about private departures.", "/dashboard", addDays(-3)],
  ]]);

  await db.query(`INSERT INTO activity_logs (user_id, action, entity, entity_id, details, ip, created_at) VALUES ?`, [[
    [userId["admin@nepaltravel.com"], "login", "admin", 1, "Admin signed in", "127.0.0.1", addDays(-1)],
    [userId["admin@nepaltravel.com"], "update", "booking", 1, "Marked NT-EBC-2401 as confirmed", "127.0.0.1", addDays(-2)],
    [userId["admin@nepaltravel.com"], "create", "trip", 17, "Published Bandipur Village Escape", "127.0.0.1", addDays(-4)],
    [userId["admin@nepaltravel.com"], "update", "trip", 1, "Updated EBC price and departure dates", "127.0.0.1", addDays(-6)],
    [userId["admin@nepaltravel.com"], "reply", "inquiry", 3, "Replied to Priya Gurung's inquiry", "127.0.0.1", addDays(-8)],
  ]]);

  console.log(`Seeded ${destinations.length} destinations, ${trips.length} trips, ${stories.length} stories, ${reviews.length} reviews, ${communityPosts.length} posts.`);
  console.log("Admin login: admin / Nepal@2026  ·  Demo user: aayush@example.com / Traveler@2026");
}
