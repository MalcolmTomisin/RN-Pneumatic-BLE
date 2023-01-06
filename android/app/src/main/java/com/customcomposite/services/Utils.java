package com.customcomposite.services;

import java.nio.ByteBuffer;
import java.nio.ByteOrder;
import java.util.HashMap;
import java.util.Map;

public class Utils {

    public static final String ACTION_START_SERVICE = "start service";
    public static final String ACTION_STOP_SERVICE = "stop service";
    public static final String TAG = "com.customcomposite";
    public static final String HANDLE = "handle";

    public static Map<String, Object> parseDataPacket(byte[] data) throws Exception {
        // Create a ByteBuffer for the data
        ByteBuffer buffer = ByteBuffer.wrap(data);

        // Extract the Identification code (2 bytes)
        byte[] identificationCode = new byte[2];
        buffer.get(identificationCode);
        int identificationCodeValue = ByteBuffer.wrap(identificationCode).order(ByteOrder.LITTLE_ENDIAN).getShort();

        // Extract the Data out length (1 byte)
        byte dataOutLength = buffer.get();

        // Extract the Cmd_code (1 byte)
        byte cmdCode = buffer.get();

        // Extract the Para field (variable length)
        byte para = buffer.get();

        // Extract the CRC8 field (1 byte)
        byte crc8 = buffer.get();

        // Return the parsed fields as a map
        Map<String, Object> fields = new HashMap<>();
        fields.put("identificationCode", identificationCodeValue);
        fields.put("dataOutLength", dataOutLength);
        fields.put("cmdCode", cmdCode);
        fields.put("para", para);
        fields.put("crc8", crc8);
        return fields;
    }





}
