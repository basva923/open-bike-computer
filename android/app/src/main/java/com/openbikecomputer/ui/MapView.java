package com.openbikecomputer.ui;

import android.content.Context;
import android.graphics.Canvas;
import android.graphics.Color;
import android.graphics.Paint;
import android.graphics.Path;
import android.os.Handler;
import android.os.Looper;
import android.view.Gravity;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.LinearLayout;

import com.openbikecomputer.model.LocationSample;
import com.openbikecomputer.model.RoutePoint;
import com.openbikecomputer.service.NavigationService;
import com.openbikecomputer.service.OnLocationUpdate;
import com.openbikecomputer.service.ServiceFactory;

import java.util.List;

public class MapView extends FrameLayout {
    private final Handler handler = new Handler(Looper.getMainLooper());
    private final MapCanvas canvas;
    private boolean follow = true;
    private boolean northUp = true;
    private double centerLat = 0;
    private double centerLon = 0;
    private final OnLocationUpdate locationListener;
    private final NavigationService.OnNewRoute routeListener;
    private final Runnable refreshRunnable = new Runnable() {
        @Override public void run() { updateCenterIfNeeded(); canvas.invalidate(); handler.postDelayed(this, 1000); }
    };

    public MapView(Context context) {
        super(context);
        canvas = new MapCanvas(context);
        locationListener = sample -> {
            if (follow) {
                centerLat = sample.latitude;
                centerLon = sample.longitude;
            }
            canvas.invalidate();
        };
        routeListener = (route, name) -> canvas.invalidate();
        addView(canvas, new FrameLayout.LayoutParams(LayoutParams.MATCH_PARENT, LayoutParams.MATCH_PARENT));
        LinearLayout controls = new LinearLayout(context);
        controls.setOrientation(LinearLayout.VERTICAL);
        Button orient = button("North Up");
        Button recenter = button("Recenter");
        orient.setOnClickListener(v -> { northUp = !northUp; orient.setText(northUp ? "North Up" : "Heading Up"); canvas.invalidate(); });
        recenter.setOnClickListener(v -> { follow = true; updateCenterIfNeeded(); canvas.invalidate(); });
        controls.addView(orient);
        controls.addView(recenter);
        FrameLayout.LayoutParams lp = new FrameLayout.LayoutParams(LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT, Gravity.TOP | Gravity.RIGHT);
        addView(controls, lp);
        updateCenterIfNeeded();
    }

    @Override protected void onAttachedToWindow() {
        super.onAttachedToWindow();
        try { ServiceFactory.getLocationService().subscribeForLocation(locationListener); } catch (Exception ignored) { }
        ServiceFactory.getNavigationService().addNewRouteListener(routeListener);
        handler.post(refreshRunnable);
    }

    @Override protected void onDetachedFromWindow() {
        handler.removeCallbacks(refreshRunnable);
        try { ServiceFactory.getLocationService().unsubscribeForLocation(locationListener); } catch (Exception ignored) { }
        ServiceFactory.getNavigationService().removeNewRouteListener(routeListener);
        super.onDetachedFromWindow();
    }

    private Button button(String text) {
        Button b = new Button(getContext());
        b.setText(text);
        b.setAllCaps(false);
        return b;
    }

    private void updateCenterIfNeeded() {
        Double lat = ServiceFactory.getLocationService().getCurLatitude();
        Double lon = ServiceFactory.getLocationService().getCurLongitude();
        if ((follow || centerLat == 0 && centerLon == 0) && lat != null && lon != null) {
            centerLat = lat;
            centerLon = lon;
        }
    }

    private class MapCanvas extends android.view.View {
        private final Paint paint = new Paint(Paint.ANTI_ALIAS_FLAG);
        private static final double METERS_PER_PIXEL = 3.0;

        MapCanvas(Context context) { super(context); setBackgroundColor(Color.rgb(232, 238, 232)); }

        @Override protected void onDraw(Canvas c) {
            super.onDraw(c);
            drawGrid(c);
            c.save();
            if (!northUp) {
                c.rotate((float) -ServiceFactory.getLocationService().getBearingForHorizontalPhone(), getWidth() / 2f, getHeight() / 2f);
            }
            drawRoute(c);
            drawTrack(c);
            drawPosition(c);
            c.restore();
        }

        private void drawGrid(Canvas c) {
            paint.setColor(Color.rgb(210, 220, 210));
            paint.setStrokeWidth(1);
            for (int x = 0; x < getWidth(); x += 80) c.drawLine(x, 0, x, getHeight(), paint);
            for (int y = 0; y < getHeight(); y += 80) c.drawLine(0, y, getWidth(), y, paint);
        }

        private void drawRoute(Canvas c) {
            List<RoutePoint> route = ServiceFactory.getNavigationService().getRoute();
            if (route == null || route.size() < 2) return;
            paint.setColor(Color.BLUE);
            paint.setStrokeWidth(6);
            paint.setStyle(Paint.Style.STROKE);
            Path path = new Path();
            for (int i = 0; i < route.size(); i++) {
                float x = xFor(route.get(i).latitude, route.get(i).longitude);
                float y = yFor(route.get(i).latitude, route.get(i).longitude);
                if (i == 0) path.moveTo(x, y); else path.lineTo(x, y);
            }
            c.drawPath(path, paint);
        }

        private void drawTrack(Canvas c) {
            List<LocationSample> track = ServiceFactory.getLocationService().getCoordinatesLog();
            if (track == null || track.size() < 2) return;
            paint.setColor(Color.DKGRAY);
            paint.setStrokeWidth(5);
            paint.setStyle(Paint.Style.STROKE);
            Path path = new Path();
            for (int i = 0; i < track.size(); i++) {
                float x = xFor(track.get(i).latitude, track.get(i).longitude);
                float y = yFor(track.get(i).latitude, track.get(i).longitude);
                if (i == 0) path.moveTo(x, y); else path.lineTo(x, y);
            }
            c.drawPath(path, paint);
        }

        private void drawPosition(Canvas c) {
            Double lat = ServiceFactory.getLocationService().getCurLatitude();
            Double lon = ServiceFactory.getLocationService().getCurLongitude();
            if (lat == null || lon == null) {
                paint.setStyle(Paint.Style.FILL);
                paint.setColor(Color.BLACK);
                paint.setTextSize(28);
                paint.setTextAlign(Paint.Align.CENTER);
                c.drawText("Waiting for GPS", getWidth() / 2f, getHeight() / 2f, paint);
                return;
            }
            float x = xFor(lat, lon);
            float y = yFor(lat, lon);
            c.save();
            c.rotate((float) ServiceFactory.getLocationService().getBearingForHorizontalPhone(), x, y);
            Path arrow = new Path();
            arrow.moveTo(x, y - 24);
            arrow.lineTo(x - 16, y + 18);
            arrow.lineTo(x, y + 8);
            arrow.lineTo(x + 16, y + 18);
            arrow.close();
            paint.setStyle(Paint.Style.FILL);
            paint.setColor(Color.RED);
            c.drawPath(arrow, paint);
            c.restore();
        }

        private float xFor(double lat, double lon) {
            double meters = (lon - centerLon) * 111320.0 * Math.cos(Math.toRadians(centerLat));
            return (float) (getWidth() / 2.0 + meters / METERS_PER_PIXEL);
        }

        private float yFor(double lat, double lon) {
            double meters = (lat - centerLat) * 110540.0;
            return (float) (getHeight() / 2.0 - meters / METERS_PER_PIXEL);
        }
    }
}
