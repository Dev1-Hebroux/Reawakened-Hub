import { db } from "./db";
import { ukCampuses } from "@shared/schema";

const UK_REGIONS: Record<string, string> = {
  "london": "London",
  "birmingham": "West Midlands", 
  "manchester": "North West",
  "liverpool": "North West",
  "leeds": "Yorkshire",
  "sheffield": "Yorkshire",
  "nottingham": "East Midlands",
  "leicester": "East Midlands",
  "derby": "East Midlands",
  "bristol": "South West",
  "cardiff": "Wales",
  "swansea": "Wales",
  "edinburgh": "Scotland",
  "glasgow": "Scotland",
  "aberdeen": "Scotland",
  "dundee": "Scotland",
  "belfast": "Northern Ireland",
  "cambridge": "East of England",
  "oxford": "South East",
  "brighton": "South East",
  "southampton": "South East",
  "portsmouth": "South East",
  "newcastle": "North East",
  "durham": "North East",
  "sunderland": "North East",
  "york": "Yorkshire",
  "hull": "Yorkshire",
  "coventry": "West Midlands",
  "wolverhampton": "West Midlands",
  "exeter": "South West",
  "plymouth": "South West",
  "bath": "South West",
  "reading": "South East",
  "surrey": "South East",
  "essex": "East of England",
  "norwich": "East of England",
  "kent": "South East",
  "sussex": "South East",
  "lancaster": "North West",
  "chester": "North West",
  "salford": "North West",
  "preston": "North West",
  "bolton": "North West",
  "bradford": "Yorkshire",
  "huddersfield": "Yorkshire",
  "middlesbrough": "North East",
  "teesside": "North East",
  "staffordshire": "West Midlands",
  "worcester": "West Midlands",
  "warwick": "West Midlands",
  "loughborough": "East Midlands",
  "lincoln": "East Midlands",
  "northampton": "East Midlands",
  "bedford": "East of England",
  "hertford": "East of England",
  "colchester": "East of England",
  "ipswich": "East of England",
  "bangor": "Wales",
  "aberystwyth": "Wales",
  "stirling": "Scotland",
  "inverness": "Scotland",
  "default": "England",
};

