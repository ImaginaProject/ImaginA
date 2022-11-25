import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import {
  Space,
  Button,
  Table,
  Upload,
  Form,
} from 'antd'
import {
  LoadingOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import type { UploadFile } from 'antd/es/upload/interface'
import type { UploadProps } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

type RetrainingInfo = {
  name: string,
  status: string,
  startDate: Dayjs | null,
  endDate: Dayjs | null,
  epochs: number,
}

export interface RetrainingListPageProps {}

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT

const RetrainingListPage: FunctionComponent<RetrainingListPageProps> = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dataSource, setDataSource] = useState<RetrainingInfo[]>([])

  const columns: ColumnsType<any> = [
    {
      title: 'Proceso',
      key: 'process',
      dataIndex: 'name',
    },
    {
      title: 'Estado',
      key: 'status',
      dataIndex: 'status',
    },
    {
      title: 'Hora inicio',
      key: 'start-time',
      dataIndex: 'startDate',
      render: (item: Dayjs | null) => {
        if (item === null) return <em>No hay dato</em>
        return item.format('DD/MM/YYYY H:m:s A')
      },
    },
    {
      title: 'Hora final',
      key: 'end-time',
      dataIndex: 'endDate',
      render: (item: Dayjs | null) => {
        if (item === null) return <em>No hay dato</em>
        return item.format('DD/MM/YYYY H:m:s A')
      },
    },
    {
      title: 'Épocas',
      key: 'epochs',
      dataIndex: 'epochs',
    },
    {
      title: 'Opciones',
      key: 'opctions',
      render: (item: RetrainingInfo) => (
        <Space key={item.name}>
          <Button danger>Pausar</Button>
        </Space>
      ),
    },
  ]

  const activeRetraining = () => {
  }

  const handleUpload: UploadProps['onChange'] = (info) => {
    setIsUploading(info.file.status === 'uploading')
    const newUploadFiles = info.fileList.map((uploadedFile) => {
      console.debug('response:', uploadedFile.response)
      if (uploadedFile.response?.file) {
        // eslint-disable-next-line no-param-reassign
        uploadedFile.url = `${ENDPOINT}/upload/${uploadedFile.response.file}`
      }
      return uploadedFile
    })
    setUploadFiles(newUploadFiles)
  }

  const handleRemove: UploadProps['onRemove'] = (file) => {
    console.log('wanna remove', file)
    fetch(`${file.url}`, { method: 'DELETE' })
      .then((response) => response.json())
      .then((value) => console.log(value))
      .catch((err) => console.error(err))
  }

  useEffect(() => {
    // TODO: active firebase realtime and update the table data from here
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space>
        <Form
          onFinish={(values) => {
            console.log('form:', values)
          }}
        >
          <Form.Item
            name="file"
            label="Archivo"
            valuePropName="fileList"
            getValueFromEvent={(e) => {
              // console.log('Upload event:', e)
              if (Array.isArray(e)) {
                return e
              }
              return e?.fileList || []
            }}
            rules={[
              {
                required: true,
                message: 'Archivo requerido',
              },
            ]}
          >
            <Upload
              name="file"
              action={`${ENDPOINT}/upload`}
              listType="text"
              maxCount={1}
              onChange={handleUpload}
              progress={{
                format: (percent) => percent && `${parseFloat(percent.toFixed(2))}%`,
              }}
              beforeUpload={(file, fileList) => {
                console.debug('will upload', file, fileList)
              }}
              directory={false}
              fileList={uploadFiles}
              method="POST"
              onRemove={handleRemove}
            >
              <Button
                icon={isUploading ? <LoadingOutlined /> : <UploadOutlined />}
                disabled={isUploading}
              >
                Subir nuevos datos (.csv or .xlsx)
              </Button>
            </Upload>
          </Form.Item>
          <Form.Item>
            <Button htmlType="submit" onClick={activeRetraining}>
              Agregar tarea de reentrenamiento
            </Button>
          </Form.Item>
        </Form>
      </Space>

      <Table columns={columns} dataSource={dataSource} />
    </Space>
  )
}

export default RetrainingListPage
