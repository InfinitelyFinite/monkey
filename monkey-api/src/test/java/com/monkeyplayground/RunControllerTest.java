package com.monkeyplayground;

import com.monkeyplayground.model.RunResponse;
import com.monkeyplayground.service.MonkeyExecutorService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
public class RunControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonkeyExecutorService monkeyExecutorService;

    @Test
    void postRun_validCode_returns200() throws Exception {
        Mockito.when(monkeyExecutorService.execute(Mockito.anyString()))
                .thenReturn(new RunResponse("ok", null));

        mockMvc.perform(post("/api/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"let a = 1;\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.output").value("ok"))
                .andExpect(jsonPath("$.error").value(Matchers.nullValue()));
    }

    @Test
    void postRun_emptyCode_returns400() throws Exception {
        mockMvc.perform(post("/api/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.output").value(Matchers.nullValue()))
                .andExpect(jsonPath("$.error").value(Matchers.not(Matchers.blankOrNullString())));
    }

    @Test
    void postRun_nullCode_returns400() throws Exception {
        mockMvc.perform(post("/api/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":null}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.output").value(Matchers.nullValue()))
                .andExpect(jsonPath("$.error").value(Matchers.not(Matchers.blankOrNullString())));
    }

    @Test
    void postRun_tooLongCode_returns400() throws Exception {
        String longCode = "a".repeat(10001);

        mockMvc.perform(post("/api/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"code\":\"" + longCode + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.output").value(Matchers.nullValue()))
                .andExpect(jsonPath("$.error").value(Matchers.not(Matchers.blankOrNullString())));
    }
}
