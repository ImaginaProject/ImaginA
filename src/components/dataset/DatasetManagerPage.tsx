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
      await onDelete()
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
  const translate = useTranslate()
  const [dm] = useState(new DatasetManager());
  const [dataSource, setDataSource] = useState<(DailyCapacityDB & { key: any })[]>([]);

  const [isAddingFormShown, setIsAddingFormShown] = useState(false);

  const [addingForm] = Form.useForm()

  const openAddingForm = () => {
    setIsAddingFormShown(true)
  }

  const closeAddingForm = () => {
    addingForm.resetFields()
    setIsAddingFormShown(false)
  }

  const onFinishAddingForm = (value: any) => {
    const {
      date,
      isHoliday,
      isVacation,
      footfall,
    } = value
    console.debug('save', value)

    dm.add({
      id: '', // Empty because this field is set by the Back-End
      date,
      isHoliday,
      isVacation,
      footfall,
    }).finally(() => {
      closeAddingForm()
    })
  }

  const columns: ColumnsType<DailyCapacityDB> = [
    {
      title: 'Fecha',
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
      title: 'Festivo',
      key: 'holiday',
      dataIndex: 'isHoliday',
      render: (item: boolean) => (item ? 'Sí' : 'No'),
      filters: [
        {
          text: 'Festivos',
          value: true,
        },
        {
          text: 'No festivos',
          value: false,
        },
      ],
      onFilter: (value, record) => record.isHoliday === value,
    },
    {
      title: 'Vacaciones',
      key: 'vacation',
      dataIndex: 'isVacation',
      render: (item: boolean) => (item ? 'Sí' : 'No'),
      filters: [
        {
          text: 'Vacaciones',
          value: true,
        },
        {
          text: 'No vacaciones',
          value: false,
        },
      ],
      onFilter: (value, record) => record.isVacation === value,
    },
    {
      title: 'Gentío',
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
      title: 'Opciones',
      key: 'options',
      render: (item: DailyCapacityDB) => (
        <Space>
          <DeleteButton
            onDelete={async () => {
              await dm.deleteById(item.id)
            }}
          >
            <DeleteOutlined />
          </DeleteButton>
        </Space>
      ),
    },
  ]

  useEffect(() => {
    dm.requestAll().then(() => {
      setDataSource(dm.datasetList.map((item, key) => ({ key, ...item })))
    })
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>
        {translate('menu.dataset.manager.title', { start: true })}
      </Typography.Title>
      <Typography.Text>
        {translate('menu.dataset.manager.description', { start: true, end: true })}
      </Typography.Text>

      <Space direction="horizontal">
        <Button onClick={openAddingForm} type="primary">Agregar un elemento</Button>
        {/* eslint-disable-next-line no-alert */}
        <Button disabled onClick={() => alert('Not implement yet')}>Agregar desde archivo</Button>
      </Space>

      <Divider />
      <Table columns={columns} dataSource={dataSource} />

      <Modal
        footer={false}
        open={isAddingFormShown}
        onCancel={closeAddingForm}
      >
        <Typography.Title>Agregar dato individual</Typography.Title>
        <Form
          form={addingForm}
          onFinish={onFinishAddingForm}
        >
          <Form.Item
            name="date"
            label="Fecha"
            rules={[
              {
                required: true,
                message: '¡Escriba la fecha!',
              },
            ]}
          >
            <DatePicker />
          </Form.Item>
          <Form.Item label="Día es festivo" name="isHoliday" valuePropName="checked">
            <Checkbox value>
              Es festivo
            </Checkbox>
          </Form.Item>
          <Form.Item label="Día es vacaciones" name="isVacation" valuePropName="checked">
            <Checkbox value>
              Es vacaciones
            </Checkbox>
          </Form.Item>
          <Form.Item
            label="Aforo"
            name="footfall"
            rules={[
              {
                required: true,
                message: '¡Escriba el aforo!',
              },
            ]}
          >
            <InputNumber />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Submit
          </Button>
        </Form>
      </Modal>
    </Space>
  )
}

export default DatasetManagerPage
