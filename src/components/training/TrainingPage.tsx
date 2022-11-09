import { FunctionComponent, useState, useEffect, useMemo, Key } from 'react'
import { Space, Button, Typography, Progress, Upload, Table } from 'antd'
import dayjs from 'dayjs'
import Loading from '../loading/Loading'
import type { ColumnsType } from 'antd/es/table'


type RegisteredModel = {
  name: string,
  description: string,
  last_date: string,
  path: string,
  md5_sum: string,
}

interface DataType extends RegisteredModel {
  key: Key,
}

export interface TrainingPageProps {}

const TrainingPage: FunctionComponent<TrainingPageProps> = (props) => {
  const [allModels, setAllModels] = useState<RegisteredModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [dataSource, setDataSource] = useState<DataType[]>([]);

  const columns: ColumnsType<DataType> = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Descripción',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Última modificación',
      dataIndex: 'last_date',
      key: 'last_date',
    }
  ]

  useEffect(() => {
    const request = async () => {
      // Request all the models
      const responseAllModels = await fetch(
        `http://localhost:8000/daily-capacity/existent-models`,
      )
      const allModelsData = await responseAllModels.json()
      setAllModels(allModelsData.models as RegisteredModel[])
    }

    setIsLoading(true)
    request().then(() => setIsLoading(false))
  }, [])

  useEffect(() => {
    setDataSource(allModels.map((model) => ({
      key: model.md5_sum,
      ...model,
      last_date: dayjs(model.last_date).format('DD/MM/YYYY')
    })))
  }, [allModels])

  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      <Typography.Title>Subir modelo entrenado</Typography.Title>
      {isLoading ? (
        <Loading>Requesting all the models</Loading>
      ) : (
        <Table columns={columns} dataSource={dataSource}/>
      )}
    </Space>
  )
}

export default TrainingPage
