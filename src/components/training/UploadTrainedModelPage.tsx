import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import { useTranslate } from 'react-admin'
import TrainedModelsPageTab from './TrainedModelsPageTab'
import type { TrainedModelsPageTabProps } from './TrainedModelsPageTab'
import modelGroupValues from '../../constants/modelGroup'

export interface UploadTrainedModelPageProps {}

const tabData: (TrainedModelsPageTabProps & {label: string})[] = [
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/${modelGroupValues.DAILY_CAPACITY}`,
    directory: modelGroupValues.DAILY_CAPACITY,
    label: 'imagina.training.upload_model.daily_capacity_model',
  },
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/models/${modelGroupValues.DAILY_SELLS}`,
    directory: modelGroupValues.DAILY_SELLS,
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
