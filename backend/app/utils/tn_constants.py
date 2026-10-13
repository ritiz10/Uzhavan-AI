"""
Tamil Nadu Agricultural Master Data and Constants.
Provides agro-climatic zones, districts, taluks, major crops, soil types,
traditional cropping seasons (Kuruvai, Samba, Navarai), and common plant diseases.
"""

TN_DISTRICTS = [
    "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
    "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kanchipuram",
    "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
    "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
    "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
    "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
    "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
    "Vellore", "Viluppuram", "Virudhunagar"
]

TN_DISTRICT_TALUKS = {
    "Thanjavur": ["Thanjavur", "Kumbakonam", "Papanasam", "Pattukkottai", "Orathanadu", "Thiruvaiyaru", "Peravurani", "Budalur"],
    "Coimbatore": ["Coimbatore North", "Coimbatore South", "Pollachi", "Sulur", "Mettupalayam", "Annur", "Kinathukadavu", "Valparai"],
    "Madurai": ["Madurai North", "Madurai South", "Melur", "Thirumangalam", "Usilampatti", "Vadipatti", "Peraiyur"],
    "Tiruchirappalli": ["Tiruchirappalli East", "Tiruchirappalli West", "Srirangam", "Lalgudi", "Manapparai", "Musiri", "Thuraiyur"],
    "Salem": ["Salem", "Attur", "Mettur", "Omalur", "Sankari", "Edappadi", "Yercaud", "Valapady"],
    "Erode": ["Erode", "Bhavani", "Gobichettipalayam", "Perundurai", "Sathyamangalam", "Anthiyur", "Kodumudi"],
    "Tiruppur": ["Tiruppur North", "Tiruppur South", "Avinashi", "Dharapuram", "Kangeyam", "Udumalaipettai", "Madathukulam"],
    "Dindigul": ["Dindigul East", "Dindigul West", "Palani", "Oddanchatram", "Kodaikanal", "Natham", "Nilakottai", "Vedasandur"],
    "Cuddalore": ["Cuddalore", "Chidambaram", "Panruti", "Virudhachalam", "Tittakudi", "Kattumannarkoil", "Kurinjipadi"],
    "Tirunelveli": ["Tirunelveli", "Palayamkottai", "Ambasamudram", "Nanguneri", "Radhapuram", "Cheranmahadevi"],
    "Kanyakumari": ["Agastheeswaram", "Thovalai", "Kalkulam", "Vilavancode", "Killiyoor", "Thiruvattar"],
    "Vellore": ["Vellore", "Katpadi", "Gudiyatham", "Anaicut", "K.V. Kuppam"],
    "Krishnagiri": ["Krishnagiri", "Hosur", "Denkanikottai", "Pochampalli", "Uthangarai", "Bargur", "Shoolagiri"],
    "Dharmapuri": ["Dharmapuri", "Harur", "Palacode", "Pennagaram", "Pappireddipatti", "Karimangalam"],
    "Namakkal": ["Namakkal", "Rasipuram", "Tiruchengode", "Paramathi Velur", "Kolli Hills", "Sendamangalam"],
    "Karur": ["Karur", "Aravakurichi", "Kulithalai", "Krishnarayapuram", "Kadavur"],
    "Tiruvannamalai": ["Tiruvannamalai", "Arani", "Cheyyar", "Polur", "Chengam", "Vandavasi", "Kalasapakkam"],
    "Tiruvarur": ["Tiruvarur", "Mannargudi", "Thiruthuraipoondi", "Nannilam", "Needamangalam", "Kudavasal", "Valangaiman"],
    "Nagapattinam": ["Nagapattinam", "Kilvelur", "Vedaranyam", "Thirukkuvalai"],
    "Mayiladuthurai": ["Mayiladuthurai", "Sirkazhi", "Tharangambadi", "Kuthalam"],
    "Pudukkottai": ["Pudukkottai", "Aranthangi", "Alangudi", "Gandarvakottai", "Illuppur", "Thirumayam"],
    "Ramanathapuram": ["Ramanathapuram", "Paramakudi", "Rameswaram", "Tiruvadanai", "Mudukulathur", "Kamuthi", "Kadaladi"],
    "Sivaganga": ["Sivaganga", "Karaikudi", "Devakottai", "Manamadurai", "Tiruppuvanam", "Ilayangudi"],
    "Virudhunagar": ["Virudhunagar", "Sivakasi", "Srivilliputhur", "Rajapalayam", "Aruppukkottai", "Sattur"],
    "Theni": ["Theni", "Periyakulam", "Bodinayakanur", "Uthamapalayam", "Andipatti"],
    "Thoothukudi": ["Thoothukudi", "Kovilpatti", "Tiruchendur", "Srivaikuntam", "Ottapidaram", "Ettayapuram", "Vilathikulam"],
    "Tenkasi": ["Tenkasi", "Sankarankovil", "Ambasamudram", "Kadayanallur", "Shenkottai", "Alangulam"],
    "Villupuram": ["Viluppuram", "Tindivanam", "Gingee", "Vanur", "Vikravandi", "Kandachipuram"],
    "Kallakurichi": ["Kallakurichi", "Sankarapuram", "Chinnasalem", "Ulundurpet", "Tirukoilur"],
    "Ranipet": ["Ranipet", "Arcot", "Walajah", "Arakkonam", "Nemili", "Kalavai"],
    "Tirupathur": ["Tirupathur", "Vaniyambadi", "Ambur", "Natrampalli"],
    "Chengalpattu": ["Chengalpattu", "Tambaram", "Pallavaram", "Maduranthakam", "Cheyyur", "Thiruporur"],
    "Kanchipuram": ["Kanchipuram", "Sriperumbudur", "Walajabad", "Kundrathur", "Uthiramerur"],
    "Tiruvallur": ["Tiruvallur", "Poonamallee", "Avadi", "Ponneri", "Gummidipoondi", "Tiruttani", "Uthukkottai"],
    "Perambalur": ["Perambalur", "Veppanthattai", "Kunnam", "Alathur"],
    "Ariyalur": ["Ariyalur", "Udayarpalayam", "Sendurai", "Andimadam"],
    "Nilgiris": ["Udhagamandalam (Ooty)", "Coonoor", "Kotagiri", "Gudalur", "Pandalur", "Kundah"],
    "Chennai": ["Egmore", "Guindy", "Mylapore", "Tondiarpet", "Velachery", "Ayanavaram"]
}

