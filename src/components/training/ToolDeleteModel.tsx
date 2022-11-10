import { FunctionComponent, useState } from 'react';
import { Tooltip, Button } from 'antd';
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons';

export interface ToolDeleteModelProps {
  deleteURL: string,
  onDelete: () => void,
}

const ToolDeleteModel: FunctionComponent<ToolDeleteModelProps> = (props) => {
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <Tooltip title='Eliminar'>
      <Button onClick={async () => {
        setIsDeleting(true)
        const response = await fetch(props.deleteURL, { method: 'DELETE' })
        const data = await response.json()
        if (response.status === 200) {
          if (data?.success) {
            props.onDelete()
          }
        }
        setIsDeleting(false)
      }}>
        {isDeleting ? (
          <LoadingOutlined />
        ) : (
          <DeleteOutlined />
        )}
      </Button>
    </Tooltip>
  )
}

export default ToolDeleteModel
