# open-bike-computer

This is an open source bike computer app for on a phone.

Application live at: [link](https://basva923.github.io/open-bike-computer)

## Native Android app

A native Android port written in Java (no framework dependencies beyond the
Android SDK) lives in the [`android/`](android/) directory. It mirrors the
Angular PWA's features — configurable metric tabs, BLE heart-rate/power/speed
sensors, GPS location and orientation, MapLibre-style route view, lap tracking
and FIT workout playback. See [`android/README.md`](android/README.md) for build
and architecture details.