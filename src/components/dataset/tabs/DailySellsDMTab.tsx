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
} from 'antd'
import { useTranslate } from 'react-admin'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import DailySellsDM from '../../../classes/dataset-manager/DailySellsDM'
import type { DailySellsDB } from '../../../types/types'

export interface DailySellsDMTabProps {}

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

const DailySellsDMTab: FunctionComponent<DailySellsDMTabProps> = () => {
  const [dm] = useState(new DailySellsDM())
  const [isLoading, setIsLoading] = useState(false)
  const [dataSource, setDataSource] = useState<(DailySellsDB & { key: any })[]>([])

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
      purchaseDate,
      eventDate,
      footfall,
      price,
    } = value
    console.debug('save', value)

    setIsFormSubmiting(true)

    dm.add({
      id: '',
      purchase: {
        date: purchaseDate.toDate(),
      },
      event: {
        date: eventDate.toDate(),
      },
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

  const columns: ColumnsType<DailySellsDB> = [
    {
      title: 'fecha de compra',
      key: 'purchase',
      dataIndex: 'purchase',
      render: (purchase: {date: Date}) => dayjs(purchase.date).format('DD/MM/YYYY'),
      sorter: (a, b) => {
        if (a.purchase.date === b.purchase.date) return 0
        if (a.purchase.date > b.purchase.date) return 1
        return -1
      },
    },
    {
      title: 'fecha del evento',
      key: 'event',
      dataIndex: 'event',
      render: (event: {date: Date}) => dayjs(event.date).format('DD/MM/YYYY'),
      sorter: (a, b) => {
        if (a.event.date === b.event.date) return 0
        if (a.event.date > b.event.date) return 1
        return -1
      },
    },
    {
      title: translate('imagina.word.footfall'),
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
      title: translate('imagina.word.price'),
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
      title: translate('imagina.word.options'),
      key: 'options',
      render: (item: DailySellsDB) => (
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
        {/* eslint-disable-next-line no-alert */}
        <Button disabled onClick={() => alert('Not implement yet')}>
          {translate('imagina.dataset.manager.add_from_file')}
        </Button>
      </Space>

      <Divider />
      <Table columns={columns} dataSource={dataSource} loading={isLoading} />

      <Modal
        footer={false}
        open={isFormShown}
        onCancel={closeForm}
      >
        <Typography.Title>
          {translate('imagina.dataset.modal.add_data')}
        </Typography.Title>
        <Form
          form={form}
          onFinish={onFinishForm}
          initialValues={{
            date: dayjs(new Date()),
          }}
        >
          <Form.Item
            name="purchaseDate"
            label={translate('imagina.word.purchase_date')}
            rules={[
              {
                required: true,
                message: translate('imagina.dataset.manager.write_purchase_date'),
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            name="eventDate"
            label={translate('imagina.word.event_date')}
            rules={[
              {
                required: true,
                message: translate('imagina.dataset.manager.write_event_date'),
              },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label={translate('imagina.word.footfall')}
            name="footfall"
            rules={[
              {
                required: true,
                message: translate('imagina.dataset.manager.write_footfall'),
              },
              {
                type: 'integer',
                message: translate('imagina.form.error.required_integer'),
              },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject(
                      new Error(translate('imagina.form.error.require_positive_integer')),
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
            label="Precio"
            rules={[
              { required: true, message: 'El precio es requerido' },
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
            {translate('imagina.word.submit')}
          </Button>
        </Form>
      </Modal>
    </Space>
  )
}

export default DailySellsDMTab
