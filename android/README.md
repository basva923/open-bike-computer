# Open Bike Computer — Native Android (Java)

This directory contains a **native Android** port of the Open Bike Computer app,
written in **Java**. It is a faithful conversion of the original Angular PWA
(in [`../src`](../src)) and reproduces the same features:

- Live, configurable **metrics dashboards** (17 metrics: power, speed, cadence,
  heart rate, altitude, grade, distance, bearing, laps, time, etc.).
- **Bluetooth Low Energy sensors**: heart-rate monitor (0x180D), cycling power
  meter (0x1818) and speed/cadence sensor (0x1816), with the same GATT
  characteristic parsing as the web app.
- **GPS** location and **device-orientation** derived grade/bearing.
- **Laps** with per-lap averages.
- **Structured workouts** loaded from Garmin **`.fit`** files, with step
  progression and zone progress bars.
- **Route** loading from **`.gpx`** files and a **map** view that draws the GPS
  track, route and current position.

## Project layout

```
android/
  settings.gradle, build.gradle, app/build.gradle   Gradle build configuration
  app/src/main/AndroidManifest.xml                  Permissions & launcher activity
  app/src/main/java/com/openbikecomputer/
    util/      Util, UnitConversion, UnitToString          (pure helpers)
    model/     MetricType, Metric (+ 17 metrics), Workout,
               LocationSample, HeartRateData, PowerMeterData,
               SpeedSensorData, RoutePoint                  (data + domain logic)
    service/   ServiceFactory, MetricService, TrainingService,
               NavigationService, the I*Service interfaces and the
               Android* implementations (GPS, orientation, BLE)
    fit/       FitDecoder                                   (self-contained .fit reader)
    ui/        MainActivity + Metrics/Settings/Laps/Workout/Map views
```

## Design notes

- **No AndroidX / no third-party libraries.** The UI is built programmatically
  against the Android framework only. This keeps the app buildable in
  restricted/offline environments (the original web dependencies — MapLibre,
  ApexCharts, the Garmin FIT SDK — are replaced by small framework-only
  implementations: a `Canvas`-based map view and a compact `FitDecoder`).
- The architecture mirrors the Angular app: a `ServiceFactory` provides
  singletons; `Metric` subclasses subscribe to sensor services and buffer a
  time series; `MetricService` owns all metrics and the lap timeline.

## Building

With network access to Google's Maven repository and the Android SDK installed:

```bash
cd android
./gradlew assembleDebug     # or: gradle assembleDebug
```

The build targets `compileSdk 34`, `minSdk 24`.

### Compiling the sources without Gradle

Because the app uses only framework APIs, the Java sources can be type-checked
directly against the platform `android.jar`:

```bash
cd android/app/src/main/java
ANDROID_JAR="$ANDROID_HOME/platforms/android-34/android.jar"
javac -cp "$ANDROID_JAR" -source 17 -target 17 -d /tmp/obc-classes \
  $(find com/openbikecomputer -name '*.java')
```

## Permissions

At runtime the app requests `ACCESS_FINE_LOCATION` (GPS) and
`BLUETOOTH_SCAN` / `BLUETOOTH_CONNECT` (BLE sensors).
