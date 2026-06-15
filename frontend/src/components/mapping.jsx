import { useState, useEffect } from "react";

export default function Mapping() {

    const [isFocused, setIsFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [selectedDiagnosis, setSelectedDiagnosis] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [loading, setLoading] = useState(false);

    // Sample diagnosis data with NAMASTE and ICD-11 mappings
    const diagnosisData = [
        {
            id: 1,
            name: "अजीर्ण (Ajirna) - Indigestion",
            namaste: {
                code: "NAM.DIG.001.234",
                term: "अजीर्ण (Ajirna) - Indigestion",
                description: "Digestive disorder characterized by impaired digestion leading to various gastrointestinal symptoms in Ayurvedic medicine.",
                tags: ["Digestive System", "Agni Vikara", "Ayurveda"],
                synonyms: "Mandagni, Vishamagni, Pachakagni Dushti"
            },
            icd11: {
                code: "DA90.0",
                term: "Functional Dyspepsia",
                description: "Chronic or recurrent pain or discomfort centered in the upper abdomen without evidence of organic disease.",
                tags: ["Gastrointestinal", "Functional", "WHO ICD-11"],
                parent: "Functional gastrointestinal disorders"
            }
        },
        {
            id: 2,
            name: "Vata Dosha Imbalance",
            namaste: {
                code: "NAM.VAT.002.105",
                term: "वात दोष असंतुलन (Vata Dosha Imbalance)",
                description: "Constitutional imbalance in Vata dosha causing nervous system and movement disorders in Ayurvedic medicine.",
                tags: ["Nervous System", "Vata Dosha", "Constitutional"],
                synonyms: "Vata Vriddhi, Vata Kopa, Vata Vikara"
            },
            icd11: {
                code: "MG30.0Y",
                term: "Other specified disorders of the nervous system",
                description: "Functional nervous system disorders not elsewhere classified in modern medicine.",
                tags: ["Neurological", "Functional", "Unspecified"],
                parent: "Disorders of the nervous system"
            }
        },
        {
            id: 3,
            name: "Pitta Rakta Dushti - Blood Vitiation",
            namaste: {
                code: "NAM.PIT.003.089",
                term: "पित्त रक्त दूषण (Pitta Rakta Dushti)",
                description: "Blood vitiation due to excess heat and Pitta dosha causing inflammatory skin conditions.",
                tags: ["Blood Disorders", "Pitta Dosha", "Skin Conditions"],
                synonyms: "Rakta Dushti, Pittaja Kushta, Raktapitta"
            },
            icd11: {
                code: "3A00",
                term: "Dermatitis and eczema",
                description: "Inflammatory skin conditions characterized by redness, swelling, and irritation.",
                tags: ["Dermatological", "Inflammatory", "Chronic"],
                parent: "Diseases of the skin"
            }
        },
        {
            id: 4,
            name: "Kapha Medas Vriddhi - Obesity",
            namaste: {
                code: "NAM.KAP.004.067",
                term: "कफ मेदस् वृद्धि (Kapha Medas Vriddhi)",
                description: "Excess accumulation of fat tissue due to Kapha imbalance and metabolic dysfunction.",
                tags: ["Metabolic", "Kapha Dosha", "Medas Dhatu"],
                synonyms: "Medoroga, Sthaulya, Kapha Vriddhi"
            },
            icd11: {
                code: "5B81",
                term: "Obesity",
                description: "Excess body fat accumulation that presents a risk to health.",
                tags: ["Metabolic", "Nutritional", "Chronic"],
                parent: "Endocrine, nutritional or metabolic diseases"
            }
        },
        {
            id: 5,
            name: "Tridosha Vishama - Digestive Disorders",
            namaste: {
                code: "NAM.TRI.005.123",
                term: "त्रिदोष विषम (Tridosha Vishama)",
                description: "Irregular patterns in all three doshas causing complex digestive and systemic disorders.",
                tags: ["Digestive System", "Tridosha", "Complex Disorders"],
                synonyms: "Sama Dosha, Tridoshaja Vikara"
            },
            icd11: {
                code: "DD90",
                term: "Functional gastrointestinal disorders",
                description: "Digestive system disorders without identifiable structural abnormalities.",
                tags: ["Gastrointestinal", "Functional", "Complex"],
                parent: "Diseases of the digestive system"
            }
        }
    ];

    // Helper function to detect search type
    const detectSearchType = (term) => {
        const upperTerm = term.trim().toUpperCase();
        if (upperTerm.startsWith('NAM.') || upperTerm.includes('NAM.')) {
            return 'namaste_code';
        }
        // Common ICD-11 patterns: alphanumeric with dots, containing at least one number, length 3 to 10
        if (/^[A-Z0-9.]{3,10}$/.test(upperTerm) && /[0-9]/.test(upperTerm)) {
            return 'icd11_code';
        }
        return 'diagnosis_name';
    };

    // Filter suggestions based on search term
    useEffect(() => {
        if (searchTerm.trim() === '') {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const searchType = detectSearchType(searchTerm);
        const searchLower = searchTerm.toLowerCase();
        
        const filtered = diagnosisData.filter(diagnosis => {
            switch (searchType) {
                case 'namaste_code':
                    return diagnosis.namaste.code.toLowerCase().includes(searchLower);
                case 'icd11_code':
                    return diagnosis.icd11.code.toLowerCase().includes(searchLower);
                default:
                    return (
                        diagnosis.name.toLowerCase().includes(searchLower) ||
                        diagnosis.namaste.term.toLowerCase().includes(searchLower) ||
                        diagnosis.icd11.term.toLowerCase().includes(searchLower) ||
                        diagnosis.namaste.code.toLowerCase().includes(searchLower) ||
                        diagnosis.icd11.code.toLowerCase().includes(searchLower)
                    );
            }
        });

        setSuggestions(filtered.slice(0, 5)); // Limit to 5 suggestions
        setShowSuggestions(filtered.length > 0);
    }, [searchTerm]);

    const handleSearch = () => {
        if (searchTerm.trim() === '') return;
        
        setLoading(true);
        setShowSuggestions(false);
        
        const searchType = detectSearchType(searchTerm);
        const searchLower = searchTerm.toLowerCase();
        
        // Find exact match or closest match based on search type
        const match = diagnosisData.find(diagnosis => {
            switch (searchType) {
                case 'namaste_code':
                    return diagnosis.namaste.code.toLowerCase().includes(searchLower);
                case 'icd11_code':
                    return diagnosis.icd11.code.toLowerCase().includes(searchLower);
                default:
                    return (
                        diagnosis.name.toLowerCase().includes(searchLower) ||
                        diagnosis.namaste.term.toLowerCase().includes(searchLower) ||
                        diagnosis.icd11.term.toLowerCase().includes(searchLower) ||
                        diagnosis.namaste.code.toLowerCase().includes(searchLower) ||
                        diagnosis.icd11.code.toLowerCase().includes(searchLower)
                    );
            }
        });
        
        setTimeout(() => {
            setSelectedDiagnosis(match);
            setLoading(false);
        }, 500);
    };

    const handleSuggestionClick = (diagnosis) => {
        setSearchTerm(diagnosis.name);
        setSelectedDiagnosis(diagnosis);
        setShowSuggestions(false);
        setSuggestions([]);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="pb-15 bg-gradient-to-br from-[#fdfbf5] to-white">

            <div className="text-center p-15">

                <p className="text-[#0a5614] font-bold text-3xl m-5 ">Intelligent Dual Coding Dashboard</p>

                <p>Advanced tools for seamless code mapping and medical diagnosis management</p>

            </div>

            <div className="mx-40 rounded-3xl shadow-xl bg-white ">

                <div className="flex justify-between items-center p-5 bg-gradient-to-r from-[#0a5614] to-[#0152cb] text-white rounded-t-3xl">

                    <div className="flex gap-5 items-center">

                        <span className="h-11 w-11 rounded-full flex justify-center items-center text-white bg-[#ffffff49]">

                            <i className="fa-solid fa-code text-2xl"></i>

                        </span>

                        <div>

                            <p className="font-bold text-xl"> Code Mapping Interface</p>
                            <p>Real-time NAMASTE ↔ ICD-11 translation</p>
                        </div>
                    </div>

                    <div className="flex gap-5 items-center">

                                <span className="bg-[#ffffff49] rounded-full p-3 cursor-pointer flex justify-center items-center">
                            <i className="fa-solid fa-download"></i>
                            Export
                        </span>

                        <span className="bg-[#ffffff49] rounded-full p-3 cursor-pointer flex justify-center items-center">
                            <i className="fa-solid fa-gear"></i>
                            Settings
                        </span>

                    </div>

                </div>

                <div className="p-5 gap-10 grid grid-cols-3">

                    <div className="col-span-2">

                        <div className="bg-[#fdfbf5] rounded-3xl p-6 border border-[#e7d58e]  ">



                            <p className="font-bold text-2xl text-[#0a5614]">Code Search & Mapping</p>

                            <div className="relative">
                                <div className={`flex my-4 justify-between items-center gap-3 bg-white rounded-lg px-4 py-1 border ${isFocused ? 'border-[#f5bd04] border-2' : 'border-[#e7d58e]'}`}>

                                    <i className="fa-solid fa-magnifying-glass text-[#e7d58e]"></i>

                                    <input
                                        type="text"
                                        placeholder="Enter disease name, NAMASTE code or ICD-11 code..."
                                        className="focus:outline-none w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => {
                                            setTimeout(() => {
                                                setIsFocused(false);
                                                setShowSuggestions(false);
                                            }, 200);
                                        }}
                                        onKeyPress={handleKeyPress}
                                    />

                                    <span 
                                        className="px-3 py-1 rounded-lg bg-[#0a5614] text-white cursor-pointer hover:bg-[#0a5614]/90 transition-colors"
                                        onClick={handleSearch}
                                    >
                                        {loading ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                                                <span>Searching...</span>
                                            </div>
                                        ) : (
                                            'Search'
                                        )}
                                    </span>
                                </div>
                                
                                {/* Autocomplete Suggestions */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full left-0 right-0 bg-white border border-[#e7d58e] rounded-lg shadow-lg mt-1 z-10 max-h-60 overflow-y-auto">
                                        {suggestions.map((diagnosis) => {
                                            const searchType = detectSearchType(searchTerm);
                                            return (
                                                <div
                                                    key={diagnosis.id}
                                                    className="px-4 py-3 hover:bg-[#fdfbf5] cursor-pointer border-b border-gray-100 last:border-b-0"
                                                    onClick={() => handleSuggestionClick(diagnosis)}
                                                >
                                                    <div className="font-medium text-[#0a5614] text-sm">
                                                        {diagnosis.name}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                                        <span className={`${searchType === 'namaste_code' ? 'font-semibold text-[#0a5614] bg-green-50 px-2 py-1 rounded' : ''}`}>
                                                            <i className="fa-solid fa-leaf mr-1"></i>
                                                            NAMASTE: {diagnosis.namaste.code}
                                                        </span>
                                                        <span className={`${searchType === 'icd11_code' ? 'font-semibold text-[#0052cb] bg-blue-50 px-2 py-1 rounded' : ''}`}>
                                                            <i className="fa-solid fa-hospital mr-1"></i>
                                                            ICD-11: {diagnosis.icd11.code}
                                                        </span>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Search Instructions */}
                            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <i className="fa-solid fa-info-circle text-blue-500"></i>
                                    <span>Search by diagnosis name, NAMASTE code (e.g., NAM.DIG.001.234) or ICD-11 code (e.g., DA90.0)</span>
                                </div>
                            </div>

                        </div>

                    </div>



                    <div className="bg-[#e7eefb] border border-[#0057b6] rounded-3xl p-5">

                        <p className="text-[#0057b6] font-bold text-2xl">Quick Actions</p>

                        <div className="*:my-5">

                            <p className="p-3 rounded-lg border border-[#0057b6]">

                            <i className="fa-solid fa-clock-rotate-left text-[#dab431]"></i>

                                Recent Searches

                            </p>

                            <p className="p-3 rounded-lg border border-[#0057b6]">

                            <i className="fa-solid fa-bookmark text-[#0057b6]"></i>
                                Saved Mappings

                            </p>

                            <p className="p-3 rounded-lg border border-[#0057b6]">

                            <i className="fa-solid fa-chart-bar text-[#0a5615]"></i>
                                Analytics

                            </p>

                        </div>

                    </div>

                </div>

                {/* Dynamic Code Cards - Only show when search is performed */}
                {selectedDiagnosis ? (
                    <div className="grid grid-cols-2 gap-10 py-5 px-10">
                        {/* NAMASTE Code Card */}
                        <div className="bg-[#fdfbf5] rounded-2xl p-5 border-l-4 border-[#0a5615] animate-fadeIn">
                            <div className="flex justify-between items-center mb-5">
                                <p className="font-bold text-2xl text-[#0a5614]">NAMASTE Code</p>
                                <span className="bg-[#0a5614] rounded-full px-3 py-1 text-xs text-white cursor-pointer">Traditional</span>
                            </div>

                            <div className="bg-white rounded-2xl p-4">
                                <p className="font-bold text-2xl text-[#0a5614]">{selectedDiagnosis.namaste.code}</p>
                                <p className="font-semibold text-lg">{selectedDiagnosis.namaste.term}</p>
                                <p className="text-sm text-[#263040] my-3">{selectedDiagnosis.namaste.description}</p>

                                <div className="text-[#0a5614] flex flex-wrap gap-2 my-4">
                                    {selectedDiagnosis.namaste.tags.map((tag, index) => (
                                        <span key={index} className="p-2 bg-[#f6e7bb] rounded-full text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <span className="font-bold text-xs text-[#263040]">
                                        Synonyms:
                                    </span>
                                    <span className="text-xs text-[#263040] ml-2">
                                        {selectedDiagnosis.namaste.synonyms}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* ICD-11 Code Card */}
                        <div className="bg-[#f9fcfe] rounded-2xl p-5 border-l-4 border-[#0052cb] animate-fadeIn">
                            <div className="flex justify-between items-center mb-5">
                                <p className="font-bold text-2xl text-[#0052cb]">ICD-11 Code</p>
                                <span className="bg-[#0052cb] rounded-full px-3 py-1 text-xs text-white cursor-pointer">Modern</span>
                            </div>

                            <div className="bg-white rounded-2xl p-4">
                                <p className="font-bold text-2xl text-[#0052cb]">{selectedDiagnosis.icd11.code}</p>
                                <p className="font-semibold text-lg">{selectedDiagnosis.icd11.term}</p>
                                <p className="text-sm text-[#263040] my-3">{selectedDiagnosis.icd11.description}</p>

                                <div className="text-[#0052cb] flex flex-wrap gap-2 my-4">
                                    {selectedDiagnosis.icd11.tags.map((tag, index) => (
                                        <span key={index} className="p-2 bg-[#e2f3ff] rounded-full text-xs">
                                            {tag}
                                        </span>
                                    ))}
                                </div>

                                <div className="mt-4">
                                    <span className="font-bold text-xs text-[#263040]">
                                        Parent:
                                    </span>
                                    <span className="text-xs text-[#263040] ml-2">
                                        {selectedDiagnosis.icd11.parent}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-10 px-10 text-center">
                        <div className="text-gray-400">
                            <i className="fa-solid fa-search text-4xl mb-4"></i>
                            <p className="text-lg font-medium text-gray-600">Search for a diagnosis to see NAMASTE and ICD-11 codes</p>
                            <p className="text-sm text-gray-500 mt-2">Start typing in the search box above to get suggestions</p>
                        </div>
                    </div>
                )}

            </div>

        </div>
    )
}