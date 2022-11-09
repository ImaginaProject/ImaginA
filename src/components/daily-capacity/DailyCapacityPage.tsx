import { FunctionComponent, useState, useEffect, useMemo } from 'react'
import { Bar } from 'react-chartjs-2'
import { Space, DatePicker, Dropdown, Button, Menu, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'

import Loading from '../loading/Loading'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

// Load the plugins
dayjs.locale('es')
dayjs.extend(weekday)
dayjs.extend(localeData)

// Register some stuffs that will be used to custom the graph
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)


type PredictionResult = {
  prediction: number,
  capacity: number,
  date: string,
}

type RegisteredModel = {
  name: string,
  description: string,
  last_date: string,
  path: string,
  md5_sum: string,
}

type ExistentModel = {
  name: string,
  id: string,
}

export interface DailyCapacityListProps {}

const graphOptions = {
  plugins: {
    legend: {
      position: 'right' as const,
    },
    title: {
      display: true,
      text: 'Daily capacities by days',
    },
  },
  responsive: true,
  scales: {
    x: {
      stacked: true,
    },
    y: {
      stacked: !true,
    },
  },
}

const DailyCapacityList: FunctionComponent<DailyCapacityListProps> = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Dayjs | null>(null)
  const [endDate, setEndDate] = useState<Dayjs | null>(null)

  const [predictionResult, setPredictionResult] = useState<PredictionResult[]>([]);
  const [allModels, setAllModels] = useState<RegisteredModel[]>([]);

  const [posibleTrainedModelList, setPosibleTrainedModelList] = useState<ExistentModel[]>([])

  useEffect(() => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 5)
    setStartDate(dayjs(yesterday))
    setEndDate(dayjs(new Date()))
  }, [])

  useEffect(() => {
    const results = allModels.map((model) => {
      const date_string: string = dayjs(model.last_date).format('DD MMMM')
      const result: ExistentModel = {
        id: model.md5_sum,
        name: `red "${model.name}" entrenada ${date_string}`
      }
      return result
    })
    setPosibleTrainedModelList(results)
  }, [allModels])

  useEffect(() => {
    const request = async () => {
      if (!startDate || !endDate) return;

      const startDateString = dayjs(startDate).format('DD/MM/YYYY')
      const endDateString = dayjs(endDate).format('DD/MM/YYYY')

      console.debug('request for date:', startDateString, 'to', endDateString)
      const response = await fetch(
        `http://localhost:8000/daily-capacity/person-amount-prediction?start_date=${startDateString}&end_date=${endDateString}`)
      const data = await response.json()

      // Save the prediction data
      setPredictionResult(data.capacities)

      // Request all the models
      const responseAllModels = await fetch(
        `http://localhost:8000/daily-capacity/existent-models`,
      )
      const allModelsData = await responseAllModels.json()
      setAllModels(allModelsData.models as RegisteredModel[])
    }

    setIsLoading(true)
    request().then(() => setIsLoading(false))
  }, [startDate, endDate])

  const menu = (
    <Menu>
      {posibleTrainedModelList.map((model) => (
        <Menu.Item key={model.id}>{model.name}</Menu.Item>
      ))}
    </Menu>
  )

  const barData = useMemo(() => {
    const labels = predictionResult.map((result) => {
      // dayjs(result.date, 'DD/MM/YYYY')
      return result.date
    })

    const realValue = predictionResult.map((result) => result.capacity)
    const predictionValue = predictionResult.map((result) => result.prediction)
    console.log(realValue)

    return {
      labels,
      datasets: [
      {
        label: 'real',
        data: realValue,
        backgroundColor: 'rgba(72, 129, 194, 0.7)'
      },
      {
        label: 'prediction',
        data: predictionValue,
        backgroundColor: 'rgba(219, 139, 59, 0.7)'
      },
      ]
    }
  }, [predictionResult])

  if (isLoading) return <Loading />

  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      <Space
        align='baseline'
        style={{
          display: 'flex',
          justifyContent: 'space-between'
        }}
      >
        <Space>
          {startDate && <DatePicker
            defaultValue={startDate as any}
            onChange={(value: any) => setStartDate(value)}
          />}
          {endDate && <DatePicker
            defaultValue={endDate ? endDate as any : ''}
            onChange={(value: any) => setEndDate(value)}
          />}
        </Space>
        
        <Space>
          <Dropdown overlay={menu} placement='bottomLeft'>
            <Button type='primary'>Realizar predicción usando</Button>
          </Dropdown>
        </Space>
      </Space>
      <Typography.Text>{predictionResult.length} resultados predichos</Typography.Text>
      <Bar options={graphOptions} data={barData} />
    </Space>
  )
}

export default DailyCapacityList
