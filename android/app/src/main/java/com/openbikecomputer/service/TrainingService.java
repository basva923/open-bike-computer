package com.openbikecomputer.service;

import com.openbikecomputer.fit.FitDecoder;
import com.openbikecomputer.model.Metric;
import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.model.Workout;
import com.openbikecomputer.model.Workout.DurationType;
import com.openbikecomputer.model.Workout.TargetType;
import com.openbikecomputer.model.Workout.WorkoutStep;

import java.io.IOException;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

/**
 * Loads structured workouts (FIT) and drives step progression.
 * Ported from {@code training.service.ts}.
 */
public class TrainingService {

    private static final long CHECK_INTERVAL_MS = 1000;

    /** Listener notified when a workout is loaded. */
    public interface OnNewWorkout {
        void onNewWorkout(Workout workout);
    }

    /** Listener notified when a step completes automatically (e.g. to play a sound). */
    public interface OnStepCompleted {
        void onStepCompleted();
    }

    private Workout workout = null;
    private final CopyOnWriteArrayList<OnNewWorkout> newWorkoutListeners = new CopyOnWriteArrayList<>();
    private final CopyOnWriteArrayList<OnStepCompleted> stepCompletedListeners = new CopyOnWriteArrayList<>();

    private int currentStepIndex = -1;
    private long currentStepStartTime = 0;
    private double currentStepStartDistance = 0;

    private ScheduledExecutorService scheduler;
    private ScheduledFuture<?> checkTask;

    private final MetricService metricService;

    public TrainingService(MetricService metricService) {
        this.metricService = metricService;
    }

    public void loadFitFile(byte[] fileContent, double powerThreshold, double heartRateThreshold) {
        stopWorkout();
        try {
            this.workout = FitDecoder.decodeWorkout(fileContent, powerThreshold, heartRateThreshold);
        } catch (IOException e) {
            throw new RuntimeException("Failed to read FIT file", e);
        }
        for (OnNewWorkout listener : newWorkoutListeners) {
            listener.onNewWorkout(this.workout);
        }
    }

    public void addNewWorkoutListener(OnNewWorkout listener) {
        newWorkoutListeners.add(listener);
    }

    public void removeNewWorkoutListener(OnNewWorkout listener) {
        newWorkoutListeners.remove(listener);
    }

    public void addStepCompletedListener(OnStepCompleted listener) {
        stepCompletedListeners.add(listener);
    }

    public void removeStepCompletedListener(OnStepCompleted listener) {
        stepCompletedListeners.remove(listener);
    }

    public Workout getCurrentWorkout() {
        return workout;
    }

    public boolean isRunning() {
        return currentStepIndex != -1 && workout != null;
    }

    public void startWorkout() {
        if (workout == null) {
            throw new IllegalStateException("No workout loaded");
        }
        if (currentStepIndex != -1) {
            throw new IllegalStateException("Workout already started");
        }
        startCheckInterval();
        moveToNextStep();
    }

    public void stopWorkout() {
        stopCheckInterval();
        workout = null;
        currentStepIndex = -1;
        currentStepStartTime = 0;
        currentStepStartDistance = 0;
    }

    private void startCheckInterval() {
        if (checkTask != null) {
            return;
        }
        scheduler = Executors.newSingleThreadScheduledExecutor(r -> {
            Thread t = new Thread(r, "training-check");
            t.setDaemon(true);
            return t;
        });
        checkTask = scheduler.scheduleAtFixedRate(this::checkWorkoutUpdate,
                CHECK_INTERVAL_MS, CHECK_INTERVAL_MS, TimeUnit.MILLISECONDS);
    }

    private void stopCheckInterval() {
        if (checkTask != null) {
            checkTask.cancel(false);
            checkTask = null;
        }
        if (scheduler != null) {
            scheduler.shutdownNow();
            scheduler = null;
        }
    }

    protected void checkWorkoutUpdate() {
        if (workout == null || currentStepIndex < 0) {
            return;
        }
        WorkoutStep currentStep = getCurrentStep();
        if (currentStep == null) {
            return;
        }
        Double remainingTime = getRemainingTime();
        if (remainingTime != null && remainingTime <= 0) {
            moveToNextStep();
            notifyStepCompleted();
            return;
        }
        Double remainingDistance = getRemainingDistance();
        if (remainingDistance != null && remainingDistance <= 0) {
            moveToNextStep();
            notifyStepCompleted();
        }
    }

    private void notifyStepCompleted() {
        for (OnStepCompleted listener : stepCompletedListeners) {
            listener.onStepCompleted();
        }
    }

    public void moveToNextStep() {
        if (workout == null) {
            throw new IllegalStateException("No workout loaded");
        }
        currentStepIndex++;
        currentStepStartTime = System.currentTimeMillis();
        currentStepStartDistance = lastDistance();
        metricService.newLap();
    }

    public void moveToPreviousStep() {
        if (workout == null || currentStepIndex <= 0) {
            throw new IllegalStateException("No previous step available");
        }
        currentStepIndex--;
        currentStepStartTime = System.currentTimeMillis();
        currentStepStartDistance = lastDistance();
        metricService.newLap();
    }

    public WorkoutStep getCurrentStep() {
        if (workout == null || currentStepIndex >= workout.steps.size() || currentStepIndex < 0) {
            return null;
        }
        return workout.steps.get(currentStepIndex);
    }

    public WorkoutStep getNextStep() {
        if (workout == null || currentStepIndex + 1 >= workout.steps.size()) {
            return null;
        }
        return workout.steps.get(currentStepIndex + 1);
    }

    public Double getRemainingTime() {
        if (workout == null || currentStepIndex < 0) {
            return null;
        }
        WorkoutStep currentStep = getCurrentStep();
        if (currentStep == null || currentStep.durationType != DurationType.TIME) {
            return null;
        }
        double elapsedTime = (System.currentTimeMillis() - currentStepStartTime) / 1000.0;
        return currentStep.durationValue - elapsedTime;
    }

    public Double getRemainingDistance() {
        if (workout == null || currentStepIndex < 0) {
            return null;
        }
        WorkoutStep currentStep = getCurrentStep();
        if (currentStep == null || currentStep.durationType != DurationType.DISTANCE) {
            return null;
        }
        double currentDistance = lastDistance();
        return currentStep.durationValue - (currentDistance - currentStepStartDistance);
    }

    public Metric getTargetMetric() {
        WorkoutStep currentStep = getCurrentStep();
        if (currentStep == null) {
            return null;
        }
        switch (currentStep.targetType) {
            case POWER:
                return metricService.getByMetricType(MetricType.POWER);
            case HEART_RATE:
                return metricService.getByMetricType(MetricType.HEART_RATE);
            case SPEED:
                return metricService.getByMetricType(MetricType.SPEED);
            case CADENCE:
                return metricService.getByMetricType(MetricType.CADENCE);
            default:
                return null;
        }
    }

    public boolean hasTraining() {
        return workout != null;
    }

    public String getTrainingName() {
        return workout != null ? workout.name : "";
    }

    private double lastDistance() {
        Double v = metricService.getByMetricType(MetricType.DISTANCE).getLastValue();
        return v != null ? v : 0.0;
    }
}
