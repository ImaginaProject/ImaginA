import {
  FunctionComponent,
  useEffect,
  useState,
  ReactNode,
} from 'react'
import dayjs from 'dayjs'
import {
  Space,
  Typography,
  Table,
  Button,
  Divider,
  Modal,
  Form,
  DatePicker,
  InputNumber,
  notification,
} from 'antd'
import { useTranslate } from 'react-admin'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import DailyCapacityDM from '../../../classes/dataset-manager/DailyCapacityDM'
import type { DailyCapacityDB } from '../../../types/types'
import Uploader, { OnChangeUploader } from '../../utils/Uploader'

export interface DailyCapacityDMTabProps {}

interface DeleteButtonProps {
  children: ReactNode,
  onDelete: () => Promise<void>,
}
const DeleteButton: FunctionComponent<DeleteButtonProps> = (props) => {
  const { children, onDelete } = props
  const [isLoading, setIsLoading] = useState(false)

  const onDeleteClick = async () => {
    setIsLoading(true)
    try {
      const success = await onDelete()
      console.info('deleting process successful:', success)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      disabled={isLoading}
      onClick={onDeleteClick}
      danger
    >
      {isLoading ? (
        <LoadingOutlined />
      ) : (
        children
      )}
    </Button>
  )
}

const DailyCapacityDMTab: FunctionComponent<DailyCapacityDMTabProps> = () => {
  const [dm] = useState(new DailyCapacityDM())
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<(DailyCapacityDB & { key: any })[]>([])

  const [isFormShown, setIsFormShown] = useState(false)
  const [isFormSubmiting, setIsFormSubmiting] = useState(false)

  const [form] = Form.useForm()
  const translate = useTranslate()

  const openForm = () => {
    setIsFormShown(true)
  }

  const closeForm = () => {
    form.resetFields()
    setIsFormShown(false)
  }

  const requestAllEntries = async () => {
    setIsLoading(true)

    try {
      await dm.requestAll()
      setDataSource(dm.datasetList.map((item, key) => ({ key, ...item })))
    } finally {
      setIsLoading(false)
    }
  }

  const onFinishForm = (value: any) => {
    const {
      date,
      footfall,
      price,
    } = value
    console.debug('save', value)

    setIsFormSubmiting(true)

    dm.add({
      id: '', // Empty because this field is set by the Back-End
      date,
      footfall,
      price,
    }).then((success) => {
      if (success) {
        requestAllEntries()
      }
    }).finally(() => {
      setIsFormSubmiting(false)
      closeForm()
    })
  }

  const onUploadedChange: OnChangeUploader = (fileList) => {
    if (fileList.length === 0) {
      console.info('no file in event on change')
      return
    }
    console.log('fileList', fileList)
    const file = fileList[0]
    if (!file.response?.file) {
      console.log('ignore non-uploaded file yet', file)
      return
    }

    dm.addFromUploadedFile(file.response.file).then((success) => {
      // TODO: use translate strings
      if (success) {
        notification.info({
          message: 'Dataset agregado',
          description: 'El archivo ha sido subido y ha sido agregado',
        })
      } else {
        notification.error({
          message: 'Error al agregar el dataset',
          description: 'Ha ocurrido un problema inesperado... en serio, no esperaba esto, no lo tenía en mis planes de problemas',
        })
      }
    }).catch((err) => {
      console.error(err)
      notification.error({
        message: 'Error al agregar el dataset',
        description: err.message,
      })
    })
  }

  const columns: ColumnsType<DailyCapacityDB> = [
    {
      title: translate('imagina.general.date'),
      key: 'date',
      dataIndex: 'date',
      render: (item: Date) => dayjs(item).format('DD/MM/YYYY'),
      sorter: (a, b) => {
        if (a.date === b.date) return 0
        if (a.date > b.date) return 1
        return -1
      },
    },
    {
      title: translate('imagina.general.footfall'),
      key: 'capacity',
      dataIndex: 'footfall',
      filters: [
        {
          text: '>= 10',
          value: 10,
        },
        {
          text: '>= 100',
          value: 100,
        },
        {
          text: '>= 1000',
          value: 1000,
        },
        {
          text: '>= 10000',
          value: 10000,
        },
      ],
      onFilter: (value, record) => record.footfall >= value,
    },
    {
      title: translate('imagina.general.price'),
      key: 'price',
      dataIndex: 'price',
      filters: [
        {
          text: '>= 1000',
          value: 1000,
        },
        {
          text: '>= 10000',
          value: 10000,
        },
        {
          text: '>= 100000',
          value: 100000,
        },
        {
          text: '>= 1000000',
          value: 1000000,
        },
      ],
      onFilter: (value, record) => record.footfall >= value,
    },
    {
      title: translate('imagina.general.options'),
      key: 'options',
      render: (item: DailyCapacityDB) => (
        <Space>
          <DeleteButton
            onDelete={async () => {
              const success = await dm.deleteById(item.id)
              if (success) {
                await requestAllEntries()
              }
            }}
          >
            <DeleteOutlined />
          </DeleteButton>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    requestAllEntries()
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space direction="horizontal">
        <Button onClick={openForm} type="primary">
          {translate('imagina.dataset.manager.add_element')}
        </Button>
        <Uploader
          label={translate('imagina.dataset.manager.add_from_file')}
          onChange={onUploadedChange}
        />
      </Space>

      <Divider />
      <Table columns={columns} dataSource={dataSource} loading={isLoading} />

      <Modal
        footer={false}
        open={isFormShown}
        onCancel={closeForm}
      >
        <Typography.Title>
          {translate('imagina.dataset.manager.modal.add_data')}
        </Typography.Title>
        <Form
          form={form}
          onFinish={onFinishForm}
          initialValues={{
            date: dayjs(new Date()),
          }}
        >
          <Form.Item
            name="date"
            label={translate('imagina.general.date')}
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_date'),
              },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label={translate('imagina.general.footfall')}
            name="footfall"
            rules={[
              {
                required: true,
                message: translate('imagina.form.error.required_footfall'),
              },
              {
                type: 'integer',
                message: translate('imagina.form.error.required_integer'),
              },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject(
                      new Error(translate('imagina.form.error.required_positive_integer')),
                    )
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <InputNumber />
          </Form.Item>

          <Form.Item
            name="price"
            label={translate('imagina.general.price')}
            rules={[
              { required: true, message: translate('imagina.form.error.required_price') },
            ]}
            initialValue={30000}
          >
            <InputNumber
              formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isFormSubmiting}
            icon={(isFormSubmiting && <LoadingOutlined />) || undefined}
          >
            {translate('imagina.general.submit')}
          </Button>
        </Form>
      </Modal>
    </Space>
  )
}

export default DailyCapacityDMTab
