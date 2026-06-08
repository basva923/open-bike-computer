package com.openbikecomputer.ui;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.openbikecomputer.model.Metric;
import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.model.Workout;
import com.openbikecomputer.service.ServiceFactory;
import com.openbikecomputer.service.TrainingService;

import java.util.Locale;

public class WorkoutView extends LinearLayout {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refreshRunnable = new Runnable() {
        @Override public void run() { refresh(); handler.postDelayed(this, 1000); }
    };
    private TextView hr;
    private TextView power;
    private TextView stepName;
    private TextView lowRemainingHigh;
    private TextView nextStep;
    private final ZoneBar[] bars = new ZoneBar[3];

    public WorkoutView(Context context) {
        super(context);
        setOrientation(VERTICAL);
        setPadding(14, 14, 14, 14);
        build();
        refresh();
    }

    @Override protected void onAttachedToWindow() { super.onAttachedToWindow(); handler.post(refreshRunnable); }
    @Override protected void onDetachedFromWindow() { handler.removeCallbacks(refreshRunnable); super.onDetachedFromWindow(); }

    private void build() {
        LinearLayout top = new LinearLayout(getContext());
        top.setOrientation(HORIZONTAL);
        top.setGravity(Gravity.CENTER_VERTICAL);

        hr = bigText();
        power = bigText();
        LinearLayout center = new LinearLayout(getContext());
        center.setOrientation(VERTICAL);
        stepName = bigText();
        stepName.setGravity(Gravity.CENTER);
        lowRemainingHigh = new TextView(getContext());
        lowRemainingHigh.setGravity(Gravity.CENTER);
        lowRemainingHigh.setTextSize(16);
        center.addView(stepName);
        center.addView(lowRemainingHigh);
        top.addView(labelBox(hr, "♥"), new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        top.addView(center, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 3));
        top.addView(labelBox(power, "⚡"), new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        addView(top);

        nextStep = new TextView(getContext());
        nextStep.setTextSize(16);
        nextStep.setPadding(0, 8, 0, 8);
        addView(nextStep);

        for (int i = 0; i < bars.length; i++) {
            bars[i] = new ZoneBar(getContext(), i);
            addView(bars[i], new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 46));
        }

        LinearLayout actions = new LinearLayout(getContext());
        actions.setGravity(Gravity.CENTER);
        Button prev = button("Previous Step");
        prev.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().moveToPreviousStep()));
        Button next = button("Next Step");
        next.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().moveToNextStep()));
        actions.addView(prev);
        actions.addView(next);
        addView(actions);
    }

    private LinearLayout labelBox(TextView value, String icon) {
        LinearLayout box = new LinearLayout(getContext());
        box.setOrientation(VERTICAL);
        box.setGravity(Gravity.CENTER);
        TextView symbol = new TextView(getContext());
        symbol.setText(icon);
        symbol.setTextSize(24);
        symbol.setGravity(Gravity.CENTER);
        box.addView(value);
        box.addView(symbol);
        return box;
    }

    private TextView bigText() {
        TextView tv = new TextView(getContext());
        tv.setTextSize(22);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setGravity(Gravity.CENTER);
        return tv;
    }

    private Button button(String text) {
        Button b = new Button(getContext());
        b.setText(text);
        b.setAllCaps(false);
        return b;
    }

    private void refresh() {
        TrainingService training = ServiceFactory.getTrainingService();
        Workout.WorkoutStep current = training.getCurrentStep();
        hr.setText(lastRaw(MetricType.HEART_RATE));
        power.setText(lastRaw(MetricType.POWER));
        stepName.setText(current != null && current.name != null && !current.name.isEmpty() ? current.name : "---");
        lowRemainingHigh.setText((current != null ? current.displayTargetLow() : "---") + "     "
                + remainingString() + "     " + (current != null ? current.displayTargetHigh() : "---"));
        Workout.WorkoutStep next = training.getNextStep();
        if (next != null) {
            nextStep.setText("Next Step:\n" + next.displayDuration() + " @ " + next.displayTargetLow() + " - " + next.displayTargetHigh());
        } else {
            nextStep.setText("Next Step:\nNo next step");
        }
        for (ZoneBar bar : bars) bar.invalidate();
    }

    private String lastRaw(MetricType type) {
        Double v = ServiceFactory.getMetricService().getByMetricType(type).getLastValue();
        return v != null && v > 0 ? String.format(Locale.US, "%.0f", v) : "---";
    }

    private String remainingString() {
        TrainingService training = ServiceFactory.getTrainingService();
        Double remainingTime = training.getRemainingTime();
        if (remainingTime != null) {
            int total = (int) Math.floor(Math.max(0, remainingTime));
            return (total / 60) + ":" + (total % 60 < 10 ? "0" : "") + (total % 60);
        }
        Double remainingDistance = training.getRemainingDistance();
        if (remainingDistance != null) {
            return String.format(Locale.US, "%.2fkm", remainingDistance / 1000.0);
        }
        return "---";
    }

    private double getProgressBarValue(int row, int column) {
        TrainingService training = ServiceFactory.getTrainingService();
        Workout.WorkoutStep current = training.getCurrentStep();
        Metric targetMetric = training.getTargetMetric();
        if (training.getCurrentWorkout() == null || current == null || targetMetric == null) return 0;
        double targetLow = current.targetLow != null ? current.targetLow : 0;
        double targetHigh = current.targetHigh != null ? current.targetHigh : 0;
        double lowest = targetLow * 0.75;
        double highest = targetHigh * 1.25;
        double value = rowValue(row, targetMetric);
        if (column == 0) {
            return value < targetLow ? Math.max(0, ratio(value - lowest, targetLow - lowest) * 100) : 100;
        } else if (column == 1) {
            if (value < targetLow) return 0;
            if (value > targetHigh) return 100;
            return ratio(value - targetLow, targetHigh - targetLow) * 100;
        } else if (column == 2) {
            return value > targetHigh ? Math.min(100, ratio(value - targetHigh, highest - targetHigh) * 100) : 0;
        }
        return 0;
    }

    private double ratio(double numerator, double denominator) {
        return denominator == 0 ? 0 : numerator / denominator;
    }

    private double rowValue(int row, Metric metric) {
        Double value;
        if (row == 0) value = metric.get3sAverage();
        else if (row == 1) value = metric.get30sAverage();
        else value = metric.getAverageForLap(null);
        return value != null ? value : 0;
    }

    private String getProgressBarDisplayValue(int row) {
        TrainingService training = ServiceFactory.getTrainingService();
        Workout.WorkoutStep current = training.getCurrentStep();
        Metric targetMetric = training.getTargetMetric();
        if (training.getCurrentWorkout() == null || current == null || targetMetric == null) return "---";
        if (row == 0) return targetMetric.display3sAverage() + "(3s)";
        if (row == 1) return targetMetric.display30sAverage() + "(30s)";
        return targetMetric.displayAverageForLap() + "(Lap)";
    }

    private int getProgressBarIndicatorColor(int row) {
        TrainingService training = ServiceFactory.getTrainingService();
        Workout.WorkoutStep current = training.getCurrentStep();
        Metric targetMetric = training.getTargetMetric();
        if (training.getCurrentWorkout() == null || current == null || targetMetric == null) return Color.rgb(61, 143, 94);
        double targetLow = current.targetLow != null ? current.targetLow : 0;
        double targetHigh = current.targetHigh != null ? current.targetHigh : 0;
        double value = rowValue(row, targetMetric);
        if (value < targetLow || value > targetHigh) return Color.rgb(245, 183, 0);
        return Color.rgb(61, 143, 94);
    }

    private void call(Action action) {
        try { action.run(); refresh(); }
        catch (Exception e) { Toast.makeText(getContext(), e.getMessage(), Toast.LENGTH_LONG).show(); }
    }
    private interface Action { void run(); }

    private class ZoneBar extends View {
        private final int row;
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        ZoneBar(Context context, int row) { super(context); this.row = row; }
        @Override protected void onDraw(Canvas canvas) {
            super.onDraw(canvas);
            int w = getWidth();
            int h = getHeight();
            int third = w / 4;
            int center = w / 2;
            int color = getProgressBarIndicatorColor(row);
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.rgb(255, 214, 92));
            canvas.drawRect(0, h / 3f, third, h * 2f / 3f, paint);
            canvas.drawRect(center + third / 2f, h / 3f, w, h * 2f / 3f, paint);
            paint.setColor(Color.rgb(148, 197, 148));
            canvas.drawRect(third, h / 3f, center + third / 2f, h * 2f / 3f, paint);
            paint.setColor(color);
            canvas.drawRect(0, h / 3f, (float) (third * getProgressBarValue(row, 0) / 100.0), h * 2f / 3f, paint);
            canvas.drawRect(third, h / 3f, (float) (third + (center - third / 2f) * getProgressBarValue(row, 1) / 100.0), h * 2f / 3f, paint);
            canvas.drawRect(center + third / 2f, h / 3f, (float) (center + third / 2f + (w - center - third / 2f) * getProgressBarValue(row, 2) / 100.0), h * 2f / 3f, paint);
            paint.setColor(Color.BLACK);
            paint.setTextAlign(Paint.Align.CENTER);
            paint.setTextSize(28);
            paint.setTypeface(Typeface.DEFAULT_BOLD);
            canvas.drawText(getProgressBarDisplayValue(row), w / 2f, h / 2f + 10, paint);
        }
    }
}
