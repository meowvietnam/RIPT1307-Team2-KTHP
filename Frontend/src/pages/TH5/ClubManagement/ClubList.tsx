import React, { useState, useEffect } from 'react';
import { 
  Table, Space, Button, Card, Modal, Form, 
  Input, DatePicker, Switch, message, 
  Typography, Popconfirm, Upload, Image
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  EyeOutlined, UploadOutlined, SearchOutlined 
} from '@ant-design/icons';
import moment from 'moment';
import { Club, ClubMember } from '../types';
import TinyEditor from '@/components/TinyEditor';
import ClubMemberList from './ClubMemberList';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const ClubList: React.FC = () => {
  const [clubs, setClubs] = useState<Club[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [memberModalVisible, setMemberModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [editorContent, setEditorContent] = useState('');

  // localStorage
  useEffect(() => {
    setLoading(true);
    const storedClubs = localStorage.getItem('clubManagement-clubs');
    if (storedClubs) {
      setClubs(JSON.parse(storedClubs));
    }
    setLoading(false);
  }, []);

  // save vao local
  useEffect(() => {
    localStorage.setItem('clubManagement-clubs', JSON.stringify(clubs));
  }, [clubs]);

  // new club
  const handleAdd = () => {
    setSelectedClub(null);
    form.resetFields();
    setAvatarUrl('');
    setEditorContent('');
    setModalVisible(true);
  };

  // edit club
  const handleEdit = (record: Club) => {
    setSelectedClub(record);
    form.setFieldsValue({
      ...record,
      foundingDate: record.foundingDate ? moment(record.foundingDate) : null,
    });
    setAvatarUrl(record.avatar || '');
    setEditorContent(record.description || '');
    setModalVisible(true);
  };

  // mem list 
  const handleViewMembers = (record: Club) => {
    setSelectedClub(record);
    setMemberModalVisible(true);
  };

  // del club
  const handleDelete = (id: string) => {
    // club mem check
    const membersStr = localStorage.getItem('clubManagement-members');
    if (membersStr) {
      const members: ClubMember[] = JSON.parse(membersStr);
      const hasMembers = members.some(member => member.clubId === id);
      if (hasMembers) {
        message.error('Không thể xóa câu lạc bộ có thành viên!');
        return;
      }
    }
    
    // del club
    setClubs(clubs.filter(club => club.id !== id));
    message.success('Xóa câu lạc bộ thành công!');
  };

  // save clb
  const handleSave = () => {
    form.validateFields().then(values => {
      // format
      const formattedValues = {
        ...values,
        foundingDate: values.foundingDate ? values.foundingDate.format('YYYY-MM-DD') : null,
        description: editorContent,
        avatar: avatarUrl,
      };

      if (selectedClub) {
        // update club
        const updated = clubs.map(club => 
          club.id === selectedClub.id 
            ? { 
                ...club, 
                ...formattedValues,
                updatedAt: new Date().toISOString() 
              } 
            : club
        );
        setClubs(updated);
        message.success('Cập nhật câu lạc bộ thành công!');
      } else {
        // new club
        const newClub: Club = {
          id: Date.now().toString(),
          ...formattedValues,
          isActive: formattedValues.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        setClubs([...clubs, newClub]);
        message.success('Thêm câu lạc bộ thành công!');
      }
      setModalVisible(false);
    });
  };

  // image
  const handleImageUpload = (info: any) => {
    if (info.file.status === 'uploading') {
      return;
    }
    if (info.file.status === 'done') {
      // base64
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setAvatarUrl(reader.result?.toString() || '');
      });
      reader.readAsDataURL(info.file.originFileObj);
    }
  };

  // upload
  const uploadButton = (
    <div>
      <UploadOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  // search
  const filteredClubs = clubs.filter(club => 
    club.name.toLowerCase().includes(searchText.toLowerCase()) || 
    club.chairman.toLowerCase().includes(searchText.toLowerCase())
  );

  // table
  const columns = [
    {
      title: 'Ảnh đại diện',
      key: 'avatar',
      render: (_: any, record: Club) => (
        <Image 
          src={record.avatar || 'https://via.placeholder.com/50'} 
          alt={record.name}
          width={50}
          height={50}
          style={{ objectFit: 'cover' }}
          preview={false}
        />
      ),
    },
    {
      title: 'Tên câu lạc bộ',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Club, b: Club) => a.name.localeCompare(b.name),
    },
    {
      title: 'Ngày thành lập',
      dataIndex: 'foundingDate',
      key: 'foundingDate',
      render: (text: string) => text ? moment(text).format('DD/MM/YYYY') : 'N/A',
      sorter: (a: Club, b: Club) => {
        const dateA = a.foundingDate ? new Date(a.foundingDate).getTime() : 0;
        const dateB = b.foundingDate ? new Date(b.foundingDate).getTime() : 0;
        return dateA - dateB;
      },
    },
    {
      title: 'Chủ nhiệm',
      dataIndex: 'chairman',
      key: 'chairman',
      sorter: (a: Club, b: Club) => a.chairman.localeCompare(b.chairman),
    },
    {
      title: 'Hoạt động',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive: boolean) => (
        <Switch checked={isActive} disabled />
      ),
      sorter: (a: Club, b: Club) => (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: Club) => (
        <Space size="small">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleViewMembers(record)}
          >
            Thành viên
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa câu lạc bộ này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button type="primary" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Card title={<Title level={2}>Quản lý câu lạc bộ</Title>}>

        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
          <Input
            placeholder="Tìm kiếm theo tên CLB hoặc chủ nhiệm"
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            allowClear
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            Thêm câu lạc bộ
          </Button>
        </div>


        <Table
          columns={columns}
          dataSource={filteredClubs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>


      <Modal
        title={selectedClub ? "Cập nhật câu lạc bộ" : "Thêm câu lạc bộ mới"}
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={handleSave}
        width={800}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên câu lạc bộ"
            rules={[{ required: true, message: 'Vui lòng nhập tên câu lạc bộ!' }]}
          >
            <Input placeholder="Nhập tên câu lạc bộ" />
          </Form.Item>

          <Form.Item
            name="foundingDate"
            label="Ngày thành lập"
            rules={[{ required: true, message: 'Vui lòng chọn ngày thành lập!' }]}
          >
            <DatePicker format="DD/MM/YYYY" style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="chairman"
            label="Chủ nhiệm CLB"
            rules={[{ required: true, message: 'Vui lòng nhập tên chủ nhiệm!' }]}
          >
            <Input placeholder="Nhập tên chủ nhiệm" />
          </Form.Item>

          <Form.Item
            label="Ảnh đại diện"
          >
            <Upload
              name="avatar"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={(file) => {
                const isImage = file.type.startsWith('image/');
                if (!isImage) {
                  message.error('Chỉ được tải lên file ảnh!');
                }
                return isImage ? false : Upload.LIST_IGNORE;
              }}
              onChange={handleImageUpload}
              customRequest={({ onSuccess }) => {
                setTimeout(() => {
                  onSuccess?.("ok", new XMLHttpRequest());
                }, 0);
              }}
            >
              {avatarUrl ? (
                <img 
                  src={avatarUrl} 
                  alt="avatar" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              ) : uploadButton}
            </Upload>
          </Form.Item>

          <Form.Item
            label="Mô tả"
            required
          >
            <TinyEditor
              value={editorContent}
              onChange={setEditorContent}
              height={300}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Hoạt động"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>
        </Form>
      </Modal>


      <Modal
        title={`Thành viên ${selectedClub?.name || ''}`}
        visible={memberModalVisible}
        onCancel={() => setMemberModalVisible(false)}
        footer={null}
        width={900}
      >
        {selectedClub && (
          <ClubMemberList clubId={selectedClub.id} />
        )}
      </Modal>
    </>
  );
};

export default ClubList;