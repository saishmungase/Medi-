const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Tesseract = require('tesseract.js');
const axios = require('axios');

const app = express();
const port = 5000;

app.use(cors());
app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Common medicine names for OCR matching
const COMMON_MEDICINES = [
    'paracetamol', 'acetaminophen', 'tylenol',
    'ibuprofen', 'advil', 'motrin',
    'aspirin', 'bayer',
    'amoxicillin', 'penicillin',
    'azithromycin', 'zithromax',
    'ciprofloxacin', 'cipro',
    'metformin', 'glucophage',
    'lisinopril', 'prinivil',
    'atorvastatin', 'lipitor',
    'omeprazole', 'prilosec',
    'amlodipine', 'norvasc',
    'levothyroxine', 'synthroid',
    'albuterol', 'ventolin',
    'gabapentin', 'neurontin',
    'prednisone',
    'tramadol',
    'hydrochlorothiazide',
    'metoprolol',
    'simvastatin',
    'losartan',
    'warfarin',
    'furosemide'
];

// Drug interaction data
const DRUG_INTERACTIONS = {
    'paracetamol': [
        {
            interacts_with: 'alcohol',
            severity: 'High',
            description: 'Concurrent use may increase risk of liver damage',
            type: 'Hepatotoxicity Risk'
        },
        {
            interacts_with: 'warfarin',
            severity: 'Medium',
            description: 'May increase anticoagulant effect',
            type: 'Enhanced Anticoagulation'
        }
    ],
    'acetaminophen': [
        {
            interacts_with: 'alcohol',
            severity: 'High',
            description: 'Concurrent use may increase risk of liver damage',
            type: 'Hepatotoxicity Risk'
        }
    ],
    'ibuprofen': [
        {
            interacts_with: 'lisinopril',
            severity: 'Medium',
            description: 'May reduce antihypertensive effects',
            type: 'Reduced Effectiveness'
        },
        {
            interacts_with: 'warfarin',
            severity: 'High',
            description: 'Increased risk of bleeding',
            type: 'Bleeding Risk'
        },
        {
            interacts_with: 'metoprolol',
            severity: 'Medium',
            description: 'May reduce blood pressure lowering effect',
            type: 'Reduced Effectiveness'
        }
    ],
    'amoxicillin': [
        {
            interacts_with: 'birth control pills',
            severity: 'Medium',
            description: 'May reduce contraceptive effectiveness',
            type: 'Reduced Effectiveness'
        },
        {
            interacts_with: 'warfarin',
            severity: 'Medium',
            description: 'May increase anticoagulant effect',
            type: 'Enhanced Anticoagulation'
        }
    ],
    'aspirin': [
        {
            interacts_with: 'warfarin',
            severity: 'High',
            description: 'Increased risk of bleeding',
            type: 'Bleeding Risk'
        },
        {
            interacts_with: 'metformin',
            severity: 'Low',
            description: 'May enhance hypoglycemic effect',
            type: 'Blood Sugar'
        }
    ],
    'metformin': [
        {
            interacts_with: 'alcohol',
            severity: 'High',
            description: 'Increased risk of lactic acidosis',
            type: 'Metabolic Risk'
        }
    ],
    'warfarin': [
        {
            interacts_with: 'aspirin',
            severity: 'High',
            description: 'Increased risk of bleeding',
            type: 'Bleeding Risk'
        },
        {
            interacts_with: 'ibuprofen',
            severity: 'High',
            description: 'Increased risk of bleeding',
            type: 'Bleeding Risk'
        }
    ]
};

// Function to get medicine info from OpenFDA API
async function getMedicineInfoFromFDA(drugName) {
    try {
        // Search for drug label information
        const response = await axios.get(`https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${drugName}"+OR+openfda.generic_name:"${drugName}"&limit=1`);
        
        if (response.data.results && response.data.results.length > 0) {
            const result = response.data.results[0];
            
            return {
                name: drugName,
                purpose: result.purpose ? result.purpose[0] : result.indications_and_usage ? result.indications_and_usage[0].substring(0, 100) + '...' : 'Pain reliever and fever reducer',
                indications: result.indications_and_usage ? result.indications_and_usage[0].substring(0, 200) + '...' : `Used for treatment as prescribed by healthcare provider`,
                dosage: result.dosage_and_administration ? result.dosage_and_administration[0].substring(0, 100) + '...' : 'As directed by physician',
                warnings: result.warnings ? result.warnings[0].substring(0, 150) + '...' : 'Consult healthcare provider before use',
                side_effects: result.adverse_reactions ? 
                    result.adverse_reactions[0].split(/[,;.]/).slice(0, 3).map(s => s.trim()).filter(s => s.length > 0) : 
                    ['Nausea', 'Dizziness', 'Headache'],
                interactions: result.drug_interactions ? 
                    result.drug_interactions[0].split(/[,;.]/).slice(0, 2).map(s => s.trim()).filter(s => s.length > 0) : 
                    ['Consult healthcare provider'],
                risk_level: getRiskLevel(drugName)
            };
        }
    } catch (error) {
        console.log(`FDA API error for ${drugName}:`, error.message);
    }
    
    // Return fallback data if FDA API fails
    return getFallbackMedicineData(drugName);
}