const UNIVERSITY_CITIES: Record<string, string> = {
  "university of oxford": "Oxford",
  "university of cambridge": "Cambridge",
  "imperial college london": "London",
  "university college london": "London",
  "king's college london": "London",
  "london school of economics": "London",
  "queen mary university of london": "London",
  "goldsmiths, university of london": "London",
  "soas university of london": "London",
  "royal holloway university of london": "Egham",
  "birkbeck college, university of london": "London",
  "the american university in london": "London",
  "city, university of london": "London",
  "london metropolitan university": "London",
  "middlesex university": "London",
  "kingston university": "London",
  "brunel university london": "Uxbridge",
  "roehampton university": "London",
  "university of westminster": "London",
  "university of greenwich": "London",
  "university of east london": "London",
  "london south bank university": "London",
  "university of the arts london": "London",
  "west herts college": "Watford",
  "british college of osteopathic medicine": "London",
  "futureworks": "Manchester",
  "american intercontinental university - london": "London",
  "university college of osteopathy": "London",
  "metanoia institute": "London",
  "ravensbourne university london": "London",
  "university of bedfordshire": "Bedford",
  "de montfort university": "Leicester",
  "cranfield university": "Cranfield",
  "the open university": "Milton Keynes",
  "university of buckingham": "Buckingham",
  "regent's university london": "London",
  "university of essex": "Colchester",
  "university of hertfordshire": "Hatfield",
  "anglia ruskin university": "Cambridge",
  "university of suffolk": "Ipswich",
  "university of east anglia": "Norwich",
  "norwich university of the arts": "Norwich",
  "university of surrey": "Guildford",
  "university of sussex": "Brighton",
  "university of kent": "Canterbury",
  "university of chichester": "Chichester",
  "university of brighton": "Brighton",
  "canterbury christ church university": "Canterbury",
  "university for the creative arts": "Canterbury",
  "arts university bournemouth": "Bournemouth",
  "falmouth university": "Falmouth",
  "university of plymouth": "Plymouth",
  "plymouth marjon university": "Plymouth",
  "solent university": "Southampton",
  "university of winchester": "Winchester",
  "university of wales trinity saint david": "Carmarthen",
  "swansea university": "Swansea",
  "cardiff university": "Cardiff",
  "cardiff metropolitan university": "Cardiff",
  "university of south wales": "Pontypridd",
  "wrexham university": "Wrexham",
  "heriot-watt university": "Edinburgh",
  "edinburgh napier university": "Edinburgh",
  "queen margaret university": "Edinburgh",
  "university of st andrews": "St Andrews",
  "university of stirling": "Stirling",
  "robert gordon university": "Aberdeen",
  "university of the west of scotland": "Paisley",
  "glasgow caledonian university": "Glasgow",
  "university of strathclyde": "Glasgow",
  "university of the highlands and islands": "Inverness",
  "queen's university belfast": "Belfast",
  "ulster university": "Belfast",
  "stranmillis university college": "Belfast",
  "st mary's university college": "Belfast",
  "edge hill university": "Ormskirk",
  "university of cumbria": "Carlisle",
  "university of central lancashire": "Preston",
  "lancaster university": "Lancaster",
  "university of salford": "Salford",
  "manchester metropolitan university": "Manchester",
  "university of manchester": "Manchester",
  "royal northern college of music": "Manchester",
  "university of chester": "Chester",
  "liverpool john moores university": "Liverpool",
  "liverpool hope university": "Liverpool",
  "university of liverpool": "Liverpool",
  "keele university": "Keele",
  "staffordshire university": "Stoke-on-Trent",
  "harper adams university": "Newport",
  "university of wolverhampton": "Wolverhampton",
  "coventry university": "Coventry",
  "university of warwick": "Coventry",
  "birmingham city university": "Birmingham",
  "university of birmingham": "Birmingham",
  "aston university": "Birmingham",
  "newman university": "Birmingham",
  "university college birmingham": "Birmingham",
  "royal birmingham conservatoire": "Birmingham",
  "university of worcester": "Worcester",
  "university of gloucestershire": "Gloucester",
  "university of the west of england": "Bristol",
  "bath spa university": "Bath",
  "university of exeter": "Exeter",
  "university of derby": "Derby",
  "nottingham trent university": "Nottingham",
  "university of nottingham": "Nottingham",
  "loughborough university": "Loughborough",
  "university of leicester": "Leicester",
  "university of northampton": "Northampton",
  "bishop grosseteste university": "Lincoln",
  "university of lincoln": "Lincoln",
  "sheffield hallam university": "Sheffield",
  "university of sheffield": "Sheffield",
  "leeds beckett university": "Leeds",
  "university of leeds": "Leeds",
  "leeds arts university": "Leeds",
  "leeds trinity university": "Leeds",
  "university of bradford": "Bradford",
  "university of huddersfield": "Huddersfield",
  "york st john university": "York",
  "university of york": "York",
  "university of hull": "Hull",
  "teesside university": "Middlesbrough",
  "northumbria university": "Newcastle",
  "newcastle university": "Newcastle",
  "university of sunderland": "Sunderland",
  "durham university": "Durham",
};

function guessCity(name: string): string {
  const lowName = name.toLowerCase();
  if (UNIVERSITY_CITIES[lowName]) {
    return UNIVERSITY_CITIES[lowName];
  }
  
  const match = name.match(/University of (\w+)/i) ||
                name.match(/(\w+) University$/i) ||
                name.match(/University College (\w+)/i);
  if (match) {
    const city = match[1];
    if (!["the", "college", "arts", "creative", "west", "south", "east", "north"].includes(city.toLowerCase())) {
      return city;
    }
  }
  
  return "UK";
}

