package com.openbikecomputer.ui;

import android.Manifest;
import android.app.Activity;
import android.content.ContentResolver;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;
import android.widget.Toast;

import com.openbikecomputer.service.ServiceFactory;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

public class MainActivity extends Activity {
    private static final int REQ_PERMISSIONS = 100;
    private static final int REQ_GPX_FILE = 101;
    private static final int REQ_FIT_FILE = 102;

    private FrameLayout content;
    private View[] views;
    private Button[] tabButtons;
    private SettingsView settingsView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        ServiceFactory.init(this);
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        requestRuntimePermissions();
        buildUi();
        showTab(1);
    }

    private void buildUi() {
        LinearLayout root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(0xfff7f7f7);

        LinearLayout tabs = new LinearLayout(this);
        tabs.setOrientation(LinearLayout.HORIZONTAL);
        root.addView(tabs, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, LinearLayout.LayoutParams.WRAP_CONTENT));

        content = new FrameLayout(this);
        root.addView(content, new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.MATCH_PARENT, 0, 1));

        settingsView = new SettingsView(this);
        views = new View[]{
                settingsView,
                new MetricsView(this, "data1"),
                new MetricsView(this, "data2"),
                new MapView(this),
                new LapsView(this),
                new WorkoutView(this)
        };

        String[] labels = {"Settings", "Metrics 1", "Metrics 2", "Map", "Laps", "Workout"};
        tabButtons = new Button[labels.length];
        for (int i = 0; i < labels.length; i++) {
            final int index = i;
            Button b = new Button(this);
            b.setText(labels[i]);
            b.setAllCaps(false);
            b.setTextSize(12);
            b.setOnClickListener(v -> showTab(index));
            tabButtons[i] = b;
            tabs.addView(b, new LinearLayout.LayoutParams(0,
                    LinearLayout.LayoutParams.WRAP_CONTENT, 1));
        }
        setContentView(root);
    }

    private void showTab(int index) {
        content.removeAllViews();
        content.addView(views[index], new FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT, FrameLayout.LayoutParams.MATCH_PARENT));
        for (int i = 0; i < tabButtons.length; i++) {
            tabButtons[i].setEnabled(i != index);
        }
    }

    private void requestRuntimePermissions() {
        String[] permissions = new String[]{
                Manifest.permission.ACCESS_FINE_LOCATION,
                Manifest.permission.BLUETOOTH_SCAN,
                Manifest.permission.BLUETOOTH_CONNECT
        };
        boolean missing = false;
        for (String p : permissions) {
            if (checkSelfPermission(p) != PackageManager.PERMISSION_GRANTED) {
                missing = true;
                break;
            }
        }
        if (missing) {
            requestPermissions(permissions, REQ_PERMISSIONS);
        } else {
            initializePermissionBackedServices();
        }
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, String[] permissions, int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == REQ_PERMISSIONS) {
            boolean granted = true;
            for (int result : grantResults) {
                granted &= result == PackageManager.PERMISSION_GRANTED;
            }
            if (granted) {
                initializePermissionBackedServices();
            } else {
                Toast.makeText(this, "Permissions are required for sensors and location", Toast.LENGTH_LONG).show();
            }
        }
    }

    private void initializePermissionBackedServices() {
        try {
            ServiceFactory.getLocationService();
            ServiceFactory.getHeartRateSensorService().reconnectToLastConnected();
            ServiceFactory.getPowerMeterService().reconnectToLastConnected();
            ServiceFactory.getSpeedSensorService().reconnectToLastConnected();
        } catch (Exception e) {
            Toast.makeText(this, "Service initialization failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    public void launchRouteFilePicker() {
        launchFilePicker(REQ_GPX_FILE);
    }

    public void launchWorkoutFilePicker() {
        launchFilePicker(REQ_FIT_FILE);
    }

    private void launchFilePicker(int requestCode) {
        Intent intent = new Intent(Intent.ACTION_OPEN_DOCUMENT);
        intent.addCategory(Intent.CATEGORY_OPENABLE);
        intent.setType("*/*");
        startActivityForResult(intent, requestCode);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (resultCode != RESULT_OK || data == null || data.getData() == null) {
            return;
        }
        Uri uri = data.getData();
        if (!ContentResolver.SCHEME_CONTENT.equals(uri.getScheme())) {
            Toast.makeText(this, "Unsupported file URI", Toast.LENGTH_LONG).show();
            return;
        }
        try (InputStream in = getContentResolver().openInputStream(uri)) {
            if (in == null) {
                throw new IllegalStateException("Unable to open selected file");
            }
            byte[] bytes = readAllBytes(in);
            if (requestCode == REQ_GPX_FILE) {
                String text = new String(bytes, StandardCharsets.UTF_8);
                ServiceFactory.getNavigationService().loadRouteFileGPX(text);
                Toast.makeText(this, "Route loaded", Toast.LENGTH_SHORT).show();
            } else if (requestCode == REQ_FIT_FILE) {
                double power = SettingsView.readPowerThreshold(this);
                double hr = SettingsView.readHeartRateThreshold(this);
                ServiceFactory.getTrainingService().loadFitFile(bytes, power, hr);
                Toast.makeText(this, "Workout loaded", Toast.LENGTH_SHORT).show();
            }
            if (settingsView != null) {
                settingsView.refresh();
            }
        } catch (Exception e) {
            Toast.makeText(this, "File load failed: " + e.getMessage(), Toast.LENGTH_LONG).show();
        }
    }

    private static byte[] readAllBytes(InputStream in) throws Exception {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        byte[] buffer = new byte[8192];
        int read;
        while ((read = in.read(buffer)) != -1) {
            out.write(buffer, 0, read);
        }
        return out.toByteArray();
    }
}
