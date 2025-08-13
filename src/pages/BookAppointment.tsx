
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const BookAppointment = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [appointmentData, setAppointmentData] = useState({
    doctorId: "",
    consultationType: "",
    date: "",
    time: "",
    symptoms: [] as string[],
    concerns: "",
    includeHistory: true,
    includeRecords: true,
    paymentMethod: "",
    paymentTiming: "now",
  });

  const doctors = [
    { id: 1, name: "Dr. Sarah Johnson", specialty: "General Medicine", rating: 4.9, experience: "15 years", price: 150 },
    { id: 2, name: "Dr. Michael Chen", specialty: "Cardiology", rating: 4.8, experience: "12 years", price: 200 },
    { id: 3, name: "Dr. Emily Rodriguez", specialty: "Dermatology", rating: 4.7, experience: "10 years", price: 180 },
  ];

  const consultationTypes = [
    { id: "standard", name: "Standard Consultation", duration: "30 min", price: 150 },
    { id: "extended", name: "Extended Consultation", duration: "60 min", price: 250 },
    { id: "followup", name: "Follow-up Appointment", duration: "20 min", price: 100 },
  ];

  const commonSymptoms = [
    "Headache", "Fatigue", "Fever", "Cough", "Back Pain", 
    "Anxiety", "Insomnia", "Nausea", "Dizziness"
  ];

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    } else {
      handleBooking();
    }
  };

  const handleBooking = () => {
    // Simulate booking process
    const booking = {
      id: Date.now(),
      ...appointmentData,
      status: "confirmed",
      bookingDate: new Date().toISOString(),
    };
    
    const existingBookings = JSON.parse(localStorage.getItem('appointments') || '[]');
    existingBookings.push(booking);
    localStorage.setItem('appointments', JSON.stringify(existingBookings));
    
    toast.success("Appointment booked successfully!");
    navigate("/calendar");
  };

  const selectedDoctor = doctors.find(d => d.id.toString() === appointmentData.doctorId);
  const selectedConsultationType = consultationTypes.find(c => c.id === appointmentData.consultationType);

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Select Doctor & Type</h2>
            
            {/* Consultation Type */}
            <div>
              <Label className="text-gray-700 mb-3 block">Consultation Type</Label>
              <div className="space-y-2">
                {consultationTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setAppointmentData({...appointmentData, consultationType: type.id})}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      appointmentData.consultationType === type.id
                        ? 'border-[#2ecac8] bg-[#2ecac8]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h3 className="font-medium text-gray-900">{type.name}</h3>
                        <p className="text-sm text-gray-600">{type.duration}</p>
                      </div>
                      <span className="text-lg font-semibold text-[#2ecac8]">${type.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <Label className="text-gray-700 mb-3 block">Choose Doctor</Label>
              <div className="space-y-3">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setAppointmentData({...appointmentData, doctorId: doctor.id.toString()})}
                    className={`w-full p-4 text-left border rounded-lg transition-colors ${
                      appointmentData.doctorId === doctor.id.toString()
                        ? 'border-[#2ecac8] bg-[#2ecac8]/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-[#2ecac8] to-[#338886] rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900">{doctor.name}</h3>
                        <p className="text-sm text-gray-600">{doctor.specialty}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-sm text-yellow-600">★ {doctor.rating}</span>
                          <span className="text-sm text-gray-500">• {doctor.experience}</span>
                        </div>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">${doctor.price}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Schedule & Symptoms</h2>
            
            {/* Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Preferred Date</Label>
                <div className="relative mt-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="date"
                    type="date"
                    value={appointmentData.date}
                    onChange={(e) => setAppointmentData({...appointmentData, date: e.target.value})}
                    className="pl-10"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="time">Preferred Time</Label>
                <div className="relative mt-1">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    id="time"
                    type="time"
                    value={appointmentData.time}
                    onChange={(e) => setAppointmentData({...appointmentData, time: e.target.value})}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            {/* Symptoms Selection */}
            <div>
              <Label className="text-gray-700 mb-3 block">Related Symptoms</Label>
              <div className="grid grid-cols-2 gap-2">
                {commonSymptoms.map((symptom) => (
                  <button
                    key={symptom}
                    onClick={() => {
                      const updated = appointmentData.symptoms.includes(symptom)
                        ? appointmentData.symptoms.filter(s => s !== symptom)
                        : [...appointmentData.symptoms, symptom];
                      setAppointmentData({...appointmentData, symptoms: updated});
                    }}
                    className={`p-2 text-sm rounded-lg border transition-colors ${
                      appointmentData.symptoms.includes(symptom)
                        ? 'bg-[#2ecac8] text-white border-[#2ecac8]'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {symptom}
                  </button>
                ))}
              </div>
            </div>

            {/* Concerns */}
            <div>
              <Label htmlFor="concerns">Main Concerns</Label>
              <Textarea
                id="concerns"
                value={appointmentData.concerns}
                onChange={(e) => setAppointmentData({...appointmentData, concerns: e.target.value})}
                placeholder="Describe your main health concerns for this appointment..."
                className="mt-1"
              />
            </div>

            {/* Data Inclusion Options */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeHistory"
                  checked={appointmentData.includeHistory}
                  onChange={(e) => setAppointmentData({...appointmentData, includeHistory: e.target.checked})}
                />
                <Label htmlFor="includeHistory" className="text-sm">
                  Include my complete medical history
                </Label>
              </div>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="includeRecords"
                  checked={appointmentData.includeRecords}
                  onChange={(e) => setAppointmentData({...appointmentData, includeRecords: e.target.checked})}
                />
                <Label htmlFor="includeRecords" className="text-sm">
                  Include recent symptom logs and health records
                </Label>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-gray-900">Payment & Confirmation</h2>
            
            {/* Appointment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Appointment Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Doctor:</span>
                  <span className="text-gray-900">{selectedDoctor?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="text-gray-900">{selectedConsultationType?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date & Time:</span>
                  <span className="text-gray-900">{appointmentData.date} at {appointmentData.time}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Symptoms:</span>
                  <span className="text-gray-900">{appointmentData.symptoms.join(", ") || "None selected"}</span>
                </div>
                <hr className="my-2" />
                <div className="flex justify-between font-medium">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-[#2ecac8]">${selectedConsultationType?.price}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div>
              <Label className="text-gray-700 mb-3 block">Payment Method</Label>
              <div className="space-y-2">
                <button
                  onClick={() => setAppointmentData({...appointmentData, paymentMethod: "card"})}
                  className={`w-full p-3 text-left border rounded-lg transition-colors flex items-center space-x-3 ${
                    appointmentData.paymentMethod === "card"
                      ? 'border-[#2ecac8] bg-[#2ecac8]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-gray-600" />
                  <span>Credit/Debit Card</span>
                </button>
                <button
                  onClick={() => setAppointmentData({...appointmentData, paymentMethod: "insurance"})}
                  className={`w-full p-3 text-left border rounded-lg transition-colors flex items-center space-x-3 ${
                    appointmentData.paymentMethod === "insurance"
                      ? 'border-[#2ecac8] bg-[#2ecac8]/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Shield className="w-5 h-5 text-gray-600" />
                  <span>Insurance</span>
                </button>
              </div>
            </div>

            {/* Payment Timing */}
            <div>
              <Label className="text-gray-700 mb-3 block">Payment Timing</Label>
              <div className="flex space-x-3">
                <button
                  onClick={() => setAppointmentData({...appointmentData, paymentTiming: "now"})}
                  className={`flex-1 p-3 text-center border rounded-lg transition-colors ${
                    appointmentData.paymentTiming === "now"
                      ? 'border-[#2ecac8] bg-[#2ecac8] text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pay Now
                </button>
                <button
                  onClick={() => setAppointmentData({...appointmentData, paymentTiming: "later"})}
                  className={`flex-1 p-3 text-center border rounded-lg transition-colors ${
                    appointmentData.paymentTiming === "later"
                      ? 'border-[#2ecac8] bg-[#2ecac8] text-white'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pay Later
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Book Appointment</h1>
      </div>

      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Step {currentStep} of 3</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-[#2ecac8] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Form Content */}
      <div className="mb-6">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
          disabled={currentStep === 1}
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          className="bg-[#2ecac8] hover:bg-[#338886] text-white"
          disabled={
            (currentStep === 1 && (!appointmentData.doctorId || !appointmentData.consultationType)) ||
            (currentStep === 2 && (!appointmentData.date || !appointmentData.time)) ||
            (currentStep === 3 && !appointmentData.paymentMethod)
          }
        >
          {currentStep === 3 ? 'Book Appointment' : 'Next'}
        </Button>
      </div>
    </div>
  );
};

export default BookAppointment;
