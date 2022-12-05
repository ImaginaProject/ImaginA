import {
  FunctionComponent,
  useState,
  useEffect,
} from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Space,
  DatePicker,
  Select,
  Typography,
  Form,
  InputNumber,
  Button,
} from 'antd'
import dayjs from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import Loading from '../loading/Loading'
import DailyCapacity from '../../classes/DailyCapacity'
import { ExistentModel } from '../../types/types'

// Load the plugins
dayjs.locale('es')
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(customParseFormat)

// Register some stuffs that will be used to custom the graph
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
)

export interface DailyCapacityPageProps {}

const DailyCapacityPage: FunctionComponent<DailyCapacityPageProps> = () => {
  const [dc] = useState(new DailyCapacity())
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAllModels, setIsLoadingAllModels] = useState(false)

  const [posibleTrainedModelList, setPossibleTrainedModelList] = useState<ExistentModel[]>([])

  const [form] = Form.useForm()

  const onFormFinish = (values: any) => {
    console.log(values)
    setIsLoading(true)
    dc.predicePersonAmount(values.startDate, values.endDate, values.modelId, values.price)
      .then((prediction) => {
        console.debug('got prediction', prediction)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  useEffect(() => {
    setIsLoadingAllModels(true)
    dc.requestAllModels()
      .then((allModels) => {
        console.debug('got all models', allModels)
        setPossibleTrainedModelList(dc.possibleTrainedModels)
      })
      .finally(() => {
        setIsLoading(false) // TODO: for now eh!
        setIsLoadingAllModels(false)
      })
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Form
        form={form}
        onFinish={onFormFinish}
      >
        <Form.Item
          name="startDate"
          label="Fecha inicio"
          initialValue={dayjs(new Date()).add(-5, 'days')}
          rules={[
            {
              required: true,
              message: 'La fecha inicial es requerida',
            },
          ]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="endDate"
          label="Fecha fin"
          initialValue={dayjs(new Date())}
          rules={[
            {
              required: true,
              message: 'La fecha final es requerida',
            },
          ]}
        >
          <DatePicker />
        </Form.Item>

        <Form.Item
          name="price"
          label="Precio"
          initialValue={1}
          rules={[
            {
              required: true,
              message: 'El precio es requerido',
            },
          ]}
        >
          <InputNumber min={0} />
        </Form.Item>

        <Form.Item name="modelId" label="Modelo">
          <Select
            placeholder="Realizar predicción usando"
            loading={isLoadingAllModels}
            // value={selectedModel?.id}
            options={posibleTrainedModelList.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            // onChange={onModelSelectionChange}
          />
        </Form.Item>

        <Form.Item>
          <Button htmlType="submit" type="primary">
            Predecir
          </Button>
        </Form.Item>
      </Form>

      <Typography.Text>
        {dc.lastPrediction.length}
        {' '}
        resultados predichos
      </Typography.Text>
      {isLoading ? <Loading /> : <Bar options={dc.graphOptions} data={dc.barData} />}
    </Space>
  )
}

export default DailyCapacityPage
