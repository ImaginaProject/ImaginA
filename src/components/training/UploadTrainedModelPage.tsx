import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import TrainedModelsPageTab from './TrainedModelsPageTab'
import type { TrainedModelsPageTabProps } from './TrainedModelsPageTab'

export interface UploadTrainedModelPageProps {}

const tabData: (TrainedModelsPageTabProps & {label: string})[] = [
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/daily-capacity`,
    directory: 'daily-capacity',
    label: 'Modelo para aforo diario',
  },
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/daily-sells`,
    directory: 'daily-sells',
    label: 'Modelo para ventas diario',
  },
]

const tabs = tabData.map(({ label, ...data }) => ({
  label,
  key: data.directory,
  children: <TrainedModelsPageTab {...data} />,
}))

const UploadTrainedModelPage: FunctionComponent<UploadTrainedModelPageProps> = () => (
  <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
    <Typography.Title>Subir modelo entrenado</Typography.Title>
    <Tabs items={tabs} />
  </Space>
)

export default UploadTrainedModelPage
