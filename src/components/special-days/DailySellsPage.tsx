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

import { useLocation } from 'react-router-dom'
import { useTranslate } from 'react-admin'

import DailySells from '../../classes/DailySells'
import { ExistentModel } from '../../types/types'

export interface DailySellsPageProps {}

const DailySellsPage: FunctionComponent<DailySellsPageProps> = () => {
  const [ds] = useState(new DailySells());
  const [possibleTrainedModelList, setPossibleTrainedModelList] = useState<ExistentModel[]>([]);
  const [imageB64, setImageB64] = useState<string | null>(null);

  const [form] = Form.useForm()
  const translate = useTranslate()
  const location = useLocation()

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
          {translate('imagina.daily_sells.insert_data')}
        </Typography.Text>
        <Form form={form} onFinish={onFormFinish}>
          <Form.Item
            label={translate('imagina.general.model')}
            name="modelId"
            rules={[
              { required: true, message: translate('imagina.form.error.required_model') },
            ]}
            initialValue={location.state?.initialSelectedModelId}
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
            label={translate('imagina.daily_sells.purchase_date')}
            name="purchaseDate"
            rules={[
              { required: true, message: translate('imagina.form.error.required_date') },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Form.Item
            label={translate('imagina.daily_sells.event_date')}
            name="eventDate"
            rules={[
              { required: true, message: translate('imagina.form.error.required_date') },
            ]}
          >
            <DatePicker />
          </Form.Item>

          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Form.Item
                label={translate('imagina.general.min_price')}
                name="minPrice"
                rules={[
                  { required: true, message: translate('imagina.form.error.required_price') },
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
                label={translate('imagina.general.max_price')}
                name="maxPrice"
                rules={[
                  { required: true, message: translate('imagina.form.error.required_price') },
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
              {translate('imagina.general.predice')}
            </Button>
          </Form.Item>
        </Form>
      </Space>

      {imageB64 && <Image width="100%" src={imageB64} />}
    </Space>
  )
}

export default DailySellsPage
