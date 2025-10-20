package com.kaiburr.taskapi.controller;

import com.kaiburr.taskapi.model.Task;
import com.kaiburr.taskapi.model.TaskExecution;
import com.kaiburr.taskapi.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Imports required for K8s API
import io.fabric8.kubernetes.api.model.ContainerBuilder;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.PodBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
// End K8s imports

import java.io.BufferedReader; // No longer needed for K8s logs, but harmless to keep
import java.io.InputStreamReader; // No longer needed for K8s logs, but harmless to keep
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskRepository taskRepository;

    // GET all tasks
    @GetMapping
    public ResponseEntity<List<Task>> getAllTasks() {
        return ResponseEntity.ok(taskRepository.findAll());
    }

    // GET task by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getTaskById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                // FIX: Type casting to resolve incompatible bounds error
                .orElse((ResponseEntity) ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found")); 
    }

    // Search tasks by name (Optimized repository search)
    @GetMapping("/search")
    public ResponseEntity<List<Task>> searchTasks(@RequestParam String name) {
        List<Task> tasks = taskRepository.findByNameContainingIgnoreCase(name); 
        
        if (tasks.isEmpty())
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new ArrayList<>());
        return ResponseEntity.ok(tasks);
    }

    // POST → create a new task
    @PostMapping
    public ResponseEntity<?> addTask(@RequestBody Task task) {
        // FIX: Removed the incorrect check for task.getId(). 
        // MongoDB will now generate a unique ID for new tasks upon saving.
        
        if (task.getTaskExecutions() == null) {
            task.setTaskExecutions(new ArrayList<>());
        }
        
        return ResponseEntity.status(HttpStatus.CREATED).body(taskRepository.save(task));
    }

    // PUT → Update an existing task details
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(@PathVariable String id, @RequestBody Task updatedTask) {
        return taskRepository.findById(id)
            .map(existingTask -> {
                // Update all fields from the request body
                existingTask.setName(updatedTask.getName());
                existingTask.setCommand(updatedTask.getCommand());
                existingTask.setOwner(updatedTask.getOwner()); 
                existingTask.setServerName(updatedTask.getServerName());

                return ResponseEntity.ok(taskRepository.save(existingTask));
            })
            // FIX: Type casting to resolve incompatible bounds error
            .orElse((ResponseEntity) ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found")); 
    }
    
    // DELETE → delete a task by ID
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(task -> {
                    taskRepository.delete(task);
                    return ResponseEntity.noContent().build(); // HTTP 204
                })
                // FIX: Type casting to resolve incompatible bounds error
                .orElse((ResponseEntity) ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found")); 
    }

    // PUT → run a task and save TaskExecution (K8s API implementation)
    @PutMapping("/{id}/run")
    public ResponseEntity<?> runTask(@PathVariable String id) {
        return taskRepository.findById(id)
            .map(task -> {
                Pod executionPod = null;
                // KubernetesClient will use the ServiceAccount credentials from the K8s deployment
                try (KubernetesClient client = new KubernetesClientBuilder().build()) {
                    TaskExecution te = new TaskExecution();
                    te.setStartTime(LocalDateTime.now());

                    String commandString = task.getCommand();
                    
                    // 1. Create a Pod definition
                    executionPod = client.pods().resource(new PodBuilder()
                        .withNewMetadata()
                            .withGenerateName("task-exec-")
                            .withLabels(new java.util.HashMap<>(java.util.Map.of("app", "task-executor")))
                        .endMetadata()
                        .withNewSpec()
                            .withRestartPolicy("OnFailure") // Pod does not restart on completion
                            .withContainers(new ContainerBuilder()
                                .withName("executor-container")
                                .withImage("busybox") // Lightweight image for shell commands
                                .withCommand("/bin/sh", "-c") 
                                .withArgs(commandString) 
                                .build())
                        .endSpec()
                        .build()).create();

                    // 2. Wait for the pod to complete (max 5 minutes)
                    client.pods().resource(executionPod)
                              .waitUntilCondition(p -> 
                                  p.getStatus().getPhase().equals("Succeeded") || p.getStatus().getPhase().equals("Failed"), 
                                  5, java.util.concurrent.TimeUnit.MINUTES);

                    // 3. Retrieve logs (output)
                    String output = client.pods().withName(executionPod.getMetadata().getName()).getLog();
                    
                    te.setEndTime(LocalDateTime.now());
                    te.setOutput(output);

                    // 4. Update Task with the execution record
                    task.getTaskExecutions().add(te);
                    taskRepository.save(task);

                    return ResponseEntity.ok(te);

                } catch (Exception e) {
                    e.printStackTrace();
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                            .body("Error executing command via K8s: " + e.getMessage());
                } finally {
                    // 5. Clean up: Delete the Pod
                    if (executionPod != null) {
                        try (KubernetesClient client = new KubernetesClientBuilder().build()) {
                            client.pods().resource(executionPod).delete();
                        } catch (Exception cleanupException) {
                            System.err.println("Failed to clean up pod: " + cleanupException.getMessage());
                        }
                    }
                }
            })
            // FIX: Type casting to resolve incompatible bounds error
            .orElse((ResponseEntity) ResponseEntity.status(HttpStatus.NOT_FOUND).body("Task not found")); 
    }
}
