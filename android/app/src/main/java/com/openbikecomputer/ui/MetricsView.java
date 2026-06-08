package com.openbikecomputer.ui;

import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.view.View;
import android.widget.AdapterView;
import android.widget.BaseAdapter;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;

import com.openbikecomputer.model.Metric;
import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.service.ServiceFactory;

import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

public class MetricsView extends ScrollView {
    private final String tabName;
    private final LinearLayout root;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refreshRunnable = new Runnable() {
        @Override public void run() {
            refreshValues();
            handler.postDelayed(this, 1000);
        }
    };
    private List<List<MetricType>> config;
    private boolean editMode;

    public MetricsView(Context context, String tabName) {
        super(context);
        this.tabName = tabName;
        root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(16, 16, 16, 16);
        addView(root, new ScrollView.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        loadConfig();
        render();
    }

    @Override protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        handler.removeCallbacks(refreshRunnable);
        handler.post(refreshRunnable);
    }

    @Override protected void onDetachedFromWindow() {
        handler.removeCallbacks(refreshRunnable);
        super.onDetachedFromWindow();
    }

    private SharedPreferences prefs() {
        return getContext().getSharedPreferences("obc", Context.MODE_PRIVATE);
    }

    private void render() {
        root.removeAllViews();
        for (int r = 0; r < config.size(); r++) {
            if (editMode) {
                addEditRow(r);
            } else {
                addDisplayRow(r);
            }
        }
        LinearLayout actions = new LinearLayout(getContext());
        actions.setGravity(Gravity.CENTER);
        actions.setOrientation(LinearLayout.HORIZONTAL);
        if (editMode) {
            Button done = button("Done");
            done.setOnClickListener(v -> { saveConfig(); editMode = false; render(); });
            Button cancel = button("Cancel");
            cancel.setOnClickListener(v -> { loadConfig(); editMode = false; render(); });
            Button reset = button("Reset");
            reset.setOnClickListener(v -> { resetConfig(); render(); });
            actions.addView(done); actions.addView(cancel); actions.addView(reset);
        } else {
            Button edit = button("⚙");
            edit.setOnClickListener(v -> { editMode = true; render(); });
            actions.addView(edit);
        }
        root.addView(actions);
    }

