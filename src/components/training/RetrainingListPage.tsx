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
  Input,
  InputNumber,
  Select,
  Alert,
  Tag,
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
import DailyCapacity from '../../classes/DailyCapacity'

type DateSource = RetrainedInfo & { key: Key }
type AvailableModelID = {
  label: string,
  value: string,
}

export interface RetrainingListPageProps {}

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT
const ENABLE_TYPE = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

const RetrainingListPage: FunctionComponent<RetrainingListPageProps> = () => {
  const [rm] = useState(new RetrainingManager());
  const [dc] = useState(new DailyCapacity())
  const [isUploading, setIsUploading] = useState(false);
  const [uploadFiles, setUploadFiles] = useState<UploadFile[]>([]);
  const [dataSource, setDataSource] = useState<DateSource[]>([])
  const [isWaitingForRealtimeData, setIsWaitingForRealtimeData] = useState(true)
  const [availableModelIDs, setAvailableModelIDs] = useState<AvailableModelID[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [wasRecientlyNewTaskAdded, setWasRecientlyNewTaskAdded] = useState(false)

  const [form] = Form.useForm()

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
      render: (item: string) => {
        let color = 'cyan'
        switch (item) {
          case 'running':
            color = 'geekblue'
            break
          case 'stopped':
            color = 'magenta'
            break
          case 'success':
            color = 'green'
            break
          case 'failure':
            color = 'red'
            break
          default:
            color = 'cyan'
        }
        return (
          <Tag color={color}>{item}</Tag>
        )
      },
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
    // {
    //   title: 'Opciones',
    //   key: 'opctions',
    //   render: (item: RetrainedInfo) => (
    //     <Space key={item.taskId}>
    //       <Button danger>Pausar</Button>
    //     </Space>
    //   ),
    // },
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
      values.modelId,
      file.response.file,
      values.epochs,
      values.name,
      values.testSize,
      values.validationSplit,
    ).then(() => {
      form.resetFields()
      setWasRecientlyNewTaskAdded(true)
    }).finally(() => {
      console.log('Ok, I am happy)))')
    }).catch((err) => {
      console.error(err)
      setWasRecientlyNewTaskAdded(false)
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
      if (wasRecientlyNewTaskAdded) {
        setWasRecientlyNewTaskAdded(() => false)
      }

      if (isWaitingForRealtimeData) {
        setIsWaitingForRealtimeData(() => false)
      }

      setDataSource(ls.map((values, index) => {
        const report: DateSource = {
          key: index,
          ...values,
        }
        return report
      }))
    }).catch((err) => console.error(err))

    setIsLoadingModels(true)
    dc.requestAllModels().then((registeredModels) => {
      const options = registeredModels.map((modelInfo) => (
        {
          label: modelInfo.name,
          value: modelInfo.md5_sum,
        }
      ))
      setAvailableModelIDs(options)
    }).finally(() => setIsLoadingModels(false))

    return () => {
      rm.unsubscribe()
    }
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space>
        <Form form={form} onFinish={activeRetraining}>
          <Form.Item
            name="name"
            label="Nombre"
            rules={[
              {
                required: true,
                message: 'Nombre requerido',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="epochs"
            label="Épocas"
            rules={[
              {
                required: true,
                message: 'La cantidad de épocas es requerido',
              },
              // {
              //   min: 1,
              //   message: 'Mínimo una época',
              // },
            ]}
            initialValue={100}
          >
            <InputNumber min={1} />
          </Form.Item>
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
          <Form.Item
            name="testSize"
            label="Tamaño de muestra de pruebas"
            initialValue={0.1}
            rules={[
              {
                required: true,
                message: 'Inserte alguna cantidad aunque sea 0',
              },
            ]}
          >
            <InputNumber min={0} max={99} addonAfter={<strong>%</strong>} />
          </Form.Item>
          <Form.Item
            name="validationSplit"
            label="Tamaño de muestra para validación"
            initialValue={0.1}
            rules={[
              {
                required: true,
                message: 'Inserte alguna cantidad aunque sea 0',
              },
            ]}
          >
            <InputNumber min={0} max={99} addonAfter={<strong>%</strong>} />
          </Form.Item>

          <Form.Item
            name="modelId"
            label="Modelo base"
            rules={[
              {
                required: true,
                message: 'Necesario seleccionar un modelo base',
              },
            ]}
          >
            <Select
              placeholder="Modelos disponible seleccionado"
              options={availableModelIDs}
              loading={isLoadingModels}
            />
          </Form.Item>

          <Form.Item>
            <Button
              htmlType="submit"
              disabled={isLoadingModels}
              icon={
                wasRecientlyNewTaskAdded ? (
                  <LoadingOutlined />
                ) : undefined
              }
            >
              Agregar tarea de reentrenamiento
            </Button>
          </Form.Item>
        </Form>
      </Space>

      {wasRecientlyNewTaskAdded && (
        <Alert type="info" icon={<LoadingOutlined />} message="Preparando..." />
      )}

      <Table loading={isWaitingForRealtimeData} columns={columns} dataSource={dataSource} />
    </Space>
  )
}

export default RetrainingListPage
