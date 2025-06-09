import React from 'react';
import { useModel, history } from 'umi';
import { Button, Tooltip } from 'antd';
import AvatarDropdown from './AvatarDropdown';
import styles from './index.less';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

export type SiderTheme = 'light' | 'dark';

const GlobalHeaderRight: React.FC = () => {

	if (!localStorage.getItem('token')) {
		return null;
	}

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('role');
        history.push('/user/login');
    };

	const username = localStorage.getItem('username') || 'Người dùng';

    return (
        <div className={styles.right}>
			<span
				style={{
					display: 'flex',
					alignItems: 'center',
					fontWeight: 500,
					color: '#fff', // Đổi màu chữ thành trắng
					fontSize: 16,
				}}
				>
				{username}
				<UserOutlined style={{ marginRight: 6, fontSize: 18, color: '#fff' }} />
			</span>
            <Tooltip title="Đăng xuất">
                <span
                    style={{
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: 6,
                        borderRadius: '50%',
                        transition: 'background 0.2s',
                    }}
                    onClick={handleLogout}
                >
                    <LogoutOutlined style={{ fontSize: 22, color: '#f5222d' }} />
                </span>
            </Tooltip>
        </div>
    );
};

export default GlobalHeaderRight;