import React, { useEffect, useState } from 'react';
import { Button, Card, Modal, Form, Input, Row, Col, Select, TimePicker, Progress} from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import moment from 'moment';

interface Subjects {
    id: string;
    title: string;
    duration: number;
    description: string;
    day: string;
    hour: string;
    contentLearned: string;
    sessions: number;
}

type Goals = Record<string, number>;

const { Option } = Select;

const TienDoHocTap: React.FC = () => {
    const [subjects, setSubjects] = useState<Subjects[]>([]);
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingSubject, setEditingSubject] = useState<Subjects | null>(null);
    const [goals, setGoals] = useState<Goals>({});
    const [isGoalModalVisible, setIsGoalModalVisible] = useState<boolean>(false);

    const [form] = Form.useForm();
    const [goalForm] = Form.useForm();

    useEffect(() => {
        const sbj = localStorage.getItem('subjects');
        if (sbj) {
            setSubjects(JSON.parse(sbj));
        } else {
            setSubjects([
                { id: '1', title: 'Toán', duration: 2, description: 'Môn Toán', day: 'Thứ Hai', hour: '08:00', contentLearned: '', sessions: 0 },
                { id: '2', title: 'Văn', duration: 2, description: 'Môn Văn', day: 'Thứ Ba', hour: '10:00', contentLearned: '', sessions: 0 },
                { id: '3', title: 'Anh', duration: 2, description: 'Môn Anh', day: 'Thứ Tư', hour: '14:00', contentLearned: '', sessions: 0 },
                { id: '4', title: 'Khoa học', duration: 2, description: 'Môn Khoa học', day: 'Thứ Năm', hour: '16:00', contentLearned: '', sessions: 0 },
                { id: '5', title: 'Công nghệ', duration: 2, description: 'Môn Công nghệ', day: 'Thứ Sáu', hour: '18:00', contentLearned: '', sessions: 0 }
            ]);
        }

        const storedGoals = localStorage.getItem('goals');
        if (storedGoals) {
            setGoals(JSON.parse(storedGoals));
        }
    }, []);

    const saveSubjectsToLocalStorage = (newSubjects: Subjects[]) => {
        localStorage.setItem('subjects', JSON.stringify(newSubjects));
    };

    const saveGoalsToLocalStorage = (newGoals: Goals) => {
        localStorage.setItem('goals', JSON.stringify(newGoals));
    };

    const openModal = (subject?: Subjects) => {
        setIsModalVisible(true);
        if (subject) {
            setEditingSubject(subject);
            form.setFieldsValue({
                ...subject,
                hour: moment(subject.hour, 'HH:mm')
            });
        } else {
            setEditingSubject(null);
            form.resetFields();
        }
    };

    const openGoalModal = () => {
        setIsGoalModalVisible(true);
        goalForm.setFieldsValue(goals);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setIsGoalModalVisible(false);
    };

    const handleFinish = (values: Omit<Subjects, 'id'>) => {
        const formattedValues = {
            ...values,
            duration: Math.floor(values.duration),
            hour: moment(values.hour, 'HH:mm').format('HH:mm'),
            sessions: 0
        };

        if (editingSubject) {
            const updatedTasks = subjects.map((t) =>
                t.id === editingSubject.id ? { ...t, ...formattedValues } : t
            );
            setSubjects(updatedTasks);
            saveSubjectsToLocalStorage(updatedTasks);
        } else {
            const newTask: Subjects = {
                id: uuidv4(),
                ...formattedValues,
            };
            const updatedTasks = [newTask, ...subjects];
            setSubjects(updatedTasks);
            saveSubjectsToLocalStorage(updatedTasks);
        }
        setIsModalVisible(false);
    };

    const handleGoalFinish = (values: Goals) => {
        setGoals(values);
        saveGoalsToLocalStorage(values);
        setIsGoalModalVisible(false);
    };

    const deleteTask = (taskId: string) => {
        const updatedTasks = subjects.filter((t) => t.id !== taskId);
        setSubjects(updatedTasks);
        saveSubjectsToLocalStorage(updatedTasks);
    };

    const calculateProgress = (subjectId: string) => {
        const subject = subjects.find((s) => s.id === subjectId);
        if (!subject || !goals[subjectId]) return 0;
        return ((subject.duration / goals[subjectId]) * 100).toFixed();
    };

    return (
        <div style={{ justifyContent : 'center' }}>
            <h1>Tiến độ học tập</h1>
            <Button type="primary" onClick={() => openModal()}>
                Tạo môn học mới
            </Button>
            <Button type="default" onClick={openGoalModal} style={{ marginLeft: 8 }}>
                Thiết lập mục tiêu
            </Button>

            <Row gutter={[16, 16]} style={{ marginTop: '20px' }}>
                {subjects.map((sbj) => (
                <Col xs={24} sm={12} md={8} lg={6} key={sbj.id}>
                    <Card
                        hoverable
                        title={sbj.title}
                        extra={
                            <>
                            <Button type="link" onClick={() => openModal(sbj)}>
                                <EditOutlined />
                            </Button>
                            <Button type="link" danger onClick={() => deleteTask(sbj.id)}>
                                <DeleteOutlined />
                            </Button>
                            </>
                        }
                        >
                        <p>Thời gian học: {sbj.hour}, {sbj.day} ({sbj.duration} tiếng)</p>
                        <p>Chú thích: {sbj.description}</p>
                        <p>Nội dung đã học: {sbj.contentLearned}</p>
                        <Progress percent={Number(calculateProgress(sbj.id))} />
                    </Card>
                </Col>
                ))}
            </Row>

            <Modal
                title={editingSubject ? 'Sửa môn học' : 'Tạo môn học mới'}
                visible={isModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                >
                    <Form.Item
                        label="Tiêu đề"
                        name="title"
                        rules={[{ required: true, message: 'Hãy nhập tiêu đề' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Thời lượng học mỗi buổi (tiếng)"
                        name="duration"
                        rules={[{ required: true, message: 'Hãy nhập thời lượng' }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Mô tả"
                        name="description"
                        rules={[{ required: true, message: 'Hãy nhập mô tả ' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày học"
                        name="day"
                        rules={[{ required: true, message: 'Hãy nhập ngày học' }]}
                    >
                        <Select>
                            <Option value="Thứ Hai">Thứ Hai</Option>
                            <Option value="Thứ Ba">Thứ Ba</Option>
                            <Option value="Thứ Tư">Thứ Tư</Option>
                            <Option value="Thứ Năm">Thứ Năm</Option>
                            <Option value="Thứ Sáu">Thứ Sáu</Option>
                            <Option value="Thứ Bảy">Thứ Bảy</Option>
                            <Option value="Chủ Nhật">Chủ Nhật</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        label="Giờ học"
                        name="hour"
                        rules={[{ required: true, message: 'Hãy nhập giờ học' }]}
                    >
                        <TimePicker format="HH:mm" />
                    </Form.Item>

                    <Form.Item
                        label="Nội dung đã học"
                        name="contentLearned"
                        rules={[{ required: true, message: 'Hãy nhập nội dung đã học' }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>

                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            {editingSubject ? 'Cập nhập' : 'Tạo'}
                        </Button>
                    </div>
                </Form>
            </Modal>

            <Modal
                title="Thiết lập mục tiêu học tập"
                visible={isGoalModalVisible}
                onCancel={handleCancel}
                footer={null}
            >
                <Form
                    form={goalForm}
                    layout="vertical"
                    onFinish={handleGoalFinish}
                >
                    {subjects.map((sbj) => (
                        <Form.Item
                            key={sbj.id}
                            label={`Mục tiêu cho ${sbj.title} (giờ)`}
                            name={sbj.id}
                        >
                            <Input type="number" min={0} />
                        </Form.Item>
                    ))}

                    <div style={{ textAlign: 'right' }}>
                        <Button onClick={handleCancel} style={{ marginRight: 8 }}>
                            Hủy
                        </Button>
                        <Button type="primary" htmlType="submit">
                            Lưu
                        </Button>
                    </div>
                </Form>
            </Modal>
        </div>
    );
};

export default TienDoHocTap;