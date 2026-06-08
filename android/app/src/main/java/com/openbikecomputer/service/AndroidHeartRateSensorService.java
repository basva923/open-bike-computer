package com.openbikecomputer.service;

import android.annotation.SuppressLint;
import android.bluetooth.BluetoothAdapter;
import android.bluetooth.BluetoothDevice;
import android.bluetooth.BluetoothGatt;
import android.bluetooth.BluetoothGattCallback;
import android.bluetooth.BluetoothGattCharacteristic;
import android.bluetooth.BluetoothGattDescriptor;
import android.bluetooth.BluetoothGattService;
import android.bluetooth.BluetoothManager;
import android.bluetooth.BluetoothProfile;
import android.bluetooth.le.BluetoothLeScanner;
import android.bluetooth.le.ScanCallback;
import android.bluetooth.le.ScanFilter;
import android.bluetooth.le.ScanResult;
import android.bluetooth.le.ScanSettings;
import android.content.Context;
import android.content.SharedPreferences;
import android.os.ParcelUuid;

import com.openbikecomputer.model.HeartRateData;

import java.util.Collections;
import java.util.UUID;
import java.util.concurrent.CopyOnWriteArrayList;

public class AndroidHeartRateSensorService implements IHeartRateSensorService {
    private static final UUID HEART_RATE_SERVICE_UUID = uuid16(0x180D);
    private static final UUID HEART_RATE_MEASUREMENT_UUID = uuid16(0x2A37);
    private static final UUID CCCD_UUID = uuid16(0x2902);
    private static final String PREFS_NAME = "open-bike-computer";
    private static final String LAST_CONNECTED_DEVICE = "lastConnectedDevice";

    private final Context context;
    private final BluetoothAdapter adapter;
    private final SharedPreferences preferences;
    private final CopyOnWriteArrayList<OnHeartRate> listeners = new CopyOnWriteArrayList<>();

    private BluetoothDevice device;
    private BluetoothGatt gatt;
    private volatile boolean connected;
    private BluetoothLeScanner scanner;
    private ScanCallback scanCallback;

