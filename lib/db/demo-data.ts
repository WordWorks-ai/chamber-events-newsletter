import type { Chamber } from "@/lib/utils/validation";

const now = new Date("2026-03-14T12:00:00.000Z").toISOString();

let counter = 0;
function uid(): string {
  counter++;
  const hex = counter.toString(16).padStart(4, "0");
  return `00000000-0000-4000-a000-00000000${hex}`;
}

function chamber(
  slug: string,
  name: string,
  websiteUrl: string,
  eventsUrl: string,
  platformHint: string | null,
  region: string,
  state: string,
  timezone = "America/New_York"
): Chamber {
  return {
    id: uid(),
    slug,
    name,
    websiteUrl,
    eventsUrl,
    platformHint,
    active: true,
    defaultTimezone: timezone,
    logoUrl: null,
    faviconUrl: null,
    themeColor: null,
    metadata: { region, state },
    createdAt: now,
    updatedAt: now
  };
}

export const seededChambers: Chamber[] = [
  // ── Ohio ──────────────────────────────────────────────────────────────
  chamber(
    "columbus-chamber",
    "Columbus Chamber of Commerce",
    "https://columbus.org",
    "https://columbus.org/events/",
    "jsonld-event-adapter",
    "Columbus",
    "OH"
  ),
  chamber(
    "dublin-chamber",
    "Dublin Chamber of Commerce",
    "https://www.dublinchamber.org",
    "https://business.dublinchamber.org/events/calendar",
    "growthzone-family-adapter",
    "Dublin",
    "OH"
  ),
  chamber(
    "westerville-area-chamber",
    "Westerville Area Chamber of Commerce",
    "https://www.westervillechamber.com",
    "https://business.westervillechamber.com/events/calendar",
    "growthzone-family-adapter",
    "Westerville",
    "OH"
  ),
  chamber(
    "delaware-area-chamber",
    "Delaware Area Chamber of Commerce",
    "https://www.delawareareachamber.com",
    "https://business.delawareareachamber.com/events/calendar",
    "growthzone-family-adapter",
    "Delaware",
    "OH"
  ),
  chamber(
    "grove-city-chamber",
    "Grove City Area Chamber of Commerce",
    "https://www.gcchamber.org",
    "https://business.gcchamber.org/events/calendar",
    "growthzone-family-adapter",
    "Grove City",
    "OH"
  ),
  chamber(
    "powell-chamber",
    "Powell Area Chamber of Commerce",
    "https://www.powellchamber.com",
    "https://business.powellchamber.com/events/calendar",
    "growthzone-family-adapter",
    "Powell",
    "OH"
  ),
  chamber(
    "pickerington-chamber",
    "Pickerington Area Chamber of Commerce",
    "https://www.pickeringtonchamber.com",
    "https://business.pickeringtonchamber.com/events/calendar",
    "growthzone-family-adapter",
    "Pickerington",
    "OH"
  ),
  chamber(
    "greater-akron-chamber",
    "Greater Akron Chamber",
    "https://www.greaterakronchamber.org",
    "https://www.greaterakronchamber.org/events",
    "jsonld-event-adapter",
    "Akron",
    "OH"
  ),
  chamber(
    "dayton-chamber",
    "Dayton Area Chamber of Commerce",
    "https://www.daytonchamber.org",
    "https://www.daytonchamber.org/events",
    null,
    "Dayton",
    "OH"
  ),
  chamber(
    "toledo-chamber",
    "Toledo Regional Chamber of Commerce",
    "https://www.toledochamber.com",
    "https://www.toledochamber.com/events",
    null,
    "Toledo",
    "OH"
  ),

  // ── Texas ─────────────────────────────────────────────────────────────
  chamber(
    "houston-chamber",
    "Greater Houston Partnership",
    "https://www.houston.org",
    "https://www.houston.org/events",
    null,
    "Houston",
    "TX",
    "America/Chicago"
  ),
  chamber(
    "dallas-chamber",
    "Dallas Regional Chamber",
    "https://www.dallaschamber.org",
    "https://www.dallaschamber.org/events/",
    null,
    "Dallas",
    "TX",
    "America/Chicago"
  ),
  chamber(
    "san-antonio-chamber",
    "San Antonio Chamber of Commerce",
    "https://www.sachamber.org",
    "https://www.sachamber.org/events/",
    null,
    "San Antonio",
    "TX",
    "America/Chicago"
  ),
  chamber(
    "austin-chamber",
    "Austin Chamber of Commerce",
    "https://www.austinchamber.com",
    "https://www.austinchamber.com/events",
    null,
    "Austin",
    "TX",
    "America/Chicago"
  ),
  chamber(
    "frisco-chamber",
    "Frisco Chamber of Commerce",
    "https://www.friscochamber.com",
    "https://www.friscochamber.com/events/",
    null,
    "Frisco",
    "TX",
    "America/Chicago"
  ),

  // ── California ────────────────────────────────────────────────────────
  chamber(
    "sf-chamber",
    "San Francisco Chamber of Commerce",
    "https://www.sfchamber.com",
    "https://www.sfchamber.com/events",
    null,
    "San Francisco",
    "CA",
    "America/Los_Angeles"
  ),
  chamber(
    "san-diego-chamber",
    "San Diego Regional Chamber of Commerce",
    "https://www.sdchamber.org",
    "https://www.sdchamber.org/events/",
    null,
    "San Diego",
    "CA",
    "America/Los_Angeles"
  ),
  chamber(
    "sacramento-chamber",
    "Sacramento Metro Chamber",
    "https://www.metrochamber.org",
    "https://www.metrochamber.org/events/",
    null,
    "Sacramento",
    "CA",
    "America/Los_Angeles"
  ),
  chamber(
    "long-beach-chamber",
    "Long Beach Area Chamber of Commerce",
    "https://www.lbchamber.com",
    "https://www.lbchamber.com/events/",
    null,
    "Long Beach",
    "CA",
    "America/Los_Angeles"
  ),

  // ── New York ──────────────────────────────────────────────────────────
  chamber(
    "brooklyn-chamber",
    "Brooklyn Chamber of Commerce",
    "https://www.brooklynchamber.com",
    "https://www.brooklynchamber.com/events",
    null,
    "Brooklyn",
    "NY"
  ),

  // ── Florida ───────────────────────────────────────────────────────────
  chamber(
    "tampa-bay-chamber",
    "Greater Tampa Chamber of Commerce",
    "https://www.tampachamber.com",
    "https://www.tampachamber.com/events/",
    null,
    "Tampa",
    "FL"
  ),
  chamber(
    "orlando-chamber",
    "Orlando Regional Chamber of Commerce",
    "https://www.orlando.org",
    "https://www.orlando.org/events/",
    null,
    "Orlando",
    "FL"
  ),
  chamber(
    "jacksonville-chamber",
    "JAX Chamber",
    "https://www.myjaxchamber.com",
    "https://www.myjaxchamber.com/events",
    null,
    "Jacksonville",
    "FL"
  ),

  // ── Illinois ──────────────────────────────────────────────────────────
  chamber(
    "chicagoland-chamber",
    "Chicagoland Chamber of Commerce",
    "https://www.chicagolandchamber.org",
    "https://www.chicagolandchamber.org/events/",
    null,
    "Chicago",
    "IL",
    "America/Chicago"
  ),

  // ── Georgia ───────────────────────────────────────────────────────────
  chamber(
    "metro-atlanta-chamber",
    "Metro Atlanta Chamber",
    "https://www.metroatlantachamber.com",
    "https://www.metroatlantachamber.com/events",
    null,
    "Atlanta",
    "GA"
  ),
  chamber(
    "savannah-chamber",
    "Savannah Area Chamber of Commerce",
    "https://www.savannahchamber.com",
    "https://www.savannahchamber.com/events",
    null,
    "Savannah",
    "GA"
  ),

  // ── North Carolina ────────────────────────────────────────────────────
  chamber(
    "raleigh-chamber",
    "Raleigh Chamber of Commerce",
    "https://www.raleighchamber.org",
    "https://www.raleighchamber.org/events/",
    null,
    "Raleigh",
    "NC"
  ),

  // ── Michigan ──────────────────────────────────────────────────────────
  chamber(
    "detroit-chamber",
    "Detroit Regional Chamber",
    "https://www.detroitchamber.com",
    "https://www.detroitchamber.com/events/",
    null,
    "Detroit",
    "MI"
  ),
  chamber(
    "grand-rapids-chamber",
    "Grand Rapids Area Chamber of Commerce",
    "https://www.grandrapids.org",
    "https://www.grandrapids.org/events/",
    null,
    "Grand Rapids",
    "MI"
  ),

  // ── Arizona ───────────────────────────────────────────────────────────
  chamber(
    "phoenix-chamber",
    "Greater Phoenix Chamber",
    "https://www.phoenixchamber.com",
    "https://www.phoenixchamber.com/events",
    null,
    "Phoenix",
    "AZ",
    "America/Phoenix"
  ),
  chamber(
    "scottsdale-chamber",
    "Scottsdale Area Chamber of Commerce",
    "https://www.scottsdalechamber.com",
    "https://business.scottsdalechamber.com/events/calendar",
    "growthzone-family-adapter",
    "Scottsdale",
    "AZ",
    "America/Phoenix"
  ),

  // ── Washington ────────────────────────────────────────────────────────
  chamber(
    "seattle-chamber",
    "Seattle Metropolitan Chamber of Commerce",
    "https://www.seattlechamber.com",
    "https://www.seattlechamber.com/events/",
    null,
    "Seattle",
    "WA",
    "America/Los_Angeles"
  ),

  // ── Colorado ──────────────────────────────────────────────────────────
  chamber(
    "denver-chamber",
    "Denver Metro Chamber of Commerce",
    "https://www.denverchamber.org",
    "https://www.denverchamber.org/events/",
    null,
    "Denver",
    "CO",
    "America/Denver"
  ),
  chamber(
    "colorado-springs-chamber",
    "Colorado Springs Chamber & EDC",
    "https://www.coloradospringschamberedc.com",
    "https://www.coloradospringschamberedc.com/events/",
    null,
    "Colorado Springs",
    "CO",
    "America/Denver"
  ),

  // ── Tennessee ─────────────────────────────────────────────────────────
  chamber(
    "nashville-chamber",
    "Nashville Area Chamber of Commerce",
    "https://www.nashvillechamber.com",
    "https://www.nashvillechamber.com/events",
    null,
    "Nashville",
    "TN",
    "America/Chicago"
  ),
  chamber(
    "memphis-chamber",
    "Greater Memphis Chamber",
    "https://www.memphischamber.com",
    "https://www.memphischamber.com/events/",
    null,
    "Memphis",
    "TN",
    "America/Chicago"
  ),

  // ── Missouri ──────────────────────────────────────────────────────────
  chamber(
    "kc-chamber",
    "Greater Kansas City Chamber of Commerce",
    "https://www.kcchamber.com",
    "https://www.kcchamber.com/events/",
    null,
    "Kansas City",
    "MO",
    "America/Chicago"
  ),

  // ── Indiana ───────────────────────────────────────────────────────────
  chamber(
    "indy-chamber",
    "Indy Chamber",
    "https://www.indychamber.com",
    "https://www.indychamber.com/events/",
    null,
    "Indianapolis",
    "IN"
  ),

  // ── Wisconsin ─────────────────────────────────────────────────────────
  chamber(
    "milwaukee-chamber",
    "Metropolitan Milwaukee Association of Commerce",
    "https://www.mmac.org",
    "https://www.mmac.org/events.html",
    null,
    "Milwaukee",
    "WI",
    "America/Chicago"
  ),

  // ── Maryland ──────────────────────────────────────────────────────────
  chamber(
    "baltimore-chamber",
    "Greater Baltimore Committee",
    "https://gbc.org",
    "https://gbc.org/events/",
    null,
    "Baltimore",
    "MD"
  ),

  // ── Utah ──────────────────────────────────────────────────────────────
  chamber(
    "salt-lake-chamber",
    "Salt Lake Chamber",
    "https://www.slchamber.com",
    "https://www.slchamber.com/events/",
    null,
    "Salt Lake City",
    "UT",
    "America/Denver"
  ),

  // ── South Carolina ────────────────────────────────────────────────────
  chamber(
    "charleston-chamber",
    "Charleston Metro Chamber of Commerce",
    "https://www.charlestonchamber.org",
    "https://www.charlestonchamber.org/events/",
    null,
    "Charleston",
    "SC"
  ),

  // ── Louisiana ─────────────────────────────────────────────────────────
  chamber(
    "new-orleans-chamber",
    "New Orleans Chamber of Commerce",
    "https://www.neworleanschamber.org",
    "https://www.neworleanschamber.org/events",
    null,
    "New Orleans",
    "LA",
    "America/Chicago"
  ),

  // ── Alabama ───────────────────────────────────────────────────────────
  chamber(
    "birmingham-chamber",
    "Birmingham Business Alliance",
    "https://www.birminghambusinessalliance.com",
    "https://www.birminghambusinessalliance.com/events",
    null,
    "Birmingham",
    "AL",
    "America/Chicago"
  ),

  // ── Iowa ──────────────────────────────────────────────────────────────
  chamber(
    "des-moines-chamber",
    "Greater Des Moines Partnership",
    "https://www.dsmpartnership.com",
    "https://www.dsmpartnership.com/events",
    null,
    "Des Moines",
    "IA",
    "America/Chicago"
  ),

  // ── Kansas ────────────────────────────────────────────────────────────
  chamber(
    "wichita-chamber",
    "Wichita Regional Chamber of Commerce",
    "https://www.wichitachamber.org",
    "https://www.wichitachamber.org/events/",
    null,
    "Wichita",
    "KS",
    "America/Chicago"
  ),

  // ── Nebraska ──────────────────────────────────────────────────────────
  chamber(
    "omaha-chamber",
    "Greater Omaha Chamber",
    "https://www.omahachamber.org",
    "https://www.omahachamber.org/events/",
    null,
    "Omaha",
    "NE",
    "America/Chicago"
  ),

  // ── New Mexico ────────────────────────────────────────────────────────
  chamber(
    "albuquerque-chamber",
    "Albuquerque Regional Economic Alliance",
    "https://www.abq.org",
    "https://www.abq.org/events/",
    null,
    "Albuquerque",
    "NM",
    "America/Denver"
  ),

  // ── Oklahoma ──────────────────────────────────────────────────────────
  chamber(
    "okc-chamber",
    "Greater Oklahoma City Chamber",
    "https://www.okcchamber.com",
    "https://www.okcchamber.com/events",
    null,
    "Oklahoma City",
    "OK",
    "America/Chicago"
  ),

  // ── Hawaii ────────────────────────────────────────────────────────────
  chamber(
    "honolulu-chamber",
    "Chamber of Commerce Hawaii",
    "https://www.cochawaii.org",
    "https://www.cochawaii.org/events/",
    null,
    "Honolulu",
    "HI",
    "Pacific/Honolulu"
  )
];
