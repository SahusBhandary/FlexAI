import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  FlatList,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
}

interface Set {
  id: string;
  reps: number;
  weight: number;
}

interface Workout {
  id: string;
  name: string;
  startTime: Date;
  exercises: Exercise[];
  isActive: boolean;
}

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [timer, setTimer] = useState(0);

  // Common exercises list
  const commonExercises = [
    'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press',
    'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Lunges', 'Plank',
    'Burpees', 'Mountain Climbers', 'Jumping Jacks', 'Crunches', 'Rows'
  ];

  // Timer effect
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (activeWorkout) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeWorkout]);

  // Get time of day for default workout name
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start new workout
  const startNewWorkout = () => {
    setWorkoutName(`${getTimeOfDay()} Workout`);
    setShowNameModal(true);
  };

  // Confirm workout creation
  const confirmNewWorkout = () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName || `${getTimeOfDay()} Workout`,
      startTime: new Date(),
      exercises: [],
      isActive: true
    };
    setActiveWorkout(newWorkout);
    setTimer(0);
    setShowNameModal(false);
    setWorkoutName('');
  };

  // Add exercise to workout
  const addExercise = (exerciseName: string) => {
    if (!activeWorkout) return;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: []
    };
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: [...activeWorkout.exercises, newExercise]
    });
    setShowExerciseModal(false);
  };

  // Add set to exercise
  const addSet = (exerciseId: string) => {
    if (!activeWorkout) return;
    
    const newSet: Set = {
      id: Date.now().toString(),
      reps: 0,
      weight: 0
    };
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? { ...exercise, sets: [...exercise.sets, newSet] }
          : exercise
      )
    });
  };

  // Update set data
  const updateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight', value: number) => {
    if (!activeWorkout) return;
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, [field]: value } : set
              )
            }
          : exercise
      )
    });
  };

  // Finish workout
  const finishWorkout = () => {
    if (!activeWorkout) return;
    
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: () => {
            const finishedWorkout = { ...activeWorkout, isActive: false };
            setWorkouts([finishedWorkout, ...workouts]);
            setActiveWorkout(null);
            setTimer(0);
          }
        }
      ]
    );
  };

  // Render active workout
  const renderActiveWorkout = () => (
    <View style={styles.activeWorkoutContainer}>
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.workoutHeader}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.workoutTitle}>{activeWorkout?.name}</Text>
        <Text style={styles.workoutTimer}>{formatTime(timer)}</Text>
      </LinearGradient>

      <ScrollView style={styles.exercisesList}>
        {activeWorkout?.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            
            {exercise.sets.map((set, index) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={styles.setNumber}>{index + 1}</Text>
                <TextInput
                  style={styles.setInput}
                  placeholder="Reps"
                  value={set.reps.toString()}
                  onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={styles.setInput}
                  placeholder="Weight"
                  value={set.weight.toString()}
                  onChangeText={(text) => updateSet(exercise.id, set.id, 'weight', parseInt(text) || 0)}
                  keyboardType="numeric"
                />
              </View>
            ))}
            
            <TouchableOpacity
              style={styles.addSetButton}
              onPress={() => addSet(exercise.id)}
            >
              <Text style={styles.addSetText}>+ Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => {
            console.log('Add Exercise button pressed');
            setShowExerciseModal(true);
            }}
        >
          <Text style={styles.addExerciseText}>+ Add Exercise</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.finishButton} onPress={finishWorkout}>
          <Text style={styles.finishButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal visible={showExerciseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
            <View style={styles.exerciseModalContent}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <FlatList
                data={commonExercises}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <TouchableOpacity
                    style={styles.exerciseOption}
                    onPress={() => {
                    console.log('Exercise selected:', item);
                    addExercise(item);
                    }}
                >
                    <Text style={styles.exerciseOptionText}>{item}</Text>
                </TouchableOpacity>
                )}
            />
            <TouchableOpacity
                style={styles.closeModalButton}
                onPress={() => setShowExerciseModal(false)}
            >
                <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </View>
  );

  // Render workout history
  const renderWorkoutHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      {workouts.map((workout) => (
        <View key={workout.id} style={styles.historyCard}>
          <Text style={styles.historyWorkoutName}>{workout.name}</Text>
          <Text style={styles.historyDate}>
            {workout.startTime.toLocaleDateString()} • {workout.exercises.length} exercises
          </Text>
        </View>
      ))}
    </View>
  );

  if (activeWorkout) {
    return renderActiveWorkout();
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Workouts</Text>
        <Text style={styles.headerSubtitle}>Track your fitness journey</Text>
      </View>

      {/* New Workout Button */}
      <TouchableOpacity style={styles.newWorkoutButton} onPress={startNewWorkout}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8E8E']}
          style={styles.newWorkoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Text style={styles.newWorkoutIcon}>💪</Text>
          <Text style={styles.newWorkoutText}>Start New Workout</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Workout History */}
      {renderWorkoutHistory()}

      {/* Workout Name Modal */}
      <Modal visible={showNameModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Name Your Workout</Text>
            <TextInput
              style={styles.modalInput}
              value={workoutName}
              onChangeText={setWorkoutName}
              placeholder={`${getTimeOfDay()} Workout`}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowNameModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={confirmNewWorkout}
              >
                <Text style={styles.confirmButtonText}>Start</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Selection Modal */}
      <Modal visible={showExerciseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.exerciseModalContent}>
            <Text style={styles.modalTitle}>Select Exercise</Text>
            <FlatList
              data={commonExercises}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseOption}
                  onPress={() => addExercise(item)}
                >
                  <Text style={styles.exerciseOptionText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={styles.closeModalButton}
              onPress={() => setShowExerciseModal(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
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
  newWorkoutButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
  },
  newWorkoutGradient: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newWorkoutIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  newWorkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  historyContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 16,
  },
  historyCard: {
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
  historyWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
  },
  historyDate: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  activeWorkoutContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  workoutHeader: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  workoutTimer: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  exerciseCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  setNumber: {
    width: 30,
    fontSize: 16,
    fontWeight: '600',
    color: '#7F8C8D',
  },
  setInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    textAlign: 'center',
  },
  addSetButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  addSetText: {
    color: '#1976D2',
    fontWeight: '600',
  },
  addExerciseButton: {
    backgroundColor: '#4ECDC4',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  addExerciseText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  finishButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 100,
  },
  finishButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
  },
  exerciseModalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: width - 40,
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  exerciseOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  exerciseOptionText: {
    fontSize: 16,
    color: '#2C3E50',
  },
  closeModalButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  closeModalText: {
    color: '#666',
    fontWeight: '600',
  },
});

export default Workouts;