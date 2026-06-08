package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnLocationUpdate;
import com.openbikecomputer.service.OnSpeedData;

import java.util.ArrayList;
import java.util.List;

public class SpeedMetric extends Metric implements OnLocationUpdate, OnSpeedData {
    private final double wheelCircumference;
    private final List<SpeedSensorData> lastSpeedSensorDatas = new ArrayList<>();

    public SpeedMetric(IMetricService metricService) {
        super(MetricType.SPEED, "Speed", "m/s", metricService, "km/h", 1);
        this.wheelCircumference = 2.1;
    }

    @Override
    public void startLogging() {
        metricService.getSpeedSensorService().subscribeForSpeedData(this);
        metricService.getLocationService().subscribeForLocation(this);
    }

    @Override
    public void stopLogging() {
        metricService.getLocationService().unsubscribeForLocation(this);
        metricService.getSpeedSensorService().unsubscribeForSpeedData(this);
    }

    @Override
    public void onLocation(LocationSample sample) {
        if (!metricService.getSpeedSensorService().isDeviceSelected()) {
            if (sample.speed != null) {
                addValue(sample.speed, sample.timestamp);
            } else {
                addValue(0, sample.timestamp);
            }
        }
    }

    @Override
    public void onSpeedData(SpeedSensorData data) {
        if (data.cumulativeWheelRevolutions == null || data.cumulativeWheelRevolutions == 0) {
            return;
        }

        SpeedSensorData lastDataWithLessWheelRevolutions =
                getLastSpeedSensorDataWithLessWheelRevolutions(data.cumulativeWheelRevolutions);
        if (lastDataWithLessWheelRevolutions == null) {
            addValue(0, data.timestamp);
        } else {
            Double diffRotationsObj = data.diffWheelRevolutions(lastDataWithLessWheelRevolutions);
            Double timeDiffObj = data.diffWheelTimeInSeconds(lastDataWithLessWheelRevolutions);
            double diffRotations = diffRotationsObj == null ? 0 : diffRotationsObj;
            double timeDiff = timeDiffObj == null || timeDiffObj == 0 ? 1 : timeDiffObj;
            addValue((diffRotations * wheelCircumference) / timeDiff, data.timestamp);
        }
        lastSpeedSensorDatas.add(data);
        if (lastSpeedSensorDatas.size() > 10) {
            lastSpeedSensorDatas.remove(0);
        }
    }

    public SpeedSensorData getLastSpeedSensorDataWithLessWheelRevolutions(long cumulativeWheelRevolutions) {
        for (int i = lastSpeedSensorDatas.size() - 1; i >= 0; i--) {
            SpeedSensorData data = lastSpeedSensorDatas.get(i);
            if (data.cumulativeWheelRevolutions != null
                    && data.cumulativeWheelRevolutions != 0
                    && data.cumulativeWheelRevolutions < cumulativeWheelRevolutions) {
                return data;
            }
        }
        return null;
    }
}