function guessRegion(name: string, city: string): string {
  const lowName = name.toLowerCase();
  const lowCity = city?.toLowerCase() || "";
  
  for (const [keyword, region] of Object.entries(UK_REGIONS)) {
    if (lowName.includes(keyword) || lowCity.includes(keyword)) {
      return region;
    }
  }
  
  if (lowName.includes("scotland") || lowName.includes("scottish")) return "Scotland";
  if (lowName.includes("wales") || lowName.includes("welsh")) return "Wales";
  if (lowName.includes("london") || lowName.includes("metropolitan")) return "London";
  
  return "England";
}

async function seedUniversities() {
  console.log("Fetching UK universities from Hipolabs API...");
  
  try {
    const response = await fetch("http://universities.hipolabs.com/search?country=united%20kingdom");
    const universities = await response.json() as Array<{
      name: string;
      domains: string[];
      web_pages: string[];
      country: string;
    }>;
    
    console.log(`Found ${universities.length} universities`);
    
    const insertData = universities.map(uni => {
      const name = uni.name;
      const city = guessCity(name);
      const region = guessRegion(name, city);
      const website = uni.web_pages?.[0] || null;
      
      return {
        name,
        type: "university" as const,
        city,
        region,
        website,
      };
    });
    
    console.log("Inserting universities into database...");
    
    for (const data of insertData) {
      try {
        await db.insert(ukCampuses).values(data).onConflictDoNothing();
      } catch (err) {
        console.log(`Skipped duplicate: ${data.name}`);
      }
    }
    
    console.log(`Inserted ${insertData.length} universities`);
  } catch (error) {
    console.error("Error fetching universities:", error);
    throw error;
  }
}

