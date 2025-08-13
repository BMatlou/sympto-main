
import React, { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';

interface Symptom {
  id: string;
  name: string;
  category: string;
  description?: string;
  common_triggers?: string[];
}

interface SymptomSearchProps {
  onSymptomSelect: (symptom: string) => void;
  selectedSymptom?: string;
}

const SymptomSearch: React.FC<SymptomSearchProps> = ({ onSymptomSelect, selectedSymptom }) => {
  const [searchTerm, setSearchTerm] = useState(selectedSymptom || '');
  const [symptoms, setSymptoms] = useState<Symptom[]>([]);
  const [filteredSymptoms, setFilteredSymptoms] = useState<Symptom[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSymptoms();
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = symptoms.filter(symptom =>
        symptom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        symptom.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSymptoms(filtered.slice(0, 20)); // Limit to 20 results
      setShowSuggestions(true);
    } else {
      setFilteredSymptoms([]);
      setShowSuggestions(false);
    }
  }, [searchTerm, symptoms]);

  const loadSymptoms = async () => {
    try {
      const { data, error } = await supabase
        .from('symptoms_library')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error loading symptoms:', error);
        return;
      }

      setSymptoms(data || []);
    } catch (error) {
      console.error('Error loading symptoms:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSymptomSelect = (symptom: Symptom) => {
    setSearchTerm(symptom.name);
    setShowSuggestions(false);
    onSymptomSelect(symptom.name);
  };

  const clearSearch = () => {
    setSearchTerm('');
    setShowSuggestions(false);
    onSymptomSelect('');
  };

  const categories = Array.from(new Set(symptoms.map(s => s.category)));
  const groupedSymptoms = categories.reduce((acc, category) => {
    acc[category] = filteredSymptoms.filter(s => s.category === category);
    return acc;
  }, {} as Record<string, Symptom[]>);

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search symptoms (e.g., headache, fatigue, nausea...)"
          className="pl-10 pr-10 border-2 border-gray-200 focus:border-[#2ecac8] transition-colors"
          onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
        />
        {searchTerm && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-3 w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {showSuggestions && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#2ecac8] mx-auto mb-2"></div>
              Loading symptoms...
            </div>
          ) : filteredSymptoms.length > 0 ? (
            <div className="p-2">
              {Object.entries(groupedSymptoms).map(([category, categorySymptoms]) => (
                categorySymptoms.length > 0 && (
                  <div key={category} className="mb-3">
                    <div className="px-3 py-2 text-xs font-semibold text-[#2ecac8] bg-gradient-to-r from-[#2ecac8]/10 to-[#338886]/10 rounded-md mb-1">
                      {category}
                    </div>
                    {categorySymptoms.map((symptom) => (
                      <button
                        key={symptom.id}
                        onClick={() => handleSymptomSelect(symptom)}
                        className="w-full text-left px-3 py-3 hover:bg-[#2ecac8]/10 rounded-lg transition-all duration-200 border-l-4 border-transparent hover:border-[#2ecac8]"
                      >
                        <div className="font-medium text-gray-900">{symptom.name}</div>
                        {symptom.description && (
                          <div className="text-sm text-gray-600 mt-1">{symptom.description}</div>
                        )}
                        {symptom.common_triggers && symptom.common_triggers.length > 0 && (
                          <div className="text-xs text-gray-500 mt-2 flex flex-wrap gap-1">
                            <span className="text-[#2ecac8] font-medium">Common triggers:</span>
                            {symptom.common_triggers.slice(0, 3).map((trigger, idx) => (
                              <span key={idx} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                                {trigger}
                              </span>
                            ))}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p>No symptoms found matching "{searchTerm}"</p>
              <p className="text-sm mt-1">Try a different search term or browse categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SymptomSearch;
