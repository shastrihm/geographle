// API for using the JSON files in the countries folder
// Randomly generate lat,long in chosen country

const COUNTRIES = ['monaco',
                   'norway',
                   'finland',
                   'uganda',
                   'solomon_islands',
                   'panama',
                   'georgia',
                   'marshall_islands',
                   'united_arab_emirates',
                   'papua_new_guinea',
                   'liberia',
                   'turkmenistan',
                   'burundi',
                   'japan',
                   'angola',
                   'malta',
                   'zimbabwe',
                   'pakistan',
                   'cameroon',
                   'madagascar',
                   'brazil',
                   'kuwait',
                   'turkey',
                   'qatar',
                   'united_kingdom',
                   'palestine',
                   'trinidad_and_tobago',
                   'switzerland',
                   'lebanon',
                   'lesotho',
                   'nauru',
                   'kenya',
                   'vanuatu',
                   'sierra_leone',
                   'ethiopia',
                   'singapore',
                   'mexico',
                   'algeria',
                   'mongolia',
                   'mauritius',
                   'montenegro',
                   'tuvalu',
                   'kiribati',
                   'iceland',
                   'dominica',
                   'netherlands',
                   'italy',
                   'tonga',
                   'india',
                   'palau',
                   'brunei',
                   'bahrain',
                   'philippines',
                   'north_macedonia',
                   'gambia',
                   'malawi',
                   'australia',
                   'albania',
                   'bangladesh',
                   'jamaica',
                   'andorra',
                   'thailand',
                   'poland',
                   'south_africa',
                   'mozambique',
                   'mali',
                   'guatemala',
                   'liechtenstein',
                   'togo',
                   'romania',
                   'guinea',
                   'east_timor',
                   'barbados',
                   'cook_islands',
                   'yemen',
                   'cambodia',
                   'niue',
                   'central_african_republic',
                   'eritrea',
                   'suriname',
                   'china',
                   'uruguay',
                   'fiji',
                   'north_korea',
                   'argentina',
                   'armenia',
                   'grenada',
                   'luxembourg',
                   'seychelles',
                   'congo',
                   'cape_verde',
                   'tunisia',
                   'croatia',
                   'sudan',
                   'guyana',
                   'burkina_faso',
                   'saint_vincent_and_the_grenadines',
                   'tajikistan',
                   'mauritania',
                   'bolivia',
                   'paraguay',
                   'san_marino',
                   'nigeria',
                   'syria',
                   'indonesia',
                   'austria',
                   'rwanda',
                   'ukraine',
                   'kazakhstan',
                   'djibouti',
                   'iran',
                   'vietnam',
                   'portugal',
                   'latvia',
                   'ireland',
                   'slovakia',
                   'serbia',
                   'slovenia',
                   'bulgaria',
                   'sao_tome_and_principe',
                   'belarus',
                   'comoros',
                   'libya',
                   'moldova',
                   'colombia',
                   'bahamas',
                   'jordan',
                   'greece',
                   'chad',
                   'uzbekistan',
                   'haiti',
                   'equatorial_guinea',
                   'south_korea',
                   'egypt',
                   'south_sudan',
                   'sri_lanka',
                   'spain',
                   'canada',
                   'samoa',
                   'zambia',
                   'saint_lucia',
                   'estonia',
                   'bosnia_and_herzegovina',
                   'malaysia',
                   'tanzania',
                   'cuba',
                   'denmark',
                   'hungary',
                   'saudi_arabia',
                   'bhutan',
                   'laos',
                   'somalia',
                   'guinea_bissau',
                   'new_zealand',
                   'germany',
                   'peru',
                   'myanmar',
                   'democratic_congo',
                   'niger',
                   'costa_rica',
                   'saint_kitts_and_nevis',
                   'nepal',
                   'dominican_republic',
                   'vatican',
                   'ghana',
                   'venezuela',
                   'iraq',
                   'morocco',
                   'lithuania',
                   'gabon',
                   'azerbaijan',
                   'kyrgyzstan',
                   'belgium',
                   'belize',
                   'botswana',
                   'namibia',
                   'senegal',
                   'france',
                   'usa',
                   'benin',
                   'nicaragua',
                   'chile',
                   'cyprus',
                   'russia',
                   'afghanistan',
                   'el_salvador',
                   'israel',
                   'czech',
                   'ivory_coast',
                   'sweden',
                   'micronesia',
                   'swaziland',
                   'oman',
                   'ecuador',
                   'honduras',
                   'antigua_and_barbuda',
                   'maldives'];

const US_STATES = ['texas',
 'idaho',
 'nebraska',
 'massachusetts',
 'arizona',
 'wisconsin',
 'new_hampshire',
 'district_of_columbia',
 'wyoming',
 'alaska',
 'georgia_state',
 'kansas',
 'missouri',
 'maine',
 'iowa',
 'arkansas',
 'guam',
 'colorado',
 'us_virgin_islands',
 'alabama',
 'west_virginia',
 'new_jersey',
 'virginia',
 'california',
 'maryland',
 'pennsylvania',
 'connecticut',
 'rhode_island',
 'washington',
 'michigan',
 'kentucky',
 'delaware',
 'indiana',
 'new_mexico',
 'florida',
 'oklahoma',
 'south_dakota',
 'vermont',
 'utah',
 'north_dakota',
 'minnesota',
 'montana',
 'tennessee',
 'american_samoa',
 'nevada',
 'south_carolina',
 'mississippi',
 'puerto_rico',
 'new_york',
 'illinois',
 'oregon',
 'louisiana',
 'ohio',
 'north_carolina'];

function convertLatLonToPixels(lat, lon){
  // converts lat, lon to pixelY, pixelX to be used
  // to lookup bitmap
  // fancy mercator stuff?
  var y = Math.round(((-1 * lat) + 90) * (1800 / 180));
  var x = Math.round((lon + 180) * (3600 / 360));
  return {x:x, y:y}
}

function boundingBox(points){
  // calculates minimum bounding box circumscribing a polygon
  // given by an array of points
  var xmin = Infinity;
  var xmax = -Infinity;
  var ymin = Infinity;
  var ymax = -Infinity;
  //console.log(points.length);
  for (let i = 0; i < points.length; i++){
    // REMEMBER! first coordinate is LONGITUDE,
      //          second coordinate is LATITUDE
    let pixs = convertLatLonToPixels(points[i][1], points[i][0]);
    let x = pixs.x;
    let y = pixs.y;
    if (x < xmin){xmin = x};
    if (x > xmax){xmax = x};
    if (y > ymax){ymax = y};
    if (y < ymin){ymin = y};
  };

  return {xmin: xmin,
          xmax: xmax,
          ymin: ymin,
          ymax: ymax}
};

const BMAP_WIDTH = 3600;
const BMAP_HEIGHT = 1800;
var randCountry = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)]
console.log(randCountry);
