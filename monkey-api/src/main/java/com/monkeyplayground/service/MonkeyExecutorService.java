package com.monkeyplayground.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.monkeyplayground.model.RunResponse;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class MonkeyExecutorService {

    private static final Logger log = LoggerFactory.getLogger(MonkeyExecutorService.class);

    private final ObjectMapper objectMapper;
    private final String binaryPath;
    private final long timeoutSeconds;

    public MonkeyExecutorService(
            ObjectMapper objectMapper,
            @Value("${monkey.binary.path:/app/monkey-server}") String binaryPath,
            @Value("${monkey.execution.timeout:10}") long timeoutSeconds
    ) {
        this.objectMapper = objectMapper;
        this.binaryPath = binaryPath;
        this.timeoutSeconds = timeoutSeconds;
    }

    public RunResponse execute(String code) {
        ProcessBuilder pb = new ProcessBuilder(binaryPath, "--stdin");
        pb.environment().clear();
        pb.redirectErrorStream(false);

        Process process;
        try {
            process = pb.start();
        } catch (IOException e) {
            log.debug("Failed to start interpreter process", e);
            return new RunResponse(null, "Interpreter binary not found at: " + binaryPath);
        }

        ExecutorService ioExecutor = Executors.newFixedThreadPool(2);
        Future<String> stdoutFuture = null;
        Future<String> stderrFuture = null;

        try {
            stdoutFuture = ioExecutor.submit(readFullyTask(process.getInputStream()));
            stderrFuture = ioExecutor.submit(readFullyTask(process.getErrorStream()));

            try (OutputStream stdin = process.getOutputStream()) {
                stdin.write(code.getBytes(StandardCharsets.UTF_8));
                stdin.flush();
            }

            boolean finished = process.waitFor(timeoutSeconds, TimeUnit.SECONDS);
            if (!finished) {
                process.destroyForcibly();
                return new RunResponse(null, "Execution timed out after 10 seconds.");
            }

            String stdout = safeGet(stdoutFuture);
            String stderr = safeGet(stderrFuture);

            if (stdout == null || stdout.isBlank()) {
                return new RunResponse(null,
                        "Internal error: could not parse interpreter output. stderr: " + (stderr == null ? "" : stderr));
            }

            try {
                return objectMapper.readValue(stdout, RunResponse.class);
            } catch (Exception parseException) {
                log.debug("Failed to parse interpreter JSON output. stdout='{}' stderr='{}'", stdout, stderr, parseException);
                return new RunResponse(null,
                        "Internal error: could not parse interpreter output. stderr: " + (stderr == null ? "" : stderr));
            }
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            return new RunResponse(null, "Execution timed out after 10 seconds.");
        } catch (Exception e) {
            log.debug("Unexpected error executing code", e);
            process.destroyForcibly();
            return new RunResponse(null, "Internal error: " + (e.getMessage() == null ? "Unknown error" : e.getMessage()));
        } finally {
            if (stdoutFuture != null && !stdoutFuture.isDone()) {
                stdoutFuture.cancel(true);
            }
            if (stderrFuture != null && !stderrFuture.isDone()) {
                stderrFuture.cancel(true);
            }
            ioExecutor.shutdownNow();
        }
    }

    private Callable<String> readFullyTask(InputStream in) {
        return () -> {
            byte[] bytes = in.readAllBytes();
            return new String(bytes, StandardCharsets.UTF_8);
        };
    }

    private String safeGet(Future<String> future) {
        if (future == null) {
            return "";
        }
        try {
            return future.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            future.cancel(true);
            return "";
        } catch (ExecutionException e) {
            return "";
        }
    }
}
