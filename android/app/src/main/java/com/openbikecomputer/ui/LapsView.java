package com.openbikecomputer.ui;

import android.content.Context;
import android.graphics.Typeface;
import android.os.Handler;
import android.os.Looper;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TableLayout;
import android.widget.TableRow;
import android.widget.TextView;

import com.openbikecomputer.model.MetricType;
import com.openbikecomputer.service.MetricService;
import com.openbikecomputer.service.ServiceFactory;

public class LapsView extends ScrollView {
    private final LinearLayout root;
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final Runnable refreshRunnable = new Runnable() {
        @Override public void run() { renderTable(); handler.postDelayed(this, 1000); }
    };
    private TableLayout table;
    private final MetricType[] metrics = {MetricType.SPEED, MetricType.POWER, MetricType.HEART_RATE, MetricType.CADENCE};

    public LapsView(Context context) {
        super(context);
        root = new LinearLayout(context);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setPadding(20, 20, 20, 20);
        addView(root, new ScrollView.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.WRAP_CONTENT));
        TextView title = new TextView(context);
        title.setText("Laps");
        title.setTextSize(24);
        title.setTypeface(Typeface.DEFAULT_BOLD);
        root.addView(title);
        Button lap = new Button(context);
        lap.setText("Lap");
        lap.setAllCaps(false);
        lap.setOnClickListener(v -> { ServiceFactory.getMetricService().newLap(); renderTable(); });
        root.addView(lap);
        table = new TableLayout(context);
        table.setStretchAllColumns(true);
        root.addView(table);
        renderTable();
    }

    @Override protected void onAttachedToWindow() { super.onAttachedToWindow(); handler.post(refreshRunnable); }
    @Override protected void onDetachedFromWindow() { handler.removeCallbacks(refreshRunnable); super.onDetachedFromWindow(); }

    private void renderTable() {
        table.removeAllViews();
        TableRow header = new TableRow(getContext());
        for (String h : new String[]{"No", "Duration", "Speed", "Power", "Heart Rate", "Cadence"}) header.addView(cell(h, true));
        table.addView(header);
        MetricService service = ServiceFactory.getMetricService();
        for (int i = 0; i < service.getNumberOfLaps(); i++) {
            final int lapIndex = i;
            TableRow row = new TableRow(getContext());
            row.addView(cell(Integer.toString(i + 1), false));
            row.addView(cell(safe(() -> service.displayLapDuration(lapIndex)), false));
            for (MetricType metric : metrics) {
                final int lap = i;
                row.addView(cell(safe(() -> service.getByMetricType(metric).displayAverageForLap(lap)), false));
            }
            table.addView(row);
        }
    }

    private TextView cell(String text, boolean bold) {
        TextView tv = new TextView(getContext());
        tv.setText(text);
        tv.setPadding(6, 6, 6, 6);
        if (bold) tv.setTypeface(Typeface.DEFAULT_BOLD);
        return tv;
    }

    private String safe(Value value) {
        try { return value.get(); } catch (Exception e) { return "---"; }
    }
    private interface Value { String get(); }
}
