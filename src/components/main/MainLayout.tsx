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
  AreaChartOutlined,
  CalendarOutlined,
  CloudSyncOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  FileAddOutlined,
  FileSyncOutlined,
  LineChartOutlined,
  SettingOutlined,
  SlidersOutlined,
  UploadOutlined,
  UserSwitchOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'

import type { MenuProps } from 'antd'
import { CoreLayoutProps, LocalesMenuButton, useTranslate } from 'react-admin'

type MenuItem = Required<MenuProps>['items'][number]

export interface MainLayoutProps
  extends CoreLayoutProps, Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {}

const MainLayout: FunctionComponent<MainLayoutProps> = (props) => {
  const { children } = props
  const [apiData, setApiData] = useState<any>(null)

  const translate = useTranslate()

  const items: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/">{translate('imagina.layout.dashboard')}</Link>,
    },
    {
      key: 'daily-capacity',
      icon: <UserSwitchOutlined />,
      label: <Link to="/daily-capacity">{translate('imagina.layout.daily_capacity')}</Link>,
    },
    {
      key: 'daily-sells',
      icon: <AreaChartOutlined />,
      label: <Link to="/daily-sells">{translate('imagina.layout.daily_sells')}</Link>,
    },
    {
      key: 'import-data',
      icon: <DatabaseOutlined />,
      // label: <Link to="/import-data">Importación datos</Link>,
      label: translate('imagina.layout.import_data'),
      children: [
        {
          key: 'dataset-manager',
          icon: <FileSyncOutlined />,
          label: <Link to="/dataset/manager">{translate('imagina.layout.manage_dataset')}</Link>,
        },
      ],
    },
    {
      key: 'training',
      icon: <SlidersOutlined />,
      label: translate('imagina.layout.training'),
      // label: <Link to="/training">Entrenamiento</Link>,
      children: [
        {
          key: 'upload-trained-model',
          icon: <UploadOutlined />,
          label: <Link to="/training/upload-model">{translate('imagina.layout.upload_trained_model')}</Link>,
        },
        {
          key: 'create-model',
          icon: <FileAddOutlined />,
          label: <Link to="/training/create-model">{translate('imagina.layout.create_model')}</Link>,
        },
        {
          key: 'retrain-model',
          icon: <CloudSyncOutlined />,
          label: <Link to="/training/retraining">{translate('imagina.layout.retrain')}</Link>,
        },
        {
          key: 'retrain-model-report',
          icon: <LineChartOutlined />,
          label: <Link to="/training/retraining/reports">{translate('imagina.layout.reports')}</Link>,
        },
      ],
    },
    {
      key: 'config-special-days',
      icon: <CalendarOutlined />,
      label: <Link to="/config-special-days">{translate('imagina.layout.config_special_days')}</Link>,
    },
    {
      key: 'price-optimization',
      icon: <SettingOutlined />,
      label: <Link to="/price-optimization">{translate('imagina.layout.price_optimization')}</Link>,
    },
  ]

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
            Version 1.11.0
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
