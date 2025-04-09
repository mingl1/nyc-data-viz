# NYC Precinct Data Analysis  

## Sources  

### Official Datasets from NYC Open Data  
The data used in this analysis was sourced from the official NYC Open Data portal: [NYC Open Data](https://opendata.cityofnewyork.us/). The following key datasets were utilized:  

- **NYPD Neighborhood Coordination Officer (NCO) Directory**  
  - Provides details on the areas covered by each NYPD precinct, crucial for mapping and analyzing crime patterns across different precincts.  

- **ENDGBV: The Intersection of Domestic Violence, Race, Ethnicity, and Sex**  
  - Crime-related dataset focusing on domestic violence incidents.  
  - Records the race and sex of both victims and suspects.  
  - A total of **289,456 rows** were processed, each representing a reported crime incident associated with a precinct.  

- **NYPD Use of Force Incidents**  
  - Documents instances where police officers used force.  
  - The columns labeled `"Police_Used_*"` were derived from this dataset, indicating the type of force used in each recorded case.  

- **NYPD OATH Summons Data**  
  - Contains records of summons issued for various infractions.  
  - Over **130 unique summons descriptions** identified.  
  - The `"Summoned_For_*"` columns categorize different infractions for which individuals received summonses.  

## Scraped Public Data  

Additional data was collected by scraping publicly available information from the **NYPD precinct landing page**:  
[NYC Precincts](https://www.nyc.gov/site/nypd/bureaus/patrol/precincts-landing.page).  

- Extracted **precinct address and borough** for geolocation purposes.  
- Scraped **precinct descriptions**, which listed prominent neighborhoods covered by each precinct.  
- Passed descriptions through **ChatGPT** to generate **tags**, categorizing and analyzing precinct coverage areas.  

## Data Processing Approach  

The primary goal of this analysis was to explore **precinct-level statistics** and identify trends in crime, police activity, and law enforcement actions across NYC.  

### Steps Taken  

1. **Precinct-Level Aggregation**  
   - Structured data so that all relevant statistics were associated with **precincts** as the fundamental unit of analysis.  
   - Enabled direct comparisons across different precincts.  

2. **Wide-Scope Analysis**  
   - Approach was **exploratory**, aiming to gather a broad understanding of precinct operations.  
   - Multiple datasets were integrated to provide a **comprehensive** view of law enforcement and crime dynamics in NYC.  

## Attributes  

The majority of dataset attributes are **numerical**, representing counts of various incidents, personnel, or law enforcement actions.  

### **NYPD Officer Ranks**  
- `sgt` – Sergeant  
- `po` – Police Officer  
- `det` – Detective  

### **Crime Statistics**  
- `Crime_Felony assault` – Number of felony assaults reported per precinct.  
- `Crime_Rape` – Number of rape incidents reported.  
- `Crime_Dir` – Domestic incident reports.  

### **Victim Demographics (Race and Sex)**  
- `Victim_Race_White Hispanic`, `Victim_Race_White`, `Victim_Race_Black`, `Victim_Race_Asian / Pacific Islander`, `Victim_Race_American Indian/Alaskan Native`  
- `Victim_Sex_Female`, `Victim_Sex_Male`  

