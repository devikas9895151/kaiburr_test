# 🚀 Kaiburr Task Application

![Java](https://img.shields.io/badge/Java-17-blue?logo=java)
![Spring Boot](https://img.shields.io/badge/SpringBoot-2.7-green?logo=springboot)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-brightgreen?logo=mongodb)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)
![GitHub Actions](https://img.shields.io/badge/CI/CD-GitHub%20Actions-blue?logo=githubactions)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## 🧩 Overview

This repository contains a **full-stack web application** developed as part of the **Kaiburr Internship Tasks**.  
It demonstrates:
- **Task 1:** Backend API using **Spring Boot + MongoDB**  
- **Task 3:** Frontend built with **React 19 + TypeScript + Ant Design**  
- **Task 4:** **CI/CD pipeline** using **GitHub Actions** with **Docker** integration  

---

## ⚙️ Task 1: Backend (Spring Boot + MongoDB)

### 🛠️ Tech Stack
- Java 17  
- Spring Boot 2.7  
- MongoDB  
- Maven  

### ✨ Features
- RESTful CRUD operations  
- MongoDB integration  
- API tested with Postman / Axios  

### ▶️ Run Backend
```bash
mvn clean install
mvn spring-boot:run
📡 API Endpoints
Method	Endpoint	Description
GET	/tasks	Get all tasks
POST	/tasks	Create a new task
PUT	/tasks/{id}	Update a task
DELETE	/tasks/{id}	Delete a task

Example MongoDB document:

{
  "_id": "6714f821cded09b10173e0b1",
  "name": "Deploy App",
  "description": "Setup CI/CD for Kaiburr project",
  "status": "In Progress"
}

💻 Task 3: Frontend (React 19 + TypeScript + Ant Design)
🧰 Tech Stack

React 19

TypeScript

Ant Design

Axios

🎯 Features

View, add, update, and delete tasks

Search by task name

Responsive Ant Design UI

Communicates with Spring Boot API

▶️ Run Frontend
cd frontend
npm install
npm start


The app runs at:
👉 http://localhost:3000
and connects to the backend at:
👉 http://localhost:8080

🐳 Task 4: CI/CD Pipeline (GitHub Actions + Docker)

A GitHub Actions workflow automates:

Code Checkout

Java Setup (JDK 17)

Maven Build

Docker Build

📜 Workflow File: .github/workflows/main.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ "main" ]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v3

      - name: Set up JDK 17
        uses: actions/setup-java@v3
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Build with Maven
        run: mvn clean package -DskipTests

      - name: Build Docker Image
        run: docker build -t kaiburr-taskapi .

🧱 Docker Setup
🐋 Dockerfile
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY target/taskapi-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]

▶️ Build and Run Container
docker build -t taskapi:latest .
docker run -p 8080:8080 taskapi:latest

🧭 Architecture Diagram
Frontend (React + Ant Design)
         |
         v
Backend (Spring Boot API)
         |
         v
MongoDB (Local or Cloud)



Replace these placeholders with actual screenshots from your project

UI Preview	API in thunder client

	
✅ Output Summary
Component	Status	Description
Spring Boot API	✅ Working	CRUD operations tested
React UI	✅ Working	User interface for tasks
Docker	✅ Working	Built & containerized successfully
GitHub Actions	✅ Working	Automated CI/CD pipeline

