import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import { useTranslate } from 'react-admin'
import TrainedModelsPageTab from './TrainedModelsPageTab'
import type { TrainedModelsPageTabProps } from './TrainedModelsPageTab'

export interface UploadTrainedModelPageProps {}

const tabData: (TrainedModelsPageTabProps & {label: string})[] = [
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/daily-capacity`,
    directory: 'daily-capacity',
    label: 'imagina.training.upload_model.daily_capacity_model',
  },
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/daily-sells`,
    directory: 'daily-sells',
    label: 'imagina.training.upload_model.daily_sells_model',
  },
]

const tabs = tabData.map(({ label, ...data }) => ({
  label,
  key: data.directory,
  children: <TrainedModelsPageTab {...data} />,
}))

const UploadTrainedModelPage: FunctionComponent<UploadTrainedModelPageProps> = () => {
  const translate = useTranslate()

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>Subir modelo entrenado</Typography.Title>
      <Tabs
        items={tabs.map(({ label, ...rest }) => ({ label: translate(label), ...rest }))}
      />
    </Space>
  )
}

export default UploadTrainedModelPage
