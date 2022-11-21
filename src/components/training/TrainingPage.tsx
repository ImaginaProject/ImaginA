import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import TrainedModelsPageTab from './TrainingPageTab'
import type { TrainedModelsPageTabProps } from './TrainingPageTab'

export interface UploadTrainedModelPageProps {}

const tabs: TrainedModelsPageTabProps[] = [
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/daily-capacity/existent-models`,
    directory: 'daily-capacity',
    title: 'Modelo para aforo diario',
  },
]

const UploadTrainedModelPage: FunctionComponent<UploadTrainedModelPageProps> = () => (
  <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
    <Typography.Title>Subir modelo entrenado</Typography.Title>
    <Tabs>
      {tabs.map((tab) => (
        <Tabs.TabPane tab={tab.title} key={tab.directory}>
          <TrainedModelsPageTab {...tab} />
        </Tabs.TabPane>
      ))}
    </Tabs>
  </Space>
)

export default UploadTrainedModelPage