// Fallback medicine data when API is unavailable
function getFallbackMedicineData(drugName) {
    const fallbackData = {
        'paracetamol': {
            name: 'Paracetamol',
            purpose: 'Pain reliever and fever reducer',
            indications: 'Used for mild to moderate pain relief and fever reduction',
            dosage: '500mg every 6 hours, max 4g per day',
            warnings: 'Do not exceed recommended dose. Can cause liver damage if overdosed',
            side_effects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'],
            interactions: ['Alcohol (increases liver toxicity)', 'Warfarin (may enhance effect)'],
            risk_level: 'Low'
        },
        'acetaminophen': {
            name: 'Acetaminophen',
            purpose: 'Pain reliever and fever reducer',
            indications: 'Used for mild to moderate pain relief and fever reduction',
            dosage: '500mg every 6 hours, max 4g per day',
            warnings: 'Do not exceed recommended dose. Can cause liver damage if overdosed',
            side_effects: ['Nausea', 'Liver damage (overdose)', 'Allergic reactions'],
            interactions: ['Alcohol (increases liver toxicity)', 'Warfarin (may enhance effect)'],
            risk_level: 'Low'
        },
        'ibuprofen': {
            name: 'Ibuprofen',
            purpose: 'Anti-inflammatory and pain reliever',
            indications: 'Reduces inflammation, pain, and fever',
            dosage: '200-400mg every 4-6 hours, max 1200mg per day',
            warnings: 'Take with food. May cause stomach bleeding or kidney problems',
            side_effects: ['Stomach upset', 'Nausea', 'Dizziness', 'Headache'],
            interactions: ['Blood pressure medications', 'Blood thinners', 'Aspirin'],
            risk_level: 'Medium'
        },
        'amoxicillin': {
            name: 'Amoxicillin',
            purpose: 'Antibiotic',
            indications: 'Treats bacterial infections including respiratory, urinary, and skin infections',
            dosage: '250-500mg every 8 hours or 500-875mg every 12 hours',
            warnings: 'Complete full course even if feeling better. May cause allergic reactions',
            side_effects: ['Diarrhea', 'Nausea', 'Skin rash', 'Vomiting'],
            interactions: ['Birth control pills (reduced effectiveness)', 'Warfarin (enhanced effect)'],
            risk_level: 'Medium'
        },
        'aspirin': {
            name: 'Aspirin',
            purpose: 'Pain reliever, anti-inflammatory, and blood thinner',
            indications: 'Pain relief, fever reduction, inflammation, cardiovascular protection',
            dosage: '325-650mg every 4 hours for pain; 81mg daily for heart protection',
            warnings: 'May cause stomach bleeding. Not for children with viral infections',
            side_effects: ['Stomach irritation', 'Nausea', 'Ringing in ears', 'Bleeding'],
            interactions: ['Blood thinners (increased bleeding risk)', 'Blood pressure medications'],
            risk_level: 'Medium'
        }
    };
    
    return fallbackData[drugName.toLowerCase()] || {
        name: drugName.charAt(0).toUpperCase() + drugName.slice(1),
        purpose: 'Medication as prescribed',
        indications: 'Used as directed by healthcare provider',
        dosage: 'As prescribed by physician',
        warnings: 'Follow healthcare provider instructions',
        side_effects: ['Consult healthcare provider'],
        interactions: ['Consult healthcare provider'],
        risk_level: 'Medium'
    };
}

function getRiskLevel(drugName) {
    const highRisk = ['warfarin', 'metformin', 'insulin'];
    const lowRisk = ['paracetamol', 'acetaminophen'];
    
    if (highRisk.includes(drugName.toLowerCase())) return 'High';
    if (lowRisk.includes(drugName.toLowerCase())) return 'Low';
    return 'Medium';
}