    private void addDisplayRow(int rowIndex) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        int count = config.get(rowIndex).size();
        int height = count == 1 ? 260 : count == 2 ? 210 : 160;
        root.addView(row, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, height));
        for (MetricType type : config.get(rowIndex)) {
            LinearLayout cell = new LinearLayout(getContext());
            cell.setOrientation(LinearLayout.VERTICAL);
            cell.setPadding(8, 4, 8, 4);
            TextView name = new TextView(getContext());
            TextView value = new TextView(getContext());
            name.setSingleLine(true);
            name.setTextSize(14);
            value.setGravity(Gravity.RIGHT | Gravity.CENTER_VERTICAL);
            value.setTextSize(count == 1 ? 76 : count == 2 ? 42 : 30);
            value.setTypeface(android.graphics.Typeface.DEFAULT_BOLD);
            cell.addView(name, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
            cell.addView(value, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, 0, 1));
            cell.setTag(new CellViews(type, name, value));
            row.addView(cell, new LinearLayout.LayoutParams(0, LayoutParams.MATCH_PARENT, 1));
        }
        refreshValues();
    }

    private void addEditRow(int rowIndex) {
        LinearLayout row = new LinearLayout(getContext());
        row.setOrientation(LinearLayout.HORIZONTAL);
        row.setPadding(0, 6, 0, 6);
        root.addView(row, new LinearLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));

        LinearLayout rowActions = new LinearLayout(getContext());
        rowActions.setOrientation(LinearLayout.VERTICAL);
        Button above = button("+↑");
        above.setOnClickListener(v -> { config.add(rowIndex, onePowerRow()); render(); });
        Button removeRow = button("Del row");
        removeRow.setOnClickListener(v -> { if (config.size() > 1) { config.remove(rowIndex); render(); } });
        Button below = button("+↓");
        below.setOnClickListener(v -> { config.add(rowIndex + 1, onePowerRow()); render(); });
        rowActions.addView(above); rowActions.addView(removeRow); rowActions.addView(below);
        row.addView(rowActions, new LinearLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT));

        for (int c = 0; c < config.get(rowIndex).size(); c++) {
            final int colIndex = c;
            LinearLayout cell = new LinearLayout(getContext());
            cell.setOrientation(LinearLayout.VERTICAL);
            Spinner spinner = new Spinner(getContext());
            spinner.setAdapter(new MetricTypeAdapter());
            spinner.setSelection(config.get(rowIndex).get(colIndex).ordinal());
            spinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
                @Override public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                    config.get(rowIndex).set(colIndex, MetricType.values()[position]);
                }
                @Override public void onNothingSelected(AdapterView<?> parent) { }
            });
            LinearLayout metricButtons = new LinearLayout(getContext());
            Button add = button("+");
            add.setOnClickListener(v -> { if (config.get(rowIndex).size() < 4) { config.get(rowIndex).add(colIndex, MetricType.POWER); render(); } });
            Button remove = button("-");
            remove.setOnClickListener(v -> { if (config.get(rowIndex).size() > 1) { config.get(rowIndex).remove(colIndex); render(); } });
            metricButtons.addView(add); metricButtons.addView(remove);
            cell.addView(spinner);
            cell.addView(metricButtons);
            row.addView(cell, new LinearLayout.LayoutParams(0, LayoutParams.WRAP_CONTENT, 1));
        }
    }

    private Button button(String text) {
        Button b = new Button(getContext());
        b.setText(text);
        b.setAllCaps(false);
        return b;
    }

    private List<MetricType> onePowerRow() {
        List<MetricType> row = new ArrayList<>();
        row.add(MetricType.POWER);
        return row;
    }

    private void refreshValues() {
        refreshIn(root);
    }

    private void refreshIn(View view) {
        Object tag = view.getTag();
        if (tag instanceof CellViews) {
            CellViews cell = (CellViews) tag;
            try {
                Metric metric = ServiceFactory.getMetricService().getByMetricType(cell.type);
                cell.name.setText(metric.getName() + " (" + metric.getPreferredUnit() + ")");
                cell.value.setText(metric.displayLastValue(false));
            } catch (Exception e) {
                cell.name.setText(cell.type.name());
                cell.value.setText("---");
            }
        }
        if (view instanceof LinearLayout) {
            LinearLayout group = (LinearLayout) view;
            for (int i = 0; i < group.getChildCount(); i++) {
                refreshIn(group.getChildAt(i));
            }
        }
    }

    private void loadConfig() {
        String json = prefs().getString("metricsConfig." + tabName, null);
        if (json == null) {
            resetConfig();
            return;
        }
        try {
            JSONArray rows = new JSONArray(json);
            config = new ArrayList<>();
            for (int i = 0; i < rows.length(); i++) {
                JSONArray cols = rows.getJSONArray(i);
                List<MetricType> row = new ArrayList<>();
                for (int j = 0; j < cols.length(); j++) {
                    row.add(MetricType.valueOf(cols.getString(j)));
                }
                if (!row.isEmpty()) config.add(row);
            }
            if (config.isEmpty()) resetConfig();
        } catch (Exception e) {
            Toast.makeText(getContext(), "Metrics config reset", Toast.LENGTH_SHORT).show();
            resetConfig();
        }
    }

    private void saveConfig() {
        JSONArray rows = new JSONArray();
        for (List<MetricType> row : config) {
            JSONArray cols = new JSONArray();
            for (MetricType type : row) cols.put(type.name());
            rows.put(cols);
        }
        prefs().edit().putString("metricsConfig." + tabName, rows.toString()).apply();
    }

    private void resetConfig() {
        config = new ArrayList<>();
        addRow(MetricType.POWER);
        addRow(MetricType.SPEED, MetricType.POWER);
        addRow(MetricType.CADENCE, MetricType.HEART_RATE);
        addRow(MetricType.ALTITUDE, MetricType.VERTICAL_SPEED);
        addRow(MetricType.DISTANCE, MetricType.GRADE, MetricType.CADENCE);
        addRow(MetricType.ALTITUDE, MetricType.ALTITUDE, MetricType.ALTITUDE);
        addRow(MetricType.CADENCE);
        addRow(MetricType.TEMPERATURE, MetricType.POWER_BALENCE);
        addRow(MetricType.WHEEL_ROTATIONS, MetricType.DISTANCE);
    }

    private void addRow(MetricType... types) {
        List<MetricType> row = new ArrayList<>();
        for (MetricType type : types) row.add(type);
        config.add(row);
    }

    private class MetricTypeAdapter extends BaseAdapter {
        @Override public int getCount() { return MetricType.values().length; }
        @Override public Object getItem(int position) { return MetricType.values()[position]; }
        @Override public long getItemId(int position) { return position; }
        @Override public View getView(int position, View convertView, android.view.ViewGroup parent) {
            return optionView(position, convertView);
        }
        @Override public View getDropDownView(int position, View convertView, android.view.ViewGroup parent) {
            return optionView(position, convertView);
        }
        private View optionView(int position, View convertView) {
            TextView tv = convertView instanceof TextView ? (TextView) convertView : new TextView(getContext());
            tv.setText(MetricType.values()[position].name());
            tv.setTextSize(16);
            tv.setPadding(12, 12, 12, 12);
            return tv;
        }
    }

    private static class CellViews {
        final MetricType type;
        final TextView name;
        final TextView value;
        CellViews(MetricType type, TextView name, TextView value) {
            this.type = type; this.name = name; this.value = value;
        }
    }
}
