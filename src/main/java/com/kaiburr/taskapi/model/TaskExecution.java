package com.kaiburr.taskapi.model;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TaskExecution {
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private String output;
}
