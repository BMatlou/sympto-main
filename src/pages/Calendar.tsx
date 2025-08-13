
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Clock, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const Calendar = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<any[]>([]);
  const [symptoms, setSymptoms] = useState<any[]>([]);

  useEffect(() => {
    const savedAppointments = JSON.parse(localStorage.getItem('appointments') || '[]');
    const savedRecords = JSON.parse(localStorage.getItem('healthRecords') || '[]');
    
    setAppointments(savedAppointments);
    setSymptoms(savedRecords.filter((r: any) => r.type === 'symptom'));
  }, []);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const today = new Date();

  const getDayEvents = (day: number) => {
    const dateString = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    const dayAppointments = appointments.filter(app => app.date === dateString);
    const daySymptoms = symptoms.filter(symptom => {
      const symptomDate = new Date(symptom.timestamp).toDateString();
      const checkDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toDateString();
      return symptomDate === checkDate;
    });

    return { appointments: dayAppointments, symptoms: daySymptoms };
  };

  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + (direction === 'next' ? 1 : -1), 1));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <Button 
          onClick={() => navigate('/book-appointment')}
          className="bg-[#2ecac8] hover:bg-[#338886] text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book
        </Button>
      </div>

      {/* Calendar Header */}
      <div className="bg-white rounded-xl shadow-sm border mb-6">
        <div className="flex items-center justify-between p-4 border-b">
          <button 
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <h2 className="text-lg font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button 
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Week Days */}
        <div className="grid grid-cols-7 border-b">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDayOfMonth }, (_, i) => (
            <div key={`empty-${i}`} className="h-16 border-r border-b"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const events = getDayEvents(day);
            const hasEvents = events.appointments.length > 0 || events.symptoms.length > 0;
            
            return (
              <div 
                key={day}
                className={`h-16 border-r border-b p-1 relative cursor-pointer hover:bg-gray-50 ${
                  isToday(day) ? 'bg-[#2ecac8]/10' : ''
                }`}
                onClick={() => {
                  // Could open day detail modal
                  console.log('Day clicked:', day, events);
                }}
              >
                <div className={`text-sm font-medium ${
                  isToday(day) ? 'text-[#2ecac8]' : 'text-gray-900'
                }`}>
                  {day}
                </div>
                
                {/* Event indicators */}
                <div className="flex space-x-1 mt-1">
                  {events.appointments.length > 0 && (
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  )}
                  {events.symptoms.length > 0 && (
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Today's Events */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Schedule</h3>
        
        {appointments.filter(app => {
          const today = new Date().toISOString().split('T')[0];
          return app.date === today;
        }).length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-gray-600">No appointments today</p>
            <Button 
              onClick={() => navigate('/book-appointment')}
              className="mt-3 bg-[#2ecac8] hover:bg-[#338886] text-white"
            >
              Schedule Appointment
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {appointments.filter(app => {
              const today = new Date().toISOString().split('T')[0];
              return app.date === today;
            }).map((appointment, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">
                      Dr. {appointment.doctorId} - {appointment.consultationType}
                    </h4>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="w-4 h-4" />
                      <span>{appointment.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Symptoms */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Health Events</h3>
        
        {symptoms.slice(0, 3).length === 0 ? (
          <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
            <p className="text-gray-600">No recent symptoms logged</p>
            <Button 
              onClick={() => navigate('/symptoms')}
              className="mt-3 bg-[#2ecac8] hover:bg-[#338886] text-white"
            >
              Log Symptom
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {symptoms.slice(0, 3).map((symptom, index) => (
              <div key={index} className="bg-white rounded-xl p-4 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">{symptom.name}</h4>
                    <p className="text-sm text-gray-600">
                      {new Date(symptom.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    symptom.severity <= 3 ? "text-green-600 bg-green-100" :
                    symptom.severity <= 6 ? "text-yellow-600 bg-yellow-100" :
                    "text-red-600 bg-red-100"
                  }`}>
                    {symptom.severity[0] || symptom.severity}/10
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Legend</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Appointments</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Symptoms logged</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#2ecac8] rounded-full"></div>
            <span className="text-sm text-gray-700">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
