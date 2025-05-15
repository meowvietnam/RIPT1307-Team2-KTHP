import { useState, useEffect } from 'react';
import { Button, Card, Form, Input, InputNumber, Table, Typography, Modal, Select, message, Popconfirm } from 'antd';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

interface Subject {
    key: string;
    code: string;
    name: string;
    credits: number;
}

interface Question {
    key: string;
    code: string;
    subject: string;
    content: string;
    difficulty: string;
    knowledgeBlock: string;
}

interface ExamStructure {
    key: string;
    subject: string;
    easy: number;
    medium: number;
    hard: number;
    veryHard: number;
}

export default function ManagementPage() {
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([]);
    const [examStructures, setExamStructures] = useState<ExamStructure[]>([]);
    const [generatedExam, setGeneratedExam] = useState<Question[]>([]);
    const [selectedStructure, setSelectedStructure] = useState<string | null>(null);
    const [subjectForm] = Form.useForm();
    const [questionForm] = Form.useForm();
    const [examStructureForm] = Form.useForm();
    const [searchForm] = Form.useForm();
    const [isModalVisible, setIsModalVisible] = useState({
        subject: false,
        question: false,
        examStructure: false,
    });
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [editingExamStructure, setEditingExamStructure] = useState<ExamStructure | null>(null);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [searchSubject, setSearchSubject] = useState('');
    const [searchDifficulty, setSearchDifficulty] = useState('');
    const [searchKnowledgeBlock, setSearchKnowledgeBlock] = useState('');

    useEffect(() => {
        const storedSubjects = localStorage.getItem('hocPhan');
        const storedQuestions = localStorage.getItem('cauHoi');
        const storedExamStructures = localStorage.getItem('examStructures');
        if (storedSubjects) setSubjects(JSON.parse(storedSubjects));
        if (storedQuestions) setQuestions(JSON.parse(storedQuestions));
        if (storedExamStructures) setExamStructures(JSON.parse(storedExamStructures));
    }, []);

    useEffect(() => {
        localStorage.setItem('hocPhan', JSON.stringify(subjects));
    }, [subjects]);

    useEffect(() => {
        localStorage.setItem('cauHoi', JSON.stringify(questions));
    }, [questions]);

    useEffect(() => {
        localStorage.setItem('examStructures', JSON.stringify(examStructures));
    }, [examStructures]);

    const addSubject = (values: Omit<Subject, 'key'>) => {
        const newSubject: Subject = {
            key: `${subjects.length + 1}`,
            ...values,
        };
        setSubjects([...subjects, newSubject]);
        subjectForm.resetFields();
        setIsModalVisible({ ...isModalVisible, subject: false });
    };

    const editSubject = (values: Subject) => {
        const updatedSubjects = subjects.map((subject) =>
            subject.key === values.key ? values : subject
        );
        setSubjects(updatedSubjects);
        setEditingSubject(null);
        setIsModalVisible({ ...isModalVisible, subject: false });
    };

    const deleteSubject = (key: string) => {
        const updatedSubjects = subjects.filter((subject) => subject.key !== key);
        setSubjects(updatedSubjects);
    };

    const addQuestion = (values: Omit<Question, 'key'>) => {
        const newQuestion: Question = {
            key: `${questions.length + 1}`,
            ...values,
        };
        setQuestions([...questions, newQuestion]);
        setFilteredQuestions([...questions, newQuestion]);
        questionForm.resetFields();
        setIsModalVisible({ ...isModalVisible, question: false });
    };

    const editQuestion = (values: Question) => {
        const updatedQuestions = questions.map((question) =>
            question.key === values.key ? values : question
        );
        setQuestions(updatedQuestions);
        setFilteredQuestions(updatedQuestions);
        setEditingQuestion(null);
        setIsModalVisible({ ...isModalVisible, question: false });
    };

    const deleteQuestion = (key: string) => {
        const updatedQuestions = questions.filter((question) => question.key !== key);
        setQuestions(updatedQuestions);
        setFilteredQuestions(updatedQuestions);
    };

    const addExamStructure = (values: Omit<ExamStructure, 'key'>) => {
        const newExamStructure: ExamStructure = {
            key: `${examStructures.length + 1}`,
            ...values,
        };
        setExamStructures([...examStructures, newExamStructure]);
        examStructureForm.resetFields();
        setIsModalVisible({ ...isModalVisible, examStructure: false });
    };

    const editExamStructure = (values: ExamStructure) => {
        const updatedExamStructures = examStructures.map((structure) =>
            structure.key === values.key ? values : structure
        );
        setExamStructures(updatedExamStructures);
        setEditingExamStructure(null);
        setIsModalVisible({ ...isModalVisible, examStructure: false });
    };

    const deleteExamStructure = (key: string) => {
        const updatedExamStructures = examStructures.filter((structure) => structure.key !== key);
        setExamStructures(updatedExamStructures);
    };

    const handleSearch = () => {
        let filtered = questions;
        if (searchKeyword) {
            filtered = filtered.filter(question =>
                question.content.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }
        if (searchSubject && searchSubject !== 'All') {
            filtered = filtered.filter(question => question.subject === searchSubject);
        }
        if (searchDifficulty && searchDifficulty !== 'All') {
            filtered = filtered.filter(question => question.difficulty === searchDifficulty);
        }
        if (searchKnowledgeBlock && searchKnowledgeBlock !== 'All') {
            filtered = filtered.filter(question => question.knowledgeBlock === searchKnowledgeBlock);
        }
        setFilteredQuestions(filtered.length > 0 ? filtered : []);
    };

    const subjectColumns = [
        {
            title: 'Mã môn',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Tên môn',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Số tín chỉ',
            dataIndex: 'credits',
            key: 'credits',
        },
        {
            title: 'Tùy Chỉnh',
            key: 'action',
            render: (_: any, record: Subject) => (
                <>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingSubject(record);
                            setIsModalVisible({ ...isModalVisible, subject: true });
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa môn học này không?"
                        onConfirm={() => deleteSubject(record.key)}
                    >
                        <Button type="link" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const questionColumns = [
        {
            title: 'Mã câu hỏi',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Môn học',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Nội dung câu hỏi',
            dataIndex: 'content',
            key: 'content',
        },
        {
            title: 'Mức độ khó',
            dataIndex: 'difficulty',
            key: 'difficulty',
        },
        {
            title: 'Khối kiến thức',
            dataIndex: 'knowledgeBlock',
            key: 'knowledgeBlock',
        },
        {
            title: 'Tùy Chỉnh',
            key: 'action',
            render: (_: any, record: Question) => (
                <>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingQuestion(record);
                            setIsModalVisible({ ...isModalVisible, question: true });
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa câu hỏi này không?"
                        onConfirm={() => deleteQuestion(record.key)}
                    >
                        <Button type="link" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const examStructureColumns = [
        {
            title: 'Môn học',
            dataIndex: 'subject',
            key: 'subject',
        },
        {
            title: 'Dễ',
            dataIndex: 'easy',
            key: 'easy',
        },
        {
            title: 'Trung bình',
            dataIndex: 'medium',
            key: 'medium',
        },
        {
            title: 'Khó',
            dataIndex: 'hard',
            key: 'hard',
        },
        {
            title: 'Rất khó',
            dataIndex: 'veryHard',
            key: 'veryHard',
        },
        {
            title: 'Tùy Chỉnh',
            key: 'action',
            render: (_: any, record: ExamStructure) => (
                <>
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingExamStructure(record);
                            setIsModalVisible({ ...isModalVisible, examStructure: true });
                        }}
                    >
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa cấu trúc đề thi này không?"
                        onConfirm={() => deleteExamStructure(record.key)}
                    >
                        <Button type="link" danger>
                            Xóa
                        </Button>
                    </Popconfirm>
                </>
            ),
        },
    ];

    const generateExam = () => {
        if (!selectedStructure) {
            message.error('Vui lòng chọn cấu trúc đề thi');
            return;
        }

        const structure = examStructures.find((s) => s.key === selectedStructure);
        if (!structure) {
            message.error('Cấu trúc đề thi không hợp lệ');
            return;
        }

        const selectedQuestions: Question[] = [];
        const difficulties: (keyof typeof difficultyCounts)[] = ['Dễ', 'Trung bình', 'Khó', 'Rất khó'];
        const difficultyCounts = {
            'Dễ': structure.easy,
            'Trung bình': structure.medium,
            'Khó': structure.hard,
            'Rất khó': structure.veryHard,
        };

        for (const difficulty of difficulties) {
            const questionsByDifficulty = questions.filter(
                (question) => question.subject === structure.subject && question.difficulty === difficulty
            );

            if (questionsByDifficulty.length < difficultyCounts[difficulty]) {
                message.error(`Không đủ câu hỏi ${difficulty} cho môn ${structure.subject}`);
                return;
            }

            const shuffledQuestions = questionsByDifficulty.sort(() => 0.5 - Math.random());
            selectedQuestions.push(...shuffledQuestions.slice(0, difficultyCounts[difficulty]));
        }

        setGeneratedExam(selectedQuestions);
    };

    return (
        <div style={{ padding: 20, background: '#f0f2f5', minHeight: '100vh' }}>
            <Title level={2}  >
                Ngân Hàng Câu Hỏi
            </Title>
            <div style={{ gap: 10, marginBottom: 20 }}>
                <Button type="primary" onClick={() => setIsModalVisible({ ...isModalVisible, subject: true })}>
                    Thêm môn học
                </Button>
                <Button type="primary" onClick={() => setIsModalVisible({ ...isModalVisible, question: true })} style={{ margin: '0 10px' }}>
                    Thêm câu hỏi
                </Button>
                <Button type="primary" onClick={() => setIsModalVisible({ ...isModalVisible, examStructure: true })}>
                    Thêm cấu trúc đề thi
                </Button>
            </div>

            <Modal
                title={editingSubject ? "Sửa môn học" : "Thêm môn học"}
                visible={isModalVisible.subject}
                onCancel={() => {
                    setEditingSubject(null);
                    setIsModalVisible({ ...isModalVisible, subject: false });
                }}
                footer={null}
            >
                <Form
                    form={subjectForm}
                    layout="vertical"
                    onFinish={editingSubject ? editSubject : addSubject}
                    initialValues={editingSubject || {}}
                >
                    <Form.Item
                        label="Mã môn"
                        name="code"
                        rules={[{ required: true, message: 'Vui lòng nhập mã môn!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Tên môn"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên môn!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Số tín chỉ"
                        name="credits"
                        rules={[{ required: true, message: 'Vui lòng nhập số tín chỉ!' }]}
                    >
                        <InputNumber min={1} max={10} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingSubject ? "Lưu" : "Thêm môn học"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingQuestion ? "Sửa câu hỏi" : "Thêm câu hỏi"}
                visible={isModalVisible.question}
                onCancel={() => {
                    setEditingQuestion(null);
                    setIsModalVisible({ ...isModalVisible, question: false });
                }}
                footer={null}
            >
                <Form
                    form={questionForm}
                    layout="vertical"
                    onFinish={editingQuestion ? editQuestion : addQuestion}
                    initialValues={editingQuestion || {}}
                >
                    <Form.Item
                        label="Mã câu hỏi"
                        name="code"
                        rules={[{ required: true, message: 'Vui lòng nhập mã câu hỏi!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Môn học"
                        name="subject"
                        rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                    >
                        <Select>
                            {subjects.map((subject) => (
                                <Option key={subject.key} value={subject.name}>
                                    {subject.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Nội dung câu hỏi"
                        name="content"
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung câu hỏi!' }]}
                    >
                        <Input.TextArea />
                    </Form.Item>
                    <Form.Item
                        label="Mức độ khó"
                        name="difficulty"
                        rules={[{ required: true, message: 'Vui lòng chọn mức độ khó!' }]}
                    >
                        <Select>
                            <Option value="Dễ">Dễ</Option>
                            <Option value="Trung bình">Trung bình</Option>
                            <Option value="Khó">Khó</Option>
                            <Option value="Rất khó">Rất khó</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Khối kiến thức"
                        name="knowledgeBlock"
                        rules={[{ required: true, message: 'Vui lòng nhập khối kiến thức!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingQuestion ? "Lưu" : "Thêm câu hỏi"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingExamStructure ? "Sửa cấu trúc đề thi" : "Thêm cấu trúc đề thi"}
                visible={isModalVisible.examStructure}
                onCancel={() => {
                    setEditingExamStructure(null);
                    setIsModalVisible({ ...isModalVisible, examStructure: false });
                }}
                footer={null}
            >
                <Form
                    form={examStructureForm}
                    layout="vertical"
                    onFinish={editingExamStructure ? editExamStructure : addExamStructure}
                    initialValues={editingExamStructure || {}}
                >
                    <Form.Item
                        label="Môn học"
                        name="subject"
                        rules={[{ required: true, message: 'Vui lòng chọn môn học!' }]}
                    >
                        <Select>
                            {subjects.map((subject) => (
                                <Option key={subject.key} value={subject.name}>
                                    {subject.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Số câu hỏi dễ"
                        name="easy"
                        rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi dễ!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Số câu hỏi trung bình"
                        name="medium"
                        rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi trung bình!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Số câu hỏi khó"
                        name="hard"
                        rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi khó!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item
                        label="Số câu hỏi rất khó"
                        name="veryHard"
                        rules={[{ required: true, message: 'Vui lòng nhập số câu hỏi rất khó!' }]}
                    >
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {editingExamStructure ? "Lưu" : "Thêm cấu trúc đề thi"}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Card title="Danh sách môn học" style={{ marginBottom: 20 }}>
                <Table dataSource={subjects} columns={subjectColumns} pagination={false} />
            </Card>

            <Card title="Danh sách câu hỏi" style={{ marginBottom: 20 }}>
                <div>
                    <Search
                        placeholder="Tìm kiếm câu hỏi theo nội dung"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        onSearch={handleSearch}
                        style={{ marginBottom: 20, width: '400px', marginRight: 10 }}
                    />
                    <Select
                        placeholder="Chọn môn học"
                        value={searchSubject}
                        onChange={(value) => setSearchSubject(value)}
                        style={{ width: 200, marginBottom: 20, marginRight: 10 }}
                    >
                        <Option value="All">All</Option>
                        {subjects.map((subject) => (
                            <Option key={subject.key} value={subject.name}>
                                {subject.name}
                            </Option>
                        ))}
                    </Select>
                    <Select
                        placeholder="Chọn mức độ khó"
                        value={searchDifficulty}
                        onChange={(value) => setSearchDifficulty(value)}
                        style={{ width: 200, marginBottom: 20, marginRight: 10 }}
                    >
                        <Option value="All">All</Option>
                        <Option value="Dễ">Dễ</Option>
                        <Option value="Trung bình">Trung bình</Option>
                        <Option value="Khó">Khó</Option>
                        <Option value="Rất khó">Rất khó</Option>
                    </Select>
                    <Select
                        placeholder="Chọn khối kiến thức"
                        value={searchKnowledgeBlock}
                        onChange={(value) => setSearchKnowledgeBlock(value)}
                        style={{ width: 200, marginBottom: 20, marginRight: 10 }}
                    >
                        <Option value="All">All</Option>
                        {[...new Set(questions.map((question) => question.knowledgeBlock))].map((knowledgeBlock) => (
                            <Option key={knowledgeBlock} value={knowledgeBlock}>
                                {knowledgeBlock}
                            </Option>
                        ))}
                    </Select>
                    <Button type="primary" onClick={handleSearch} style={{ marginBottom: 20 }}>
                        Tìm kiếm
                    </Button>
                </div>
                <Table dataSource={filteredQuestions.length > 0 ? filteredQuestions : []} columns={questionColumns} pagination={false} />
            </Card>

            <Card title="Danh sách cấu trúc đề thi" style={{ marginBottom: 20 }}>
                <Table dataSource={examStructures} columns={examStructureColumns} pagination={false} />
                <Form layout="inline">
                    <Form.Item label="Chọn cấu trúc đề thi">
                        <Select
                            style={{ width: 200 }}
                            onChange={(value) => setSelectedStructure(value)}
                        >
                            {examStructures.map((structure, index) => (
                                <Option key={structure.key} value={structure.key}>
                                    Cấu trúc {index + 1}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" onClick={generateExam}>
                            Tạo đề thi
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {generatedExam.length > 0 && (
                <Card title="Đề thi đã tạo" style={{ marginTop: 20 }}>
                    <Table dataSource={generatedExam} columns={questionColumns} pagination={false} />
                </Card>
            )}
        </div>
    );
}