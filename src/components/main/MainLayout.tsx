import { FunctionComponent, HtmlHTMLAttributes } from 'react'
import { Layout, Menu, Typography } from 'antd'
import { DashboardOutlined, SettingOutlined, UserSwitchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

import type { MenuProps } from 'antd'
import type { CoreLayoutProps } from 'react-admin'

type MenuItem = Required<MenuProps>['items'][number];

export interface MainLayoutProps
  extends CoreLayoutProps, Omit<HtmlHTMLAttributes<HTMLDivElement>, 'title'> {}

const items: MenuItem[] = [
  {
    key: 'dashboard',
    icon: <DashboardOutlined />,
    label: <Link to={'/'}>Dashboard</Link>
  },
  {
    key: 'daily-capacity',
    icon: <UserSwitchOutlined />,
    label: <Link to={'/daily-capacity'}>Aforo diario</Link>
  },
  {
    key: 'daily-sells',
    icon: <SettingOutlined />,
    label: <Link to={'/daily-sells'}>Ventas día</Link>
  },
  {
    key: 'import-data',
    icon: <SettingOutlined />,
    label: <Link to={'/import-data'}>Importación datos</Link>
  },
  {
    key: 'entertainment',
    icon: <SettingOutlined />,
    label: <Link to={'/training'}>Entrenamiento</Link>
  },
  {
    key: 'config-special-days',
    icon: <SettingOutlined />,
    label: <Link to={'/config-special-days'}>Config. días especiales</Link>
  },
  {
    key: 'price-optimization',
    icon: <SettingOutlined />,
    label: <Link to={'/price-optimization'}>Optimización precios</Link>
  },
]

const MainLayout: FunctionComponent<MainLayoutProps> = (props) => {
  return (
    <Layout>
      <Layout.Header>
        <Typography.Title style={{color: 'whitesmoke'}}>ImaginA</Typography.Title>
      </Layout.Header>

      <Layout>
        <Layout.Sider collapsible>
          <Menu
            defaultSelectedKeys={['1']}
            items={items}
          />
        </Layout.Sider>

        {/* The content is inserted here by React Admin */}
        <Layout.Content>
          {props.children}
        </Layout.Content>
      </Layout>

      <Layout.Footer>Footer</Layout.Footer>
    </Layout>
  )
}

export default MainLayout
