package fpt.su26.exe101.backend.modules.payment.util;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.stream.Collectors;
import java.util.Map;
import java.util.TreeMap;

@Slf4j
@Component
public class PayOSChecksumUtil {

    private static final String HMAC_SHA256 = "HmacSHA256";

    public String calculateChecksum(String checksumKey, Map<String, Object> params) {
        try {
            // PayOS requires parameters to be sorted alphabetically by key
            TreeMap<String, Object> sortedParams = new TreeMap<>(params);

            StringBuilder sb = new StringBuilder();
            sortedParams.forEach((key, value) -> {
                if (value != null) {
                    sb.append(key).append("=").append(value).append("&");
                }
            });

            // Remove the trailing '&'
            if (sb.length() > 0) {
                sb.setLength(sb.length() - 1);
            }

            String data = sb.toString();
            return hmacSha256(data, checksumKey);
        } catch (Exception e) {
            log.error("[PAYMENT] Signature calculation failed | errorType={}",
                    e.getClass().getSimpleName(), e);
            throw new RuntimeException("Checksum calculation failed", e);
        }
    }

    private String hmacSha256(String data, String key) throws NoSuchAlgorithmException, InvalidKeyException {
        SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        Mac mac = Mac.getInstance(HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] hash = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        // PayOS requires the signature in Hexadecimal format, not Base64
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) {
                hexString.append('0');
            }
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
