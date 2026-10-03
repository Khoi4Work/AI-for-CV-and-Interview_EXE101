package fpt.su26.exe101.backend.base.config;

import org.springframework.ai.embedding.EmbeddingModel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

@Configuration
public class AIEmbeddingConfig {

    @Bean
    @Primary
    EmbeddingModel vectorStoreEmbeddingModel(
            @Qualifier("googleGenAiTextEmbedding") EmbeddingModel geminiEmbeddingModel) {
        return geminiEmbeddingModel;
    }
}
