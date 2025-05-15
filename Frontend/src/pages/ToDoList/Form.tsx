import { Button, Form, Input } from 'antd';
import { useModel } from 'umi';

const FormToDoList = () => {
	const { data, getDataToDoList, row, isEdit, setVisible } = useModel('todolist');

	return (
		<Form
			onFinish={(values) => {
				const index = data.findIndex((item: any) => item.task === row?.task);
				const dataTemp: ToDoList.Record[] = [...data];
				dataTemp.splice(index, 1, values);
				const dataLocal = isEdit ? dataTemp : [values, ...data];
				localStorage.setItem('todoListData', JSON.stringify(dataLocal));
				setVisible(false);
				getDataToDoList();
			}}
		>
			<Form.Item
				initialValue={row?.task}
				label='Task'
				name='task'
				rules={[{ required: true, message: 'Please input your task!' }]}
			>
				<Input />
			</Form.Item>

			<Form.Item
				initialValue={row?.content}
				label='Content'
				name='content'
				rules={[{ required: true, message: 'Please input your content!' }]}
			>
				<Input />
			</Form.Item>

			<div className='form-footer'>
				<Button htmlType='submit' type='primary'>
					{isEdit ? 'Save' : 'Insert'}
				</Button>
				<Button onClick={() => setVisible(false)}>Cancel</Button>
			</div>
		</Form>
	);
};

export default FormToDoList;
