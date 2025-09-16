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
  Dimensions,
  SafeAreaView,
  AppState
} from 'react-native';
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { BasePageProps } from '@/types/user';
import AuthService from '@/services/auth';
import { apiService } from '@/services/api';

const { width } = Dimensions.get('window');

interface UserProfile {
  height_feet: number;
  height_inches: number;
  weight: number;
  activity_level: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  profile?: UserProfile;
}

interface Exercise {
  id: string;
  name: string;
  sets: Set[];
  pinnedNote?: string;
}

interface Set {
  id: string;
  reps: number;
  weight: number;
  isCompleted: boolean;
  previousWeight?: number;
  previousReps?: number;
}

interface Workout {
  id: string;
  name: string;
  startTime: Date;
  exercises: Exercise[];
  isActive: boolean;
  notes?: string;
}

interface BackendWorkout {
  id: number;
  name: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  notes: string;
  is_active: boolean;
  is_draft: boolean;
  exercises: any[];
}

const Workouts: React.FC<BasePageProps> = ({ isLoggedIn, userData }) => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<Workout | null>(null);
  const [workoutId, setWorkoutId] = useState<string | null>(null); 
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [workoutName, setWorkoutName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [displayedWorkouts, setDisplayedWorkouts] = useState<BackendWorkout[]>([]);
  const [workoutData, setWorkoutData] = useState<BackendWorkout[]>([]);

  useEffect(() => {
    const get_past_workouts = async () => {
      try{
        const response = await apiService.getWorkouts();
        const allWorkouts: BackendWorkout[] = response.data.workouts;
        setWorkoutData(allWorkouts);

        // Collect Last 10 Workouts
        const oldWorkouts: BackendWorkout[] = [];
        let i = 0;
        while (i < allWorkouts.length && oldWorkouts.length <= 10){
          oldWorkouts.push(allWorkouts[i]);
          i++;
        }
        setDisplayedWorkouts(oldWorkouts);
        
      }
      catch (error){
        console.error("Error fetching workout data:", error)
      }
      finally{
        setIsLoading(false);
      }
    }
    get_past_workouts();
    
  }, [])

  useEffect(() => {
    console.log("Displayed Workouts: ", displayedWorkouts)
  }, [displayedWorkouts])

  // Auto-save every 30 seconds when there's an active workout
  useEffect(() => {
    if (!activeWorkout || !workoutId) return;

    const autoSaveInterval = setInterval(() => {
      saveWorkoutProgress();
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [activeWorkout, workoutId]);

  // Save workout progress to backend
  const saveWorkoutProgress = async () => {
    if (!activeWorkout || !workoutId || isSaving) return;

    setIsSaving(true);
    try {
      const workoutData = {
        exercises: activeWorkout.exercises.map(exercise => ({
          name: exercise.name,
          pinnedNote: exercise.pinnedNote,
          order: activeWorkout.exercises.indexOf(exercise),
          sets: exercise.sets.map(set => ({
            reps: set.reps,
            weight: set.weight,
            isCompleted: set.isCompleted,
            previousWeight: set.previousWeight,
            previousReps: set.previousReps,
            order: exercise.sets.indexOf(set)
          }))
        })),
        notes: activeWorkout.notes
      };

      const response = await apiService.updateWorkoutProgress(workoutId, workoutData);

      if (response.data.status) {
        setLastSaved(new Date());
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Common exercises list
  const commonExercises = [
    'Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Bench Press',
    'Shoulder Press', 'Bicep Curls', 'Tricep Dips', 'Lunges', 'Plank',
    'Burpees', 'Mountain Climbers', 'Jumping Jacks', 'Crunches', 'Rows'
  ];

  // Get time of day for default workout name
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 17) return 'Afternoon';
    if (hour < 21) return 'Evening';
    return 'Night';
  };

  // Start new workout
  const startNewWorkout = () => {
    setWorkoutName(`${getTimeOfDay()} Routine`);
    setShowNameModal(true);
  };

  // Modified confirm new workout to create draft
  const confirmNewWorkout = async () => {
    const newWorkout: Workout = {
      id: Date.now().toString(),
      name: workoutName || `${getTimeOfDay()} Routine`,
      startTime: new Date(),
      exercises: [],
      isActive: true,
      notes: 'Example routine for testing'
    };

    // Create draft workout in backend
    try {
      const response = await apiService.createWorkout({
        name: newWorkout.name,
        notes: newWorkout.notes,
        exercises: [],
        is_draft: true
      });

      if (response.data.status === 'success') {
        setWorkoutId(response.data.workout_id);
        setActiveWorkout(newWorkout);
      } else {
        throw new Error(response.data.message || 'Failed to create workout');
      }
    } catch (error) {
      console.error('Failed to create draft workout:', error);
      
      // Show user-friendly error message
      Alert.alert(
        'Connection Error',
        'Unable to save workout to server. You can continue working out, but progress may not be saved.',
        [{ text: 'Continue Anyway', onPress: () => {
          // Fallback to local storage
          setActiveWorkout(newWorkout);
        }}]
      );
      return;
    }

    setShowNameModal(false);
    setWorkoutName('');
  };

  // Save on app state changes (when user backgrounds the app)
  useEffect(() => {
    if (!activeWorkout || !workoutId) return;

    const handleAppStateChange = (nextAppState: string) => {
      console.log('App State Changed to:', nextAppState);
      
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        console.log('Saving workout progress due to app state change...');
        saveWorkoutProgress();
      }
    };

    // Subscribe to app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Cleanup function
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [activeWorkout, workoutId]);

  // Add exercise to workout
  const addExercise = (exerciseName: string) => {
    if (!activeWorkout) return;
    
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: exerciseName,
      sets: [
        { id: '1', reps: 5, weight: 0, isCompleted: false }
      ]
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
    
    const exercise = activeWorkout.exercises.find(e => e.id === exerciseId);
    if (!exercise) return;
    
    const newSet: Set = {
      id: Date.now().toString(),
      reps: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].reps : 5,
      weight: exercise.sets.length > 0 ? exercise.sets[exercise.sets.length - 1].weight : 0,
      isCompleted: false
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

  // Toggle set completion
  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    if (!activeWorkout) return;
    
    setActiveWorkout({
      ...activeWorkout,
      exercises: activeWorkout.exercises.map(exercise =>
        exercise.id === exerciseId
          ? {
              ...exercise,
              sets: exercise.sets.map(set =>
                set.id === setId ? { ...set, isCompleted: !set.isCompleted } : set
              )
            }
          : exercise
      )
    });
  };

  // Modified finish workout to mark as completed
  const finishWorkout = async () => {
    if (!activeWorkout) return;
    
    Alert.alert(
      'Finish Workout',
      'Are you sure you want to finish this workout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Finish',
          onPress: async () => {
            // Save final state and mark as completed
            if (workoutId) {
              try {
                const response = await apiService.completeWorkout(workoutId);
                console.log('Workout completed:', response.data);
              } catch (error) {
                console.error('Failed to complete workout:', error);
              }
            }

            const finishedWorkout = { ...activeWorkout, isActive: false };
            setWorkouts([finishedWorkout, ...workouts]);
            setActiveWorkout(null);
            setWorkoutId(null);
          }
        }
      ]
    );
  };

  // Show save status in UI
  const renderSaveStatus = () => (
    <View style={styles.saveStatusContainer}>
      {isSaving ? (
        <Text style={styles.savingText}>Saving...</Text>
      ) : lastSaved ? (
        <Text style={styles.savedText}>
          Saved {lastSaved.toLocaleTimeString()}
        </Text>
      ) : null}
    </View>
  );

  // Cancel workout
  const cancelWorkout = () => {
    Alert.alert(
      'Cancel Workout',
      'Are you sure you want to cancel this workout? All progress will be lost.',
      [
        { text: 'Keep Working Out', style: 'cancel' },
        {
          text: 'Cancel Workout',
          style: 'destructive',
          onPress: () => {
            setActiveWorkout(null);
          }
        }
      ]
    );
  };

  // Render active workout
  const renderActiveWorkout = () => (
    <SafeAreaView style={styles.activeWorkoutContainer}>
      {/* Workout Header */}
      <View style={styles.workoutHeader}>
        <View style={styles.workoutTitleRow}>
          <Text style={styles.workoutTitle}>{activeWorkout?.name}</Text>
          <TouchableOpacity style={styles.moreOptionsButton}>
            <Feather name="more-horizontal" size={18} color="#666" />
          </TouchableOpacity>
        </View>
        <Text style={styles.workoutNotes}>{activeWorkout?.notes}</Text>
      </View>

      {renderSaveStatus()}

      <ScrollView style={styles.exercisesList}>
        {activeWorkout?.exercises.map((exercise) => (
          <View key={exercise.id} style={styles.exerciseCard}>
            {/* Exercise Header */}
            <View style={styles.exerciseHeader}>
              <Text style={styles.exerciseName}>{exercise.name}</Text>
              <View style={styles.exerciseActions}>
                <TouchableOpacity style={styles.exerciseActionButton}>
                  <Ionicons name="add-circle-outline" size={18} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.exerciseActionButton}>
                  <Feather name="more-horizontal" size={18} color="#666" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Pinned Note */}
            {exercise.pinnedNote && (
              <View style={styles.pinnedNoteContainer}>
                <Text style={styles.pinnedNoteText}>{exercise.pinnedNote}</Text>
                <TouchableOpacity style={styles.pinButton}>
                  <Ionicons name="pin" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}

            {/* Sets Table */}
            <View style={styles.setsTable}>
              {/* Table Header */}
              <View style={styles.tableHeader}>
                <Text style={styles.tableHeaderCell}>Set</Text>
                <Text style={styles.tableHeaderCell}>Previous</Text>
                <Text style={styles.tableHeaderCell}>lbs</Text>
                <Text style={styles.tableHeaderCell}>Reps</Text>
                <Text style={styles.tableHeaderCell}></Text>
              </View>

              {/* Sets Rows */}
              {exercise.sets.map((set, index) => (
                <View 
                  key={set.id} 
                  style={[
                    styles.setRow,
                    set.isCompleted && styles.completedSetRow
                  ]}
                >
                  <Text style={styles.setNumber}>{index + 1}</Text>
                  <Text style={styles.previousData}>
                    {set.previousWeight && set.previousReps 
                      ? `${set.previousWeight} lbs × ${set.previousReps}`
                      : '—'
                    }
                  </Text>
                  <TextInput
                    style={styles.weightInput}
                    value={set.weight.toString()}
                    onChangeText={(text) => updateSet(exercise.id, set.id, 'weight', parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                  <TextInput
                    style={styles.repsInput}
                    value={set.reps.toString()}
                    onChangeText={(text) => updateSet(exercise.id, set.id, 'reps', parseInt(text) || 0)}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#999"
                  />
                  <TouchableOpacity
                    style={[
                      styles.completionButton,
                      set.isCompleted && styles.completedButton
                    ]}
                    onPress={() => toggleSetCompletion(exercise.id, set.id)}
                  >
                    {set.isCompleted ? (
                      <Ionicons name="checkmark" size={18} color="white" />
                    ) : (
                      <View style={styles.emptyCheck} />
                    )}
                  </TouchableOpacity>
                </View>
              ))}
            </View>
            
            {/* Individual Add Set Button for this exercise */}
            <TouchableOpacity
              style={styles.individualAddSetButton}
              onPress={() => addSet(exercise.id)}
            >
              <Ionicons name="add" size={16} color="#333" />
              <Text style={styles.individualAddSetButtonText}>Add Set</Text>
            </TouchableOpacity>
          </View>
        ))}
        
        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => setShowExerciseModal(true)}
          >
            <Ionicons name="add-circle-outline" size={20} color="#333" />
            <Text style={styles.addExerciseButtonText}>Add Exercises</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.cancelWorkoutButton}
            onPress={cancelWorkout}
          >
            <Ionicons name="close-circle-outline" size={20} color="#666" />
            <Text style={styles.cancelWorkoutButtonText}>Cancel Workout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Bottom Fixed Finish Button */}
      <View style={styles.bottomFinishContainer}>
        <TouchableOpacity 
          style={styles.finishWorkoutButton}
          onPress={finishWorkout}
        >
          <MaterialIcons name="check" size={20} color="white" />
          <Text style={styles.finishWorkoutButtonText}>Finish Workout</Text>
        </TouchableOpacity>
      </View>

      {/* Exercise Selection Modal */}
      <Modal visible={showExerciseModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.exerciseModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Exercise</Text>
              <TouchableOpacity
                style={styles.closeModalIconButton}
                onPress={() => setShowExerciseModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={commonExercises}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.exerciseOption}
                  onPress={() => addExercise(item)}
                >
                  <Text style={styles.exerciseOptionText}>{item}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#999" />
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );

  // Render workout history
  const renderWorkoutHistory = () => (
    <View style={styles.historyContainer}>
      <Text style={styles.sectionTitle}>Recent Workouts</Text>
      {displayedWorkouts.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialIcons name="fitness-center" size={48} color="#E0E0E0" />
          <Text style={styles.emptyStateText}>No workouts yet</Text>
          <Text style={styles.emptyStateSubtext}>Start your first workout to see it here</Text>
        </View>
      ) : (
        displayedWorkouts.map((workout) => (
          <View key={workout.id} style={styles.historyCard}>
            <View style={styles.historyCardHeader}>
              <Text style={styles.historyWorkoutName}>{workout.name}</Text>
              <MaterialIcons name="fitness-center" size={20} color="#999" />
            </View>
            <Text style={styles.historyDate}>
              {new Date(workout.start_time).toLocaleTimeString()} • {workout.exercises.length} exercises
            </Text>
          </View>
        ))
      )}
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
        <View style={styles.newWorkoutContent}>
          <MaterialIcons name="fitness-center" size={24} color="white" />
          <Text style={styles.newWorkoutText}>Start New Workout</Text>
        </View>
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
              placeholder={`${getTimeOfDay()} Routine`}
              placeholderTextColor="#999"
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666666',
    marginTop: 4,
  },
  newWorkoutButton: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  newWorkoutContent: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  newWorkoutText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 12,
  },
  historyContainer: {
    paddingHorizontal: 20,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 8,
  },
  historyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  historyWorkoutName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  historyDate: {
    fontSize: 14,
    color: '#666666',
  },
  // Active Workout Styles
  activeWorkoutContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  topActionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  finishButtonTop: {
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  finishButtonTextTop: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  workoutHeader: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  workoutTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  workoutTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  moreOptionsButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  workoutNotes: {
    fontSize: 14,
    color: '#666666',
  },
  exercisesList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  exerciseActions: {
    flexDirection: 'row',
  },
  exerciseActionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pinnedNoteContainer: {
    backgroundColor: '#F8F8F8',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pinnedNoteText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  pinButton: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  setsTable: {
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 8,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  completedSetRow: {
    backgroundColor: '#F8F8F8',
  },
  setNumber: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#666666',
    textAlign: 'center',
  },
  previousData: {
    flex: 1,
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
  },
  weightInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  repsInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: 4,
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    color: '#000000',
  },
  completionButton: {
    flex: 1,
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  completedButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  emptyCheck: {
    width: 18,
    height: 18,
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#CCCCCC',
  },
  actionButtonsContainer: {
    marginBottom: 100,
  },
  addExerciseButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addExerciseButtonText: {
    color: '#333333',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  individualAddSetButton: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginTop: 12,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  individualAddSetButtonText: {
    color: '#333333',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  cancelWorkoutButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cancelWorkoutButtonText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
  },
  closeModalIconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
    color: '#000000',
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmButton: {
    backgroundColor: '#000000',
  },
  cancelButtonText: {
    color: '#666666',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exerciseOptionText: {
    fontSize: 16,
    color: '#000000',
  },
  bottomFinishContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  finishWorkoutButton: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  finishWorkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  saveStatusContainer: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    backgroundColor: '#F8F8F8',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  savingText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  savedText: {
    fontSize: 12,
    color: '#28A745',
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default Workouts;