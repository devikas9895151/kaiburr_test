import React, { useState, useEffect, useCallback } from 'react';
import { Layout, Menu, Table, Button, Form, Input, Modal, Typography, Space, notification, Tag, Tooltip } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, PlayCircleOutlined, CodeOutlined } from '@ant-design/icons';

// --- TYPE DEFINITIONS & API SERVICE (Combined into App.tsx) ---

const API_BASE_URL = 'http://localhost:8080/tasks';

export interface TaskExecution {
  id?: string;
  startTime: string; // ISO Date string
  endTime: string;   // ISO Date string
  output: string;
}

export interface Task {
  id?: string;
  name: string;
  command: string;
  owner: string;
  serverName: string;
  taskExecutions?: TaskExecution[];
}

// Utility to format date for display
const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return 'Invalid Date';
    }
};


// Service class for CRUD and Command execution
class TaskService {
  // GET: Fetch all tasks
  static async getTasks(): Promise<Task[]> {
    const response = await fetch(API_BASE_URL);
    if (!response.ok) {
      throw new Error('Failed to fetch tasks.');
    }
    return response.json();
  }

  // POST: Create a new task
  static async createTask(task: Omit<Task, 'id' | 'taskExecutions'>): Promise<Task> {
    const response = await fetch(API_BASE_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (response.status !== 201) {
      const errorText = await response.text();
      throw new Error(`Failed to create task: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // PUT: Update an existing task
  static async updateTask(id: string, task: Partial<Task>): Promise<Task> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to update task: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  // DELETE: Delete a task
  static async deleteTask(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: 'DELETE',
    });

    if (response.status !== 204) {
      const errorText = await response.text();
      throw new Error(`Failed to delete task: ${response.status} - ${errorText}`);
    }
  }

  // GET: Search tasks by name
  static async searchTasks(name: string): Promise<Task[]> {
    const response = await fetch(`${API_BASE_URL}/search?name=${encodeURIComponent(name)}`);
    if (!response.ok) {
      // If the API returns 404 on empty search, return empty array gracefully
      if (response.status === 404) return []; 
      throw new Error('Failed to search tasks.');
    }
    return response.json();
  }
  
  // PUT: Run a command on the server
  static async runTaskCommand(id: string): Promise<TaskExecution> {
    const response = await fetch(`${API_BASE_URL}/${id}/run`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Command execution failed: ${response.status} - ${errorText}`);
    }
    return response.json();
  }
}

// --- Constants and Utility ---

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

// Define Form initial values for creation/editing
const initialTaskValues: Task = {
    name: '',
    command: '',
    owner: '',
    serverName: '',
    taskExecutions: [] // Initialize array for type safety
};

// --- Custom Components ---

// Component for creating/editing a task
const TaskForm: React.FC<{ initialValues: Task, onFinish: (values: Task) => void }> = ({ initialValues, onFinish }) => {
    const [form] = Form.useForm();

    // Set initial values when prop changes (for editing)
    useEffect(() => {
        form.setFieldsValue(initialValues);
    }, [initialValues, form]);

    const isEditing = !!initialValues.id;

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            initialValues={initialTaskValues}
            scrollToFirstError
        >
            <Form.Item
                label="Task Name"
                name="name"
                rules={[{ required: true, message: 'Please enter the task name' }]}
            >
                <Input placeholder="e.g., Daily Database Backup" aria-label="Task Name Input" />
            </Form.Item>
            
            <Form.Item
                label="Command"
                name="command"
                rules={[{ required: true, message: 'Please enter the command to execute' }]}
                tooltip="The shell command to run on the server (e.g., /bin/sh -c 'echo Hello')"
            >
                <TextArea rows={2} placeholder="e.g., echo 'Backup complete'" aria-label="Command Input" />
            </Form.Item>

            <Form.Item
                label="Owner"
                name="owner"
                rules={[{ required: true, message: 'Please specify the task owner' }]}
            >
                <Input placeholder="e.g., John Doe" aria-label="Owner Input" />
            </Form.Item>
            
            <Form.Item
                label="Server Name"
                name="serverName"
                rules={[{ required: true, message: 'Please specify the server name' }]}
            >
                <Input placeholder="e.g., prod-server-1" aria-label="Server Name Input" />
            </Form.Item>
            
            <Button type="primary" htmlType="submit" block aria-label={isEditing ? "Save Changes" : "Create Task"}>
                {isEditing ? 'Save Changes' : 'Create Task'}
            </Button>
        </Form>
    );
};

