import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';

const CodeMapping = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState('namaste'); // 'namaste' or 'icd11'
  const [mappings, setMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [selectedMapping, setSelectedMapping] = useState(null);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  
  const { user, isDoctor, isAdmin } = useAuth();

  // Sample mapping data (will be replaced with API calls)
  const sampleMappings = [
    {
      id: 1,
      namaste_code: 'NAM.001.001',
      namaste_term: 'Vata Dosha Imbalance',
      namaste_description: 'Constitutional imbalance in Vata dosha causing nervous system disorders',
      icd11_code: 'MG30.0Y',
      icd11_term: 'Other specified disorders of the nervous system',
      icd11_description: 'Functional nervous system disorders not elsewhere classified',
      confidence_score: 85,
      mapped_by: 'System',
      mapping_date: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      namaste_code: 'NAM.002.015',
      namaste_term: 'Pitta Rakta Dushti',
      namaste_description: 'Blood vitiation due to excess heat and Pitta dosha',
      icd11_code: '3A00',
      icd11_term: 'Dermatitis and eczema',
      icd11_description: 'Inflammatory skin conditions',
      confidence_score: 92,
      mapped_by: 'Dr. Kumar',
      mapping_date: '2024-01-20',
      status: 'active'
    },
    {
      id: 3,
      namaste_code: 'NAM.003.008',
      namaste_term: 'Kapha Medas Vriddhi',
      namaste_description: 'Excess accumulation of fat tissue due to Kapha imbalance',
      icd11_code: '5B81',
      icd11_term: 'Obesity',
      icd11_description: 'Excess body fat accumulation',
      confidence_score: 88,
      mapped_by: 'System',
      mapping_date: '2024-01-18',
      status: 'active'
    },
    {
      id: 4,
      namaste_code: 'NAM.004.022',
      namaste_term: 'Tridosha Vishama',
      namaste_description: 'Irregular patterns in all three doshas causing digestive disorders',
      icd11_code: 'DD90',
      icd11_term: 'Functional gastrointestinal disorders',
      icd11_description: 'Digestive system disorders without structural abnormalities',
      confidence_score: 78,
      mapped_by: 'Dr. Sharma',
      mapping_date: '2024-01-22',
      status: 'pending_review'
    }
  ];

  useEffect(() => {
    setMappings(sampleMappings);
    setFilteredMappings(sampleMappings);
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredMappings(mappings);
      setSuggestions([]);
      return;
    }

    const filtered = mappings.filter(mapping => {
      const searchLower = searchTerm.toLowerCase();
      if (searchType === 'namaste') {
        return (
          mapping.namaste_code.toLowerCase().includes(searchLower) ||
          mapping.namaste_term.toLowerCase().includes(searchLower) ||
          mapping.namaste_description.toLowerCase().includes(searchLower)
        );
      } else {
        return (
          mapping.icd11_code.toLowerCase().includes(searchLower) ||
          mapping.icd11_term.toLowerCase().includes(searchLower) ||
          mapping.icd11_description.toLowerCase().includes(searchLower)
        );
      }
    });

    setFilteredMappings(filtered);
    
    // Generate suggestions
    const suggestions = filtered.slice(0, 5).map(mapping => ({
      text: searchType === 'namaste' ? mapping.namaste_term : mapping.icd11_term,
      code: searchType === 'namaste' ? mapping.namaste_code : mapping.icd11_code,
      mapping: mapping
    }));
    setSuggestions(suggestions);
  }, [searchTerm, searchType, mappings]);

  const handleSearch = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending_review': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getConfidenceColor = (score) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f9efd5] to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-[#0a5614] mb-2">
            Code Mapping Interface
          </h1>
          <p className="text-gray-600 text-lg">
            Search and explore NAMASTE to ICD-11 code mappings
          </p>
        </div>

        {/* Search Interface */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            {/* Search Type Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setSearchType('namaste')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'namaste'
                    ? 'bg-[#0a5614] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#0a5614]'
                }`}
              >
                <i className="fas fa-leaf mr-2"></i>
                NAMASTE Codes
              </button>
              <button
                onClick={() => setSearchType('icd11')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  searchType === 'icd11'
                    ? 'bg-[#017be8] text-white shadow-sm'
                    : 'text-gray-700 hover:text-[#017be8]'
                }`}
              >
                <i className="fas fa-hospital mr-2"></i>
                ICD-11 Codes
              </button>
            </div>

            {/* Search Input */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder={`Search ${searchType === 'namaste' ? 'NAMASTE' : 'ICD-11'} codes, terms, or descriptions...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0a5614] focus:border-[#0a5614] outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              
              {/* Search Suggestions */}
              {suggestions.length > 0 && searchTerm && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg mt-1 z-10">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSearchTerm(suggestion.text);
                        setSelectedMapping(suggestion.mapping);
                        setSuggestions([]);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="font-medium text-gray-900">{suggestion.text}</div>
                      <div className="text-sm text-gray-500">{suggestion.code}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-[#0a5614] to-[#017be8] text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Searching...
                </div>
              ) : (
                <>
                  <i className="fas fa-search mr-2"></i>
                  Search
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            <span>
              <i className="fas fa-database mr-1"></i>
              {filteredMappings.length} mappings found
            </span>
            <span>
              <i className="fas fa-check-circle mr-1 text-green-500"></i>
              {filteredMappings.filter(m => m.status === 'active').length} active
            </span>
            <span>
              <i className="fas fa-clock mr-1 text-yellow-500"></i>
              {filteredMappings.filter(m => m.status === 'pending_review').length} pending review
            </span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid gap-6">
          {filteredMappings.map((mapping) => (
            <div 
              key={mapping.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(mapping.status)}`}>
                      {mapping.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`font-semibold ${getConfidenceColor(mapping.confidence_score)}`}>
                      {mapping.confidence_score}% confidence
                    </span>
                  </div>
                  {(isDoctor() || isAdmin()) && (
                    <button 
                      onClick={() => setSelectedMapping(mapping)}
                      className="text-[#017be8] hover:text-blue-600 transition-colors"
                    >
                      <i className="fas fa-edit mr-1"></i>
                      Edit Mapping
                    </button>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* NAMASTE Side */}
                  <div className="border-l-4 border-[#0a5614] pl-4">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-leaf text-[#0a5614] mr-2"></i>
                      <h3 className="font-semibold text-[#0a5614]">NAMASTE Code</h3>
                    </div>
                    <div className="mb-2">
                      <span className="font-mono text-sm bg-green-50 px-2 py-1 rounded">
                        {mapping.namaste_code}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {mapping.namaste_term}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {mapping.namaste_description}
                    </p>
                  </div>

                  {/* ICD-11 Side */}
                  <div className="border-l-4 border-[#017be8] pl-4">
                    <div className="flex items-center mb-2">
                      <i className="fas fa-hospital text-[#017be8] mr-2"></i>
                      <h3 className="font-semibold text-[#017be8]">ICD-11 Code</h3>
                    </div>
                    <div className="mb-2">
                      <span className="font-mono text-sm bg-blue-50 px-2 py-1 rounded">
                        {mapping.icd11_code}
                      </span>
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {mapping.icd11_term}
                    </h4>
                    <p className="text-gray-600 text-sm">
                      {mapping.icd11_description}
                    </p>
                  </div>
                </div>

                {/* Mapping Info */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm text-gray-500">
                  <span>
                    Mapped by: <strong>{mapping.mapped_by}</strong>
                  </span>
                  <span>
                    Date: {new Date(mapping.mapping_date).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* No Results */}
        {filteredMappings.length === 0 && searchTerm && (
          <div className="text-center py-12">
            <i className="fas fa-search text-6xl text-gray-300 mb-4"></i>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No mappings found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search terms or switch between NAMASTE and ICD-11 codes
            </p>
          </div>
        )}

        {/* Add New Mapping Button (for authorized users) */}
        {(isDoctor() || isAdmin()) && (
          <div className="fixed bottom-6 right-6">
            <button className="bg-gradient-to-r from-[#0a5614] to-[#017be8] text-white w-16 h-16 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center">
              <i className="fas fa-plus text-xl"></i>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeMapping;