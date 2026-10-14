package fpt.su26.exe101.backend.modules.cv.dto.response;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNull;

class CVOptimizationResultResponseDTOTest {
    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void ignoresUntrustedModelScoreAndExposesOnlyRubricScore() throws Exception {
        CVOptimizationResultResponseDTO result = mapper.readValue(
                "{\"predictedScore\":99,\"postOptimizationScore\":76}",
                CVOptimizationResultResponseDTO.class);

        assertNull(result.getPredictedScore());
        assertEquals(76, result.getPostOptimizationScore());
        assertFalse(mapper.writeValueAsString(result).contains("predictedScore"));
    }
}
