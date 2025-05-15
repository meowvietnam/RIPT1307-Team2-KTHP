import React from 'react';
import { Layout, Menu } from 'antd';
import { Route, Switch, Link, useLocation } from 'react-router-dom';
import { 
  TeamOutlined, 
  FormOutlined, 
  UserOutlined, 
  DashboardOutlined 
} from '@ant-design/icons';

import ClubList from './ClubManagement/ClubList';
import ApplicationList from './ApplicationManagement/ApplicationList';
import ClubMembers from './MemberManagement/ClubMembers';
import Dashboard from './Dashboard';

const { Sider, Content } = Layout;

const ClubManagementSystem: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = React.useState(false);

  const menuItems = [
    {
      key: '/ThucHanh05',
      icon: <DashboardOutlined />,
      label: <Link to="/ThucHanh05">Tổng quan</Link>
    },
    {
      key: '/ThucHanh05/clubs',
      icon: <TeamOutlined />,
      label: <Link to="/ThucHanh05/clubs">Quản lý câu lạc bộ</Link>
    },
    {
      key: '/ThucHanh05/applications',
      icon: <FormOutlined />,
      label: <Link to="/ThucHanh05/applications">Quản lý đơn đăng ký</Link>
    },
    {
      key: '/ThucHanh05/members',
      icon: <UserOutlined />,
      label: <Link to="/ThucHanh05/members">Quản lý thành viên</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ overflow: 'auto', height: '100vh', position: 'fixed', left: 0, top: 0, bottom: 0 }}
      >
        <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)" }} />
        <Menu
          theme="dark"
          defaultSelectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout style={{ marginLeft: collapsed ? 80 : 200, transition: 'all 0.2s' }}>
        <Content style={{ margin: '24px 16px', overflow: 'initial' }}>
          <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
            <Switch>
              <Route exact path="/ThucHanh05" component={Dashboard} />
              <Route path="/ThucHanh05/clubs" component={ClubList} />
              <Route path="/ThucHanh05/applications" component={ApplicationList} />
              <Route path="/ThucHanh05/members" component={ClubMembers} />
            </Switch>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ClubManagementSystem;