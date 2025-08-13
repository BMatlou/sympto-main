
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Calendar, MapPin, Thermometer, Clock, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSymptoms } from '@/hooks/useSupabaseData';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SymptomDetail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const symptomId = searchParams.get('id');
  const { data: symptoms } = useSymptoms();
  const [symptom, setSymptom] = useState<any>(null);

  useEffect(() => {
    if (symptoms && symptomId) {
      const foundSymptom = symptoms.find(s => s.id === symptomId);
      setSymptom(foundSymptom);
    }
  }, [symptoms, symptomId]);

  const handleDelete = async () => {
    if (!symptom) return;
    
    if (confirm('Are you sure you want to delete this symptom entry?')) {
      try {
        const { error } = await supabase
          .from('symptoms_log')
          .delete()
          .eq('id', symptom.id);
        
        if (error) throw error;
        
        toast.success('Symptom deleted successfully');
        navigate('/symptoms');
      } catch (error) {
        console.error('Error deleting symptom:', error);
        toast.error('Failed to delete symptom');
      }
    }
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-100 text-green-800';
    if (severity <= 6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getSeverityLabel = (severity: number) => {
    if (severity <= 3) return 'Mild';
    if (severity <= 6) return 'Moderate';
    return 'Severe';
  };

  if (!symptom) {
    return (
      <div className="p-4 pb-20 max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate('/symptoms')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Symptom Detail</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-600">Symptom not found</p>
          <Button 
            onClick={() => navigate('/symptoms')}
            className="mt-4"
            variant="outline"
          >
            Back to Symptoms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/symptoms')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Symptom Detail</h1>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => navigate(`/add-record?type=symptom&edit=${symptom.id}`)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            size="sm" 
            variant="outline"
            onClick={handleDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Symptom Card */}
      <div className="bg-white rounded-xl p-6 shadow-sm border mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">{symptom.symptom}</h2>
          {symptom.severity && (
            <Badge className={getSeverityColor(symptom.severity)}>
              {getSeverityLabel(symptom.severity)} ({symptom.severity}/10)
            </Badge>
          )}
        </div>

        {/* Date and Time */}
        <div className="flex items-center space-x-2 mb-4 text-gray-600">
          <Calendar className="w-4 h-4" />
          <span className="text-sm">
            {format(new Date(symptom.logged_at || symptom.created_at), 'EEEE, MMMM dd, yyyy')}
          </span>
        </div>

        <div className="flex items-center space-x-2 mb-4 text-gray-600">
          <Clock className="w-4 h-4" />
          <span className="text-sm">
            {format(new Date(symptom.logged_at || symptom.created_at), 'hh:mm a')}
          </span>
        </div>

        {/* Description */}
        {symptom.description && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-gray-700 text-sm">{symptom.description}</p>
          </div>
        )}

        {/* Triggers */}
        {symptom.triggers && symptom.triggers.length > 0 && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Possible Triggers</h3>
            <div className="flex flex-wrap gap-2">
              {symptom.triggers.map((trigger: string, index: number) => (
                <span 
                  key={index} 
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {trigger}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {symptom.notes && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Additional Notes</h3>
            <p className="text-gray-700 text-sm">{symptom.notes}</p>
          </div>
        )}

        {/* Location Data */}
        {symptom.location_data && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Location</h3>
            <div className="flex items-center space-x-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">
                {symptom.location_data.city || 'Location recorded'}
              </span>
            </div>
          </div>
        )}

        {/* Environmental Data */}
        {symptom.environmental_data && (
          <div className="mb-4">
            <h3 className="font-medium text-gray-900 mb-2">Environmental Conditions</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {symptom.environmental_data.temperature && (
                <div className="flex items-center space-x-2">
                  <Thermometer className="w-4 h-4 text-gray-400" />
                  <span>{symptom.environmental_data.temperature}°C</span>
                </div>
              )}
              {symptom.environmental_data.humidity && (
                <div>
                  <span className="text-gray-600">Humidity: {symptom.environmental_data.humidity}%</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Severity Scale */}
        {symptom.severity && (
          <div className="mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Pain/Severity Scale</h3>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                <div
                  key={level}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                    level <= symptom.severity
                      ? level <= 3
                        ? 'bg-green-500 text-white'
                        : level <= 6
                        ? 'bg-yellow-500 text-white'
                        : 'bg-red-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {level}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={() => navigate('/symptom-recommendations', { state: { symptom } })}
          className="w-full bg-[#2ecac8] hover:bg-[#338886] text-white"
        >
          Get Recommendations
        </Button>

        <Button 
          onClick={() => navigate('/add-record?type=symptom')}
          variant="outline"
          className="w-full"
        >
          Log Similar Symptom
        </Button>
      </div>

      {/* Related Symptoms */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pattern Analysis</h3>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            This is your {symptoms?.filter(s => s.symptom.toLowerCase() === symptom.symptom.toLowerCase()).length || 1} time logging "{symptom.symptom}".
            {symptom.severity && (
              <span className="block mt-1">
                Average severity: {
                  (symptoms?.filter(s => s.symptom.toLowerCase() === symptom.symptom.toLowerCase())
                    .reduce((sum, s) => sum + (s.severity || 0), 0) / 
                   symptoms?.filter(s => s.symptom.toLowerCase() === symptom.symptom.toLowerCase()).length || 1
                  ).toFixed(1)
                }/10
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default SymptomDetail;
