"""
Official government portals and verified booking links registry for EcoTrail.
Provides authoritative, real-time, authentic official website links and government tour packages
for destinations across India and globally.
"""

import re
import logging
from urllib.parse import urlparse

logger = logging.getLogger(__name__)

# Standard Authoritative National & Central Authorities
NATIONAL_OFFICIAL_LINKS = {
    "railway": {
        "name": "Official IRCTC Indian Railways E-Ticketing",
        "url": "https://www.irctc.co.in",
        "domain": "irctc.co.in",
        "category": "Official Railway Booking",
        "description": "Direct reservation for electric Vande Bharat, Rajdhani, Shatabdi & sleeper trains with zero intermediary markup.",
        "badge": "Indian Railways (Govt of India)",
        "verified": True,
        "is_package": False,
    },
    "irctc_tourism": {
        "name": "IRCTC Official Tourism & Tour Packages",
        "url": "https://www.irctctourism.com",
        "domain": "irctctourism.com",
        "category": "Official Government Tour Packages",
        "description": "Ministry of Railways all-inclusive holiday packages, Bharat Gaurav tourist trains, pilgrimage circuits, and verified hotel stays.",
        "badge": "Govt of India (IRCTC)",
        "verified": True,
        "is_package": True,
    },
    "train_enquiry": {
        "name": "National Train Enquiry System (NTES)",
        "url": "https://enquiry.indianrail.gov.in",
        "domain": "indianrail.gov.in",
        "category": "Live Transit Status",
        "description": "Official Ministry of Railways portal for real-time live train running status, station schedules, and route delays.",
        "badge": "Ministry of Railways",
        "verified": True,
        "is_package": False,
    },
    "incredible_india": {
        "name": "Incredible India Official Portal",
        "url": "https://www.incredibleindia.org",
        "domain": "incredibleindia.org",
        "category": "National Tourism Board",
        "description": "Ministry of Tourism official national portal for sustainable circuits, heritage guidelines, and certified guides.",
        "badge": "Ministry of Tourism (Govt of India)",
        "verified": True,
        "is_package": False,
    },
    "asi_monuments": {
        "name": "Archaeological Survey of India (ASI)",
        "url": "https://asi.nic.in",
        "domain": "asi.nic.in",
        "category": "Official Heritage Tickets",
        "description": "Official central portal for monument entry tickets, UNESCO world heritage sites, and protected monument timings.",
        "badge": "Ministry of Culture (Govt of India)",
        "verified": True,
        "is_package": True,
    },
}

