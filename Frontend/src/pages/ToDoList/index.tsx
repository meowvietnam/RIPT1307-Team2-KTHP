import type { IColumn } from '@/components/Table/typing';
import { Button, Modal, Table } from 'antd';
import { useEffect } from 'react';
import { useModel } from 'umi';
import FormToDoList from './Form';

const ToDoList = () => {
	const { data, getDataToDoList, setRow, isEdit, setVisible, setIsEdit, visible } = useModel('todolist');

	useEffect(() => {
		getDataToDoList();
	}, []);

	const columns: IColumn<ToDoList.Record>[] = [
		{
			title: 'Task',
            dataIndex: 'task',
			key: 'name',
			width: 200,
            align: 'center', // Căn giữa nội dung cột Task

            
		},
		{
			title: 'Content',
            dataIndex: 'content',
			key: 'age',
			width: 300,
            align: 'center',

		},
		{
			title: 'Action',
			width: 200,
			align: 'center',
			render: (record) => {
				return (
					<div>
						<Button
							onClick={() => {
								setVisible(true);
								setRow(record);
								setIsEdit(true);
							}}
						>
							Edit
						</Button>
						<Button
							style={{ marginLeft: 10 }}
							onClick={() => {
								const dataLocal: any = JSON.parse(localStorage.getItem('todoListData') as any);
								const newData = dataLocal.filter((item: any) => item.task !== record.task);
								localStorage.setItem('todoListData', JSON.stringify(newData));
								getDataToDoList();
							}}
							type='primary'
						>
							Delete
						</Button>
					</div>
				);
			},
		},
	];

	return (
		<div>
			<Button
				type='primary'
				onClick={() => {
					setVisible(true);
					setIsEdit(false);
				}}
			>
				Add Task
			</Button>

			<Table dataSource={data} columns={columns} />

			<Modal
				destroyOnClose
				footer={false}
				title={isEdit ? 'Edit Task' : 'Add Task'}
				visible={visible}
				onOk={() => {}}
				onCancel={() => {
					setVisible(false);
				}}
			>
				<FormToDoList />
			</Modal>
		</div>
	);
};

export default ToDoList;