    public AndroidHeartRateSensorService(Context context) {
        this.context = context.getApplicationContext();
        BluetoothManager manager = (BluetoothManager) this.context.getSystemService(Context.BLUETOOTH_SERVICE);
        this.adapter = manager == null ? null : manager.getAdapter();
        this.preferences = this.context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    @Override
    @SuppressLint("MissingPermission")
    public void selectNewDevice() {
        disconnect();
        if (adapter == null) {
            return;
        }
        try {
            scanner = adapter.getBluetoothLeScanner();
            if (scanner == null) {
                return;
            }
            ScanFilter filter = new ScanFilter.Builder().setServiceUuid(new ParcelUuid(HEART_RATE_SERVICE_UUID)).build();
            ScanSettings settings = new ScanSettings.Builder().setScanMode(ScanSettings.SCAN_MODE_LOW_LATENCY).build();
            scanCallback = new ScanCallback() {
                @Override
                public void onScanResult(int callbackType, ScanResult result) {
                    BluetoothDevice foundDevice = result.getDevice();
                    if (foundDevice == null) {
                        return;
                    }
                    stopScan();
                    device = foundDevice;
                    storeLastConnectedDevice();
                    connectSelectedDevice();
                }
            };
            scanner.startScan(Collections.singletonList(filter), settings, scanCallback);
        } catch (SecurityException | IllegalStateException ignored) {
        }
    }

    @Override
    @SuppressLint("MissingPermission")
    public void reconnectToLastConnected() {
        if (connected || adapter == null) {
            return;
        }
        String mac = preferences.getString(LAST_CONNECTED_DEVICE, null);
        if (mac == null) {
            return;
        }
        try {
            device = adapter.getRemoteDevice(mac);
            connectSelectedDevice();
        } catch (SecurityException | IllegalArgumentException ignored) {
        }
    }

    @Override
    @SuppressLint("MissingPermission")
    public void disconnect() {
        stopScan();
        try {
            if (gatt != null) {
                gatt.disconnect();
                gatt.close();
            }
        } catch (SecurityException ignored) {
        } finally {
            gatt = null;
            connected = false;
        }
    }

    @Override
    public boolean isConnected() {
        return connected;
    }

    @Override
    public boolean isDeviceSelected() {
        return device != null || preferences.getString(LAST_CONNECTED_DEVICE, null) != null;
    }

    @Override
    @SuppressLint("MissingPermission")
    public String getDeviceName() {
        if (device == null) {
            return "No device selected";
        }
        try {
            String name = device.getName();
            return name == null ? device.getAddress() : name;
        } catch (SecurityException ignored) {
            return "No device selected";
        }
    }

    @Override
    public void subscribeForHeartRate(OnHeartRate listener) {
        listeners.addIfAbsent(listener);
    }

    @Override
    public void unsubscribeForHeartRate(OnHeartRate listener) {
        listeners.remove(listener);
    }

    @SuppressLint("MissingPermission")
    private void connectSelectedDevice() {
        if (device == null) {
            return;
        }
        try {
            gatt = device.connectGatt(context, false, gattCallback);
        } catch (SecurityException ignored) {
        }
    }

    @SuppressLint("MissingPermission")
    private void stopScan() {
        try {
            if (scanner != null && scanCallback != null) {
                scanner.stopScan(scanCallback);
            }
        } catch (SecurityException | IllegalStateException ignored) {
        } finally {
            scanCallback = null;
        }
    }

    @SuppressLint("MissingPermission")
    private void storeLastConnectedDevice() {
        if (device != null) {
            try {
                preferences.edit().putString(LAST_CONNECTED_DEVICE, device.getAddress()).apply();
            } catch (SecurityException ignored) {
            }
        }
    }

    private final BluetoothGattCallback gattCallback = new BluetoothGattCallback() {
        @Override
        @SuppressLint("MissingPermission")
        public void onConnectionStateChange(BluetoothGatt gatt, int status, int newState) {
            if (newState == BluetoothProfile.STATE_CONNECTED) {
                connected = true;
                try {
                    gatt.discoverServices();
                } catch (SecurityException ignored) {
                }
            } else if (newState == BluetoothProfile.STATE_DISCONNECTED) {
                connected = false;
            }
        }

        @Override
        @SuppressLint("MissingPermission")
        public void onServicesDiscovered(BluetoothGatt gatt, int status) {
            BluetoothGattService service = gatt.getService(HEART_RATE_SERVICE_UUID);
            if (service == null) {
                return;
            }
            BluetoothGattCharacteristic characteristic = service.getCharacteristic(HEART_RATE_MEASUREMENT_UUID);
            if (characteristic == null) {
                return;
            }
            try {
                gatt.setCharacteristicNotification(characteristic, true);
                BluetoothGattDescriptor descriptor = characteristic.getDescriptor(CCCD_UUID);
                if (descriptor != null) {
                    descriptor.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
                    gatt.writeDescriptor(descriptor);
                }
            } catch (SecurityException ignored) {
            }
        }

        @Override
        public void onCharacteristicChanged(BluetoothGatt gatt, BluetoothGattCharacteristic characteristic) {
            if (!HEART_RATE_MEASUREMENT_UUID.equals(characteristic.getUuid())) {
                return;
            }
            byte[] value = characteristic.getValue();
            if (value == null) {
                return;
            }
            HeartRateData data = parseHeartRate(value);
            for (OnHeartRate listener : listeners) {
                listener.onHeartRate(data);
            }
        }
    };

    private HeartRateData parseHeartRate(byte[] value) {
        int flags = uint8(value, 0);
        boolean rate16Bits = (flags & 0x1) != 0;
        int index = 1;
        int heartRate;
        if (rate16Bits) {
            heartRate = uint16LE(value, index);
            index += 2;
        } else {
            heartRate = uint8(value, index);
            index += 1;
        }

        HeartRateData result = new HeartRateData(System.currentTimeMillis(), heartRate);
        boolean contactDetected = (flags & 0x2) != 0;
        boolean contactSensorPresent = (flags & 0x4) != 0;
        if (contactSensorPresent) {
            result.contactDetected = contactDetected;
        }
        if ((flags & 0x8) != 0) {
            result.energyExpended = uint16LE(value, index);
            index += 2;
        }
        if ((flags & 0x10) != 0) {
            int count = (value.length - index) / 2;
            int[] rrIntervals = new int[count];
            for (int i = 0; index + 1 < value.length; i++, index += 2) {
                rrIntervals[i] = uint16LE(value, index);
            }
            result.rrIntervals = rrIntervals;
        }
        return result;
    }

    private static int uint8(byte[] value, int offset) {
        return value[offset] & 0xFF;
    }

    private static int uint16LE(byte[] value, int offset) {
        return (value[offset] & 0xFF) | ((value[offset + 1] & 0xFF) << 8);
    }

    private static UUID uuid16(int assignedNumber) {
        return UUID.fromString(String.format("0000%04x-0000-1000-8000-00805f9b34fb", assignedNumber));
    }
}
