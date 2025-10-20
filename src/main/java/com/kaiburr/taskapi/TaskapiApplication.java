package com.kaiburr.taskapi;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
// FIX: Explicitly tells Spring to scan the 'taskapi' package AND the sibling 'config' package, 
// ensuring WebConfig is loaded.
@ComponentScan({"com.kaiburr.taskapi", "com.kaiburr.config"}) 
public class TaskapiApplication {

	public static void main(String[] args) {
		SpringApplication.run(TaskapiApplication.class, args);
	}
}
