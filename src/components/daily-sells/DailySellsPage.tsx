import {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react'
import dayjs, { Dayjs } from 'dayjs'

import {
  Space,
  DatePicker,
  Form,
  Row,
  Select,
  Col,
  Typography,
  InputNumber,
  Button,
} from 'antd'

export interface DailySellsProps {}

const DailySells: FunctionComponent<DailySellsProps> = () => {
  const [form] = Form.useForm()

  const onFormFinish = useCallback((values: any) => {}, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>Ventas diarias</Typography.Title>
      <Space direction="vertical">
        <Typography.Text>
          Inserte datos de predicción
        </Typography.Text>
        <Form form={form} onFinish={onFormFinish}>
          <Form.Item label="Modelo" name="modelId">
            <Select style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label="Fecha" name="date">
            <DatePicker />
          </Form.Item>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Form.Item label="Precio mínimo" name="minPrice">
                <InputNumber min={0} />
              </Form.Item>
            </Col>
            <Col md={12} sm={24}>
              <Form.Item label="Precio máximo" name="maxPrice">
                <InputNumber min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item>
            <Button htmlType="submit">
              Predecir
            </Button>
          </Form.Item>
        </Form>
      </Space>

    </Space>
  )
}

export default DailySells
