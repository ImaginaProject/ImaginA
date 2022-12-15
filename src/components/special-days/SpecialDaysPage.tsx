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
  Calendar,
  Tag,
  Tabs,
} from 'antd'
import type { CalendarMode } from 'antd/es/calendar/generateCalendar'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import customParseFormat from 'dayjs/plugin/customParseFormat'

// import Loading from '../loading/Loading'

import { DeleteOutlined, LoadingOutlined } from '@ant-design/icons'
import SpecialDays from '../../classes/SpecialDays'
import { SpecialDay } from '../../types/types'

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

const SpecialDaysPage: FunctionComponent<SpecialDaysPageProps> = () => {
  const [sd] = useState(new SpecialDays())
  const [isLoading, setIsLoading] = useState(false)
  const [specialDays, setSpecialDays] = useState<SpecialDay[]>([])
  const [errorAlertMessage, setErrorAlertMessage] = useState<string | null>(null)
  const [isDateWithRange, setIsDateWithRange] = useState(false)
  const [isAdding, setIsAdding] = useState(false)

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

  const onFormFinish = async (value: any) => {
    console.debug(value)
    setIsAdding(true)
    const dates: Dayjs[] = []

    if (value.dateEnd && value.date !== value.dateEnd) {
      // Get two dates
      const firstDate: Dayjs = value.date
      const secondDate: Dayjs = value.dateEnd

      // Get the min/max date
      const minDate = [firstDate, secondDate].reduce((a, b) => (a < b ? a : b))
      const maxDate = [firstDate, secondDate].reduce((a, b) => (a < b ? b : a))
      console.debug(minDate.format('DD/MM/YYYY'), '<', maxDate.format('DD/MM/YYYY'))
      if (minDate.format('DD/MM/YYYY') === maxDate.format('DD/MM/YYYY')) {
        showErrorAlert('Las fechas son la misma')
        form.resetFields()
        setIsAdding(false)
        return
      }

      // Take the first (AKA the min)
      let offsetDate = minDate.clone()

      // Go through the dates
      let watchDog = 100 * 365
      while (offsetDate <= secondDate && watchDog > 0) {
        dates.push(offsetDate.clone()) // Add the date
        console.debug('next date', offsetDate.toDate())
        offsetDate = offsetDate.add(1, 'd')
        watchDog -= 1
      }

      if (watchDog === 0) {
        console.error('Cannot go through the dates. From', minDate, 'to', maxDate)
        setIsAdding(false)
        return
      }
    } else {
      dates.push(value.date as Dayjs)
    }
    dates.map((date) => console.info('date:', date))

    // eslint-disable-next-line no-restricted-syntax
    for (let index = 0; index < dates.length; index += 1) {
      // We should do dayjs an standard, what do you think about? xD
      const currentDate = dayjs(dates[index])
      try {
        // eslint-disable-next-line no-await-in-loop
        const success = await sd.add(currentDate, value.isHoliday, value.isVacation)
        console.log('saved?', success)
        if (success) {
          // Nothing, because now we are into a loop
        } else {
          showErrorAlert('No puede agregar esa fecha. Verifique que no esté duplicada')
        }
      } catch (err) {
        console.error(err)
      }
    }

    form.resetFields()
    requestAllSpecialDays().catch((reason) => {
      console.error(reason)
      showErrorAlert(JSON.stringify(reason))
    })
    setIsAdding(false)
  }

  const onDelete = (item: SpecialDay) => {
    setSpecialDays((previous) => previous.filter((_sd) => _sd !== item))

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

  const dateCellRender = (date: any) => {
    const value = dayjs(date)

    // console.log('value!:', value)
    const [currentDay, setCurrentDay] = useState<SpecialDay | undefined>()
    useEffect(() => {
      const matches = specialDays.filter((_sd) => {
        if (!value) return false
        return dayjs(_sd.date).format('DD/MM/YYYY') === value.format('DD/MM/YYYY')
      })
      setCurrentDay(matches[0])
    }, [value])

    if (!currentDay) {
      return (
        <Tag>
          <span>Día normal</span>
        </Tag>
      )
    }

    if (currentDay.isHoliday && currentDay.isVacation) {
      return (
        <>
          <Tag color="magenta">
            <strong>Festivo</strong>
          </Tag>
          <Tag color="green">
            <strong>Vacaciones</strong>
          </Tag>
        </>
      )
    }

    if (currentDay.isHoliday) {
      return (
        <Tag color="magenta">
          <strong>Festivo</strong>
        </Tag>
      )
    }

    if (currentDay.isVacation) {
      return (
        <Tag color="green">
          <strong>Vacaciones</strong>
        </Tag>
      )
    }

    return (
      <Tag>
        <span>Día normal</span>
      </Tag>
    )
  }

  const monthCellRender = (date: any) => {
    const value = dayjs(date)
    const stringDays = specialDays
      .filter((_sd) => dayjs(_sd.date).format('MM/YYYY') === value.format('MM/YYYY'))
      .map((_sd) => dayjs(_sd.date).format('DD'))
      .map((day) => Number.parseInt(day, 10))
      .join(', ')
    if (!stringDays) return <p>Sin días</p>
    return (
      <p>
        días:
        {' '}
        {stringDays}
      </p>
    )
  }

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>
        Configuración de días especiales
      </Typography.Title>

      {/* Form that asks for date */}
      <Space direction="vertical" style={{ width: '100%' }}>
        <Typography.Text strong>Agregar nuevo día</Typography.Text>
        <Form {...formItemLayout} form={form} onFinish={onFormFinish}>
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
          <Form.Item label="¿Rango de fecha?">
            <Checkbox
              defaultChecked={isDateWithRange}
              onChange={(e) => setIsDateWithRange(e.target.checked)}
            >
              Sí
            </Checkbox>

          </Form.Item>
          {isDateWithRange && (
          <Form.Item
            label="Fecha final"
            name="dateEnd"
            rules={isDateWithRange ? [
              {
                required: true,
                message: '¡Escriba la fecha final!',
              },
            ] : undefined}
          >
            <DatePicker />
          </Form.Item>
          )}
          <Typography.Text strong>Configuración del día</Typography.Text>
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
          <Form.Item wrapperCol={{ span: 12, offset: 6 }}>
            <Button
              type="primary"
              htmlType="submit"
              disabled={isAdding}
              icon={isAdding && <LoadingOutlined />}
            >
              Submit
            </Button>
          </Form.Item>
        </Form>
      </Space>
      {errorAlertMessage !== null && <Alert message={errorAlertMessage} type="error" />}
      <Divider />
      <Tabs
        items={[
          {
            label: 'Calendario',
            key: '1',
            children: (
              <Calendar
                dateCellRender={dateCellRender}
                monthCellRender={monthCellRender}
                onPanelChange={(value: any, mode: CalendarMode) => {
                  console.log((value as Dayjs).format('YYYY-MM-DD'), mode)
                }}
                onChange={(date) => console.log('date:', date)}
                onSelect={(date) => console.log('select:', date)}
              />
            ),
          },
          {
            label: 'Listado',
            key: '2',
            children: (
              <List
                dataSource={specialDays}
                renderItem={(item: SpecialDay) => (
                  <List.Item
                    actions={[
                      <Button danger onClick={() => onDelete(item)}>
                        <DeleteOutlined />
                      </Button>,
                    ]}
                  >
                    <Skeleton title={false} loading={isLoading} active>
                      <Typography.Text strong>
                        Fecha:
                        {' '}
                        {dayjs(item.date).format('DD/MM/YYYY')}
                      </Typography.Text>
                      {item.isHoliday ? (
                        <Badge count="Festivo" style={{ backgroundColor: 'greenyellow' }} />
                      ) : (
                        <Badge count="No festivo" style={{ backgroundColor: 'orangered' }} />
                      )}
                      {item.isVacation ? (
                        <Badge count="Día vacaciones" style={{ backgroundColor: 'red' }} />
                      ) : (
                        <Badge count="No es vacaciones" style={{ backgroundColor: 'olivedrab' }} />
                      )}
                    </Skeleton>
                  </List.Item>
                )}
              />
            ),
          },
        ]}
      />
    </Space>
  )
}

export default SpecialDaysPage
