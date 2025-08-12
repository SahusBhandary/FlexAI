import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Dimensions,
  FlatList,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';

const { width } = Dimensions.get('window');

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  imageUri?: string; // Add image URI field
}

interface Meal {
  id: string;
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  foods: FoodItem[];
}

interface DayLog {
  date: string;
  meals: Meal[];
}

const Diet = () => {
  const [dayLogs, setDayLogs] = useState<DayLog[]>([
    {
      date: '2025-08-11',
      meals: [
        {
          id: '1',
          type: 'breakfast',
          foods: [
            { id: '1', name: 'Oatmeal with Berries', calories: 320, protein: 12, carbs: 54, fat: 6, fiber: 8 },
            { id: '2', name: 'Greek Yogurt', calories: 130, protein: 15, carbs: 9, fat: 0, fiber: 0 }
          ]
        },
        {
          id: '2',
          type: 'lunch',
          foods: [
            { id: '3', name: 'Grilled Chicken Salad', calories: 450, protein: 35, carbs: 15, fat: 28, fiber: 6 }
          ]
        }
      ]
    },
    {
      date: '2025-08-10',
      meals: [
        {
          id: '3',
          type: 'breakfast',
          foods: [
            { id: '4', name: 'Protein Smoothie', calories: 280, protein: 25, carbs: 20, fat: 8, fiber: 4 }
          ]
        }
      ]
    }
  ]);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [showCameraOptions, setShowCameraOptions] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [newFood, setNewFood] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    fiber: ''
  });

  // Get current meal type based on time
  const getCurrentMealType = (): 'breakfast' | 'lunch' | 'dinner' | 'snack' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'breakfast';
    if (hour >= 11 && hour < 16) return 'lunch';
    if (hour >= 16 && hour < 22) return 'dinner';
    return 'snack';
  };

  // Camera functions
  const requestCameraPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed to take photos of your food.');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowCameraOptions(false);
        // Optionally open the add food modal after taking photo
        setShowAddFoodModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setShowCameraOptions(false);
        // Optionally open the add food modal after selecting photo
        setShowAddFoodModal(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  // Get today's log or create new one
  const getTodayLog = (): DayLog => {
    const today = new Date().toISOString().split('T')[0];
    const existingLog = dayLogs.find(log => log.date === today);
    
    if (existingLog) return existingLog;
    
    return {
      date: today,
      meals: [
        { id: Date.now().toString() + '1', type: 'breakfast', foods: [] },
        { id: Date.now().toString() + '2', type: 'lunch', foods: [] },
        { id: Date.now().toString() + '3', type: 'dinner', foods: [] },
        { id: Date.now().toString() + '4', type: 'snack', foods: [] }
      ]
    };
  };

  // Calculate total nutrition for a meal
  const getMealNutrition = (meal: Meal) => {
    return meal.foods.reduce(
      (total, food) => ({
        calories: total.calories + food.calories,
        protein: total.protein + food.protein,
        carbs: total.carbs + food.carbs,
        fat: total.fat + food.fat,
        fiber: total.fiber + food.fiber
      }),
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  // Calculate daily nutrition
  const getDayNutrition = (dayLog: DayLog) => {
    return dayLog.meals.reduce(
      (total, meal) => {
        const mealNutrition = getMealNutrition(meal);
        return {
          calories: total.calories + mealNutrition.calories,
          protein: total.protein + mealNutrition.protein,
          carbs: total.carbs + mealNutrition.carbs,
          fat: total.fat + mealNutrition.fat,
          fiber: total.fiber + mealNutrition.fiber
        };
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0 }
    );
  };

  // Add food to meal
  const addFood = () => {
    if (!newFood.name || !newFood.calories) {
      Alert.alert('Error', 'Please enter at least food name and calories');
      return;
    }

    const food: FoodItem = {
      id: Date.now().toString(),
      name: newFood.name,
      calories: parseInt(newFood.calories) || 0,
      protein: parseInt(newFood.protein) || 0,
      carbs: parseInt(newFood.carbs) || 0,
      fat: parseInt(newFood.fat) || 0,
      fiber: parseInt(newFood.fiber) || 0,
      imageUri: selectedImage || undefined, // Include image URI
    };

    const today = new Date().toISOString().split('T')[0];
    const updatedLogs = dayLogs.map(log => {
      if (log.date === today) {
        return {
          ...log,
          meals: log.meals.map(meal => 
            meal.type === selectedMealType
              ? { ...meal, foods: [...meal.foods, food] }
              : meal
          )
        };
      }
      return log;
    });

    // If today doesn't exist, create it
    const todayExists = dayLogs.some(log => log.date === today);
    if (!todayExists) {
      const newDayLog: DayLog = {
        date: today,
        meals: [
          { id: Date.now().toString() + '1', type: 'breakfast', foods: selectedMealType === 'breakfast' ? [food] : [] },
          { id: Date.now().toString() + '2', type: 'lunch', foods: selectedMealType === 'lunch' ? [food] : [] },
          { id: Date.now().toString() + '3', type: 'dinner', foods: selectedMealType === 'dinner' ? [food] : [] },
          { id: Date.now().toString() + '4', type: 'snack', foods: selectedMealType === 'snack' ? [food] : [] }
        ]
      };
      updatedLogs.unshift(newDayLog);
    }

    setDayLogs(updatedLogs);
    setNewFood({ name: '', calories: '', protein: '', carbs: '', fat: '', fiber: '' });
    setSelectedImage(null); // Reset image
    setShowAddFoodModal(false);
  };

  // Open add food modal
  const openAddFoodModal = (mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack') => {
    setSelectedMealType(mealType || getCurrentMealType());
    setShowAddFoodModal(true);
  };

  // Get meal icon
  const getMealIcon = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return '🌅';
      case 'lunch': return '☀️';
      case 'dinner': return '🌙';
      case 'snack': return '🍎';
      default: return '🍽️';
    }
  };

  // Render food item
  const renderFoodItem = (food: FoodItem) => (
    <View key={food.id} style={styles.foodItem}>
      <View style={styles.foodItemContent}>
        {food.imageUri && (
          <Image source={{ uri: food.imageUri }} style={styles.foodImage} />
        )}
        <View style={styles.foodDetails}>
          <Text style={styles.foodName}>{food.name}</Text>
          <View style={styles.foodNutrition}>
            <Text style={styles.nutritionText}>{food.calories} cal</Text>
            <Text style={styles.nutritionText}>P: {food.protein}g</Text>
            <Text style={styles.nutritionText}>C: {food.carbs}g</Text>
            <Text style={styles.nutritionText}>F: {food.fat}g</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Render meal card
  const renderMealCard = (meal: Meal, isToday: boolean = false) => {
    const nutrition = getMealNutrition(meal);
    
    return (
      <View key={meal.id} style={styles.mealCard}>
        <View style={styles.mealHeader}>
          <View style={styles.mealTitleContainer}>
            <Text style={styles.mealIcon}>{getMealIcon(meal.type)}</Text>
            <Text style={styles.mealTitle}>{meal.type.charAt(0).toUpperCase() + meal.type.slice(1)}</Text>
          </View>
          {isToday && (
            <TouchableOpacity
              style={styles.addFoodButton}
              onPress={() => openAddFoodModal(meal.type)}
            >
              <Text style={styles.addFoodButtonText}>+ Add</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {meal.foods.length > 0 ? (
          <>
            {meal.foods.map(renderFoodItem)}
            <View style={styles.mealSummary}>
              <Text style={styles.mealSummaryText}>
                Total: {nutrition.calories} cal • P: {nutrition.protein}g • C: {nutrition.carbs}g • F: {nutrition.fat}g
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.emptyMealText}>No foods logged</Text>
        )}
      </View>
    );
  };

  const todayLog = getTodayLog();
  const todayNutrition = getDayNutrition(todayLog);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Log</Text>
        <Text style={styles.headerSubtitle}>Track your nutrition journey</Text>
      </View>

      {/* Quick Add Button */}
      <TouchableOpacity style={styles.quickAddButton} onPress={() => openAddFoodModal()}>
        <LinearGradient
          colors={['#4ECDC4', '#44A08D']}
          style={styles.quickAddGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.quickAddIcon}>🥗</Text>
          <Text style={styles.quickAddText}>Quick Add Food</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Camera Button */}
      <TouchableOpacity style={styles.cameraButton} onPress={() => setShowCameraOptions(true)}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.cameraGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.cameraIcon}>📸</Text>
          <Text style={styles.cameraText}>Take Food Photo</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Today's Summary */}
      <View style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Today's Nutrition</Text>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{todayNutrition.calories}</Text>
            <Text style={styles.summaryLabel}>Calories</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{todayNutrition.protein}g</Text>
            <Text style={styles.summaryLabel}>Protein</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{todayNutrition.carbs}g</Text>
            <Text style={styles.summaryLabel}>Carbs</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNumber}>{todayNutrition.fat}g</Text>
            <Text style={styles.summaryLabel}>Fat</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Today's Meals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Today - {new Date().toLocaleDateString()}</Text>
          {todayLog.meals.map(meal => renderMealCard(meal, true))}
        </View>

        {/* Previous Days */}
        {dayLogs.map((dayLog) => {
          const isToday = dayLog.date === new Date().toISOString().split('T')[0];
          if (isToday) return null;
          
          const dayNutrition = getDayNutrition(dayLog);
          
          return (
            <View key={dayLog.date} style={styles.section}>
              <View style={styles.dayHeader}>
                <Text style={styles.sectionTitle}>
                  {new Date(dayLog.date).toLocaleDateString()}
                </Text>
                <Text style={styles.dayTotal}>
                  {dayNutrition.calories} cal total
                </Text>
              </View>
              {dayLog.meals.filter(meal => meal.foods.length > 0).map(meal => renderMealCard(meal))}
            </View>
          );
        })}

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Add Food Modal */}
      <Modal visible={showAddFoodModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Food to {selectedMealType}</Text>
            
            {/* Image Preview */}
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageButton} 
                  onPress={removeImage}
                >
                  <Text style={styles.removeImageText}>✕ Remove</Text>
                </TouchableOpacity>
              </View>
            )}
            
            <TextInput
              style={styles.modalInput}
              placeholder="Food name"
              value={newFood.name}
              onChangeText={(text) => setNewFood({ ...newFood, name: text })}
            />
            
            <View style={styles.nutritionInputRow}>
              <TextInput
                style={[styles.modalInput, styles.nutritionInput]}
                placeholder="Calories"
                value={newFood.calories}
                onChangeText={(text) => setNewFood({ ...newFood, calories: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, styles.nutritionInput]}
                placeholder="Protein (g)"
                value={newFood.protein}
                onChangeText={(text) => setNewFood({ ...newFood, protein: text })}
                keyboardType="numeric"
              />
            </View>
            
            <View style={styles.nutritionInputRow}>
              <TextInput
                style={[styles.modalInput, styles.nutritionInput]}
                placeholder="Carbs (g)"
                value={newFood.carbs}
                onChangeText={(text) => setNewFood({ ...newFood, carbs: text })}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, styles.nutritionInput]}
                placeholder="Fat (g)"
                value={newFood.fat}
                onChangeText={(text) => setNewFood({ ...newFood, fat: text })}
                keyboardType="numeric"
              />
            </View>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Fiber (g)"
              value={newFood.fiber}
              onChangeText={(text) => setNewFood({ ...newFood, fiber: text })}
              keyboardType="numeric"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowAddFoodModal(false);
                  setSelectedImage(null);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addFood}
              >
                <Text style={styles.confirmButtonText}>Add Food</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Camera Options Modal */}
      <Modal visible={showCameraOptions} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.cameraOptionsModal}>
            <Text style={styles.cameraOptionsTitle}>Add Food Photo</Text>
            
            <TouchableOpacity style={styles.cameraOption} onPress={takePhoto}>
              <Text style={styles.cameraOptionIcon}>📷</Text>
              <Text style={styles.cameraOptionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.cameraOption} onPress={pickFromGallery}>
              <Text style={styles.cameraOptionIcon}>📂</Text>
              <Text style={styles.cameraOptionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.cameraOptionCancel} 
              onPress={() => setShowCameraOptions(false)}
            >
              <Text style={styles.cameraOptionCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#7F8C8D',
    marginTop: 4,
  },
  quickAddButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  quickAddGradient: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  quickAddIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  quickAddText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  summaryCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
    textAlign: 'center',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4ECDC4',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dayTotal: {
    fontSize: 14,
    color: '#7F8C8D',
    fontWeight: '600',
  },
  mealCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mealIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  addFoodButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  addFoodButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  foodItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  foodName: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
    marginBottom: 4,
  },
  foodNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionText: {
    fontSize: 12,
    color: '#7F8C8D',
  },
  mealSummary: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  mealSummaryText: {
    fontSize: 14,
    color: '#2C3E50',
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyMealText: {
    fontSize: 14,
    color: '#BDC3C7',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 12,
  },
  bottomSpacing: {
    height: 100,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  nutritionInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  cancelButton: {
    backgroundColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#4ECDC4',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  // Camera styles
  cameraButton: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cameraGradient: {
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cameraIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  cameraText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Food item with image styles
  foodItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  foodImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  foodDetails: {
    flex: 1,
  },
  // Image preview styles
  imagePreviewContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
  },
  removeImageButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  removeImageText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  // Camera options modal styles
  cameraOptionsModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width - 80,
    alignItems: 'center',
  },
  cameraOptionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  cameraOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: '100%',
  },
  cameraOptionIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  cameraOptionText: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '600',
  },
  cameraOptionCancel: {
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  cameraOptionCancelText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Diet;