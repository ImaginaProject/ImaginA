import {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react'
// import dayjs, { Dayjs } from 'dayjs'
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
  Image,
} from 'antd'

import DailyCapacity from '../../classes/DailyCapacity'
import { ExistentModel } from '../../types/types'

const ENDPOINT = import.meta.env.VITE_APP_ENDPOINT

export interface PriceOptimizationPageProps {}

const PriceOptimizationPage: FunctionComponent<PriceOptimizationPageProps> = () => {
  const [dc] = useState(new DailyCapacity());
  const [possibleTrainedModelList, setPossibleTrainedModelList] = useState<ExistentModel[]>([]);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [form] = Form.useForm()

  const onFormFinish = useCallback((values: any) => {
    console.log('form:', values)
    const payload = {
      date: values.date.format('DD/MM/YYYY'),
      min_price: values.minPrice,
      max_price: values.maxPrice,
      model_id: values.modelId,
    }

    fetch(`${ENDPOINT}/daily-capacity/optimize-prices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      body: JSON.stringify(payload),
    }).then((response) => response.json())
      .then((data) => setImageB64(data.image))
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    dc.requestAllModels().then((models) => {
      console.debug('got all models', models)
      setPossibleTrainedModelList(dc.possibleTrainedModels)
    })
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>Optimización de precios</Typography.Title>
      <Space direction="vertical">
        <Typography.Text>
          Inserte datos de predicción
        </Typography.Text>
        <Form form={form} onFinish={onFormFinish}>
          <Form.Item
            label="Modelo"
            name="modelId"
            rules={[
              { required: true, message: 'Seleccione un modelo para usar' },
            ]}
          >
            <Select
              style={{ width: '100%' }}
              options={possibleTrainedModelList.map((model) => ({
                label: model.name,
                value: model.id,
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Fecha"
            name="date"
            rules={[
              { required: true, message: 'La fecha es requerida' },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Form.Item
                label="Precio mínimo"
                name="minPrice"
                rules={[
                  { required: true, message: 'Fije un precio mínimo' },
                ]}
              >
                <InputNumber min={0} />
              </Form.Item>
            </Col>
            <Col md={12} sm={24}>
              <Form.Item
                label="Precio máximo"
                name="maxPrice"
                rules={[
                  { required: true, message: 'Fije un precio máximo' },
                ]}
              >
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

      {imageB64 && <Image width="100%" src={imageB64} />}
    </Space>
  )
}

export default PriceOptimizationPage
