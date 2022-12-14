import {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react'

import {
  Space,
  Form,
  Typography,
  Button,
  Image,
  Select,
  InputNumber,
  DatePicker,
  Row,
  Col,
} from 'antd'

import DailySells from '../../classes/DailySells'
import { ExistentModel } from '../../types/types'

export interface DailySellsPageProps {}

const DailySellsPage: FunctionComponent<DailySellsPageProps> = () => {
  const [ds] = useState(new DailySells());
  const [possibleTrainedModelList, setPossibleTrainedModelList] = useState<ExistentModel[]>([]);
  const [imageB64, setImageB64] = useState<string | null>(null);
  const [form] = Form.useForm()

  const onFormFinish = useCallback((values: any) => {
    console.log('form:', values)

    ds.optimizePrices(
      values.modelId,
      values.purchaseDate,
      values.eventDate,
      '', // TODO: it is this for a future when it would be matter
      values.minPrice,
      values.maxPrice,
    ).then((base64Image) => setImageB64(base64Image))
      .catch((err) => console.error(err))
  }, [])

  useEffect(() => {
    ds.requestAllModels().then((models) => {
      console.debug('got all models', models)
      setPossibleTrainedModelList(ds.possibleTrainedModels)
    })
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>Ventas diarias</Typography.Title>
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
            label="Fecha de compra"
            name="purchaseDate"
            rules={[
              { required: true, message: 'La fecha es requerida' },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label="Fecha del evento"
            name="eventDate"
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
                <InputNumber
                  // min={0}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
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
                <InputNumber
                  // min={0}
                  formatter={(value) => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                />
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

export default DailySellsPage
