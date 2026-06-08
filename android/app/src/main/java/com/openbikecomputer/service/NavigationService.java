package com.openbikecomputer.service;

import android.util.Xml;

import com.openbikecomputer.model.RoutePoint;

import org.xmlpull.v1.XmlPullParser;
import org.xmlpull.v1.XmlPullParserException;

import java.io.IOException;
import java.io.StringReader;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Loads and stores a GPX route. Ported from {@code navigation.service.ts}.
 */
public class NavigationService {

    /** Listener notified when a new route is loaded. */
    public interface OnNewRoute {
        void onNewRoute(List<RoutePoint> route, String name);
    }

    private List<RoutePoint> route = new ArrayList<>();
    private String routeName = "";
    private final CopyOnWriteArrayList<OnNewRoute> listeners = new CopyOnWriteArrayList<>();

    /** Parse GPX content and store the contained track. */
    public void loadRouteFileGPX(String content) {
        List<RoutePoint> parsed = new ArrayList<>();
        String name = "GPX Route";
        try {
            XmlPullParser parser = Xml.newPullParser();
            parser.setFeature(XmlPullParser.FEATURE_PROCESS_NAMESPACES, false);
            parser.setInput(new StringReader(content));

            double lat = 0, lon = 0, ele = 0;
            boolean inTrkpt = false;
            boolean nameCaptured = false;
            String currentTag = null;

            int event = parser.getEventType();
            while (event != XmlPullParser.END_DOCUMENT) {
                if (event == XmlPullParser.START_TAG) {
                    String tag = parser.getName();
                    currentTag = tag;
                    if ("trkpt".equalsIgnoreCase(tag)) {
                        inTrkpt = true;
                        ele = 0;
                        String latAttr = parser.getAttributeValue(null, "lat");
                        String lonAttr = parser.getAttributeValue(null, "lon");
                        lat = latAttr != null ? Double.parseDouble(latAttr) : 0;
                        lon = lonAttr != null ? Double.parseDouble(lonAttr) : 0;
                    }
                } else if (event == XmlPullParser.TEXT) {
                    String text = parser.getText();
                    if (text != null) {
                        text = text.trim();
                        if (!text.isEmpty() && currentTag != null) {
                            if (!nameCaptured && "name".equalsIgnoreCase(currentTag)) {
                                name = text;
                                nameCaptured = true;
                            } else if (inTrkpt && "ele".equalsIgnoreCase(currentTag)) {
                                ele = Double.parseDouble(text);
                            }
                        }
                    }
                } else if (event == XmlPullParser.END_TAG) {
                    String tag = parser.getName();
                    if ("trkpt".equalsIgnoreCase(tag)) {
                        parsed.add(new RoutePoint(lat, lon, ele));
                        inTrkpt = false;
                    }
                    currentTag = null;
                }
                event = parser.next();
            }
        } catch (XmlPullParserException | IOException | NumberFormatException e) {
            throw new RuntimeException("Failed to parse GPX route", e);
        }

        this.route = parsed;
        this.routeName = name;
        for (OnNewRoute listener : listeners) {
            listener.onNewRoute(this.route, this.routeName);
        }
    }

    public void addNewRouteListener(OnNewRoute listener) {
        listeners.add(listener);
    }

    public void removeNewRouteListener(OnNewRoute listener) {
        listeners.remove(listener);
    }

    public boolean hasRoute() {
        return route != null && !route.isEmpty();
    }

    public String getRouteName() {
        return routeName != null ? routeName : "";
    }

    public List<RoutePoint> getRoute() {
        return route;
    }
}
