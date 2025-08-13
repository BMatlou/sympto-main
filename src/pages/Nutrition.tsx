
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Calendar, Utensils } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNutritionLog, useAddNutritionEntry, useTodayCalories } from '@/hooks/useNutrition';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Nutrition = () => {
  const navigate = useNavigate();
  const { data: nutritionLog, isLoading } = useNutritionLog();
  const { data: todayCalories } = useTodayCalories();
  const addNutritionEntry = useAddNutritionEntry();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    food_item: '',
    meal_type: '',
    quantity: '',
    unit: '',
    calories: ''
  });

  const mealTypes = [
    'breakfast',
    'lunch', 
    'dinner',
    'snack'
  ];

  const units = [
    'grams',
    'cups',
    'pieces',
    'tablespoons',
    'ounces',
    'servings'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.food_item || !formData.meal_type || !formData.quantity) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addNutritionEntry.mutateAsync({
        food_item: formData.food_item,
        meal_type: formData.meal_type,
        quantity: parseFloat(formData.quantity),
        unit: formData.unit,
        calories: formData.calories ? parseInt(formData.calories) : null,
        logged_at: new Date().toISOString()
      });

      setFormData({
        food_item: '',
        meal_type: '',
        quantity: '',
        unit: '',
        calories: ''
      });
      setShowAddForm(false);
    } catch (error) {
      console.error('Error adding nutrition entry:', error);
    }
  };

  const getRecommendedFoods = () => {
    // This could be based on symptoms or health goals
    return [
      { name: 'Leafy Greens', reason: 'Rich in vitamins and minerals' },
      { name: 'Fatty Fish', reason: 'High in omega-3 fatty acids' },
      { name: 'Berries', reason: 'Antioxidants and fiber' },
      { name: 'Nuts', reason: 'Healthy fats and protein' }
    ];
  };

  const recommendedFoods = getRecommendedFoods();

  return (
    <div className="p-4 pb-20 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors mr-3"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Nutrition</h1>
        </div>
        
        <Button 
          onClick={() => setShowAddForm(true)}
          className="bg-[#2ecac8] hover:bg-[#338886]"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Food
        </Button>
      </div>

      {/* Today's Calories */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900">Today's Calories</h3>
            <p className="text-3xl font-bold text-[#2ecac8] mt-2">
              {todayCalories || 0}
            </p>
            <p className="text-sm text-gray-600">Goal: 2000 calories</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
              <div 
                className="bg-[#2ecac8] h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, ((todayCalories || 0) / 2000) * 100)}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Food Form */}
      {showAddForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add Food Entry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="food_item">Food Item *</Label>
                <Input
                  id="food_item"
                  value={formData.food_item}
                  onChange={(e) => setFormData(prev => ({ ...prev, food_item: e.target.value }))}
                  placeholder="e.g., Apple, Chicken breast"
                  required
                />
              </div>

              <div>
                <Label htmlFor="meal_type">Meal Type *</Label>
                <Select value={formData.meal_type} onValueChange={(value) => setFormData(prev => ({ ...prev, meal_type: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select meal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((meal) => (
                      <SelectItem key={meal} value={meal}>
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unit">Unit</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData(prev => ({ ...prev, unit: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {units.map((unit) => (
                        <SelectItem key={unit} value={unit}>
                          {unit}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="calories">Calories (optional)</Label>
                <Input
                  id="calories"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData(prev => ({ ...prev, calories: e.target.value }))}
                  placeholder="150"
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" className="flex-1 bg-[#2ecac8] hover:bg-[#338886]">
                  Add Entry
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Recommended Foods */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Utensils className="w-5 h-5 text-[#2ecac8]" />
            <span>Recommended Foods</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recommendedFoods.map((food, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <h4 className="font-medium text-gray-900">{food.name}</h4>
                  <p className="text-sm text-gray-600">{food.reason}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, food_item: food.name }));
                    setShowAddForm(true);
                  }}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span>Recent Entries</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2ecac8] mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading entries...</p>
            </div>
          ) : nutritionLog && nutritionLog.length > 0 ? (
            <div className="space-y-3">
              {nutritionLog.slice(0, 10).map((entry, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium text-gray-900">{entry.food_item}</h4>
                    <p className="text-sm text-gray-600">
                      {entry.meal_type} • {entry.quantity} {entry.unit || 'serving'}
                      {entry.calories && ` • ${entry.calories} cal`}
                    </p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(entry.logged_at || entry.created_at), 'MMM dd, HH:mm')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-600">No nutrition entries yet</p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-2 bg-[#2ecac8] hover:bg-[#338886]"
                size="sm"
              >
                Add your first entry
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Nutrition;
