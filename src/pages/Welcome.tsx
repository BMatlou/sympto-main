import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Shield, Users, Smartphone, TrendingUp, Clock } from "lucide-react";

const Welcome = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Heart,
      title: "Track Symptoms",
      description: "Log and monitor your symptoms with ease, helping you identify patterns and triggers."
    },
    {
      icon: TrendingUp,
      title: "Health Insights",
      description: "Get personalized insights and recommendations based on your health data."
    },
    {
      icon: Clock,
      title: "Medication Reminders",
      description: "Never miss a dose with smart medication tracking and reminders."
    },
    {
      icon: Shield,
      title: "Secure & Private",
      description: "Your health data is encrypted and protected with enterprise-grade security."
    },
    {
      icon: Users,
      title: "Share with Doctors",
      description: "Generate comprehensive reports to share with your healthcare providers."
    },
    {
      icon: Smartphone,
      title: "Always Available",
      description: "Access your health data anytime, anywhere with our mobile-friendly platform."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#2ecac8]/10 via-white to-[#338886]/5">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-[#2ecac8] to-[#338886] p-4 rounded-2xl shadow-lg">
              <Heart className="w-12 h-12 text-white" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
            Welcome to <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2ecac8] to-[#338886]">Sympto</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-4xl mx-auto">
            Symptoms Managed Proactively by Tracking for Better Health Outcomes!
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-3xl mx-auto">
            Take control of your health journey with intelligent symptom tracking, 
            personalized insights, and seamless healthcare provider collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-[#2ecac8] to-[#338886] hover:from-[#338886] hover:to-[#2ecac8] text-white px-8 py-4 text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              Get Started Today
            </Button>
            <Button 
              onClick={() => navigate('/login')}
              variant="outline"
              className="border-2 border-[#2ecac8] text-[#2ecac8] hover:bg-[#2ecac8] hover:text-white px-8 py-4 text-lg rounded-full transition-all duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="mx-auto bg-gradient-to-r from-[#2ecac8]/20 to-[#338886]/20 p-4 rounded-full w-fit mb-4">
                    <Icon className="w-8 h-8 text-[#2ecac8]" />
                  </div>
                  <CardTitle className="text-xl text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center">{feature.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-[#2ecac8] to-[#338886] rounded-3xl p-12 text-white shadow-2xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Health Management?
          </h2>
          <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto">
            Join thousands of users who have taken control of their health journey with Sympto.
            Start tracking, get insights, and improve your health outcomes today.
          </p>
          <Button 
            onClick={() => navigate('/auth')}
            className="bg-white text-[#2ecac8] hover:bg-gray-100 px-10 py-4 text-lg rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            Start Your Health Journey
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-gray-500">
            © 2024 Sympto. Empowering better health through intelligent tracking.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;
