import React, { useEffect, useState } from 'react';
import { Table, Button, Input, Space, Modal, message } from 'antd';
import { Task } from '../types/Task';
import { getTasks, deleteTask, runTask } from '../services/taskService';

const { Search } = Input;

const TaskTable: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await getTasks();
            setTasks(res.data);
        } catch (err) {
            message.error('Failed to fetch tasks');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id?: string) => {
        if (!id) return;
        await deleteTask(id);
        message.success('Task deleted');
        fetchTasks();
    };

    const handleRun = async (task: Task) => {
        if (!task.id) return;
        const res = await runTask(task.id, task.command);
        message.success('Command executed');
        fetchTasks();
    };

    const columns = [
        { title: 'Name', dataIndex: 'name', key: 'name' },
        { title: 'Description', dataIndex: 'description', key: 'description' },
        { title: 'Command', dataIndex: 'command', key: 'command' },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: Task) => (
                <Space>
                    <Button onClick={() => handleRun(record)} type="primary">
                        Run
                    </Button>
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Delete
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <Search
                placeholder="Search tasks"
                onSearch={(value) =>
                    setTasks(
                        tasks.filter(
                            (t) =>
                                t.name.includes(value) ||
                                t.description.includes(value)
                        )
                    )
                }
                style={{ marginBottom: 16, width: 300 }}
            />
            <Table
                dataSource={tasks}
                columns={columns}
                rowKey="id"
                loading={loading}
            />
        </div>
    );
};

export default TaskTable;
