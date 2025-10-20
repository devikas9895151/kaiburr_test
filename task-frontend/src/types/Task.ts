export interface Task {
    id?: string; // optional for new tasks
    name: string;
    description: string;
    command: string;
    output?: string;
}
