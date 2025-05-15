import React, { useState } from "react";
import { Layout, Menu, Typography, Card } from "antd";
import {
  BookOutlined,
  FileTextOutlined,
  FormOutlined,
  UserOutlined,
  SearchOutlined,
  DashboardOutlined
} from "@ant-design/icons";
import { Route, Switch, Link, useLocation } from "react-router-dom";
import CertificateRegisterList from "./CertificateRegister/RegisterList";
import GraduationDecisionList from "./GraduationDecision/DecisionList";
import TemplateConfig from "./TemplateConfig";//
import CertificateManagement from "./CertificateManagement";//
import CertificateLookup from "./CertificateLookup";//
import Dashboard from "./Dashboard";//

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const QuanLyVanBang: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // config menu
  const menuItems = [
    {
      key: "/QuanLyVanBang",
      icon: <DashboardOutlined />,
      label: <Link to="/QuanLyVanBang">Tổng quan</Link>
    },
    {
      key: "/QuanLyVanBang/registers",
      icon: <BookOutlined />,
      label: <Link to="/QuanLyVanBang/registers">Sổ văn bằng</Link>
    },
    {
      key: "/QuanLyVanBang/decisions",
      icon: <FileTextOutlined />,
      label: <Link to="/QuanLyVanBang/decisions">Quyết định tốt nghiệp</Link>
    },
    {
      key: "/QuanLyVanBang/template",
      icon: <FormOutlined />,
      label: <Link to="/QuanLyVanBang/template">Cấu hình biểu mẫu</Link>
    },
    {
      key: "/QuanLyVanBang/certificates",
      icon: <UserOutlined />,
      label: <Link to="/QuanLyVanBang/certificates">Quản lý văn bằng</Link>
    },
    {
      key: "/QuanLyVanBang/lookup",
      icon: <SearchOutlined />,
      label: <Link to="/QuanLyVanBang/lookup">Tra cứu văn bằng</Link>
    }
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
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
        <Header style={{ background: "#fff", padding: 0, paddingLeft: 16 }}>
          <Title level={3}>Quản lý văn bằng tốt nghiệp</Title>
        </Header>
        <Content style={{ margin: "24px 16px 0", overflow: "initial" }}>
          <div style={{ padding: 24, background: "#fff", minHeight: 360 }}>
            <Switch>
              <Route exact path="/QuanLyVanBang" component={Dashboard} />
              <Route path="/QuanLyVanBang/registers" component={CertificateRegisterList} />
              <Route path="/QuanLyVanBang/decisions" component={GraduationDecisionList} />
              <Route path="/QuanLyVanBang/template" component={TemplateConfig} />
              <Route path="/QuanLyVanBang/certificates" component={CertificateManagement} />
              <Route path="/QuanLyVanBang/lookup" component={CertificateLookup} />
            </Switch>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default QuanLyVanBang;