TN_SOIL_TYPES = [
    "Red Loam",
    "Black Cotton Soil (Regur)",
    "Clayey Loam",
    "Alluvial Soil",
    "Laterite Soil",
    "Coastal Sandy Soil"
]

TN_IRRIGATION_TYPES = [
    "Drip Irrigation",
    "Sprinkler Irrigation",
    "Canal / River Irrigation",
    "Borewell / Tube Well",
    "Open Well",
    "Tank / Rainfed Lake",
    "Rainfed (Dryland)"
]

TN_SEASONS = [
    "Kuruvai (Short Season: June - Sept)",
    "Samba (Main Season: Aug - Jan)",
    "Navarai (Late Season: Dec - March)",
    "Summer (Feb - May)",
    "Kharif (Monsoon: July - Oct)",
    "Rabi (Winter: Oct - March)"
]

TN_MAJOR_CROPS = [
    "Paddy",
    "Sugarcane",
    "Cotton",
    "Groundnut",
    "Maize",
    "Banana",
    "Tomato",
    "Chilli",
    "Brinjal",
    "Onion",
    "Turmeric",
    "Coconut",
    "Black Gram",
    "Green Gram",
    "Millets",
    "Tapioca",
    "Coffee",
    "Tea"
]

# District to typical agro-climate profile
DISTRICT_PROFILES = {
    "Thanjavur": {"zone": "Cauvery Delta", "primary_soil": "Alluvial Soil", "primary_crop": "Paddy", "avg_rainfall": 980},
    "Tiruvarur": {"zone": "Cauvery Delta", "primary_soil": "Alluvial Soil", "primary_crop": "Paddy", "avg_rainfall": 1100},
    "Nagapattinam": {"zone": "Cauvery Delta", "primary_soil": "Clayey Loam", "primary_crop": "Paddy", "avg_rainfall": 1300},
    "Coimbatore": {"zone": "Western Zone", "primary_soil": "Red Loam", "primary_crop": "Cotton", "avg_rainfall": 680},
    "Erode": {"zone": "Western Zone", "primary_soil": "Red Loam", "primary_crop": "Turmeric", "avg_rainfall": 700},
    "Tiruppur": {"zone": "Western Zone", "primary_soil": "Black Cotton Soil (Regur)", "primary_crop": "Cotton", "avg_rainfall": 600},
    "Salem": {"zone": "North Western Zone", "primary_soil": "Red Loam", "primary_crop": "Tapioca", "avg_rainfall": 850},
    "Madurai": {"zone": "Southern Zone", "primary_soil": "Clayey Loam", "primary_crop": "Paddy", "avg_rainfall": 840},
    "Dindigul": {"zone": "Western / Southern", "primary_soil": "Red Loam", "primary_crop": "Tomato", "avg_rainfall": 820},
    "Kanyakumari": {"zone": "High Rainfall Zone", "primary_soil": "Laterite Soil", "primary_crop": "Banana", "avg_rainfall": 1450},
    "Nilgiris": {"zone": "Hilly Zone", "primary_soil": "Laterite Soil", "primary_crop": "Tea", "avg_rainfall": 1800}
}