// Component to view command output
const CommandOutputView: React.FC<{ executions: TaskExecution[] }> = ({ executions }) => {
    if (!executions || executions.length === 0) {
        return <Text disabled>No execution history available.</Text>;
    }

    // Get the most recent execution
    const latestExecution = executions[executions.length - 1];

    const getStatusTag = (execution: TaskExecution) => {
        // NOTE: Status determination here is simplified based on output content or end time
        if (execution.output && execution.output.toLowerCase().includes('error') || execution.output.includes('Failed to clean up pod')) {
             return <Tag color="error">Failed</Tag>;
        }
        if (execution.endTime && execution.output) {
            return <Tag color="success">Succeeded</Tag>;
        }
        return <Tag color="processing">Running/Unknown</Tag>;
    };

    return (
        <Space direction="vertical" style={{ width: '100%' }}>
            <Title level={5}>Latest Execution</Title>
            <Space>
                <Text strong>Status:</Text> {getStatusTag(latestExecution)}
                <Text strong>Start:</Text> {formatDate(latestExecution.startTime)}
                <Text strong>End:</Text> {formatDate(latestExecution.endTime)}
            </Space>

            <Title level={5} style={{ marginBottom: 4 }}>Output:</Title>
            <div 
                style={{ 
                    padding: 10, 
                    backgroundColor: '#1f1f1f', 
                    color: '#00ff00', 
                    fontFamily: 'monospace', 
                    whiteSpace: 'pre-wrap', 
                    maxHeight: 300, 
                    overflowY: 'auto',
                    borderRadius: 8
                }}
                role="log"
                aria-live="polite" 
            >
                {latestExecution.output || 'No output recorded.'}
            </div>
        </Space>
    );
};


// --- Main Application Component ---

