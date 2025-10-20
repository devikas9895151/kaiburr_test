package com.kaiburr.taskapi.util;

import java.util.Set;
import java.util.regex.Pattern;

public class CommandValidator {

    // Whitelist of allowed base commands for this exercise (change as needed)
    private static final Set<String> ALLOWED_BASE_COMMANDS = Set.of(
            "echo", "date", "uname", "whoami", "ls", "pwd", "cat", "uptime"
    );

    // Reject dangerous characters / operators
    private static final Pattern FORBIDDEN = Pattern.compile("[;&|`$<>\\\\\\n]");

    public static boolean isSafe(String command) {
        if (command == null || command.isBlank()) return false;
        if (FORBIDDEN.matcher(command).find()) return false; // has dangerous chars
        String[] parts = command.trim().split("\\s+");
        String base = parts[0];
        return ALLOWED_BASE_COMMANDS.contains(base);
    }
}
