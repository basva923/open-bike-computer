package com.openbikecomputer.model;

import com.openbikecomputer.service.IMetricService;
import com.openbikecomputer.service.OnPowerData;

import java.util.ArrayList;
import java.util.List;

public class CadenceMetric extends Metric implements OnPowerData {
    private final List<PowerMeterData> lastPowerMeterDatas = new ArrayList<>();

    public CadenceMetric(IMetricService metricService) {
        super(MetricType.CADENCE, "Cadence", "rps", metricService, "rpm");
    }

    @Override
    public void startLogging() {
        metricService.getPowerMeterService().subscribeForPowerData(this);
    }

    @Override
    public void stopLogging() {
        metricService.getPowerMeterService().unsubscribeForPowerData(this);
    }

    @Override
    public void onPowerData(PowerMeterData data) {
        if (data.cumulativeCrankRevolutions == null || data.cumulativeCrankRevolutions == 0) {
            return;
        }

        PowerMeterData lastDataWithLessCrankRevolutions =
                getLastPowerMeterDataWithLessCrankRevolutions(data.cumulativeCrankRevolutions);
        if (lastDataWithLessCrankRevolutions == null) {
            addValue(0, data.timestamp);
        } else {
            Double diffRotationsObj = data.diffCrankRotations(lastDataWithLessCrankRevolutions);
            Double timeDiffObj = data.diffCrankTimeInSeconds(lastDataWithLessCrankRevolutions);
            double diffRotations = diffRotationsObj == null ? 0 : diffRotationsObj;
            double timeDiff = timeDiffObj == null || timeDiffObj == 0 ? 1 : timeDiffObj;
            addValue(diffRotations / timeDiff, data.timestamp);
        }
        lastPowerMeterDatas.add(data);
        if (lastPowerMeterDatas.size() > 10) {
            lastPowerMeterDatas.remove(0);
        }
    }

    public PowerMeterData getLastPowerMeterDataWithLessCrankRevolutions(long cumulativeCrankRevolutions) {
        for (int i = lastPowerMeterDatas.size() - 1; i >= 0; i--) {
            PowerMeterData data = lastPowerMeterDatas.get(i);
            if (data.cumulativeCrankRevolutions != null
                    && data.cumulativeCrankRevolutions != 0
                    && data.cumulativeCrankRevolutions < cumulativeCrankRevolutions) {
                return data;
            }
        }
        return null;
    }
}
