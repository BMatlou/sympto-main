
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts";

const WeeklyOverview = () => {
  const healthData = [
    { day: 'Mon', symptoms: 2, water: 6, energy: 8 },
    { day: 'Tue', symptoms: 1, water: 8, energy: 9 },
    { day: 'Wed', symptoms: 3, water: 7, energy: 6 },
    { day: 'Thu', symptoms: 1, water: 9, energy: 8 },
    { day: 'Fri', symptoms: 2, water: 8, energy: 7 },
    { day: 'Sat', symptoms: 0, water: 6, energy: 9 },
    { day: 'Sun', symptoms: 1, water: 7, energy: 8 }
  ];

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Overview</h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={healthData}>
            <XAxis dataKey="day" axisLine={false} tickLine={false} />
            <YAxis hide />
            <Line 
              type="monotone" 
              dataKey="energy" 
              stroke="#2ecac8" 
              strokeWidth={3}
              dot={{ fill: '#2ecac8', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <p className="text-sm text-gray-600 mt-2">Energy levels this week</p>
    </div>
  );
};

export default WeeklyOverview;