async function seedSixthForms() {
  console.log("Seeding sixth form colleges...");
  
  const sixthForms = [
    { name: "Peter Symonds College", city: "Winchester", region: "South East" },
    { name: "Hills Road Sixth Form College", city: "Cambridge", region: "East of England" },
    { name: "Long Road Sixth Form College", city: "Cambridge", region: "East of England" },
    { name: "Godalming College", city: "Godalming", region: "South East" },
    { name: "Hereford Sixth Form College", city: "Hereford", region: "West Midlands" },
    { name: "Richard Huish College", city: "Taunton", region: "South West" },
    { name: "Cirencester College", city: "Cirencester", region: "South West" },
    { name: "Esher Sixth Form College", city: "Esher", region: "South East" },
    { name: "Farnborough Sixth Form College", city: "Farnborough", region: "South East" },
    { name: "Brockenhurst College", city: "Brockenhurst", region: "South East" },
    { name: "Collyer's", city: "Horsham", region: "South East" },
    { name: "Barton Peveril Sixth Form College", city: "Eastleigh", region: "South East" },
    { name: "Varndean College", city: "Brighton", region: "South East" },
    { name: "Brighton Hove & Sussex Sixth Form College", city: "Brighton", region: "South East" },
    { name: "Worthing College", city: "Worthing", region: "South East" },
    { name: "Chichester College", city: "Chichester", region: "South East" },
    { name: "Havant and South Downs College", city: "Havant", region: "South East" },
    { name: "St Vincent Sixth Form College", city: "Gosport", region: "South East" },
    { name: "Portsmouth College", city: "Portsmouth", region: "South East" },
    { name: "Itchen Sixth Form College", city: "Southampton", region: "South East" },
    { name: "Taunton's College", city: "Southampton", region: "South East" },
    { name: "St Brendan's Sixth Form College", city: "Bristol", region: "South West" },
    { name: "City of Bristol College", city: "Bristol", region: "South West" },
    { name: "Stroud College", city: "Stroud", region: "South West" },
    { name: "Weston College", city: "Weston-super-Mare", region: "South West" },
    { name: "Yeovil College", city: "Yeovil", region: "South West" },
    { name: "Exeter College", city: "Exeter", region: "South West" },
    { name: "Truro and Penwith College", city: "Truro", region: "South West" },
    { name: "Cornwall College", city: "St Austell", region: "South West" },
    { name: "City of Stoke-on-Trent Sixth Form", city: "Stoke-on-Trent", region: "West Midlands" },
    { name: "Shrewsbury Sixth Form College", city: "Shrewsbury", region: "West Midlands" },
    { name: "King Edward VI College, Stourbridge", city: "Stourbridge", region: "West Midlands" },
    { name: "Joseph Chamberlain Sixth Form College", city: "Birmingham", region: "West Midlands" },
    { name: "Cadbury Sixth Form College", city: "Birmingham", region: "West Midlands" },
    { name: "Solihull Sixth Form College", city: "Solihull", region: "West Midlands" },
    { name: "The Sixth Form College Solihull", city: "Solihull", region: "West Midlands" },
    { name: "Stratford-upon-Avon College", city: "Stratford-upon-Avon", region: "West Midlands" },
    { name: "Worcester Sixth Form College", city: "Worcester", region: "West Midlands" },
    { name: "Gateway Sixth Form College", city: "Leicester", region: "East Midlands" },
    { name: "Leicester College", city: "Leicester", region: "East Midlands" },
    { name: "The Nottingham Emmanuel School Sixth Form", city: "Nottingham", region: "East Midlands" },
    { name: "Derby College", city: "Derby", region: "East Midlands" },
    { name: "Chesterfield College", city: "Chesterfield", region: "East Midlands" },
    { name: "Boston College", city: "Boston", region: "East Midlands" },
    { name: "Grantham College", city: "Grantham", region: "East Midlands" },
    { name: "Franklin College", city: "Grimsby", region: "Yorkshire" },
    { name: "Wyke Sixth Form College", city: "Hull", region: "Yorkshire" },
    { name: "Wilberforce College", city: "Hull", region: "Yorkshire" },
    { name: "York College", city: "York", region: "Yorkshire" },
    { name: "Notre Dame Sixth Form College", city: "Leeds", region: "Yorkshire" },
    { name: "Leeds City College", city: "Leeds", region: "Yorkshire" },
    { name: "Greenhead College", city: "Huddersfield", region: "Yorkshire" },
    { name: "Huddersfield New College", city: "Huddersfield", region: "Yorkshire" },
    { name: "Sheffield College", city: "Sheffield", region: "Yorkshire" },
    { name: "Longley Park Sixth Form College", city: "Sheffield", region: "Yorkshire" },
    { name: "Barnsley Sixth Form College", city: "Barnsley", region: "Yorkshire" },
    { name: "Doncaster College", city: "Doncaster", region: "Yorkshire" },
    { name: "Rotherham College", city: "Rotherham", region: "Yorkshire" },
    { name: "Bradford College", city: "Bradford", region: "Yorkshire" },
    { name: "Loreto College", city: "Manchester", region: "North West" },
    { name: "Xaverian College", city: "Manchester", region: "North West" },
    { name: "Aquinas College", city: "Stockport", region: "North West" },
    { name: "Stockport College", city: "Stockport", region: "North West" },
    { name: "Priestley College", city: "Warrington", region: "North West" },
    { name: "Birkenhead Sixth Form College", city: "Birkenhead", region: "North West" },
    { name: "Carmel College", city: "St Helens", region: "North West" },
    { name: "St Helens College", city: "St Helens", region: "North West" },
    { name: "Runshaw College", city: "Leyland", region: "North West" },
    { name: "Cardinal Newman College", city: "Preston", region: "North West" },
    { name: "Preston College", city: "Preston", region: "North West" },
    { name: "Blackburn College", city: "Blackburn", region: "North West" },
    { name: "Burnley College", city: "Burnley", region: "North West" },
    { name: "Nelson and Colne College", city: "Nelson", region: "North West" },
    { name: "Blackpool Sixth Form College", city: "Blackpool", region: "North West" },
    { name: "Lancaster and Morecambe College", city: "Lancaster", region: "North West" },
    { name: "Kendal College", city: "Kendal", region: "North West" },
    { name: "Carlisle College", city: "Carlisle", region: "North West" },
    { name: "Queen Elizabeth Sixth Form College", city: "Darlington", region: "North East" },
    { name: "New College Durham", city: "Durham", region: "North East" },
    { name: "Newcastle Sixth Form College", city: "Newcastle", region: "North East" },
    { name: "Sunderland College", city: "Sunderland", region: "North East" },
    { name: "Middlesbrough College", city: "Middlesbrough", region: "North East" },
    { name: "Prior Pursglove College", city: "Guisborough", region: "North East" },
    { name: "Christ the King Sixth Form College", city: "London", region: "London" },
    { name: "Newham Sixth Form College", city: "London", region: "London" },
    { name: "Sir George Monoux College", city: "London", region: "London" },
    { name: "Leyton Sixth Form College", city: "London", region: "London" },
    { name: "Havering Sixth Form College", city: "London", region: "London" },
    { name: "Barking & Dagenham College", city: "London", region: "London" },
    { name: "Tower Hamlets College", city: "London", region: "London" },
    { name: "Hackney Community College", city: "London", region: "London" },
    { name: "City and Islington College", city: "London", region: "London" },
    { name: "Westminster Kingsway College", city: "London", region: "London" },
    { name: "St Francis Xavier Sixth Form College", city: "London", region: "London" },
    { name: "St Charles Catholic Sixth Form College", city: "London", region: "London" },
    { name: "Woodhouse College", city: "London", region: "London" },
    { name: "St Dominic's Sixth Form College", city: "London", region: "London" },
    { name: "Harris Westminster Sixth Form", city: "London", region: "London" },
    { name: "The BRIT School", city: "London", region: "London" },
    { name: "John Ruskin College", city: "Croydon", region: "London" },
    { name: "Croydon College", city: "Croydon", region: "London" },
    { name: "Southwark College", city: "London", region: "London" },
    { name: "Lambeth College", city: "London", region: "London" },
    { name: "Lewisham Southwark College", city: "London", region: "London" },
    { name: "Richmond upon Thames College", city: "London", region: "London" },
    { name: "Kingston College", city: "London", region: "London" },
    { name: "South Thames College", city: "London", region: "London" },
    { name: "Ealing, Hammersmith and West London College", city: "London", region: "London" },
    { name: "Harrow College", city: "London", region: "London" },
    { name: "Stanmore College", city: "London", region: "London" },
    { name: "Uxbridge College", city: "London", region: "London" },
    { name: "West Herts College Sixth Form", city: "Watford", region: "East of England" },
    { name: "Hertford Regional College", city: "Hertford", region: "East of England" },
    { name: "St Albans College", city: "St Albans", region: "East of England" },
    { name: "Oaklands College", city: "St Albans", region: "East of England" },
    { name: "North Hertfordshire College", city: "Stevenage", region: "East of England" },
    { name: "Harlow College", city: "Harlow", region: "East of England" },
    { name: "Chelmsford College", city: "Chelmsford", region: "East of England" },
    { name: "South Essex College", city: "Southend-on-Sea", region: "East of England" },
    { name: "Colchester Sixth Form College", city: "Colchester", region: "East of England" },
    { name: "Suffolk One", city: "Ipswich", region: "East of England" },
    { name: "West Suffolk College", city: "Bury St Edmunds", region: "East of England" },
    { name: "Norwich City College", city: "Norwich", region: "East of England" },
    { name: "Paston Sixth Form College", city: "North Walsham", region: "East of England" },
    { name: "College of West Anglia", city: "King's Lynn", region: "East of England" },
    { name: "Peterborough Regional College", city: "Peterborough", region: "East of England" },
  ];
  
  console.log(`Inserting ${sixthForms.length} sixth form colleges...`);
  
  for (const sf of sixthForms) {
    try {
      await db.insert(ukCampuses).values({
        name: sf.name,
        type: "sixth_form",
        city: sf.city,
        region: sf.region,
      }).onConflictDoNothing();
    } catch (err) {
      console.log(`Skipped duplicate: ${sf.name}`);
    }
  }
  
  console.log(`Inserted ${sixthForms.length} sixth form colleges`);
}

async function main() {
  console.log("Starting campus seed...\n");
  
  await seedUniversities();
  console.log("");
  await seedSixthForms();
  
  console.log("\nCampus seeding complete!");
  process.exit(0);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
