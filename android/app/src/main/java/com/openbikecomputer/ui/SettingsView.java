package com.openbikecomputer.ui;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Typeface;
import android.text.Editable;
import android.text.InputType;
import android.text.TextWatcher;
import android.view.Gravity;
import android.widget.Button;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;
import android.widget.Toast;

import com.openbikecomputer.model.GradeMetric;
import com.openbikecomputer.model.Metric;
import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.service.IHeartRateSensorService;
import com.openbikecomputer.service.IPowerMeterService;
import com.openbikecomputer.service.ISpeedSensorService;
import com.openbikecomputer.service.ServiceFactory;

public class SettingsView extends ScrollView {
    private final LinearLayout root;
    private EditText powerThreshold;
    private EditText heartRateThreshold;
    private Button hrButton;
    private Button powerButton;
    private Button speedButton;
    private Button activityButton;
    private TextView routeLabel;
    private TextView workoutLabel;

    public SettingsView(Context context) {
        super(context);
        root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(20, 20, 20, 20);
        addView(root, new ScrollView.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        build();
        refresh();
    }

    public static double readPowerThreshold(Context context) {
        return context.getSharedPreferences("obc", Context.MODE_PRIVATE).getFloat("powerThreshold", 250f);
    }

    public static double readHeartRateThreshold(Context context) {
        return context.getSharedPreferences("obc", Context.MODE_PRIVATE).getFloat("heartRateThreshold", 180f);
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences("obc", Context.MODE_PRIVATE);
    }

    private void build() {
        root.addView(header("Setting", 24));
        root.addView(header("Sensors", 18));
        LinearLayout sensors = new LinearLayout(getContext());
        sensors.setOrientation(LinearLayout.HORIZONTAL);
        hrButton = button("Connect Heart Rate");
        powerButton = button("Connect Power");
        speedButton = button("Connect Speed");
        hrButton.setOnClickListener(v -> connectHeartRate());
        powerButton.setOnClickListener(v -> connectPower());
        speedButton.setOnClickListener(v -> connectSpeed());
        sensors.addView(hrButton, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        sensors.addView(powerButton, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        sensors.addView(speedButton, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        root.addView(sensors);

        root.addView(header("Route", 18));
        LinearLayout routeRow = new LinearLayout(getContext());
        routeRow.setGravity(Gravity.CENTER_VERTICAL);
        Button routeButton = button("Load Route (GPX)");
        routeButton.setOnClickListener(v -> ((MainActivity) getContext()).launchRouteFilePicker());
        routeLabel = new TextView(getContext());
        routeLabel.setPadding(12, 0, 0, 0);
        routeRow.addView(routeButton);
        routeRow.addView(routeLabel, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        root.addView(routeRow);

        root.addView(header("Training", 18));
        LinearLayout thresholdRow = new LinearLayout(getContext());
        thresholdRow.setOrientation(LinearLayout.HORIZONTAL);
        powerThreshold = numberEdit(Double.toString(readPowerThreshold(getContext())));
        heartRateThreshold = numberEdit(Double.toString(readHeartRateThreshold(getContext())));
        thresholdRow.addView(labeled("Power threshold", powerThreshold), new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        thresholdRow.addView(labeled("Heart rate threshold", heartRateThreshold), new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        root.addView(thresholdRow);

        LinearLayout workoutRow = new LinearLayout(getContext());
        workoutRow.setGravity(Gravity.CENTER_VERTICAL);
        Button workoutButton = button("Load Workout (FIT)");
        workoutButton.setOnClickListener(v -> { saveThresholds(); ((MainActivity) getContext()).launchWorkoutFilePicker(); });
        workoutLabel = new TextView(getContext());
        workoutLabel.setPadding(12, 0, 0, 0);
        workoutRow.addView(workoutButton);
        workoutRow.addView(workoutLabel, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        root.addView(workoutRow);

        LinearLayout workoutControls = new LinearLayout(getContext());
        Button startWorkout = button("Start Workout");
        startWorkout.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().startWorkout()));
        Button stopWorkout = button("Stop Workout");
        stopWorkout.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().stopWorkout()));
        Button prev = button("Prev Step");
        prev.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().moveToPreviousStep()));
        Button next = button("Next Step");
        next.setOnClickListener(v -> call(() -> ServiceFactory.getTrainingService().moveToNextStep()));
        workoutControls.addView(startWorkout); workoutControls.addView(stopWorkout); workoutControls.addView(prev); workoutControls.addView(next);
        root.addView(workoutControls);

        root.addView(header("Activity", 18));
        LinearLayout activityRow = new LinearLayout(getContext());
        activityButton = button("Start Activity");
        activityButton.setOnClickListener(v -> {
            if (ServiceFactory.getMetricService().isRunning()) ServiceFactory.getMetricService().stopLogging();
            else ServiceFactory.getMetricService().startLogging();
            refresh();
        });
        Button lap = button("Lap");
        lap.setOnClickListener(v -> ServiceFactory.getMetricService().newLap());
        activityRow.addView(activityButton);
        activityRow.addView(lap);
        root.addView(activityRow);

        root.addView(header("Metrics", 18));
        root.addView(metricsTable());
        Button calibrate = button("Calibrate Grade");
        calibrate.setOnClickListener(v -> call(() -> ((GradeMetric) ServiceFactory.getMetricService().getByMetricType(MetricType.GRADE)).calibrateGrade()));
        root.addView(calibrate);
    }

    private TextView header(String text, int size) {
        TextView tv = new TextView(getContext());
        tv.setText(text);
        tv.setTextSize(size);
        tv.setTypeface(Typeface.DEFAULT_BOLD);
        tv.setPadding(0, 14, 0, 8);
        return tv;
    }

    private Button button(String text) {
        Button b = new Button(getContext());
        b.setAllCaps(false);
        b.setText(text);
        return b;
    }

    private EditText numberEdit(String value) {
        EditText edit = new EditText(getContext());
        edit.setInputType(InputType.TYPE_CLASS_NUMBER | InputType.TYPE_NUMBER_FLAG_DECIMAL);
        edit.setText(value);
        edit.setSingleLine(true);
        edit.setOnFocusChangeListener((v, hasFocus) -> { if (!hasFocus) saveThresholds(); });
        edit.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int start, int count, int after) { }
            @Override public void onTextChanged(CharSequence s, int start, int before, int count) { saveThresholdsQuietly(); }
            @Override public void afterTextChanged(Editable s) { }
        });
        return edit;
    }

    private LinearLayout labeled(String label, EditText edit) {
        LinearLayout box = new LinearLayout(getContext());
        box.setOrientation(LinearLayout.VERTICAL);
        TextView tv = new TextView(getContext());
        tv.setText(label);
        box.addView(tv);
        box.addView(edit);
        return box;
    }

    private TableLayout metricsTable() {
        TableLayout table = new TableLayout(getContext());
        table.setStretchAllColumns(true);
        TableRow header = new TableRow(getContext());
        for (String h : new String[]{"Metric", "Last", "Avg", "Max", "Lap"}) header.addView(tableCell(h, true));
        table.addView(header);
        for (String name : ServiceFactory.getMetricService().getNames()) {
            Metric metric = ServiceFactory.getMetricService().getByName(name);
            TableRow row = new TableRow(getContext());
            row.addView(tableCell(name, false));
            row.addView(tableCell(metric.displayLastValue(), false));
            row.addView(tableCell(metric.displayAverage(true), false));
            row.addView(tableCell(metric.displayMax(true), false));
            row.addView(tableCell(metric.displayAverageForLap(), false));
            table.addView(row);
        }
        return table;
    }

    private TextView tableCell(String text, boolean bold) {
        TextView tv = new TextView(getContext());
        tv.setText(text);
        tv.setPadding(4, 4, 4, 4);
        if (bold) tv.setTypeface(Typeface.DEFAULT_BOLD);
        return tv;
    }

    private void saveThresholds() {
        if (!saveThresholdsQuietly()) {
            Toast.makeText(getContext(), "Invalid threshold", Toast.LENGTH_SHORT).show();
        }
    }

    private boolean saveThresholdsQuietly() {
        if (powerThreshold == null || heartRateThreshold == null) return false;
        try {
            float power = Float.parseFloat(powerThreshold.getText().toString());
            float hr = Float.parseFloat(heartRateThreshold.getText().toString());
            prefs().edit().putFloat("powerThreshold", power).putFloat("heartRateThreshold", hr).apply();
            return true;
        } catch (NumberFormatException e) {
            return false;
        }
    }

    public void refresh() {
        try {
            IHeartRateSensorService hr = ServiceFactory.getHeartRateSensorService();
            IPowerMeterService power = ServiceFactory.getPowerMeterService();
            ISpeedSensorService speed = ServiceFactory.getSpeedSensorService();
            hrButton.setText(sensorLabel("Connect Heart Rate", hr.isDeviceSelected(), hr.isConnected(), hr.getDeviceName()));
            powerButton.setText(sensorLabel("Connect Power", power.isDeviceSelected(), power.isConnected(), power.getDeviceName()));
            speedButton.setText(sensorLabel("Connect Speed", speed.isDeviceSelected(), speed.isConnected(), speed.getDeviceName()));
        } catch (Exception ignored) { }
        routeLabel.setText(ServiceFactory.getNavigationService().hasRoute() ? ServiceFactory.getNavigationService().getRouteName() : "No route");
        workoutLabel.setText(ServiceFactory.getTrainingService().hasTraining() ? ServiceFactory.getTrainingService().getTrainingName() : "No workout");
        activityButton.setText(ServiceFactory.getMetricService().isRunning() ? "Stop Activity" : "Start Activity");
    }

    private String sensorLabel(String base, boolean selected, boolean connected, String name) {
        if (!selected) return base;
        return (connected ? "✓ " : "… ") + (name == null || name.isEmpty() ? base : name);
    }

    private void connectHeartRate() { call(() -> { ServiceFactory.getHeartRateSensorService().selectNewDevice(); refresh(); }); }
    private void connectPower() { call(() -> { ServiceFactory.getPowerMeterService().selectNewDevice(); refresh(); }); }
    private void connectSpeed() { call(() -> { ServiceFactory.getSpeedSensorService().selectNewDevice(); refresh(); }); }

    private void call(Action action) {
        try { action.run(); refresh(); }
        catch (Exception e) { Toast.makeText(getContext(), e.getMessage(), Toast.LENGTH_LONG).show(); }
    }

    private interface Action { void run(); }
}
