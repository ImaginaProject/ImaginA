import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import type { Key } from 'react'
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
// import dayjs, { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

import type { RetrainedInfo } from '../../types/types'
import RetrainingManager from '../../classes/RetrainingManager'

type DateSource = RetrainedInfo & { key: Key }

export interface RetrainingListPageProps {}

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT
const ENABLE_TYPE = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

const RetrainingListPage: FunctionComponent<RetrainingListPageProps> = () => {
  const [rm] = useState(new RetrainingManager());
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dataSource, setDataSource] = useState<DateSource[]>([])

  const columns: ColumnsType<DateSource> = [
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
      render: (item: string | null) => {
        if (item === null) return <em>No hay dato</em>
        // return item.format('DD/MM/YYYY H:m:s A')
        return <p>{item}</p>
      },
    },
    {
      title: 'Hora final',
      key: 'end-time',
      dataIndex: 'endDate',
      render: (item: string | null) => {
        if (item === null) return <em>No hay dato</em>
        // return item.format('DD/MM/YYYY H:m:s A')
        return <p>{item}</p>
      },
    },
    {
      title: 'Épocas',
      key: 'epochs',
      // dataIndex: 'epochs',
      render: (item: DateSource) => {
        const { epochs, targetEpochs } = item
        return (
          <p>
            {`${epochs} de ${targetEpochs}`}
          </p>
        )
      },
    },
    {
      title: 'Opciones',
      key: 'opctions',
      render: (item: RetrainedInfo) => (
        <Space key={item.taskId}>
          <Button danger>Pausar</Button>
        </Space>
      ),
    },
  ]

  const activeRetraining = (values: any) => {
    console.log('form:', values)
    const fileList = values?.fileList as any[] || []
    if (fileList.length === 0) {
      // eslint-disable-next-line no-alert
      alert('No hay archivo que subir')
      return
    }

    const file = fileList[0]
    rm.retrain(
      'a53df9febd652ebf27a641c9886cfef5', // TODO: change it
      file.response.file,
      100,
      'Nuevo modelo 1A.1',
      0.3,
      0.2,
    ).finally(() => {
      console.log('Ok, I am happy)))')
    })
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
    rm.active((ls) => {
      setDataSource(ls.map((values, index) => {
        const report: DateSource = {
          key: index,
          ...values,
        }
        return report
      }))
    }).catch((err) => console.error(err))

    return () => {
      rm.unsubscribe()
    }
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space>
        <Form onFinish={activeRetraining}>
          <Form.Item
            name="fileList"
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
                const isEnable = ENABLE_TYPE.includes(file.type)
                if (!isEnable) {
                  console.error('File is not enable:', file)
                }
                return isEnable || Upload.LIST_IGNORE
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
            <Button htmlType="submit">
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
