package com.openbikecomputer.fit;

import com.openbikecomputer.model.Workout;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Minimal, self-contained decoder for the Garmin FIT binary format, supporting
 * the {@code file_id} (0), {@code workout} (26) and {@code workout_step} (27)
 * messages — enough to load structured workouts. This replaces the
 * {@code @garmin/fitsdk} dependency used by the Angular app.
 *
 * <p>Only the fields required to build a {@link Workout} are interpreted; all
 * other fields are skipped according to their declared size.</p>
 */
public final class FitDecoder {

    private static final int MESG_FILE_ID = 0;
    private static final int MESG_WORKOUT = 26;
    private static final int MESG_WORKOUT_STEP = 27;

    private FitDecoder() {
    }

    private static final class FieldDef {
        final int number;
        final int size;
        final int baseType;

        FieldDef(int number, int size, int baseType) {
            this.number = number;
            this.size = size;
            this.baseType = baseType;
        }
    }

    private static final class MessageDef {
        boolean bigEndian;
        int globalMessageNumber;
        List<FieldDef> fields = new ArrayList<>();
        List<FieldDef> devFields = new ArrayList<>();
    }

    /**
     * Decode a FIT file and build a {@link Workout}.
     *
     * @throws IOException if the byte stream is not a valid/parseable FIT workout file
     */
    public static Workout decodeWorkout(byte[] bytes, double powerThreshold, double heartRateThreshold)
            throws IOException {
        InputStream in = new ByteArrayInputStream(bytes);

        int headerSize = readUByte(in);
        if (headerSize != 12 && headerSize != 14) {
            throw new IOException("Unexpected FIT header size: " + headerSize);
        }
        readUByte(in);                       // protocol version
        readUShortLE(in);                    // profile version
        long dataSize = readUIntLE(in);      // data size
        byte[] dotFit = readBytes(in, 4);    // ".FIT"
        if (dotFit[0] != '.' || dotFit[1] != 'F' || dotFit[2] != 'I' || dotFit[3] != 'T') {
            throw new IOException("Not a FIT file (missing .FIT signature)");
        }
        if (headerSize == 14) {
            readUShortLE(in);                // CRC
        }

        Map<Integer, MessageDef> localDefs = new HashMap<>();

        String workoutName = "Unnamed Workout";
        String sport = "cycling";
        List<Workout.WorkoutStep> steps = new ArrayList<>();

        long consumed = 0;
        while (consumed < dataSize) {
            int recordHeader = in.read();
            if (recordHeader < 0) {
                break;
            }
            consumed++;

            boolean isDefinition = (recordHeader & 0x40) != 0;
            boolean compressedTimestamp = (recordHeader & 0x80) != 0;

            int localType;
            if (compressedTimestamp) {
                localType = (recordHeader >> 5) & 0x03;
            } else {
                localType = recordHeader & 0x0F;
            }

            if (isDefinition) {
                MessageDef def = new MessageDef();
                readUByte(in);                                   // reserved
                int arch = readUByte(in);
                def.bigEndian = arch == 1;
                def.globalMessageNumber = def.bigEndian ? readUShortBE(in) : readUShortLE(in);
                int numFields = readUByte(in);
                consumed += 5;
                for (int i = 0; i < numFields; i++) {
                    int fieldNum = readUByte(in);
                    int size = readUByte(in);
                    int baseType = readUByte(in);
                    def.fields.add(new FieldDef(fieldNum, size, baseType));
                    consumed += 3;
                }
                if ((recordHeader & 0x20) != 0) {                // developer fields present
                    int numDev = readUByte(in);
                    consumed++;
                    for (int i = 0; i < numDev; i++) {
                        readUByte(in);                           // field number
                        int size = readUByte(in);
                        readUByte(in);                           // dev data index
                        def.devFields.add(new FieldDef(0, size, 0));
                        consumed += 3;
                    }
                }
                localDefs.put(localType, def);
            } else {
                MessageDef def = localDefs.get(localType);
                if (def == null) {
                    throw new IOException("Data message for undefined local type " + localType);
                }
                Map<Integer, Object> fieldValues = new HashMap<>();
                for (FieldDef field : def.fields) {
                    byte[] raw = readBytes(in, field.size);
                    consumed += field.size;
                    fieldValues.put(field.number, decodeField(raw, field.baseType, def.bigEndian));
                }
                for (FieldDef field : def.devFields) {
                    readBytes(in, field.size);
                    consumed += field.size;
                }

                switch (def.globalMessageNumber) {
                    case MESG_WORKOUT:
                        if (fieldValues.get(8) != null) {
                            workoutName = (String) fieldValues.get(8);
                        }
                        if (fieldValues.get(4) != null) {
                            sport = sportName(toLong(fieldValues.get(4)));
                        }
                        break;
                    case MESG_WORKOUT_STEP:
                        steps.add(buildStep(fieldValues, powerThreshold, heartRateThreshold));
                        break;
                    case MESG_FILE_ID:
                    default:
                        break;
                }
            }
        }

        if (steps.isEmpty()) {
            throw new IOException("No workout steps found in FIT file");
        }
        return new Workout(sport, workoutName, steps);
    }

