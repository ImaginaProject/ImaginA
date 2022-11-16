import { FunctionComponent, useState, useEffect } from 'react'
import {
  Space,
  DatePicker,
  Checkbox,
  Button,
  List,
  Typography,
  Skeleton,
  Form,
  Divider,
  Badge,
  Alert,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import Loading from '../loading/Loading'

import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import SpecialDays from '../../classes/SpecialDays'
import type { SpecialDayResponse, SpecialDay } from '../../types/types'

// Load the plugins
dayjs.locale('es')
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(customParseFormat)


export interface SpecialDaysPageProps {}

const formItemLayout = {
  labelCol: { span: 6 },
  wrapperCol: { span: 14 },
}

const SpecialDaysPage: FunctionComponent<SpecialDaysPageProps> = (props) => {
  const [sd, setSd] = useState(new SpecialDays())
  const [isLoading, setIsLoading] = useState(false)
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
  const [errorAlertMessage, setErrorAlertMessage] = useState<string | null>(null);
  const [isDateWithRange, setIsDateWithRange] = useState(false);

  const [form] = Form.useForm()

  const requestAllSpecialDays = async () => {
    setIsLoading(true)
    try {
      const allDays = await sd.getAll()
      setSpecialDays(allDays.sort((a, b) => {
        if (a.date > b.date) return 1
        if (a.date < b.date) return -1
        return 0
      }))
    } finally {
      setIsLoading(false)
    }
  }

  const showErrorAlert = (message: string) => {
    setErrorAlertMessage(message)
    setTimeout(() => setErrorAlertMessage(null), 4000)
  }

  useEffect(() => {
    requestAllSpecialDays().catch((reason) => console.error(reason))
  }, [])

  const onFormFinish = (value: any) => {
    console.debug(value)
    sd.add(value.date, value.isHoliday, value.isVacation)
      .then((success) => {
        console.log('saved?', success)
        if (success) {
          requestAllSpecialDays().catch((reason) => {
            console.error(reason)
            showErrorAlert(JSON.stringify(reason))
          })
        } else {
          showErrorAlert('No puede agregar esa fecha. Verifique que no esté duplicada')
        }
      })
      .finally(() => {
        form.resetFields()
      })
  }

  const onDelete = (item: SpecialDay) => {
    sd.delete(item.date).then((success) => {
      if (success) {
        requestAllSpecialDays().catch((reason) => {
          console.error(reason)
          showErrorAlert(JSON.stringify(reason))
        })
      } else {
        showErrorAlert('No puede eliminar ese elemento')
      }
    }).catch((reason) => showErrorAlert(reason))
  }

  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      <Typography.Title>
        Configuración de días especiales
      </Typography.Title>
  
      {/* Form that asks for date */}
      <Space direction='vertical' style={{ width: '100%'}}>
        <Typography.Text strong>Agregar nuevo día</Typography.Text>
        <Form {...formItemLayout} form={form} onFinish={onFormFinish}>
          <Form.Item
            name='date'
            label='Fecha'
            rules={[
              {
                required: true,
                message: '¡Escriba la fecha!',
              },
            ]}
          >
            <DatePicker/>
          </Form.Item>
          <Form.Item label='¿Rango de fecha?'>
            <Checkbox
              defaultChecked={isDateWithRange}
              onChange={(e) => setIsDateWithRange(e.target.checked)}
            >
              Sí
            </Checkbox>
            
          </Form.Item>
          {isDateWithRange && (
          <Form.Item
            label='Fecha final'
            name='dateEnd'
            rules={isDateWithRange ? [
              {
                required: true,
                message: '¡Escriba la fecha final!',
              },
            ] : undefined}
          >
            <DatePicker/>
          </Form.Item>
          )}
          <Typography.Text strong>Configuración del día</Typography.Text>
          <Form.Item label='Día es festivo' name='isHoliday' valuePropName='checked'>
            <Checkbox value={true}>
              Es festivo
            </Checkbox>
          </Form.Item>
          <Form.Item label='Día es vacaciones' name='isVacation' valuePropName='checked'>
            <Checkbox value={true}>
              Es vacaciones
            </Checkbox>
          </Form.Item>
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Button type='primary' htmlType='submit'>
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Space>
      {errorAlertMessage !== null && <Alert message={errorAlertMessage} type='error'/>}
      <Divider/>
      <List
        dataSource={specialDays}
        renderItem={(item: SpecialDay) => (
          <List.Item
            actions={[
              <Button danger onClick={() => onDelete(item)}>
                <DeleteOutlined/>
              </Button>
            ]}
          >
            <Skeleton title={false} loading={isLoading} active>
              <Typography.Text strong>
                Fecha: {dayjs(item.date).format('DD/MM/YYYY')}
              </Typography.Text>
              {item.isHoliday ? (
                <Badge count='Festivo' style={{backgroundColor: 'greenyellow'}} />
              ) : (
                <Badge count='No festivo' style={{backgroundColor: 'orangered'}} />
              )}
              {item.isVacation ? (
                <Badge count='Día vacaciones' style={{backgroundColor: 'red'}} />
              ) : (
                <Badge count='No es vacaciones' style={{backgroundColor: 'olivedrab'}} />
              )}
            </Skeleton>
          </List.Item>
        )}
      />
    </Space>
  )
}

export default SpecialDaysPage