const App: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [activeView, setActiveView] = useState<'list' | 'output'>('list');
    const [selectedTaskForOutput, setSelectedTaskForOutput] = useState<Task | null>(null);

    // Fetch data from backend API
    const fetchTasks = useCallback(async () => {
        setLoading(true);
        try {
            const data = await TaskService.getTasks();
            setTasks(data);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to load tasks from the API.' });
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Handle search logic
    const handleSearch = useCallback(async (value: string) => {
        if (value.trim() === '') {
            fetchTasks(); // If search is empty, reload all
            return;
        }

        setLoading(true);
        try {
            const data = await TaskService.searchTasks(value);
            setTasks(data);
        } catch (error) {
            notification.error({ message: 'Error', description: 'Failed to execute search.' });
            setTasks([]); // Clear tasks on search error
        } finally {
            setLoading(false);
        }
    }, [fetchTasks]);

    // Handle creation and updating
    const handleFormSubmit = async (values: Task) => {
        try {
            let updatedList: Task[];
            if (editingTask) {
                // Update existing task
                const result = await TaskService.updateTask(editingTask.id!, values);
                updatedList = tasks.map(t => (t.id === result.id ? result : t));
                notification.success({ message: 'Success', description: `Task "${result.name}" updated.` });
            } else {
                // Create new task
                const result = await TaskService.createTask(values);
                updatedList = [...tasks, result];
                notification.success({ message: 'Success', description: `Task "${result.name}" created.` });
            }
            
            setTasks(updatedList);
            setIsModalVisible(false);
            setEditingTask(null);
        } catch (error) {
            notification.error({ message: 'Error', description: (error as Error).message });
            console.error(error);
        }
    };
    
    // Handle deletion
    const handleDelete = (id: string, name: string) => {
        Modal.confirm({
            title: `Are you sure you want to delete task "${name}"?`,
            icon: <DeleteOutlined />,
            content: 'This action cannot be undone.',
            okText: 'Yes, Delete',
            okType: 'danger',
            cancelText: 'No',
            onOk: async () => {
                try {
                    await TaskService.deleteTask(id);
                    setTasks(tasks.filter(t => t.id !== id));
                    notification.success({ message: 'Success', description: `Task "${name}" deleted.` });
                } catch (error) {
                    notification.error({ message: 'Error', description: (error as Error).message });
                    console.error(error);
                }
            },
        });
    };

    // Handle command execution
    const handleRunCommand = async (task: Task) => {
        setLoading(true);
        setSelectedTaskForOutput(task);
        setActiveView('output');
        
        try {
            notification.info({ 
                message: 'Executing Command', 
                description: `Running command for task "${task.name}"...`,
                duration: 5,
                icon: <CodeOutlined />
            });

            // The backend returns the TaskExecution object
            const executionResult = await TaskService.runTaskCommand(task.id!);
            
            // Reload all tasks to get the updated task object with the new execution in its list
            await fetchTasks();
            
            notification.success({ 
                message: 'Command Complete', 
                description: `Execution ID: ${executionResult.id ? executionResult.id.substring(0, 8) : 'N/A'}`,
                duration: 4
            });

            // Find the updated task from the refreshed list to show its output
            const updatedTask = tasks.find(t => t.id === task.id);
            if (updatedTask) {
                setSelectedTaskForOutput(updatedTask);
            }

        } catch (error) {
            notification.error({ message: 'Execution Failed', description: (error as Error).message });
            console.error(error);
        } finally {
            setLoading(false);
        }
    };
    
    // Setup Table Columns
    const columns = [
        { title: 'Task Name', dataIndex: 'name', key: 'name', sorter: (a: Task, b: Task) => a.name.localeCompare(b.name) },
        { title: 'Owner', dataIndex: 'owner', key: 'owner' },
        { title: 'Server', dataIndex: 'serverName', key: 'serverName' },
        { title: 'Command', dataIndex: 'command', key: 'command', render: (text: string) => (
            <Tooltip title={text}>
                <Text code ellipsis style={{ maxWidth: 200 }}>{text}</Text>
            </Tooltip>
        )},
        {
            title: 'Actions',
            key: 'actions',
            width: 250,
            render: (text: any, record: Task) => (
                <Space size="middle">
                    <Button 
                        icon={<PlayCircleOutlined />} 
                        onClick={() => handleRunCommand(record)}
                        disabled={loading}
                        aria-label={`Run command for task ${record.name}`}
                    >
                        Run
                    </Button>
                    <Button 
                        icon={<EditOutlined />} 
                        onClick={() => {
                            setEditingTask(record);
                            setIsModalVisible(true);
                        }}
                        aria-label={`Edit task ${record.name}`}
                    />
                    <Button 
                        icon={<DeleteOutlined />} 
                        danger 
                        onClick={() => handleDelete(record.id!, record.name)}
                        aria-label={`Delete task ${record.name}`}
                    />
                </Space>
            ),
        },
    ];

    // Helper function to render the correct view
    const renderContent = () => {
        if (activeView === 'output' && selectedTaskForOutput) {
            return (
                <div className="p-6 bg-white rounded-lg shadow-md" role="main">
                    <Title level={3} className="text-gray-800">
                        Command Output: <Text mark>{selectedTaskForOutput.name}</Text>
                    </Title>
                    <Button 
                        onClick={() => { setActiveView('list'); setSelectedTaskForOutput(null); }} 
                        style={{ marginBottom: 16 }}
                        aria-label="Back to Task List"
                    >
                        ← Back to List
                    </Button>
                    <CommandOutputView executions={selectedTaskForOutput.taskExecutions || []} />
                </div>
            );
        }

        return (
            <div className="p-6 bg-white rounded-lg shadow-md" role="main">
                <Title level={3} className="text-gray-800">Task Management Dashboard</Title>
                
                <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                    <Button 
                        type="primary" 
                        icon={<PlusOutlined />} 
                        onClick={() => {
                            setEditingTask(null);
                            setIsModalVisible(true);
                        }}
                        aria-label="Add New Task"
                    >
                        Add New Task
                    </Button>
                    <Input.Search
                        placeholder="Search tasks by name"
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                        aria-label="Search Tasks"
                    />
                </Space>

                <Table
                    columns={columns}
                    dataSource={tasks}
                    rowKey="id"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 'max-content' }}
                    className="ant-table-striped"
                    aria-label="List of tasks"
                />

                <Modal
                    title={editingTask ? 'Edit Task' : 'Create New Task'}
                    open={isModalVisible}
                    onCancel={() => { setIsModalVisible(false); setEditingTask(null); }}
                    footer={null}
                    destroyOnClose={true} // Re-render form on close/open
                    maskClosable={!loading} // Prevent closing while processing
                    aria-modal="true"
                    aria-labelledby={editingTask ? 'modal-edit-task-title' : 'modal-create-task-title'}
                >
                    <TaskForm 
                        initialValues={editingTask || initialTaskValues} 
                        onFinish={handleFormSubmit} 
                    />
                </Modal>
            </div>
        );
    };

    return (
        <Layout style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}>
            <Header style={{ backgroundColor: '#001529', color: 'white', display: 'flex', alignItems: 'center' }} role="banner">
                <Title level={3} style={{ color: 'white', margin: 0 }}>Kaiburr Task API UI</Title>
            </Header>
            <Layout>
                <Sider breakpoint="lg" collapsedWidth="0" theme="light">
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['list']}
                        style={{ height: '100%', borderRight: 0 }}
                        items={[
                            { key: 'list', label: 'Task Dashboard', icon: <CodeOutlined />, onClick: () => setActiveView('list') },
                        ]}
                        role="navigation"
                    />
                </Sider>
                <Content style={{ padding: 24, margin: 0, backgroundColor: '#f0f2f5' }} role="main">
                    {renderContent()}
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
