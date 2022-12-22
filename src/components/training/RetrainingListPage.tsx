import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import dayjs from 'dayjs'
import { useLocation } from 'react-router-dom'
import type { Key } from 'react'
import {
  Space,
  Button,
  Table,
  Form,
  Input,
  InputNumber,
  Select,
  Alert,
  Tag,
  Tooltip,
  Radio,
} from 'antd'
import {
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons'

import { useTranslate } from 'react-admin'

// import dayjs, { Dayjs } from 'dayjs'
import type { ColumnsType } from 'antd/es/table'

import type { RetrainedInfo } from '../../types/types'
import RetrainingManager from '../../classes/RetrainingManager'
import DailyCapacity from '../../classes/DailyCapacity'
import Uploader from '../utils/Uploader'

type DateSource = RetrainedInfo & { key: Key }
type AvailableModelID = {
  label: string,
  value: string,
}

export interface RetrainingListPageProps {}

const ENABLE_TYPE = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
]

const RetrainingListPage: FunctionComponent<RetrainingListPageProps> = () => {
  const [rm] = useState(new RetrainingManager())
  const [dc] = useState(new DailyCapacity())
  const [dataSource, setDataSource] = useState<DateSource[]>([])
  const [isWaitingForRealtimeData, setIsWaitingForRealtimeData] = useState(true)
  const [availableModelIDs, setAvailableModelIDs] = useState<AvailableModelID[]>([])
  const [isLoadingModels, setIsLoadingModels] = useState(false)
  const [wasRecientlyNewTaskAdded, setWasRecientlyNewTaskAdded] = useState(false)

  const [sourceFrom, setSourceFrom] = useState('file');

  const [
    autoInitialSelectedModelId,
    setAutoInitialSelectedModelId,
  ] = useState<string | undefined>(undefined)

  const [form] = Form.useForm()
  const translate = useTranslate()
  const location = useLocation()

  const columns: ColumnsType<DateSource> = [
    {
      title: translate('imagina.training.retraining.process'),
      key: 'process',
      dataIndex: 'name',
    },
    {
      title: translate('imagina.training.retraining.state'),
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
          <Tag color={color}>{translate(`imagina.training.retraining.states.${item}`, { _: item })}</Tag>
        )
      },
    },
    {
      title: translate('imagina.training.retraining.start_hour'),
      key: 'start-time',
      dataIndex: 'startDate',
      render: (item: string | null) => {
        if (item === null) return <em>No hay dato</em>
        // return item.format('DD/MM/YYYY H:m:s A')
        return <p>{item}</p>
      },
    },
    {
      title: translate('imagina.training.retraining.end_hour'),
      key: 'end-time',
      dataIndex: 'endDate',
      render: (item: string | null) => {
        if (item === null) return <em>No hay dato</em>
        // return item.format('DD/MM/YYYY H:m:s A')
        return <p>{item}</p>
      },
    },
    {
      title: translate('imagina.training.retraining.epochs'),
      key: 'epochs',
      // dataIndex: 'epochs',
      render: (item: DateSource) => {
        const { epochs, targetEpochs } = item
        return (
          <p>
            {translate('imagina.training.retraining.epochs_of', { epochs, epochTotal: targetEpochs })}
          </p>
        )
      },
    },
    {
      title: translate('imagina.general.options'),
      key: 'opctions',
      render: (item: RetrainedInfo) => (
        <Space key={item.taskId}>
          <Tooltip title={`${translate('imagina.general.delete')} "${item.name}"`}>
            <Button
              danger
              onClick={() => {
                rm.deleteLog(item.taskId)
              }}
            >
              <DeleteOutlined />
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ]

  const activeRetraining = (values: any) => {
    console.log('form:', values)
    let uploadFile: null | string = null

    if (values.source === 'file') {
      const fileList = values?.fileList as any[] || []
      if (fileList.length === 0) {
        // eslint-disable-next-line no-alert
        alert('No hay archivo que subir')
        return
      }
      const file = fileList[0]
      uploadFile = file.response.file as string
    }

    setWasRecientlyNewTaskAdded(true)
    rm.retrain(
      values.modelId,
      uploadFile,
      values.epochs,
      values.name,
      values.testSize,
      values.validationSplit,
    ).then(() => {
      form.resetFields()
    }).catch((err) => {
      console.error(err)
    }).finally(() => {
      console.log('Ok, I am happy)))')
      setWasRecientlyNewTaskAdded(() => false)
    })
  }

  useEffect(() => {
    console.debug('initialSelectedModelId', location.state?.initialSelectedModelId)
    rm.active((ls) => {
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
    }, true).catch((err) => console.error(err))

    setIsLoadingModels(true)
    dc.requestAllModels().then((registeredModels) => {
      // Get the earlier model
      if (registeredModels.length > 0) {
        const earlierModelId = registeredModels.map((modelInfo) => {
          const dateString = modelInfo.last_date
          const day = dayjs(dateString)
          // console.debug('modelInfo.md5_sum', modelInfo.md5_sum)
          return {
            day,
            modelId: modelInfo.md5_sum,
          }
        }).sort((a, b) => {
          if (a.day > b.day) return 1
          if (a.day < b.day) return -1
          return 0
        }).map((element) => element.modelId)[0]
        console.debug('earlierModelId', earlierModelId)
        setAutoInitialSelectedModelId(earlierModelId)
      }
      const options = registeredModels.map((modelInfo) => {
        const dateString = modelInfo.last_date
        const day = dayjs(dateString)
        return {
          label: `${modelInfo.name} - ${day.format('DD MMM, YYYY - HH:mm:ss')}`,
          value: modelInfo.md5_sum,
        }
      })
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
            label={translate('imagina.general.name')}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_name'),
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="epochs"
            label={translate('imagina.training.retraining.epochs')}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_epochs_amount'),
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
            name="source"
            label="Fuente"
            initialValue={sourceFrom}
            rules={[
              { required: true, message: 'La fuente es requerida' },
            ]}
          >
            <Radio.Group
              value={sourceFrom}
              onChange={(e) => {
                console.debug('source:', e.target.value)
                setSourceFrom(e.target.value)
              }}
            >
              <Radio value="dataset">Desde dataset</Radio>
              <Radio value="file">Desde archivo</Radio>
            </Radio.Group>
          </Form.Item>
          {sourceFrom === 'file' && (
            <Form.Item
              name="fileList"
              label={translate('imagina.general.file')}
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
                  message: translate('imagina.form.error.required_file'),
                },
              ]}
            >
              <Uploader
                enableType={ENABLE_TYPE}
                label={translate('imagina.training.retraining.upload_new_csv_or_xlsx_data')}
              />
            </Form.Item>
          )}
          <Form.Item
            name="testSize"
            label={translate('imagina.training.retraining.test_size')}
            initialValue={0.1}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_test_size'),
              },
            ]}
          >
            <InputNumber min={0} max={99} addonAfter={<strong>%</strong>} />
          </Form.Item>
          <Form.Item
            name="validationSplit"
            label={translate('imagina.training.retraining.validation_split')}
            initialValue={0.1}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_validation_split'),
              },
            ]}
          >
            <InputNumber min={0} max={99} addonAfter={<strong>%</strong>} />
          </Form.Item>

          <Form.Item
            name="modelId"
            label={translate('imagina.training.retraining.model_base')}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_model_base'),
              },
            ]}
            initialValue={location.state?.initialSelectedModelId || autoInitialSelectedModelId}
          >
            <Select
              placeholder={translate('imagina.training.retraining.selected_model')}
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
              {translate('imagina.training.retraining.submit')}
            </Button>
          </Form.Item>
        </Form>
      </Space>

      {wasRecientlyNewTaskAdded && (
        <Alert type="info" icon={<LoadingOutlined />} message={translate('imagina.training.retraining.working')} />
      )}

      <Table loading={isWaitingForRealtimeData} columns={columns} dataSource={dataSource} />
    </Space>
  )
}

export default RetrainingListPage
