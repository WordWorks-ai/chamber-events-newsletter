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
    "hilliard-area-chamber",
    "Hilliard Area Chamber of Commerce",
    "https://www.hilliardchamber.org",
    "https://business.hilliardchamber.org/events/calendar",
    "growthzone-family-adapter",
    "Hilliard",
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
    "gahanna-chamber",
    "Gahanna Area Chamber of Commerce",
    "https://www.gahannachamber.com",
    "https://business.gahannachamber.com/events/calendar",
    "growthzone-family-adapter",
    "Gahanna",
    "OH"
  ),
  chamber(
    "reynoldsburg-chamber",
    "Reynoldsburg Area Chamber of Commerce",
    "https://www.reynoldsburgchamber.com",
    "https://business.reynoldsburgchamber.com/events/calendar",
    "growthzone-family-adapter",
    "Reynoldsburg",
    "OH"
  ),
  chamber(
    "upper-arlington-chamber",
    "Upper Arlington Area Chamber of Commerce",
    "https://www.uachamber.org",
    "https://business.uachamber.org/events/calendar",
    "growthzone-family-adapter",
    "Upper Arlington",
    "OH"
  ),
  chamber(
    "worthington-chamber",
    "Worthington Area Chamber of Commerce",
    "https://www.worthingtonchamber.org",
    "https://business.worthingtonchamber.org/events/calendar",
    "growthzone-family-adapter",
    "Worthington",
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
    "greater-cleveland-partnership",
    "Greater Cleveland Partnership",
    "https://www.gcpartnership.com",
    "https://www.gcpartnership.com/events",
    null,
    "Cleveland",
    "OH"
  ),
  chamber(
    "cincinnati-usa-chamber",
    "Cincinnati USA Regional Chamber",
    "https://www.cincinnatichamber.com",
    "https://www.cincinnatichamber.com/events",
    null,
    "Cincinnati",
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
    "fort-worth-chamber",
    "Fort Worth Chamber of Commerce",
    "https://www.fortworthchamber.com",
    "https://www.fortworthchamber.com/events",
    null,
    "Fort Worth",
    "TX",
    "America/Chicago"
  ),
  chamber(
    "plano-chamber",
    "Plano Chamber of Commerce",
    "https://www.planochamber.org",
    "https://business.planochamber.org/events/calendar",
    "growthzone-family-adapter",
    "Plano",
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
    "la-area-chamber",
    "Los Angeles Area Chamber of Commerce",
    "https://www.lachamber.com",
    "https://www.lachamber.com/events",
    null,
    "Los Angeles",
    "CA",
    "America/Los_Angeles"
  ),
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
    "san-jose-chamber",
    "San Jose Chamber of Commerce",
    "https://www.sjchamber.com",
    "https://www.sjchamber.com/events",
    null,
    "San Jose",
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
  chamber(
    "oakland-chamber",
    "Oakland Metropolitan Chamber of Commerce",
    "https://www.oaklandchamber.com",
    "https://www.oaklandchamber.com/events",
    null,
    "Oakland",
    "CA",
    "America/Los_Angeles"
  ),

  // ── New York ──────────────────────────────────────────────────────────
  chamber(
    "nyc-partnership",
    "Partnership for New York City",
    "https://pfnyc.org",
    "https://pfnyc.org/events/",
    null,
    "New York City",
    "NY"
  ),
  chamber(
    "brooklyn-chamber",
    "Brooklyn Chamber of Commerce",
    "https://www.brooklynchamber.com",
    "https://www.brooklynchamber.com/events",
    null,
    "Brooklyn",
    "NY"
  ),
  chamber(
    "buffalo-niagara-partnership",
    "Buffalo Niagara Partnership",
    "https://www.thepartnership.org",
    "https://www.thepartnership.org/events/",
    null,
    "Buffalo",
    "NY"
  ),
  chamber(
    "rochester-chamber",
    "Greater Rochester Chamber of Commerce",
    "https://www.greaterrochesterchamber.com",
    "https://www.greaterrochesterchamber.com/events",
    null,
    "Rochester",
    "NY"
  ),

  // ── Florida ───────────────────────────────────────────────────────────
  chamber(
    "miami-dade-chamber",
    "Greater Miami Chamber of Commerce",
    "https://www.miamichamber.com",
    "https://www.miamichamber.com/events",
    null,
    "Miami",
    "FL"
  ),
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
  chamber(
    "fort-lauderdale-chamber",
    "Greater Fort Lauderdale Chamber of Commerce",
    "https://www.ftlchamber.com",
    "https://www.ftlchamber.com/events",
    null,
    "Fort Lauderdale",
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
  chamber(
    "naperville-chamber",
    "Naperville Area Chamber of Commerce",
    "https://www.naperville.net",
    "https://business.naperville.net/events/calendar",
    "growthzone-family-adapter",
    "Naperville",
    "IL",
    "America/Chicago"
  ),
  chamber(
    "springfield-il-chamber",
    "Greater Springfield Chamber of Commerce",
    "https://www.gscc.org",
    "https://www.gscc.org/events/",
    null,
    "Springfield",
    "IL",
    "America/Chicago"
  ),

  // ── Pennsylvania ──────────────────────────────────────────────────────
  chamber(
    "philadelphia-chamber",
    "Chamber of Commerce for Greater Philadelphia",
    "https://www.chamberphl.com",
    "https://www.chamberphl.com/events",
    null,
    "Philadelphia",
    "PA"
  ),
  chamber(
    "pittsburgh-chamber",
    "Greater Pittsburgh Chamber of Commerce",
    "https://www.pittsburghchamber.com",
    "https://www.pittsburghchamber.com/events/",
    null,
    "Pittsburgh",
    "PA"
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
    "charlotte-chamber",
    "Charlotte Regional Business Alliance",
    "https://www.charlottealliance.org",
    "https://www.charlottealliance.org/events",
    null,
    "Charlotte",
    "NC"
  ),
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
    "tucson-chamber",
    "Tucson Metro Chamber",
    "https://www.tucsonchamber.org",
    "https://www.tucsonchamber.org/events/",
    null,
    "Tucson",
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

  // ── Massachusetts ─────────────────────────────────────────────────────
  chamber(
    "boston-chamber",
    "Greater Boston Chamber of Commerce",
    "https://www.bostonchamber.com",
    "https://www.bostonchamber.com/events/",
    null,
    "Boston",
    "MA"
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

  // ── Minnesota ─────────────────────────────────────────────────────────
  chamber(
    "minneapolis-chamber",
    "Minneapolis Regional Chamber",
    "https://www.minneapolischamber.org",
    "https://www.minneapolischamber.org/events/",
    null,
    "Minneapolis",
    "MN",
    "America/Chicago"
  ),

  // ── Missouri ──────────────────────────────────────────────────────────
  chamber(
    "stl-chamber",
    "St. Louis Regional Chamber",
    "https://www.stlregionalchamber.com",
    "https://www.stlregionalchamber.com/events",
    null,
    "St. Louis",
    "MO",
    "America/Chicago"
  ),
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

  // ── Virginia ──────────────────────────────────────────────────────────
  chamber(
    "nova-chamber",
    "Northern Virginia Chamber of Commerce",
    "https://www.novachamber.org",
    "https://www.novachamber.org/events/",
    null,
    "Northern Virginia",
    "VA"
  ),
  chamber(
    "richmond-chamber",
    "Greater Richmond Partnership",
    "https://www.grpva.com",
    "https://www.grpva.com/events/",
    null,
    "Richmond",
    "VA"
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

  // ── Oregon ────────────────────────────────────────────────────────────
  chamber(
    "portland-chamber",
    "Portland Business Alliance",
    "https://www.portlandalliance.com",
    "https://www.portlandalliance.com/events",
    null,
    "Portland",
    "OR",
    "America/Los_Angeles"
  ),

  // ── Nevada ────────────────────────────────────────────────────────────
  chamber(
    "las-vegas-chamber",
    "Las Vegas Metro Chamber of Commerce",
    "https://www.lvchamber.com",
    "https://www.lvchamber.com/events/",
    null,
    "Las Vegas",
    "NV",
    "America/Los_Angeles"
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

  // ── Connecticut ───────────────────────────────────────────────────────
  chamber(
    "hartford-chamber",
    "MetroHartford Alliance",
    "https://www.metrohartford.com",
    "https://www.metrohartford.com/events/",
    null,
    "Hartford",
    "CT"
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
  ),

  // ── DC ────────────────────────────────────────────────────────────────
  chamber(
    "dc-chamber",
    "DC Chamber of Commerce",
    "https://www.dcchamber.org",
    "https://www.dcchamber.org/events/",
    null,
    "Washington",
    "DC"
  )
];
