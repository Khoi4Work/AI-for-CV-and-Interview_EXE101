package fpt.su26.exe101.backend.base.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.google.genai.GoogleGenAiChatModel;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AIChatClientConfig {

    @Bean("geminiChatClient")
    ChatClient geminiChatClient(GoogleGenAiChatModel model) {
        return ChatClient.builder(model).build();
    }

    @Bean("groqChatClient")
    ChatClient groqChatClient(OpenAiChatModel model) {
        return ChatClient.builder(model).build();
    }
}
