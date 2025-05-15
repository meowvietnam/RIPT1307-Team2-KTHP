import { useState } from 'react';

export default () => {
    const [data, setData] = useState<ToDoList.Record[]>([]);
    const [visible, setVisible] = useState<boolean>(false);
    const [isEdit, setIsEdit] = useState<boolean>(false);
    const [row, setRow] = useState<ToDoList.Record | null>(null);

    const getDataToDoList = () => {
        const dataLocal: ToDoList.Record[] = JSON.parse(localStorage.getItem('todoListData') || '[]');
        setData(dataLocal);
    };

    return {
        data,
        visible,
        setVisible,
        row,
        setRow,
        isEdit,
        setIsEdit,
        setData,
        getDataToDoList,
    };
};