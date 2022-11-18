import { Result } from 'antd';
import { ReactNode } from 'react';
import type { FunctionComponent } from 'react';
import { LoadingOutlined } from '@ant-design/icons';

export interface LoadingProps {
  label?: string,
  children?: ReactNode,
}

const Loading: FunctionComponent<LoadingProps> = (props) => {
  const {
    children,
    label,
  } = props

  return (
    <Result
      title={label}
      icon={<LoadingOutlined />}
      extra={children}
    />
  )
}

Loading.defaultProps = {
  label: 'Cargando...',
  children: undefined,
}

export default Loading
