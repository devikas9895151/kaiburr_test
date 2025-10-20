package com.kaiburr.taskapi.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "tasks")
public class Task {

    @Id
    private String id;
    private String name;
    private String command;
    
    // This field was missing or misspelled, causing the compiler error
    private String serverName; 
    
    private String owner;
    
    // This field and its methods were missing or misspelled
    @Field("executions")
    private List<TaskExecution> taskExecutions = new ArrayList<>();

    // Standard Constructor
    public Task() {
    }

    // --- GETTERS AND SETTERS (The methods that were 'missing') ---

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCommand() { return command; }
    public void setCommand(String command) { this.command = command; }

    // Fix for Error 4
    public String getServerName() { return serverName; }
    public void setServerName(String serverName) { this.serverName = serverName; }

    public String getOwner() { return owner; }
    public void setOwner(String owner) { this.owner = owner; }

    // Fix for Errors 2, 3, and 6
    public List<TaskExecution> getTaskExecutions() { 
        if (taskExecutions == null) {
            taskExecutions = new ArrayList<>();
        }
        return taskExecutions; 
    }
    public void setTaskExecutions(List<TaskExecution> taskExecutions) { 
        this.taskExecutions = taskExecutions; 
    }
}