import axios from 'axios';
import { Task } from '../types/Task';

const API_URL = 'http://localhost:8080/tasks'; // change if different

export const getTasks = () => axios.get<Task[]>(API_URL);

export const createTask = (task: Task) => axios.post(API_URL, task);

export const deleteTask = (id: string) => axios.delete(`${API_URL}/${id}`);

export const runTask = (id: string, command: string) =>
    axios.put(`${API_URL}/${id}`, { command });
