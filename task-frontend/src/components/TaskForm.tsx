import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { createTask } from '../services/taskService';
import { Task } from '../types/Task';

const TaskForm: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
    const [form] = Form.useForm();

    const onFinish = async (values: Task) => {
        try {
            await createTask(values);
            message.success('Task created');
            form.resetFields();
            onSuccess();
        } catch (err) {
            message.error('Failed to create task');
        }
    };

    return (
        <Form form={form} layout="vertical" onFinish={onFinish}>
            <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please enter task name' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Description"
                name="description"
                rules={[
                    { required: true, message: 'Please enter description' },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                label="Command"
                name="command"
                rules={[{ required: true, message: 'Please enter command' }]}
            >
                <Input />
            </Form.Item>
            <Form.Item>
                <Button type="primary" htmlType="submit">
                    Create Task
                </Button>
            </Form.Item>
        </Form>
    );
};

export default TaskForm;
