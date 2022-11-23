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
  Checkbox,
  InputNumber,
} from 'antd'
import { useTranslate } from 'react-admin'
import type { ColumnsType } from 'antd/es/table'
import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import DatasetManager from '../../classes/DatasetManager'
import type { DailyCapacityDB } from '../../types/types'

export interface DatasetManagerPageProps {}

interface DeleteButtonProps {
  children: ReactNode,
  onDelete: () => Promise<void>,
}
const DeleteButton: FunctionComponent<DeleteButtonProps> = (props) => {
  const { children, onDelete } = props
  const [isLoading, setIsLoading] = useState(false);

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

const DatasetManagerPage: FunctionComponent<DatasetManagerPageProps> = () => {
  const [dm] = useState(new DatasetManager());
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<(DailyCapacityDB & { key: any })[]>([]);

  const [isAddingFormShown, setIsAddingFormShown] = useState(false);
  const [isAddingFormSubmiting, setIsAddingFormSubmiting] = useState(false);

  const [addingForm] = Form.useForm()
  const translate = useTranslate()

  const openAddingForm = () => {
    setIsAddingFormShown(true)
  }

  const closeAddingForm = () => {
    addingForm.resetFields()
    setIsAddingFormShown(false)
  }

  const requestAllEntries = async () => {
    setIsLoading(true)

    try {
      await dm.requestAll();
      setDataSource(dm.datasetList.map((item, key) => ({ key, ...item })))
    } finally {
      setIsLoading(false)
    }
  }

  const onFinishAddingForm = (value: any) => {
    const {
      date,
      isHoliday,
      isVacation,
      footfall,
    } = value
    console.debug('save', value)

    setIsAddingFormSubmiting(true)

    dm.add({
      id: '', // Empty because this field is set by the Back-End
      date,
      isHoliday: !!isHoliday, // Avoid send undefined, send false instead
      isVacation: !!isVacation, // Avoid send undefined, send false instead
      footfall,
    }).then((success) => {
      if (success) {
        requestAllEntries()
      }
    }).finally(() => {
      setIsAddingFormSubmiting(false)
      closeAddingForm()
    })
  }

  const columns: ColumnsType<DailyCapacityDB> = [
    {
      title: translate('date', { start: true }),
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
      title: translate('holiday', { start: true }),
      key: 'holiday',
      dataIndex: 'isHoliday',
      render: (item: boolean) => (item ? 'Sí' : 'No'),
      filters: [
        {
          text: translate('it.is.holiday'),
          value: true,
        },
        {
          text: translate('it.is.not.holiday'),
          value: false,
        },
      ],
      onFilter: (value, record) => record.isHoliday === value,
    },
    {
      title: translate('vacation', { start: true }),
      key: 'vacation',
      dataIndex: 'isVacation',
      render: (item: boolean) => (item ? 'Sí' : 'No'),
      filters: [
        {
          text: translate('it.is.vacation'),
          value: true,
        },
        {
          text: translate('it.is.not.vacation'),
          value: false,
        },
      ],
      onFilter: (value, record) => record.isVacation === value,
    },
    {
      title: translate('footfall', { start: true }),
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
      title: translate('options', { start: true }),
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
      <Typography.Title>
        {translate('dataset.manager.title', { start: true })}
      </Typography.Title>
      <Typography.Text>
        {translate('dataset.manager.description', { start: true, end: true })}
      </Typography.Text>

      <Space direction="horizontal">
        <Button onClick={openAddingForm} type="primary">
          {translate('add.a.element', { start: true })}
        </Button>
        {/* eslint-disable-next-line no-alert */}
        <Button disabled onClick={() => alert('Not implement yet')}>
          {translate('add.from.file', { start: true })}
        </Button>
      </Space>

      <Divider />
      <Table columns={columns} dataSource={dataSource} loading={isLoading} />

      <Modal
        footer={false}
        open={isAddingFormShown}
        onCancel={closeAddingForm}
      >
        <Typography.Title>
          {translate('add.individual.data', { start: true })}
        </Typography.Title>
        <Form
          form={addingForm}
          onFinish={onFinishAddingForm}
          initialValues={{
            date: dayjs(new Date()),
          }}
        >
          <Form.Item
            name="date"
            label={translate('date', { start: true })}
            rules={[
              {
                required: true,
                message: translate(
                  'dataset.manager.write-date',
                  { start: true, exclamation: true },
                ),
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item
            label={translate('holiday.day', { start: true })}
            name="isHoliday"
            valuePropName="checked"
          >
            <Checkbox value>{translate('it.is.holiday')}</Checkbox>
          </Form.Item>
          <Form.Item
            label={translate('vacation.day', { start: true })}
            name="isVacation"
            valuePropName="checked"
          >
            <Checkbox value>{translate('it.is.vacation')}</Checkbox>
          </Form.Item>
          <Form.Item
            label={translate('footfall', { start: true })}
            name="footfall"
            rules={[
              {
                required: true,
                message: translate('dataset.manager.write-footfall'),
              },
              {
                type: 'integer',
                message: translate('error.required.integer'),
              },
              {
                validator: (_, value) => {
                  if (value < 0) {
                    return Promise.reject(new Error(translate('error.non.positive.integer')))
                  }
                  return Promise.resolve()
                },
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            disabled={isAddingFormSubmiting}
            icon={(isAddingFormSubmiting && <LoadingOutlined />) || undefined}
          >
            {translate('submit', { start: true })}
          </Button>
        </Form>
      </Modal>
    </Space>
  )
}

export default DatasetManagerPage
