# EcoTrail Data & Knowledge Base

This directory documents the data sources, environmental baseline datasets, real-time telemetry APIs, and official government portal registries that power the **EcoTrail** recommendation platform.

---

## 1. Data Sources & External Telemetry

| Data Domain | Provider / Source | Description | Update Frequency |
| :--- | :--- | :--- | :--- |
| **Real-Time Climate & Weather** | [OpenWeatherMap 2.5 API](https://openweathermap.org/api) | Live temperature, feels-like, condition codes, humidity, weather emoji mapping | Live (with 10-min in-memory cache) |
| **Official Government Packages** | Official State Tourism & Ministry Portals | Authentic holiday packages, temple darshan tokens, zero-markup guest houses | Continuous curated registry |
| **National Transit & Rail** | [IRCTC Indian Railways](https://www.irctc.co.in) | Vande Bharat, Rajdhani, Shatabdi electric rail routes & Bharat Gaurav packages | Direct deep links |
| **Carbon Emission Factors** | UK DEFRA / GHG Protocol | Passenger-km conversion factors for flights, electric trains, buses, and EVs | Static reference table |
| **Geographic & Spatial Data** | OpenStreetMap (OSM) / Overpass | Lat/Long coordinates, transit corridors, regional boundary polygons | On-demand / indexed |
| **Accessibility Attributes** | OSM Accessibility Tags + ASI | Step-free access, battery buggies, accessible restrooms, wheelchair ramps | Curated & API-verified |

---

## 2. Official Government Portals & Packages Registry

EcoTrail eliminates middleman markups and fraudulent travel agencies by linking travelers directly to verified, official government booking portals:

- **Andhra Pradesh / Tirupati**:
  - *TTD Official Portal* (`https://ttdevasthanams.ap.gov.in`): Direct ₹300 Special Entry Darshan (SED), pilgrim guest houses, Arjitha Sevas.
  - *IRCTC Tirupati Balaji Rail Tour Package* (`https://www.irctctourism.com/tourpckage_search?searchKey=Tirupati`): Ministry of Railways all-inclusive tour.
  - *APTDC Official Haritha Stays* (`https://tourism.ap.gov.in`).
  - *APSRTC Electric Hill Buses* (`https://www.apsrtconline.in`).
- **Goa**:
  - *GTDC Official Packages & Eco-Cottages* (`https://goa-tourism.com`).
  - *IRCTC Goa Rail Tour Package* (`https://www.irctctourism.com/tourpckage_search?searchKey=Goa`).
  - *Goa Tourism Department* (`https://goatourism.gov.in`).
- **Kerala**:
  - *KTDC Official Tour Packages* (`https://www.ktdc.com/packages`): Munnar, Thekkady, Wayanad, Alleppey.
  - *KSRTC Green Mountain Buses* (`https://online.keralartc.com`).
- **Karnataka**:
  - *KSTDC Heritage Packages* (`https://kstdc.co/tour-packages/`): Coorg, Hampi, Mysore.
- **Rajasthan**:
  - *RTDC Official Heritage Packages* (`https://rtdc.tourism.rajasthan.gov.in`): Jaipur, Udaipur, Jaisalmer.
- **National / Heritage**:
  - *Archaeological Survey of India (ASI)* (`https://asi.nic.in`): UNESCO monument ticketing.
  - *Incredible India Official Portal* (`https://www.incredibleindia.org`).

---

## 3. Carbon Emission Calculation Methodology

EcoTrail evaluates carbon intensity using standard conversion factors derived from the **UK Government GHG Conversion Factors for Company Reporting (DEFRA)**:

$$\text{CO}_2\text{e} = \text{Distance (km)} \times \text{Emission Factor (kg CO}_2\text{e / pax-km)}$$

### Emission Factors Applied:
- **Domestic Aviation (short-haul flight with radiative forcing)**: `0.2458 kg CO₂e / pax-km`
- **Long-Distance Electric Rail (Indian Railways / Vande Bharat)**: `0.0351 kg CO₂e / pax-km`
- **Intercity Coach / Electric Bus**: `0.0273 kg CO₂e / pax-km`
- **Private Internal Combustion Car (petrol/diesel)**: `0.1710 kg CO₂e / km`
- **Electric Vehicle (EV) on National Grid**: `0.0520 kg CO₂e / km`

### Eco-Twin Carbon Reduction Metric:
$$\text{Carbon Reduction \%} = \frac{\text{Baseline CO}_2\text{e} - \text{Eco-Twin CO}_2\text{e}}{\text{Baseline CO}_2\text{e}} \times 100$$
Eco-Twin recommendations consistently deliver **50% to 80% net carbon savings** compared to traditional flight-and-car packages.

---

## 4. Curated Destination Knowledge Base

The repository includes a curated registry of 25+ verified destinations:
- **Hill & Mountain Sanctuaries**: Munnar, Spiti Valley, Manali, Ooty, Dharamshala, Leh Ladakh, Gangtok, Coorg.
- **Living Heritage & Spiritual Hubs**: Hampi, Tirupati, Varanasi, Amritsar, Rishikesh, Khajuraho, Madurai.
- **Coastal & Backwater Ecosystems**: Alleppey, Pondicherry, Gokarna, Havelock Island, Goa.
- **Royal & Cultural Circuits**: Jaipur, Udaipur, Jodhpur, Mysore.
- **Global Metropolitan Corridors**: Paris, Tokyo, Kyoto.

For any un-indexed query, the **Dynamic Fallback Resolver** in `travel/views.py` queries OpenWeatherMap live and maps appropriate IRCTC packages automatically.
