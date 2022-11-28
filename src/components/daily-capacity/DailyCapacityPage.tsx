import {
  FunctionComponent,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { Bar } from 'react-chartjs-2'
import {
  Space,
  DatePicker,
  Select,
  Typography,
} from 'antd'
import dayjs, { Dayjs } from 'dayjs'
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

  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)

  const [posibleTrainedModelList, setPossibleTrainedModelList] = useState<ExistentModel[]>([])
  const [selectedModel, setSelectedModel] = useState<ExistentModel | null>(null)

  const onModelSelectionChange = useCallback((value: any) => {
    const currentSelectedOnes = posibleTrainedModelList
      .filter((model) => model.id === value)
    if (currentSelectedOnes.length === 0) {
      console.error(`Cannot find the model for ID = ${value}`)
      return
    }
    setSelectedModel(currentSelectedOnes[0])
  }, [posibleTrainedModelList])

  useEffect(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 5)
    setStartDate(dayjs(yesterday))
    setEndDate(dayjs(new Date()))

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

  useEffect(() => {
    if (!startDate || !endDate) return
    if (!selectedModel) return

    setIsLoading(true)
    dc.predicePersonAmount(startDate, endDate, selectedModel.id)
      .then((prediction) => {
        console.debug('got prediction', prediction)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [startDate, endDate, selectedModel])

  if (isLoading) return <Loading />

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Space
        align="baseline"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <Space>
          {startDate && (
            <DatePicker
              defaultValue={startDate as any}
              onChange={(value: any) => setStartDate(value)}
            />
          )}
          {endDate && (
            <DatePicker
              defaultValue={endDate ? endDate as any : ''}
              onChange={(value: any) => setEndDate(value)}
            />
          )}
        </Space>

        <Space>
          <Select
            placeholder="Realizar predicción usando"
            loading={isLoadingAllModels}
            options={posibleTrainedModelList.map((model) => ({
              label: model.name,
              value: model.id,
            }))}
            onChange={onModelSelectionChange}
          />
        </Space>
      </Space>
      <Typography.Text>
        {dc.lastPrediction.length}
        {' '}
        resultados predichos
      </Typography.Text>
      <Bar options={dc.graphOptions} data={dc.barData} />
    </Space>
  )
}

export default DailyCapacityPage