    private static Workout.WorkoutStep buildStep(Map<Integer, Object> f,
                                                 double powerThreshold, double heartRateThreshold) {
        String stepName = (String) f.get(0);
        String durationType = durationTypeName(toLong(f.get(1)));
        double durationValue = toDouble(f.get(2));
        String targetType = targetTypeName(toLong(f.get(3)));
        double low = toDouble(f.get(5));
        double high = toDouble(f.get(6));
        return Workout.WorkoutStep.fromRaw(durationType, durationValue, targetType,
                low, high, stepName, powerThreshold, heartRateThreshold);
    }

    private static String durationTypeName(Long value) {
        if (value == null) {
            return "open";
        }
        switch (value.intValue()) {
            case 0:
                return "time";
            case 1:
                return "distance";
            default:
                return "open";
        }
    }

    private static String targetTypeName(Long value) {
        if (value == null) {
            return "open";
        }
        switch (value.intValue()) {
            case 0:
                return "speed";
            case 1:
                return "heart_rate";
            case 3:
                return "cadence";
            case 4:
                return "power";
            case 7:
                return "power_3s";
            case 8:
                return "power_10s";
            case 9:
                return "power_30s";
            case 10:
                return "power_lap";
            case 12:
                return "speed_lap";
            case 13:
                return "heart_rate_lap";
            default:
                return "open";
        }
    }

    private static String sportName(Long value) {
        if (value != null && value.intValue() == 2) {
            return "cycling";
        }
        return "cycling";
    }

    // ---- FIT base-type field decoding -------------------------------------

    private static Object decodeField(byte[] raw, int baseType, boolean bigEndian) {
        if (raw.length == 0) {
            return null;
        }
        switch (baseType) {
            case 0x00: // enum
            case 0x02: // uint8
            case 0x0A: // uint8z
                return (long) (raw[0] & 0xFF);
            case 0x01: // sint8
                return (long) raw[0];
            case 0x83: // sint16
                return (long) (short) readShort(raw, bigEndian);
            case 0x84: // uint16
            case 0x8B: // uint16z
                return (long) (readShort(raw, bigEndian) & 0xFFFF);
            case 0x85: // sint32
                return (long) readInt(raw, bigEndian);
            case 0x86: // uint32
            case 0x8C: // uint32z
                return readInt(raw, bigEndian) & 0xFFFFFFFFL;
            case 0x07: // string
                return readString(raw);
            case 0x88: // float32
                return (long) Float.intBitsToFloat(readInt(raw, bigEndian));
            case 0x89: // float64
                return (long) Double.longBitsToDouble(readLong(raw, bigEndian));
            default:
                // Unknown / unsupported base type: ignore.
                return null;
        }
    }

    private static int readShort(byte[] raw, boolean bigEndian) {
        if (bigEndian) {
            return ((raw[0] & 0xFF) << 8) | (raw[1] & 0xFF);
        }
        return ((raw[1] & 0xFF) << 8) | (raw[0] & 0xFF);
    }

    private static int readInt(byte[] raw, boolean bigEndian) {
        if (bigEndian) {
            return ((raw[0] & 0xFF) << 24) | ((raw[1] & 0xFF) << 16)
                    | ((raw[2] & 0xFF) << 8) | (raw[3] & 0xFF);
        }
        return ((raw[3] & 0xFF) << 24) | ((raw[2] & 0xFF) << 16)
                | ((raw[1] & 0xFF) << 8) | (raw[0] & 0xFF);
    }

    private static long readLong(byte[] raw, boolean bigEndian) {
        long result = 0;
        if (bigEndian) {
            for (int i = 0; i < 8; i++) {
                result = (result << 8) | (raw[i] & 0xFF);
            }
        } else {
            for (int i = 7; i >= 0; i--) {
                result = (result << 8) | (raw[i] & 0xFF);
            }
        }
        return result;
    }

    private static String readString(byte[] raw) {
        int end = 0;
        while (end < raw.length && raw[end] != 0) {
            end++;
        }
        if (end == 0) {
            return null;
        }
        return new String(raw, 0, end, StandardCharsets.UTF_8);
    }

    private static Long toLong(Object o) {
        if (o instanceof Long) {
            return (Long) o;
        }
        return null;
    }

    private static double toDouble(Object o) {
        if (o instanceof Long) {
            return ((Long) o).doubleValue();
        }
        return 0.0;
    }

    // ---- low level stream helpers -----------------------------------------

    private static int readUByte(InputStream in) throws IOException {
        int b = in.read();
        if (b < 0) {
            throw new IOException("Unexpected end of FIT stream");
        }
        return b;
    }

    private static int readUShortLE(InputStream in) throws IOException {
        int b0 = readUByte(in);
        int b1 = readUByte(in);
        return (b1 << 8) | b0;
    }

    private static int readUShortBE(InputStream in) throws IOException {
        int b0 = readUByte(in);
        int b1 = readUByte(in);
        return (b0 << 8) | b1;
    }

    private static long readUIntLE(InputStream in) throws IOException {
        long b0 = readUByte(in);
        long b1 = readUByte(in);
        long b2 = readUByte(in);
        long b3 = readUByte(in);
        return (b3 << 24) | (b2 << 16) | (b1 << 8) | b0;
    }

    private static byte[] readBytes(InputStream in, int n) throws IOException {
        byte[] buf = new byte[n];
        int off = 0;
        while (off < n) {
            int r = in.read(buf, off, n - off);
            if (r < 0) {
                throw new IOException("Unexpected end of FIT stream");
            }
            off += r;
        }
        return buf;
    }
}