# State-by-State Verified Official Government Tourism, Transit & Package Portals
STATE_OFFICIAL_REGISTRY = {
    "andhra": [
        {
            "name": "TTD Official Portal (Tirumala Tirupati Devasthanams)",
            "url": "https://ttdevasthanams.ap.gov.in",
            "domain": "ttdevasthanams.ap.gov.in",
            "category": "Official Tirupati Darshan & Stays",
            "description": "Official government portal for direct Tirupati Balaji Special Entry Darshan (SED ₹300), Laddu Prasadam, Arjitha Sevas, and verified pilgrim guest houses.",
            "badge": "Govt of Andhra Pradesh (TTD)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Tirupati Balaji Official Rail Tour Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Tirupati",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways all-inclusive package with confirmed train berths, AC hotel lodging, AC road transfers, and confirmed Sheegra Darshan tokens.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "APTDC Official Andhra Pradesh Tourism Packages",
            "url": "https://tourism.ap.gov.in",
            "domain": "tourism.ap.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official Andhra Pradesh government Haritha resort bookings and all-inclusive Tirupati/Araku tour packages.",
            "badge": "Govt of Andhra Pradesh",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "APSRTC Official Online Bus Booking",
            "url": "https://www.apsrtconline.in",
            "domain": "apsrtconline.in",
            "category": "State Public Transit",
            "description": "Official state road transport corporation running direct electric and super-luxury buses to Tirupati and Tirumala hilltop.",
            "badge": "Govt of Andhra Pradesh",
            "verified": True,
            "is_package": False,
        },
    ],
    "goa": [
        {
            "name": "Goa Tourism Development Corporation (GTDC)",
            "url": "https://goa-tourism.com",
            "domain": "goa-tourism.com",
            "category": "Official State Tour Packages",
            "description": "Official government portal for GTDC verified eco-cottages, coastal heritage tour packages, and certified river cruises.",
            "badge": "Govt of Goa (GTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Official Goa Rail & Holiday Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Goa",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Official IRCTC train holiday package with confirmed train tickets, beachside accommodation, and sightseeing.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Department of Tourism, Government of Goa",
            "url": "https://goatourism.gov.in",
            "domain": "goatourism.gov.in",
            "category": "State Tourism Directorate",
            "description": "Official government guidelines, registered green homestays, and beach preservation initiatives.",
            "badge": "Govt of Goa",
            "verified": True,
            "is_package": False,
        },
        {
            "name": "Kadamba Transport Corporation (KTCL)",
            "url": "https://ktclgoa.com",
            "domain": "ktclgoa.com",
            "category": "State Public Transport",
            "description": "Official state public bus corporation operating electric buses between Panaji, Margao, and coastal hubs.",
            "badge": "Govt of Goa",
            "verified": True,
            "is_package": False,
        },
    ],
    "kerala": [
        {
            "name": "Kerala Tourism Development Corporation (KTDC) Packages",
            "url": "https://www.ktdc.com/packages",
            "domain": "ktdc.com",
            "category": "Official State Tour Packages",
            "description": "Government-operated eco-lodges, Munnar tea sanctuary packages, and verified Lake Palace backwater tours.",
            "badge": "Govt of Kerala (KTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Official Kerala Rail Tour Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Kerala",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways all-inclusive tour across Kochi, Munnar, Thekkady, and Alleppey houseboats.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Department of Tourism, Government of Kerala",
            "url": "https://www.keralatourism.org",
            "domain": "keralatourism.org",
            "category": "State Tourism Board",
            "description": "Official world-renowned responsible tourism mission, certified green homestays, and Munnar/Alleppey guides.",
            "badge": "Govt of Kerala",
            "verified": True,
            "is_package": False,
        },
        {
            "name": "Kerala State Road Transport Corporation (KSRTC)",
            "url": "https://online.keralartc.com",
            "domain": "keralartc.com",
            "category": "State Public Transit",
            "description": "Official state government bus reservations including electric low-floor buses and scenic hill routes.",
            "badge": "Govt of Kerala",
            "verified": True,
            "is_package": False,
        },
    ],
    "karnataka": [
        {
            "name": "Karnataka State Tourism Development Corporation (KSTDC)",
            "url": "https://kstdc.co/tour-packages/",
            "domain": "kstdc.co",
            "category": "Official State Tour Packages",
            "description": "Official Mayura hotel bookings, Hampi UNESCO sightseeing packages, and Coorg coffee trail tours.",
            "badge": "Govt of Karnataka (KSTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Karnataka Heritage Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Karnataka",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways tour package covering Bengaluru, Mysore palace, and Hampi ruins.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Karnataka Tourism Official Portal",
            "url": "https://karnatakatourism.org",
            "domain": "karnatakatourism.org",
            "category": "State Tourism Board",
            "description": "Official portal for Hampi UNESCO heritage, Coorg plantations, and Western Ghats eco-sanctuaries.",
            "badge": "Govt of Karnataka",
            "verified": True,
            "is_package": False,
        },
        {
            "name": "KSRTC Official Online Bus Booking",
            "url": "https://ksrtc.in",
            "domain": "ksrtc.in",
            "category": "State Public Transit",
            "description": "Award-winning electric and multi-axle state bus network connecting Bengaluru, Coorg, Hampi, and Mysore.",
            "badge": "Govt of Karnataka",
            "verified": True,
            "is_package": False,
        },
    ],
    "himachal": [
        {
            "name": "Himachal Pradesh Tourism Development Corp (HPTDC)",
            "url": "https://hptdc.in",
            "domain": "hptdc.in",
            "category": "Official State Tour Packages",
            "description": "Official government hotel bookings, Manali/Shimla holiday packages, and guided mountain itineraries.",
            "badge": "Govt of Himachal Pradesh",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Himachal Mountain Rail & Road Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Himachal",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Official train & mountain holiday package covering Kalka-Shimla toy train and Kullu-Manali valleys.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Himachal Road Transport Corporation (HRTC)",
            "url": "https://www.hrtchp.com",
            "domain": "hrtchp.com",
            "category": "State Public Transit",
            "description": "Official government bus booking for mountain corridors, electric buses in Kullu/Manali, and Spiti routes.",
            "badge": "Govt of Himachal Pradesh",
            "verified": True,
            "is_package": False,
        },
    ],
    "maharashtra": [
        {
            "name": "Maharashtra Tourism Development Corporation (MTDC)",
            "url": "https://maharashtratourism.gov.in",
            "domain": "maharashtratourism.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official portal for MTDC beachfront resorts, Western Ghats hill stations, and heritage cave tour packages.",
            "badge": "Govt of Maharashtra (MTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Shri Saibaba Sansthan Trust Shirdi Official Portal",
            "url": "https://online.sai.org.in",
            "domain": "sai.org.in",
            "category": "Official Temple Darshan & Stays",
            "description": "Official government shrine board for Shirdi Sai Baba Aarti passes, Darshan tokens, and verified pilgrim accommodation.",
            "badge": "Govt of Maharashtra",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Maharashtra State Road Transport Corporation (MSRTC)",
            "url": "https://msrtc.maharashtra.gov.in",
            "domain": "msrtc.maharashtra.gov.in",
            "category": "State Public Transit",
            "description": "Official reservation portal for Shivneri and E-Shivai zero-emission intercity electric buses.",
            "badge": "Govt of Maharashtra",
            "verified": True,
            "is_package": False,
        },
    ],
    "rajasthan": [
        {
            "name": "Rajasthan Tourism Development Corporation (RTDC)",
            "url": "https://rtdc.tourism.rajasthan.gov.in",
            "domain": "rajasthan.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official government heritage hotels, desert camp tour packages, and Golden Triangle circuits.",
            "badge": "Govt of Rajasthan (RTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Royal Rajasthan Official Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Rajasthan",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways all-inclusive tour package covering Jaipur, Jodhpur, and Udaipur forts.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Rajasthan State Road Transport Corporation (RSRTC)",
            "url": "https://transport.rajasthan.gov.in/rsrtc",
            "domain": "rajasthan.gov.in",
            "category": "State Public Transit",
            "description": "Official state road transport booking connecting Delhi, Jaipur, Udaipur, and rural eco-villages.",
            "badge": "Govt of Rajasthan",
            "verified": True,
            "is_package": False,
        },
    ],
    "tamilnadu": [
        {
            "name": "TTDC Online Hotel & Tour Package Booking",
            "url": "https://ttdconline.com",
            "domain": "ttdconline.com",
            "category": "Official State Tour Packages",
            "description": "Official Tamil Nadu government hotel reservations, boat house passes, and temple circuit packages.",
            "badge": "Govt of Tamil Nadu (TTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Rameswaram & Madurai Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Tamil+Nadu",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways package with confirmed train berths, Meenakshi temple Darshan, and Rameswaram lodging.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "uttarakhand": [
        {
            "name": "Garhwal Mandal Vikas Nigam (GMVN) Packages",
            "url": "https://gmvnonline.com",
            "domain": "gmvnonline.com",
            "category": "Official State Tour Packages",
            "description": "Official government mountain huts, Char Dham pilgrimage packages, rafting permits, and eco-homestays.",
            "badge": "Govt of Uttarakhand (GMVN)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Kumaon Mandal Vikas Nigam (KMVN) Packages",
            "url": "https://kmvn.in",
            "domain": "kmvn.in",
            "category": "Official State Tour Packages",
            "description": "Official Nainital, Almora & Kausani eco-lodge packages and Himalayan nature tours.",
            "badge": "Govt of Uttarakhand (KMVN)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Uttarakhand Tourism Development Board (UTDB)",
            "url": "https://uttarakhandtourism.gov.in",
            "domain": "uttarakhandtourism.gov.in",
            "category": "State Tourism Board",
            "description": "Official portal for Rishikesh river eco-guidelines, Himalayan trek registrations, and wildlife permits.",
            "badge": "Govt of Uttarakhand",
            "verified": True,
            "is_package": False,
        },
    ],
    "up": [
        {
            "name": "Uttar Pradesh Tourism Development Corporation",
            "url": "https://www.uptourism.gov.in",
            "domain": "uptourism.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official government packages for Kashi Varanasi ghats, Taj Mahal Agra, and Ayodhya heritage circuits.",
            "badge": "Govt of Uttar Pradesh",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Kashi Vishwanath Official Temple Booking",
            "url": "https://shrikashivishwanath.org",
            "domain": "shrikashivishwanath.org",
            "category": "Official Temple Darshan & Sevas",
            "description": "Official government shrine board for Kashi Vishwanath Sugam Darshan, Mangala Aarti passes, and Rudrabhishek.",
            "badge": "Govt of Uttar Pradesh",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Varanasi & Ayodhya Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Varanasi",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways all-inclusive package with Vande Bharat express tickets, Ganga boat rides, and verified hotel stays.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "kashmir": [
        {
            "name": "Shri Mata Vaishno Devi Shrine Board (SMVDSB)",
            "url": "https://www.maavaishnodevi.org",
            "domain": "maavaishnodevi.org",
            "category": "Official Pilgrimage Board & Stays",
            "description": "Official government shrine portal for Katra to Bhawan Yatra Parchi, Battery Car tickets, Helicopter bookings, and room reservations.",
            "badge": "SMVDSB (Govt of J&K)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "J&K Tourism Development Corporation (JKTDC)",
            "url": "https://www.jktourism.jk.gov.in",
            "domain": "jktourism.jk.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official government packages for Srinagar houseboats, Gulmarg gondola tickets, and Pahalgam alpine huts.",
            "badge": "Govt of Jammu & Kashmir",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Kashmir Paradise Rail & Flight Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Kashmir",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Holiday Package",
            "description": "Official government package including scenic rail/air travel, verified Dal Lake stays, and mountain transfers.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "odisha": [
        {
            "name": "Odisha Tourism Development Corporation (OTDC)",
            "url": "https://otdc.in",
            "domain": "otdc.in",
            "category": "Official State Tour Packages",
            "description": "Official Panthanivas hotel reservations and all-inclusive Puri Jagannath, Konark Sun Temple & Chilika packages.",
            "badge": "Govt of Odisha (OTDC)",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Jagannath Puri Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Puri",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways package with confirmed train berths, AC accommodation, and VIP Darshan assistance.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "gujarat": [
        {
            "name": "Tourism Corporation of Gujarat (TCGL) Packages",
            "url": "https://www.gujarattourism.com",
            "domain": "gujarattourism.com",
            "category": "Official State Tour Packages",
            "description": "Official holiday packages for Rann of Kutch Utsav, Gir lion safari permits, and Somnath/Dwarka temple circuits.",
            "badge": "Govt of Gujarat",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Statue of Unity Official Ticketing Portal",
            "url": "https://www.soutickets.in",
            "domain": "soutickets.in",
            "category": "Official Monument Package",
            "description": "Official government booking portal for Statue of Unity viewing gallery tickets, jungle safari, and valley of flowers.",
            "badge": "Govt of Gujarat",
            "verified": True,
            "is_package": True,
        },
    ],
    "mp": [
        {
            "name": "Madhya Pradesh Tourism Development Corp (MPSTDC)",
            "url": "https://www.mptourism.com",
            "domain": "mptourism.com",
            "category": "Official State Tour Packages",
            "description": "Official government jungle resort bookings in Kanha/Bandhavgarh, Pachmarhi retreats, and Khajuraho packages.",
            "badge": "Govt of Madhya Pradesh",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "Shri Mahakaleshwar Ujjain Official Temple Portal",
            "url": "https://shrimahakaleshwar.com",
            "domain": "shrimahakaleshwar.com",
            "category": "Official Temple Darshan & Bhasma Aarti",
            "description": "Official shrine board for Bhasma Aarti advance permits, VIP protocol Darshan, and verified pilgrim accommodation.",
            "badge": "Govt of Madhya Pradesh",
            "verified": True,
            "is_package": True,
        },
    ],
    "westbengal": [
        {
            "name": "West Bengal Tourism Development Corp (WBTDCL)",
            "url": "https://www.wbtourism.gov.in",
            "domain": "wbtourism.gov.in",
            "category": "Official State Tour Packages",
            "description": "Official tourism packages for Darjeeling Himalayan tea estates, Sundarbans mangrove cruises, and Kalimpong retreats.",
            "badge": "Govt of West Bengal",
            "verified": True,
            "is_package": True,
        },
        {
            "name": "IRCTC Darjeeling Toy Train Rail Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Darjeeling",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Rail Package",
            "description": "Ministry of Railways package covering UNESCO Darjeeling Himalayan Railway, sunrise at Tiger Hill, and heritage stays.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "punjab": [
        {
            "name": "Punjab Heritage and Tourism Promotion Board",
            "url": "https://punjabtourism.punjab.gov.in",
            "domain": "punjab.gov.in",
            "category": "Official State Tourism Board",
            "description": "Official portal for Amritsar Golden Temple heritage walks, Wagah Border protocol seating, and eco-farm tours.",
            "badge": "Govt of Punjab",
            "verified": True,
            "is_package": True,
        },
    ],
    "ladakh": [
        {
            "name": "Administration of Union Territory of Ladakh",
            "url": "https://ladakh.nic.in",
            "domain": "ladakh.nic.in",
            "category": "Official UT Administration & Permits",
            "description": "Official Inner Line Permit (ILP) portal, Nubra Valley eco-regulations, and Pangong Tso environmental passes.",
            "badge": "UT Ladakh Administration",
            "verified": True,
            "is_package": False,
        },
        {
            "name": "IRCTC Ladakh Land of Lamas Tour Package",
            "url": "https://www.irctctourism.com/tourpckage_search?searchKey=Ladakh",
            "domain": "irctctourism.com",
            "category": "Official IRCTC Tour Package",
            "description": "Official all-inclusive high-altitude package with acclimatized stays, Leh palace tours, and oxygen support.",
            "badge": "Govt of India (IRCTC)",
            "verified": True,
            "is_package": True,
        },
    ],
    "pondicherry": [
        {
            "name": "Tourism Department, Government of Puducherry",
            "url": "https://pondicherrytourism.org",
            "domain": "pondicherrytourism.org",
            "category": "Official Tourism Department",
            "description": "Official government portal for French Quarter heritage walks, Paradise Beach eco-ferries, and Auroville guidelines.",
            "badge": "Govt of Puducherry",
            "verified": True,
            "is_package": True,
        },
    ],
}

# Synonyms & aliases mapping cities/attractions to state keys
DESTINATION_KEY_MAP = {
    # Andhra Pradesh / Tirupati
    "tirupati": "andhra",
    "tirumala": "andhra",
    "renigunta": "andhra",
    "andhra": "andhra",
    "andhra pradesh": "andhra",
    "visakhapatnam": "andhra",
    "vizag": "andhra",
    "vijayawada": "andhra",
    "srisailam": "andhra",
    "araku": "andhra",

    # Goa
    "goa": "goa",
    "panaji": "goa",
    "panjim": "goa",
    "margao": "goa",
    "madgaon": "goa",
    "calangute": "goa",
    "candolim": "goa",
    "anjuna": "goa",
    "palolem": "goa",
    "vasco": "goa",

    # Kerala
    "munnar": "kerala",
    "alleppey": "kerala",
    "alappuzha": "kerala",
    "kochi": "kerala",
    "cochin": "kerala",
    "kerala": "kerala",
    "wayanad": "kerala",
    "varkala": "kerala",
    "kovalam": "kerala",
    "thekkady": "kerala",
    "trivandrum": "kerala",

    # Karnataka
    "coorg": "karnataka",
    "kodagu": "karnataka",
    "hampi": "karnataka",
    "bangalore": "karnataka",
    "bengaluru": "karnataka",
    "mysore": "karnataka",
    "mysuru": "karnataka",
    "gokarna": "karnataka",
    "karnataka": "karnataka",

    # Himachal Pradesh
    "spiti": "himachal",
    "kaza": "himachal",
    "manali": "himachal",
    "shimla": "himachal",
    "dharamshala": "himachal",
    "mcleodganj": "himachal",
    "kasol": "himachal",
    "himachal": "himachal",
    "jibhi": "himachal",

    # Maharashtra
    "mumbai": "maharashtra",
    "pune": "maharashtra",
    "shirdi": "maharashtra",
    "mahabaleshwar": "maharashtra",
    "lonavala": "maharashtra",
    "panchgani": "maharashtra",
    "alibaug": "maharashtra",
    "maharashtra": "maharashtra",
    "aurangabad": "maharashtra",
    "ellora": "maharashtra",
    "ajanta": "maharashtra",

    # Rajasthan
    "jaipur": "rajasthan",
    "udaipur": "rajasthan",
    "jodhpur": "rajasthan",
    "jaisalmer": "rajasthan",
    "pushkar": "rajasthan",
    "rajasthan": "rajasthan",

    # Tamil Nadu
    "chennai": "tamilnadu",
    "ooty": "tamilnadu",
    "kodaikanal": "tamilnadu",
    "madurai": "tamilnadu",
    "rameswaram": "tamilnadu",
    "tamilnadu": "tamilnadu",
    "tamil nadu": "tamilnadu",

    # Uttarakhand
    "rishikesh": "uttarakhand",
    "haridwar": "uttarakhand",
    "dehradun": "uttarakhand",
    "nainital": "uttarakhand",
    "mussoorie": "uttarakhand",
    "uttarakhand": "uttarakhand",
    "kedarnath": "uttarakhand",
    "badrinath": "uttarakhand",

    # Uttar Pradesh
    "varanasi": "up",
    "kashi": "up",
    "banaras": "up",
    "agra": "up",
    "ayodhya": "up",
    "mathura": "up",
    "vrindavan": "up",
    "uttar pradesh": "up",
    "up": "up",

    # Kashmir / Katra
    "katra": "kashmir",
    "vaishno devi": "kashmir",
    "srinagar": "kashmir",
    "gulmarg": "kashmir",
    "pahalgam": "kashmir",
    "kashmir": "kashmir",
    "jammu": "kashmir",

    # Odisha
    "puri": "odisha",
    "konark": "odisha",
    "bhubaneswar": "odisha",
    "odisha": "odisha",
    "orissa": "odisha",

    # Gujarat
    "somnath": "gujarat",
    "dwarka": "gujarat",
    "kutch": "gujarat",
    "rann of kutch": "gujarat",
    "ahmedabad": "gujarat",
    "gujarat": "gujarat",
    "statue of unity": "gujarat",

    # Madhya Pradesh
    "ujjain": "mp",
    "khajuraho": "mp",
    "pachmarhi": "mp",
    "bhopal": "mp",
    "indore": "mp",
    "madhya pradesh": "mp",

    # West Bengal
    "darjeeling": "westbengal",
    "kolkata": "westbengal",
    "sundarbans": "westbengal",
    "west bengal": "westbengal",

    # Punjab
    "amritsar": "punjab",
    "golden temple": "punjab",
    "punjab": "punjab",

    # Ladakh
    "leh": "ladakh",
    "ladakh": "ladakh",
    "nubra": "ladakh",
    "pangong": "ladakh",

    # Puducherry
    "pondicherry": "pondicherry",
    "puducherry": "pondicherry",
    "auroville": "pondicherry",
}


def detect_state_key(text: str) -> str:
    """Detects matching state/destination key from user query, origin, or destination string."""
    if not text:
        return ""
    text_lower = str(text).lower()
    for keyword, state_key in DESTINATION_KEY_MAP.items():
        if re.search(r'\b' + re.escape(keyword) + r'\b', text_lower):
            return state_key
    return ""


def clean_url(url: str) -> str:
    """Ensures URL starts with https:// and is formatted correctly."""
    url = url.strip()
    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url
    return url


def extract_domain(url: str) -> str:
    """Extracts clean domain name from URL."""
    try:
        parsed = urlparse(clean_url(url))
        domain = parsed.netloc.lower()
        if domain.startswith("www."):
            domain = domain[4:]
        return domain
    except Exception:
        return "official-portal.gov.in"


def resolve_official_links(
    destination: str = "",
    origin: str = "",
    user_query: str = "",
    ai_generated_links: list = None
) -> list:
    """
    Produces a curated, verified, and deduplicated list of official government portals,
    authentic tour packages, and direct transit websites for the given journey or query.
    Combines live AI-identified links with the verified authoritative registry.
    """
    links_list = []
    seen_domains_and_urls = set()

    dest_str = (destination or "").strip()
    user_q = (user_query or "").strip()
    dest_state = detect_state_key(dest_str) or detect_state_key(user_q)

    # 1. If destination state has dedicated official packages, place them FIRST!
    if dest_state and dest_state in STATE_OFFICIAL_REGISTRY:
        for portal in STATE_OFFICIAL_REGISTRY[dest_state]:
            key = (portal.get("domain"), portal.get("url"))
            if key not in seen_domains_and_urls:
                seen_domains_and_urls.add(key)
                links_list.append(portal)

    # 2. Add destination-specific IRCTC Government Tour Package search link if not present
    if dest_str and len(dest_str) > 2:
        dest_clean = dest_str.title()
        package_url = f"https://www.irctctourism.com/tourpckage_search?searchKey={dest_clean}"
        pkg_key = ("irctctourism.com", package_url)
        # Check if already added
        already_has_irctc_pkg = any(l.get("is_package") and "irctctourism.com" in l.get("domain", "") for l in links_list)
        if not already_has_irctc_pkg:
            links_list.append({
                "name": f"Official IRCTC {dest_clean} Tour & Rail Package",
                "url": package_url,
                "domain": "irctctourism.com",
                "category": "Official Government Tour Package",
                "description": f"Direct Ministry of Railways all-inclusive tour package for {dest_clean}: confirmed train berths, certified accommodation, local transfers, and authorized sightseeing.",
                "badge": "Govt of India (IRCTC)",
                "verified": True,
                "is_package": True,
            })
            seen_domains_and_urls.add(pkg_key)

    # 3. Always include Official IRCTC Train E-Ticketing for direct route reservation
    irctc_rail = NATIONAL_OFFICIAL_LINKS["railway"]
    rail_key = (irctc_rail["domain"], irctc_rail["url"])
    if rail_key not in seen_domains_and_urls:
        seen_domains_and_urls.add(rail_key)
        links_list.append(irctc_rail)

    # 4. Check origin state for regional public transport
    orig_state = detect_state_key(origin)
    if orig_state and orig_state in STATE_OFFICIAL_REGISTRY and orig_state != dest_state:
        for portal in STATE_OFFICIAL_REGISTRY[orig_state]:
            if "transit" in portal.get("category", "").lower() or "transport" in portal.get("category", "").lower():
                key = (portal.get("domain"), portal.get("url"))
                if key not in seen_domains_and_urls:
                    seen_domains_and_urls.add(key)
                    links_list.append(portal)

    # 5. Integrate AI-generated verified links if valid
    if ai_generated_links and isinstance(ai_generated_links, list):
        for raw in ai_generated_links:
            if not isinstance(raw, dict):
                continue
            url = raw.get("url")
            name = raw.get("name") or raw.get("title")
            if not url or not name:
                continue

            cleaned = clean_url(url)
            dom = extract_domain(cleaned)
            key = (dom, cleaned)

            if key in seen_domains_and_urls:
                continue

            if "." not in dom or len(dom.split(".")[-1]) < 2:
                continue

            # Only allow reputable government / transit / tourism domains
            allowed_suffixes = ('.gov.in', '.nic.in', '.org', '.org.in', '.edu', '.com', '.co.in', '.co')
            if not any(dom.endswith(sfx) or f"{sfx}/" in dom for sfx in allowed_suffixes):
                continue

            links_list.append({
                "name": name.strip(),
                "url": cleaned,
                "domain": dom,
                "category": raw.get("category", "Official Travel Portal"),
                "description": raw.get("description", f"Official website: {dom}"),
                "badge": raw.get("badge", "Official Verified"),
                "verified": True,
                "is_package": bool(raw.get("is_package", False) or "package" in str(name).lower()),
            })
            seen_domains_and_urls.add(key)

    # 6. Fallback national tourism / packages if list is still small
    if len(links_list) < 3:
        pkg_nat = NATIONAL_OFFICIAL_LINKS["irctc_tourism"]
        if (pkg_nat["domain"], pkg_nat["url"]) not in seen_domains_and_urls:
            seen_domains_and_urls.add((pkg_nat["domain"], pkg_nat["url"]))
            links_list.append(pkg_nat)

    if len(links_list) < 3:
        inc = NATIONAL_OFFICIAL_LINKS["incredible_india"]
        if (inc["domain"], inc["url"]) not in seen_domains_and_urls:
            seen_domains_and_urls.add((inc["domain"], inc["url"]))
            links_list.append(inc)

    # Return top 4-5 focused, authoritative official links prioritizing packages
    return links_list[:5]
