package com.kaiburr.taskapi.repository;

import com.kaiburr.taskapi.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TaskRepository extends MongoRepository<Task, String> {
    
    // Custom method for efficient, case-insensitive search
    List<Task> findByNameContainingIgnoreCase(String name);
}