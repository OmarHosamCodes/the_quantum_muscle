-- Demo Data for Testing Add Exercise Feature
-- Run these SQL commands in your Supabase SQL Editor to create test data

-- 1. Create a sample workout (if you don't have one)
INSERT INTO workouts (id, name, creator_id, created_at) 
VALUES (
  'demo-workout-123', 
  'Demo Workout for Testing', 
  'your-user-id-here',  -- Replace with actual user ID
  NOW()
);

-- 2. Add a sample exercise to test the UI
INSERT INTO exercises (id, name, target_muscle, workout_id, created_at)
VALUES (
  'demo-exercise-123',
  'Push-ups',
  'Chest',
  'demo-workout-123',
  NOW()
);

-- 3. Add some sample sets to test the sets display
INSERT INTO exercise_sets (exercise_id, set_index, reps, weight_kg)
VALUES 
  ('demo-exercise-123', 0, 10, 0),
  ('demo-exercise-123', 1, 8, 0),
  ('demo-exercise-123', 2, 6, 0);

-- To test the feature:
-- 1. Navigate to /workout/demo-workout-123 in your app
-- 2. You should see the existing Push-ups exercise
-- 3. Click "Add Exercise" button to test the create exercise flow
-- 4. Try adding exercises with different muscle groups
-- 5. Test the delete functionality on existing exercises

-- Clean up test data (run this after testing)
-- DELETE FROM exercise_sets WHERE exercise_id = 'demo-exercise-123';
-- DELETE FROM exercises WHERE workout_id = 'demo-workout-123';
-- DELETE FROM workouts WHERE id = 'demo-workout-123';