// Function to find drug interactions
function findDrugInteractions(medicines) {
    const interactions = [];
    
    for (let i = 0; i < medicines.length; i++) {
        for (let j = i + 1; j < medicines.length; j++) {
            const drug1 = medicines[i].toLowerCase();
            const drug2 = medicines[j].toLowerCase();
            
            // Check if drug1 has interactions with drug2
            if (DRUG_INTERACTIONS[drug1]) {
                const interaction = DRUG_INTERACTIONS[drug1].find(inter => 
                    inter.interacts_with.toLowerCase().includes(drug2) || 
                    drug2.includes(inter.interacts_with.toLowerCase())
                );
                
                if (interaction) {
                    interactions.push({
                        drugA: medicines[i],
                        drugB: medicines[j],
                        interactionType: interaction.type,
                        severity: interaction.severity,
                        description: interaction.description
                    });
                }
            }
            
            // Check if drug2 has interactions with drug1
            if (DRUG_INTERACTIONS[drug2]) {
                const interaction = DRUG_INTERACTIONS[drug2].find(inter => 
                    inter.interacts_with.toLowerCase().includes(drug1) || 
                    drug1.includes(inter.interacts_with.toLowerCase())
                );
                
                if (interaction) {
                    interactions.push({
                        drugA: medicines[j],
                        drugB: medicines[i],
                        interactionType: interaction.type,
                        severity: interaction.severity,
                        description: interaction.description
                    });
                }
            }
        }
        
        // Check for common interactions (like alcohol)
        const drug = medicines[i].toLowerCase();
        if (DRUG_INTERACTIONS[drug]) {
            DRUG_INTERACTIONS[drug].forEach(interaction => {
                if (!medicines.some(med => med.toLowerCase().includes(interaction.interacts_with.toLowerCase()))) {
                    interactions.push({
                        drugA: medicines[i],
                        drugB: interaction.interacts_with,
                        interactionType: interaction.type,
                        severity: interaction.severity,
                        description: interaction.description
                    });
                }
            });
        }
    }
    
    // Remove duplicates
    const uniqueInteractions = interactions.filter((interaction, index, self) =>
        index === self.findIndex(t => 
            (t.drugA === interaction.drugA && t.drugB === interaction.drugB) ||
            (t.drugA === interaction.drugB && t.drugB === interaction.drugA)
        )
    );
    
    return uniqueInteractions;
}

// Upload and OCR endpoint
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;

    try {
        // Perform OCR
        console.log('Starting OCR processing...');
        const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
            logger: m => console.log(m)
        });
        
        console.log('OCR Text:', text);

        // Extract medicine names from OCR text
        const words = text.toLowerCase().split(/[\s,.\n\r]+/).map(w => w.trim());
        const detectedMedicines = [];
        
        // Check for common medicine names in the OCR text
        COMMON_MEDICINES.forEach(medicine => {
            if (words.some(word => word.includes(medicine) || medicine.includes(word))) {
                if (!detectedMedicines.includes(medicine)) {
                    detectedMedicines.push(medicine);
                }
            }
        });

        console.log('Detected medicines:', detectedMedicines);

        // Get detailed information for detected medicines
        const medicineDetails = [];
        for (const medicine of detectedMedicines) {
            console.log(`Fetching info for: ${medicine}`);
            const info = await getMedicineInfoFromFDA(medicine);
            medicineDetails.push(info);
        }

        // Clean up uploaded file
        fs.unlinkSync(filePath);

        res.json({
            success: true,
            detected_medicines: detectedMedicines,
            details: medicineDetails,
            ocr_text: text
        });

    } catch (error) {
        console.error('Error processing image:', error);
        
        // Clean up file if it exists
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        
        res.status(500).json({ 
            error: 'Failed to process image',
            details: error.message 
        });
    }
});

// Get medicine details endpoint
app.get('/medicine/:name', async (req, res) => {
    try {
        const medicineName = req.params.name;
        const info = await getMedicineInfoFromFDA(medicineName);
        res.json(info);
    } catch (error) {
        console.error('Error fetching medicine info:', error);
        res.status(500).json({ error: 'Failed to fetch medicine information' });
    }
});

// Get drug interactions endpoint
app.post('/interactions', (req, res) => {
    try {
        const { medicines } = req.body;
        
        if (!medicines || !Array.isArray(medicines)) {
            return res.status(400).json({ error: 'Invalid medicines array' });
        }

        const interactions = findDrugInteractions(medicines);
        
        res.json({
            interactions: interactions,
            total_interactions: interactions.length
        });
    } catch (error) {
        console.error('Error finding interactions:', error);
        res.status(500).json({ error: 'Failed to find drug interactions' });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log('Available endpoints:');
    console.log('POST /upload - Upload prescription image');
    console.log('GET /medicine/:name - Get medicine details');
    console.log('POST /interactions - Get drug interactions');
    console.log('GET /health - Health check');
});