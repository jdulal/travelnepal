import type { PlanData } from "@/types";
import { getTrips } from "./queries";
import { npr, priceOf } from "./utils";

type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

const SYSTEM = `You are the Nepal Travel assistant, a friendly local expert based in Kathmandu.
You help travellers plan treks, tours and safaris in Nepal. Be concise (max 180 words), warm and specific.
Use NPR for prices and mention realistic durations, permits and seasons. Never invent bookings or confirmations.
If the user wants a full day-by-day plan, suggest the AI itinerary builder at /itinerary.
Do not use markdown headings; plain sentences and short lines are best.`;

async function aiChat(messages: ChatMsg[], temperature = 0.6): Promise<string | null> {
  const base = process.env.AI_BASE_URL?.trim() || (process.env.AI_API_KEY ? "https://api.openai.com/v1" : "");
  const key = process.env.AI_API_KEY?.trim();
  if (!base) return null;
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages,
        temperature,
        max_tokens: 700,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  }
}

async function aiJson<T>(prompt: string, image?: string): Promise<T | null> {
  const base = process.env.AI_BASE_URL?.trim() || (process.env.AI_API_KEY ? "https://api.openai.com/v1" : "");
  const key = process.env.AI_API_KEY?.trim();
  if (!base) return null;
  try {
    const content = image
      ? [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: image } },
        ]
      : prompt;
    const res = await fetch(`${base.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(key ? { Authorization: `Bearer ${key}` } : {}) },
      body: JSON.stringify({
        model: process.env.AI_MODEL || "gpt-4o-mini",
        messages: [{ role: "user", content }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

const topics: { keys: string[]; reply: string; trip?: string }[] = [
  {
    keys: ["everest", "ebc", "base camp", "khumbu", "kala patthar"],
    trip: "everest-base-camp-trek",
    reply:
      "Everest Base Camp is a 12–14 day trek from Lukla, reaching 5,364 m at Base Camp and 5,555 m at Kala Patthar. The best windows are March–May and October–November. Go slowly, take both acclimatisation days, and budget for the Lukla flight to be delayed by weather.\n\nOur 14-day EBC trek includes permits, guide, porters and two rest days, from NPR 169,000 per person.",
  },
  {
    keys: ["annapurna base", "abc", "sanctuary"],
    trip: "annapurna-base-camp-trek",
    reply:
      "Annapurna Base Camp is an 11-day teahouse trek that finishes inside a 360° mountain amphitheatre at 4,130 m. It is easier than Everest, with comfortable lodges and the Jhinu hot springs on the way down.\n\nBest seasons: March–May and September–December. Our 11-day ABC trip starts at NPR 124,000 per person, including permits and transport.",
  },
  {
    keys: ["poon hill", "ghorepani"],
    trip: "ghorepani-poon-hill-trek",
    reply:
      "Poon Hill is the best first trek in Nepal: 5 days, gentle teahouses and a sunrise at 3,210 m that takes in Dhaulagiri, Annapurna South and Machhapuchhre. The rhododendron forest is spectacular in March and April.\n\nOur Poon Hill trek starts at NPR 62,000 with guide, porter, permits and transport included.",
  },
  {
    keys: ["manaslu", "larke"],
    trip: "manaslu-circuit-trek",
    reply:
      "The Manaslu Circuit is a 14-day restricted-area trek around the world's eighth-highest mountain, crossing the 5,106 m Larke La. It is quieter and more challenging than Annapurna, with Tibetan-influenced villages and basic lodges.\n\nYou need a restricted-area permit and a minimum group of two. Our 14-day Manaslu departure is NPR 210,000 per person.",
  },
  {
    keys: ["mustang", "lo manthang", "forbidden"],
    trip: "upper-mustang-trek",
    reply:
      "Upper Mustang is the old Kingdom of Lo — ochre cliffs, sky caves and the walled city of Lo Manthang, north of the Annapurnas in the rain shadow. It is a 10–12 day trek, lodge-based but remote, and usually best March–November.\n\nA restricted-area permit (US$500 for 10 days) applies and must be arranged through a licensed agency. Our 12-day Upper Mustang trek covers everything for NPR 225,000.",
  },
  {
    keys: ["langtang", "kyanjin"],
    trip: "langtang-valley-trek",
    reply:
      "Langtang is the closest high mountain valley to Kathmandu — 8 days, comfortable teahouses, Tamang villages and the glacier at Kyanjin Gompa. It is a great choice if you want big scenery with limited time.\n\nBest March–May and October–November. Our Langtang Valley trek is NPR 89,000 including permits and transport.",
  },
  {
    keys: ["chitwan", "safari", "rhino", "jungle"],
    trip: "chitwan-jungle-safari",
    reply:
      "Chitwan is Nepal's best wildlife destination, with greater one-horned rhinos, crocodiles and 500+ bird species. A 3-day stay with a jeep safari, canoe ride and naturalist walk is the classic option, and October–March is the best weather.\n\nOur Chitwan Jungle Safari includes full board, permits and all activities from NPR 38,000 per person.",
  },
  {
    keys: ["pokhara", "phewa", "paraglid", "sarangkot"],
    trip: "pokhara-lakes-adventure",
    reply:
      "Pokhara is Nepal's adventure base: Phewa Lake, Sarangkot sunrise, paragliding, kayaking and easy access to Annapurna treks. Three to four days is ideal, and September–May offers the clearest mountain views.\n\nOur 4-day Pokhara adventure includes paragliding and kayaking from NPR 54,000 per person.",
  },
  {
    keys: ["kathmandu", "durbar", "boudhanath", "pashupatinath", "heritage"],
    trip: "kathmandu-heritage-tour",
    reply:
      "Kathmandu Valley has seven UNESCO World Heritage sites. Give it at least three days: Boudhanath and Pashupatinath, Kathmandu and Patan Durbar Squares, then Bhaktapur and Changunarayan. Our 4-day heritage tour includes an expert cultural guide and all monument tickets from NPR 48,000.",
  },
  {
    keys: ["lumbini", "buddha", "monastery"],
    trip: "lumbini-buddhist-circuit",
    reply:
      "Lumbini is the birthplace of the Buddha, with the Maya Devi Temple, Ashoka Pillar and a monastic zone of temples from across Asia. Two to three days is enough, and October–March is the most comfortable season. Our 4-day Buddhist circuit includes meditation and the nearby Tilaurakot site.",
  },
  {
    keys: ["permit", "tims", "paperwork", "visa"],
    reply:
      "Most treks need a TIMS card and a national park or conservation permit — all included in our trip prices. Restricted areas (Upper Mustang, Manaslu, Dolpo) need extra permits, a registered agency and a minimum of two trekkers. For Nepal visas, most nationalities can get a 15/30/90-day visa on arrival or online; bring passport photos and the exact USD fee in cash.",
  },
  {
    keys: ["best time", "season", "weather", "monsoon", "when to"],
    reply:
      "The two best trekking windows are March–May (rhododendrons, warmer, hazier) and October–November (crisp skies, cold nights). December–February is good for low-altitude tours and Chitwan. The monsoon (June–September) brings rain and leeches, though Upper Mustang and Dolpo sit in the rain shadow.",
  },
  {
    keys: ["cost", "budget", "price", "cheap", "expensive", "money"],
    reply:
      "As a guide: teahouse treks run roughly NPR 8,000–13,000 per day with a guide, porter and meals; our Poon Hill trip is NPR 62,000 for 5 days and EBC is NPR 169,000 for 14. City tours and safaris are usually NPR 10,000–15,000 per day. Add travel insurance, tips and personal spending. All our published prices are per person and include permits and transport.",
  },
  {
    keys: ["altitude", "sick", "ams", "safety", "oxygen", "diamox"],
    reply:
      "Altitude sickness is the main risk above 3,000 m. Our itineraries build in acclimatisation days, guides carry pulse oximeters and oxygen, and we descend immediately if symptoms worsen. Drink 3–4 litres a day, avoid alcohol, and consider talking to your doctor about acetazolamide before you fly. Travel insurance must cover high-altitude trekking and helicopter evacuation.",
  },
  {
    keys: ["solo", "female", "woman", "women", "safe"],
    reply:
      "Nepal is generally very safe for solo and female travellers. We can assign a female guide on request for any trek, and our groups are small. For teahouse treks, a guide is now mandatory for foreign trekkers. Share your itinerary with someone at home and keep a copy of your passport and insurance details.",
  },
  {
    keys: ["pack", "gear", "equipment", "clothes"],
    reply:
      "Core kit: broken-in waterproof boots, layered clothing (base layer, fleece, down jacket), waterproof shell, sleeping bag liner, sun hat, warm hat and gloves, headtorch, water purification, first-aid and 2–3 litres of water capacity. We provide duffel bags, a down jacket and a sleeping bag on request for high treks. Leave cotton at home.",
  },
  {
    keys: ["food", "eat", "dal bhat", "momo", "vegetarian", "vegan"],
    reply:
      "Dal bhat (rice, lentils, vegetables) is the trekker's fuel and usually comes with free refills. Momo, thukpa, sel roti and Newari khaja are worth seeking out. Vegetarian food is easy everywhere; vegan is manageable in cities and tourist teahouses. Stick to boiled or purified water, and avoid raw salad in remote areas.",
  },
  {
    keys: ["flight", "lukla", "delay", "airport"],
    reply:
      "Lukla flights are weather-dependent and often delayed. Build at least one buffer day before your international flight home, and keep the option of a helicopter transfer in mind. Our EBC itinerary includes the domestic flights and we rebook you if weather closes the pass — but we cannot control the mountain weather.",
  },
  {
    keys: ["cancel", "refund", "deposit", "payment", "esewa", "khalti"],
    reply:
      "We take a 20% deposit to confirm a booking, with the balance due before departure. Cancellations 30+ days before departure receive a full refund; 15–29 days receive 50%; inside 14 days is non-refundable. Permits and domestic flights are non-refundable once issued. We accept eSewa, Khalti, bank transfer and cash at our Kathmandu office.",
  },
  {
    keys: ["visa", "entry", "arrival"],
    reply:
      "Most visitors can obtain a Nepal visa on arrival at Tribhuvan International Airport or apply online in advance. Fees are US$30 for 15 days, US$50 for 30 days and US$125 for 90 days (2026 rates). Bring passport photos and pay in cash or card. Your passport should be valid for at least six months.",
  },
];

async function enrichTrip(tripSlug?: string) {
  if (!tripSlug) return null;
  const trips = await getTrips({ limit: 40 });
  return trips.find((t) => t.slug === tripSlug) ?? null;
}

export async function generateChatReply(history: ChatMsg[]): Promise<string> {
  const live = await aiChat([{ role: "system", content: SYSTEM }, ...history]);
  if (live) return live;

  const last = [...history].reverse().find((m) => m.role === "user")?.content?.toLowerCase() ?? "";
  const scored = topics
    .map((t) => ({ t, score: t.keys.filter((k) => last.includes(k)).length }))
    .sort((a, b) => b.score - a.score);

  const match = scored[0]?.score > 0 ? scored[0].t : null;

  if (last.includes("plan") || last.includes("itinerary") || last.includes("days in") || last.includes("day in")) {
    return "I can build that properly. Open the AI itinerary builder (/itinerary), choose your destination, dates, group size and interests, and I'll return a day-by-day plan with meals, stays and a cost estimate. You can save it to your dashboard and turn it into a booking.\n\nIf you tell me the destination and number of days here, I can also give you a quick outline.";
  }

  if (match) {
    const trip = await enrichTrip(match.trip);
    let reply = match.reply;
    if (trip) {
      reply += `\n\nYou can see the full day-by-day itinerary for ${trip.title} at /tours/${trip.slug}. Price from ${npr(priceOf(trip))} per person, ${trip.duration_days} days.`;
    }
    return reply;
  }

  if (/hello|hi|namaste|hey|good morning|good evening/.test(last)) {
    return "Namaste! I'm the Nepal Travel assistant. I can help you choose a trek, understand permits and seasons, estimate costs, plan a route or book a trip. What kind of adventure are you thinking about — mountains, culture, or wildlife?";
  }

  return "I can help with treks, tours, permits, costs, seasons, safety and packing. For example, ask me: \"Is Everest Base Camp right for a first trek?\", \"Best time for Annapurna\", or \"How much does a 5-day trek cost?\"\n\nFor a full day-by-day plan, try the AI itinerary builder at /itinerary.";
}

/* ----------------------------- Itinerary ----------------------------- */

type Profile = {
  key: string;
  name: string;
  region: string;
  base: number;
  stay: string;
  activities: { tag: string; title: string; morning: string; afternoon: string; evening: string }[];
  tips: string[];
};

const profiles: Profile[] = [
  {
    key: "everest",
    name: "Everest Region",
    region: "Khumbu",
    base: 11500,
    stay: "Tea house",
    activities: [
      { tag: "trekking", title: "Trek to Namche Bazaar", morning: "Cross the Hillary suspension bridge and climb through pine forest.", afternoon: "Arrive in Namche, visit the Sherpa museum and acclimatise.", evening: "Dal bhat and an early night at the teahouse.", },
      { tag: "trekking", title: "Acclimatisation in Namche", morning: "Short hike to the Everest View Hotel for your first Everest panorama.", afternoon: "Rest, hydrate and explore the Saturday market if it is running.", evening: "Briefing with your guide about the days ahead." },
      { tag: "trekking", title: "Tengboche Monastery", morning: "Walk the ridge above the Dudh Koshi with Everest views.", afternoon: "Visit Tengboche Monastery and join the evening prayer.", evening: "Tea and cards in the lodge dining room." },
      { tag: "trekking", title: "Into the high valley", morning: "Trek through Pangboche to Dingboche's stone-walled fields.", afternoon: "Acclimatisation walk on the Nangkartshang ridge.", evening: "Early dinner and rest at 4,410 m." },
      { tag: "trekking", title: "Everest Base Camp", morning: "Walk the Khumbu glacier moraine from Gorak Shep.", afternoon: "Reach Everest Base Camp and celebrate at 5,364 m.", evening: "Return to Gorak Shep for the night." },
      { tag: "trekking", title: "Kala Patthar sunrise", morning: "Pre-dawn climb to Kala Patthar for sunrise over Everest.", afternoon: "Descend to Pheriche for a warmer, easier night.", evening: "Celebration dinner with the crew." },
    ],
    tips: ["Take both acclimatisation days seriously.", "Build a buffer day for Lukla weather delays.", "Carry cash for hot showers and charging above Namche."],
  },
  {
    key: "annapurna",
    name: "Annapurna Region",
    region: "Gandaki",
    base: 9500,
    stay: "Tea house",
    activities: [
      { tag: "trekking", title: "Ghandruk village", morning: "Climb stone steps through terraced fields to Ghandruk.", afternoon: "Visit the Gurung museum and old monastery.", evening: "Mountain sunset over Annapurna South." },
      { tag: "trekking", title: "Chhomrong ridge", morning: "Descend to the Kimrong Khola and climb to Chhomrong.", afternoon: "Rest with views of Machhapuchhre and Annapurna South.", evening: "Teahouse dinner and briefing." },
      { tag: "trekking", title: "Into the sanctuary", morning: "Walk through bamboo and rhododendron forest.", afternoon: "Continue to Deurali as the valley narrows.", evening: "Early night before the climb to Base Camp." },
      { tag: "trekking", title: "Annapurna Base Camp", morning: "Climb past Machhapuchhre Base Camp.", afternoon: "Arrive at ABC at 4,130 m — a 360° mountain amphitheatre.", evening: "Sunset on Annapurna I." },
      { tag: "wellness", title: "Jhinu hot springs", morning: "Descend through forest to Jhinu Danda.", afternoon: "Soak in the riverside natural hot springs.", evening: "Last night on the trail." },
    ],
    tips: ["Spring brings rhododendrons but also afternoon cloud.", "Teahouses are comfortable — pack a sleeping bag liner.", "Add a Poon Hill sunrise if you have two extra days."],
  },
  {
    key: "pokhara",
    name: "Pokhara",
    region: "Gandaki",
    base: 7500,
    stay: "Lakeside hotel",
    activities: [
      { tag: "adventure", title: "Sarangkot sunrise & paragliding", morning: "Drive to Sarangkot for sunrise over the Annapurnas.", afternoon: "Tandem paragliding down to Phewa Lake.", evening: "Lakeside dinner and live music." },
      { tag: "lakes", title: "Phewa Lake & Peace Pagoda", morning: "Row a wooden boat across Phewa Lake.", afternoon: "Hike or drive to the World Peace Pagoda.", evening: "Sunset from the pagoda terrace." },
      { tag: "culture", title: "Old Pokhara", morning: "Explore the old bazaar and Bindhyabasini temple.", afternoon: "Visit the Tibetan settlement and carpet weaving centre.", evening: "Newari dinner in the bazaar." },
      { tag: "trekking", title: "Australian Camp walk", morning: "Drive to Kande and walk through forest.", afternoon: "Lunch at Australian Camp with mountain views, descend to Dhampus.", evening: "Transfer back to Lakeside." },
      { tag: "adventure", title: "Kayaking & caves", morning: "Kayak on Phewa Lake with a guide.", afternoon: "Davis Falls, Gupteshwor Cave and the mountain museum.", evening: "Free evening for cafes." },
    ],
    tips: ["Mornings are clearest for mountain views.", "Book paragliding a day ahead in peak season.", "Stay on the north end of Lakeside for quieter evenings."],
  },
  {
    key: "kathmandu",
    name: "Kathmandu Valley",
    region: "Bagmati",
    base: 6500,
    stay: "Boutique hotel",
    activities: [
      { tag: "culture", title: "Boudhanath & Pashupatinath", morning: "Walk the kora at Boudhanath before the crowds.", afternoon: "Explore Pashupatinath's ghats and temples.", evening: "Rooftop dinner overlooking the stupa." },
      { tag: "culture", title: "Patan & Kathmandu Durbar Square", morning: "Patan museum, golden temple and courtyards.", afternoon: "Kathmandu Durbar Square and Kumari Ghar.", evening: "Newari food walk in Ason." },
      { tag: "culture", title: "Bhaktapur", morning: "Explore Bhaktapur Durbar Square at opening time.", afternoon: "Pottery Square workshop and juju dhau tasting.", evening: "Sunset at Nyatapola temple." },
      { tag: "nature", title: "Nagarkot sunrise", morning: "Drive to Nagarkot for the Himalayan sunrise.", afternoon: "Walk to Changunarayan temple through villages.", evening: "Return to Kathmandu." },
      { tag: "food", title: "Local food & craft", morning: "Momos and chiya in a local bazaar.", afternoon: "Thangka painting or woodcarving workshop.", evening: "Nepali thali dinner with live music." },
    ],
    tips: ["Buy the combined monument ticket in Kathmandu.", "Allow extra time for traffic — distances are short but slow.", "Dress modestly at temples and remove shoes."],
  },
  {
    key: "chitwan",
    name: "Chitwan",
    region: "Terai",
    base: 8200,
    stay: "Jungle lodge",
    activities: [
      { tag: "wildlife", title: "Jeep safari", morning: "Dawn jeep safari deep into the national park.", afternoon: "Look for rhino, deer, crocodile and birds with a naturalist.", evening: "Tharu cultural performance." },
      { tag: "wildlife", title: "Canoe & jungle walk", morning: "Dugout canoe ride on the Rapti River.", afternoon: "Guided jungle walk and elephant breeding centre.", evening: "Sunset by the river." },
      { tag: "culture", title: "Tharu village", morning: "Cycle through Tharu villages and farmland.", afternoon: "Cooking class with a local family.", evening: "Birdwatching at dusk." },
    ],
    tips: ["Wear neutral colours and closed shoes in the jungle.", "Rhino sightings are common but never guaranteed.", "October–March is the most comfortable season."],
  },
  {
    key: "mustang",
    name: "Upper Mustang",
    region: "Trans-Himalaya",
    base: 12500,
    stay: "Tea house",
    activities: [
      { tag: "trekking", title: "Kagbeni to Chele", morning: "Enter the restricted area through the Kali Gandaki gorge.", afternoon: "Climb through ochre cliffs to Chele.", evening: "Teahouse dinner at 3,050 m." },
      { tag: "trekking", title: "Taklam La", morning: "Cross the Taklam La with desert views.", afternoon: "Walk to Syangboche past chortens.", evening: "Rest and acclimatise." },
      { tag: "culture", title: "Ghami mani wall", morning: "Cross the Nyi La pass.", afternoon: "Visit the 300 m mani wall at Ghami.", evening: "Local apple brandy (optional)." },
      { tag: "culture", title: "Lo Manthang", morning: "Cross the Lo La into the walled capital.", afternoon: "Royal palace, monasteries and sky caves of Chhoser.", evening: "Sunset over the desert." },
      { tag: "trekking", title: "Return south", morning: "Descend through Ghami and Samar.", afternoon: "Return to Kagbeni and the Kali Gandaki.", evening: "Celebration dinner in Jomsom." },
    ],
    tips: ["You need a restricted-area permit and a registered guide.", "Nights are cold even in spring — bring a down jacket.", "Cash only in most villages; ATMs are unreliable."],
  },
  {
    key: "lumbini",
    name: "Lumbini",
    region: "Terai",
    base: 5200,
    stay: "Garden hotel",
    activities: [
      { tag: "culture", title: "Sacred garden", morning: "Maya Devi Temple and the Ashoka Pillar.", afternoon: "Cycle the international monastery zone.", evening: "Evening chanting at a monastery." },
      { tag: "wellness", title: "Meditation & Tilaurakot", morning: "Guided meditation with resident monks.", afternoon: "Visit the ancient Shakya capital of Tilaurakot.", evening: "Quiet dinner at the hotel." },
      { tag: "culture", title: "Ramgram & villages", morning: "Visit the Ramgram stupa.", afternoon: "Explore local Tharu villages and markets.", evening: "Return to Lumbini." },
    ],
    tips: ["Rent a bicycle — the monastic zone is spread out.", "Dress modestly and remove shoes in temple areas.", "Combine with Chitwan for a wildlife contrast."],
  },
  {
    key: "bandipur",
    name: "Bandipur",
    region: "Gandaki",
    base: 5600,
    stay: "Heritage guesthouse",
    activities: [
      { tag: "culture", title: "Old bazaar", morning: "Walk the car-free Newari bazaar.", afternoon: "Visit the Bindhyabasini temple and view points.", evening: "Sunset from Thani Mai." },
      { tag: "nature", title: "Siddha Gufa", morning: "Hike to Nepal's largest cave.", afternoon: "Explore the stalactites with a local guide.", evening: "Cooking class with a local family." },
      { tag: "nature", title: "Ridge walk", morning: "Sunrise walk along the ridge.", afternoon: "Picnic lunch with Himalayan views.", evening: "Return to the bazaar." },
    ],
    tips: ["Bandipur is car-free — pack light.", "Bring a torch for the cave.", "The drive from Kathmandu is about 5 hours."],
  },
  {
    key: "ilam",
    name: "Ilam",
    region: "Koshi",
    base: 5400,
    stay: "Tea bungalow",
    activities: [
      { tag: "wellness", title: "Tea estate walk", morning: "Walk through Kanyam's tea terraces.", afternoon: "Visit an orthodox tea factory and taste the day's batch.", evening: "Sunset over the eastern hills." },
      { tag: "nature", title: "Antu Danda", morning: "Sunrise from Antu Danda.", afternoon: "Hike through cardamom farms and forest.", evening: "Local Limbu dinner." },
      { tag: "nature", title: "Mai Pokhari", morning: "Forest walk to the sacred lake.", afternoon: "Birdwatching and a picnic.", evening: "Return to Ilam town." },
    ],
    tips: ["April and October are the best tea-plucking seasons.", "The roads are winding — allow extra travel time.", "Buy tea directly from the estate for the best price."],
  },
];

function matchProfile(destination: string): Profile {
  const d = destination.toLowerCase();
  if (d.includes("everest") || d.includes("khumbu") || d.includes("lukla") || d.includes("base camp")) return profiles[0];
  if (d.includes("annapurna") || d.includes("poon") || d.includes("ghorepani")) return profiles[1];
  if (d.includes("pokhara") || d.includes("phewa")) return profiles[2];
  if (d.includes("chitwan") || d.includes("safari")) return profiles[4];
  if (d.includes("mustang") || d.includes("lo manthang") || d.includes("jomsom")) return profiles[5];
  if (d.includes("lumbini") || d.includes("buddha")) return profiles[6];
  if (d.includes("bandipur")) return profiles[7];
  if (d.includes("ilam") || d.includes("tea")) return profiles[8];
  if (!d) return profiles[2];
  if (d.includes("nepal")) return profiles[2];
  return profiles[3];
}

export async function generateItinerary(input: {
  destination: string;
  days: number;
  travelers: number;
  budgetTier: string;
  interests: string[];
}): Promise<{ plan: PlanData; source: "ai" | "local" }> {
  const days = Math.min(Math.max(Number(input.days) || 5, 1), 21);
  const travelers = Math.min(Math.max(Number(input.travelers) || 2, 1), 20);
  const tier = ["budget", "mid", "luxury"].includes(input.budgetTier) ? input.budgetTier : "mid";
  const interests = input.interests.map((i) => i.toLowerCase());
  const profile = matchProfile(input.destination);

  const live = await aiJson<PlanData>(
    `Create a realistic ${days}-day Nepal travel itinerary for ${travelers} travellers in ${input.destination || profile.name}.
Budget tier: ${tier}. Interests: ${interests.join(", ") || "general sightseeing"}.
Respond ONLY with JSON matching this shape:
{"title":string,"destination":string,"days":number,"travelers":number,"budget_tier":string,"summary":string,
"itinerary":[{"day":number,"title":string,"morning":string,"afternoon":string,"evening":string,"meals":string[],"stay":string,"cost":number}],
"totals":{"per_person":number,"group":number,"currency":"NPR"},
"tips":string[]}
Costs are per person in NPR. Use real Nepali places, dishes and practical travel times.`
  );

  if (live && Array.isArray(live.itinerary) && live.itinerary.length) {
    return { plan: { ...live, days, travelers, budget_tier: tier }, source: "ai" };
  }

  const multiplier = tier === "budget" ? 0.7 : tier === "luxury" ? 1.9 : 1;
  const sortedActivities = [...profile.activities].sort((a, b) => {
    const score = (t: string) => (interests.some((i) => t.includes(i) || i.includes(t)) ? 1 : 0);
    return score(b.tag) - score(a.tag);
  });

  const itinerary: PlanData["itinerary"] = [];
  const totalDays = days;

  for (let day = 1; day <= totalDays; day++) {
    if (day === 1) {
      itinerary.push({
        day,
        title: `Arrive in ${profile.name}`,
        morning: `Transfer from the airport or bus park to your ${profile.stay.toLowerCase()}.`,
        afternoon: "Check in, meet your guide and take an easy orientation walk.",
        evening: "Welcome dinner with a trip briefing.",
        meals: ["Dinner"],
        stay: profile.stay,
        cost: Math.round(profile.base * 0.5 * multiplier),
      });
    } else if (day === totalDays) {
      itinerary.push({
        day,
        title: "Departure",
        morning: "Free morning for last-minute shopping or a cafe.",
        afternoon: "Transfer to the airport or onward transport.",
        evening: "Depart Nepal — or extend your trip.",
        meals: ["Breakfast"],
        stay: "—",
        cost: Math.round(profile.base * 0.35 * multiplier),
      });
    } else {
      const activity = sortedActivities[(day - 2) % sortedActivities.length];
      itinerary.push({
        day,
        title: activity.title,
        morning: activity.morning,
        afternoon: activity.afternoon,
        evening: activity.evening,
        meals: ["Breakfast", day % 3 === 0 ? "Lunch" : "Dinner"],
        stay: profile.stay,
        cost: Math.round(profile.base * multiplier),
      });
    }
  }

  const perPerson = itinerary.reduce((sum, d) => sum + d.cost, 0);
  const plan: PlanData = {
    title: `${days} days in ${profile.name}`,
    destination: profile.name,
    days,
    travelers,
    budget_tier: tier,
    summary: `A ${days}-day ${tier === "budget" ? "value-focused" : tier === "luxury" ? "comfort-focused" : "balanced"} plan in ${profile.name}, with time for ${interests.slice(0, 3).join(", ") || "the highlights"} and a realistic daily pace.`,
    itinerary,
    totals: { per_person: perPerson, group: perPerson * travelers, currency: "NPR" },
    tips: profile.tips,
  };

  return { plan, source: "local" };
}

/* ----------------------------- Vision tools ----------------------------- */

const landmarkHints: { keys: string[]; data: Record<string, unknown> }[] = [
  {
    keys: ["boudha", "boudhanath", "stupa", "buddha eyes"],
    data: { name: "Boudhanath Stupa", location: "Kathmandu", confidence: 0.93, description: "One of the largest Buddhist stupas in the world and a UNESCO World Heritage site, with the painted eyes of the Buddha facing all four directions.", tips: ["Walk the kora clockwise", "Visit at sunset when butter lamps are lit", "Try a rooftop cafe for the classic view"] },
  },
  {
    keys: ["swayambhu", "monkey temple", "swayambhunath"],
    data: { name: "Swayambhunath (Monkey Temple)", location: "Kathmandu", confidence: 0.9, description: "An ancient stupa on a hilltop west of Kathmandu, reached by 365 stone steps and famous for its resident monkeys and valley views.", tips: ["Go early to avoid crowds", "Watch your snacks around monkeys", "The west side has the best sunset view"] },
  },
  {
    keys: ["everest", "sagarmatha", "khumbu", "himalaya", "mountain"],
    data: { name: "Everest / Himalayan range", location: "Khumbu, Nepal", confidence: 0.88, description: "The Everest massif including Everest, Nuptse and Lhotse, best seen from Kala Patthar or a scenic mountain flight from Kathmandu.", tips: ["Kala Patthar offers the classic sunrise view", "Mountain flights leave at dawn", "Acclimatise properly before any high viewpoint"] },
  },
  {
    keys: ["bhaktapur", "nyatapola", "pottery"],
    data: { name: "Bhaktapur Durbar Square", location: "Bhaktapur", confidence: 0.91, description: "The best-preserved medieval square in Nepal, with the five-storey Nyatapola temple, palace courtyards and pottery workshops.", tips: ["Stay overnight to see the square without crowds", "Try juju dhau (king curd)", "Visit Pottery Square in the morning"] },
  },
  {
    keys: ["pashupati", "shiva", "ghat"],
    data: { name: "Pashupatinath Temple", location: "Kathmandu", confidence: 0.9, description: "Nepal's most sacred Hindu temple complex on the Bagmati river, dedicated to Shiva, with cremation ghats and sadhu rituals.", tips: ["Non-Hindus cannot enter the main temple but can view from the east bank", "Be respectful when photographing rituals", "Evening aarti is atmospheric"] },
  },
  {
    keys: ["phewa", "pokhara", "lake"],
    data: { name: "Phewa Lake, Pokhara", location: "Pokhara", confidence: 0.86, description: "Pokhara's iconic lake with wooden boats, the Tal Barahi temple on an island and reflections of Machhapuchhre on clear mornings.", tips: ["Rent a boat before 9am for calm water", "Hike to the World Peace Pagoda for sunset", "The north shore is quieter"] },
  },
  {
    keys: ["chitwan", "rhino", "elephant"],
    data: { name: "Chitwan National Park", location: "Chitwan", confidence: 0.87, description: "Nepal's first national park and a UNESCO Natural World Heritage site, home to greater one-horned rhinos, gharials and 500+ bird species.", tips: ["Jeep safaris are best at dawn", "Wear neutral colours", "Never approach wildlife on foot without a naturalist"] },
  },
];

const foods: Record<string, { dish: string; calories: number; protein: number; carbs: number; fat: number; allergens: string[]; note: string }> = {
  "dal bhat": { dish: "Dal bhat", calories: 620, protein: 19, carbs: 98, fat: 12, allergens: [], note: "A balanced staple with rice, lentil soup, vegetables and pickle. Usually comes with free refills — great fuel for trekking." },
  momo: { dish: "Momo (10 pieces, steamed)", calories: 480, protein: 18, carbs: 58, fat: 18, allergens: ["Gluten"], note: "Steamed dumplings. Chicken or buff are most common; vegetable and paneer versions are easy to find. The tomato achar adds sodium." },
  thukpa: { dish: "Thukpa (noodle soup)", calories: 430, protein: 20, carbs: 55, fat: 12, allergens: ["Gluten"], note: "A warming noodle soup, ideal at altitude. Ask for extra vegetables and less oil." },
  "sel roti": { dish: "Sel roti (2 pieces)", calories: 310, protein: 4, carbs: 52, fat: 10, allergens: ["Gluten"], note: "A sweet, ring-shaped rice-flour bread eaten at festivals and breakfast. High in carbohydrate, low in protein." },
  "newari khaja": { dish: "Newari khaja set", calories: 780, protein: 26, carbs: 96, fat: 28, allergens: ["Gluten"], note: "A festive platter with beaten rice, buff choila, beans, egg and pickle. Delicious but high in salt and fat." },
  gundruk: { dish: "Gundruk (fermented greens)", calories: 120, protein: 6, carbs: 18, fat: 2, allergens: [], note: "Fermented leafy greens, usually served as a tangy soup or side. High in fibre and vitamin K." },
  chowmein: { dish: "Chowmein", calories: 540, protein: 14, carbs: 78, fat: 18, allergens: ["Gluten", "Soy"], note: "Nepali-style stir-fried noodles, often with egg or vegetables. Ask for less oil and extra vegetables." },
  "momo (veg)": { dish: "Vegetable momo (10 pieces)", calories: 410, protein: 11, carbs: 62, fat: 12, allergens: ["Gluten"], note: "Steamed vegetable dumplings — a lighter option than fried snacks." },
  "masu": { dish: "Chicken masu (curry)", calories: 520, protein: 34, carbs: 18, fat: 34, allergens: [], note: "A rich Nepali curry, often served with rice. High in protein and fat; ask for less oil if you prefer." },
  "milk tea": { dish: "Milk chiya (1 cup)", calories: 110, protein: 3, carbs: 14, fat: 4, allergens: ["Dairy"], note: "Sweet spiced tea with milk — a trail ritual. Ask for less sugar if you are watching intake." },
};

function normalize(s: string) {
  return s.toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ").trim();
}

type ToolResult = {
  demo: boolean;
  name?: string;
  location?: string;
  confidence?: number;
  description?: string;
  tips?: string[];
  vendor?: string;
  total?: number;
  currency?: string;
  items?: { label: string; amount: number }[];
  note?: string;
  dish?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  allergens?: string[];
  health_note?: string;
};

export async function analyzeTool(type: "landmark" | "receipt" | "food", payload: { image?: string; text?: string }): Promise<ToolResult> {
  const text = normalize(payload.text || "");
  const prompts = {
    landmark:
      'Identify the Nepal landmark in this image. Return JSON: {"name":string,"location":string,"confidence":number,"description":string,"tips":string[]}. If it is not a Nepal landmark, say so honestly.',
    receipt:
      'Read this travel receipt. Return JSON: {"vendor":string,"total":number,"currency":string,"items":[{"label":string,"amount":number}],"note":string}. Do not invent items that are not visible.',
    food:
      'Identify the food in this image or description and estimate nutrition. Return JSON: {"dish":string,"calories":number,"protein":number,"carbs":number,"fat":number,"allergens":string[],"health_note":string}.',
  };

  const live = await aiJson<Record<string, unknown>>(prompts[type], payload.image);
  if (live) return { ...live, demo: false };

  if (type === "food") {
    const key = Object.keys(foods).find((k) => text.includes(k)) || (text.includes("momo") ? "momo" : null);
    if (key) return { ...foods[key], demo: false, note: foods[key].note };
    const guess = text ? text.split(" ").slice(0, 4).join(" ") : "Nepali meal";
    return {
      dish: guess || "Nepali thali",
      calories: 550,
      protein: 18,
      carbs: 78,
      fat: 16,
      allergens: [],
      health_note: "A rough estimate for a typical Nepali plate. Add an AI key in .env for photo-based analysis.",
      demo: true,
    };
  }

  if (type === "receipt") {
    const number = text.match(/(\d{3,6})/);
    return {
      vendor: text ? text.split(" ").slice(0, 3).join(" ") : "Nepal Travel partner lodge",
      total: number ? Number(number[1]) : 4500,
      currency: "NPR",
      items: [
        { label: "Accommodation", amount: number ? Math.round(Number(number[1]) * 0.8) : 3600 },
        { label: "Meals", amount: number ? Math.round(Number(number[1]) * 0.2) : 900 },
      ],
      note: "Demo extraction. Add an AI vision key in .env for real OCR and line-item detection.",
      demo: true,
    };
  }

  const hint = landmarkHints.find((h) => h.keys.some((k) => text.includes(k)));
  if (hint) {
    return { ...hint.data, note: text ? "Matched from your description. Add an AI vision key in .env for photo recognition." : undefined, demo: true };
  }
  return {
    ...landmarkHints[0].data,
    note: "Demo result: this looks like a Kathmandu Valley stupa, but without a vision model I cannot be certain. Add an AI key in .env for live recognition, or describe the landmark in the text box.",
    demo: true,
  };
}
