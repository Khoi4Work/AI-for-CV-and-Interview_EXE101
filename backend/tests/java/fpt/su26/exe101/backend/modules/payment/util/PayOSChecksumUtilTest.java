package fpt.su26.exe101.backend.modules.payment.util;

import org.junit.jupiter.api.Test;
import java.util.LinkedHashMap;
import java.util.Map;
import static org.junit.jupiter.api.Assertions.*;

class PayOSChecksumUtilTest {
    private final PayOSChecksumUtil checksum = new PayOSChecksumUtil();
    private static final String KEY = "test-checksum-key";

    // Golden signatures independently generated with Node's crypto.createHmac, not this utility.
    @Test void preservesCheckoutSignatureAndAlphabeticalSorting() {
        Map<String, Object> data = new LinkedHashMap<>();
        data.put("returnUrl", "https://example.test/return");
        data.put("orderCode", 1792740200L);
        data.put("amount", 59000);
        data.put("description", "Pay CV Enhance");
        data.put("cancelUrl", "https://example.test/cancel");
        assertEquals("cb723591bd0098abcebd6b3bab4f849e7672a87b739dcdd67b45c3d0c3b9fce8",
                checksum.calculateChecksum(KEY, data));
    }

    @Test void retainsNullWebhookFieldAndDoesNotMutateInput() {
        Map<String, Object> data = new LinkedHashMap<>(Map.of(
                "orderCode", 1792740200L, "amount", 59000, "code", "00", "desc", "success"));
        data.put("counterAccountName", null);
        assertEquals("a969694f70c8a12fa0effd5c8811b8ead356b398c4a5ea698aea9f42f0caad49",
                checksum.calculateChecksum(KEY, data));
        assertTrue(data.containsKey("counterAccountName"));
        assertNull(data.get("counterAccountName"));
        Map<String, Object> missingField = new LinkedHashMap<>(data);
        missingField.remove("counterAccountName");
        assertNotEquals(checksum.calculateChecksum(KEY, data), checksum.calculateChecksum(KEY, missingField));
    }

    @Test void normalizesNullLiteralsButPreservesZeroAndFalse() {
        Map<String, Object> data = new LinkedHashMap<>(Map.of(
                "empty", "", "nullString", "null", "undefinedString", "undefined", "zero", 0, "falseValue", false));
        data.put("nullValue", null);
        assertEquals("96fc0a50b590411ff2df1c5c1f6d271c4651afed520c2f6eb647780dcb6d798f",
                checksum.calculateChecksum(KEY, data));
    }
}
