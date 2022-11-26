import {
  FunctionComponent,
  HtmlHTMLAttributes,
  useEffect,
  useState,
} from 'react'
import {
  Layout,
  Menu,
  Typography,
  Badge,
  Modal,
  Space,
} from 'antd'
import {
  DashboardOutlined,
  SettingOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

import type { MenuProps } from 'antd'
import { CoreLayoutProps, LocalesMenuButton } from 'react-admin'

type MenuItem = Required<MenuProps>['items'][number];

export interface MainLayoutProps
  extends CoreLayoutProps, Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {}

const items: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: <Link to="/">Dashboard</Link>,
  },
  {
    key: 'daily-capacity',
    icon: <UserSwitchOutlined />,
    label: <Link to="/daily-capacity">Aforo diario</Link>,
  },
  {
    key: 'daily-sells',
    icon: <SettingOutlined />,
    label: <Link to="/daily-sells">Ventas día</Link>,
  },
  {
    key: 'import-data',
    icon: <SettingOutlined />,
    // label: <Link to="/import-data">Importación datos</Link>,
    label: 'Importación datos',
    children: [
      {
        key: 'dataset-manager',
        icon: <SettingOutlined />,
        label: <Link to="/dataset/manager">Administrar dataset</Link>,
      },
    ],
  },
  {
    key: 'training',
    icon: <SettingOutlined />,
    label: 'Entrenamiento',
    // label: <Link to="/training">Entrenamiento</Link>,
    children: [
      {
        key: 'upload-trained-model',
        icon: <UploadOutlined />,
        label: <Link to="/training/upload-model">Subir modelo</Link>,
        title: 'Subir modelo entrenado',
      },
      {
        key: 'train-model',
        icon: <SettingOutlined />,
        label: <Link to="/training/train">Entrenar modelo</Link>,
      },
      {
        key: 'retrain-model',
        icon: <SettingOutlined />,
        label: <Link to="/training/retraining">Reentrenar</Link>,
      },
    ],
  },
  {
    key: 'config-special-days',
    icon: <SettingOutlined />,
    label: <Link to="/config-special-days">Config. días especiales</Link>,
  },
  {
    key: 'price-optimization',
    icon: <SettingOutlined />,
    label: <Link to="/price-optimization">Optimización precios</Link>,
  },
]

const MainLayout: FunctionComponent<MainLayoutProps> = (props) => {
  const { children } = props
  const [apiData, setApiData] = useState<any>(null);

  // No needed, but request for the API info.
  useEffect(() => {
    fetch(`${import.meta.env.VITE_APP_ENDPOINT}/`)
      .then((response) => response.json())
      .then((info: any) => setApiData(info))
      .catch((err) => {
        setApiData(null)
        console.error(err)
      })
  }, [])

  return (
    <Layout>
      <Layout.Header>
        <Space direction="horizontal" style={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography.Title style={{ color: 'whitesmoke' }}>ImaginA</Typography.Title>
          <LocalesMenuButton />
        </Space>
      </Layout.Header>

      <Layout>
        <Layout.Sider collapsible>
          <Menu
            defaultSelectedKeys={['1']}
            items={items}
            mode="inline"
          />
        </Layout.Sider>

        {/* The content is inserted here by React Admin */}
        <Layout.Content>
          {children}
        </Layout.Content>
      </Layout>

      <Layout.Footer>
        <small>
          <small>
            Version 1.5.0
            {' '}
            <Badge status={apiData === null ? 'error' : 'success'} />
            {' '}
            {apiData && (`API version ${apiData.version}`)}
          </small>
        </small>
      </Layout.Footer>

      <Modal
        open={import.meta.env.VITE_APP_ENDPOINT === undefined}
        title="Error de construcción"
        closable={false}
        footer={null}
      >
        <p>
          No se ha definido el
          {' '}
          <strong>endpoint</strong>
          {' '}
          de la API.
        </p>
      </Modal>
    </Layout>
  )
}

export default MainLayout
