import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import TrainingPageTab from './TrainingPageTab'
import type { TrainingPageTabProps } from './TrainingPageTab'


export interface TrainingPageProps {}

const tabs: TrainingPageTabProps[] = [
  {
    actionURL: `${import.meta.env.VITE_APP_ENDPOINT}/daily-capacity/existent-models`,
    directory: 'daily-capacity',
    title: 'Modelo para aforo diario',
  },
]

const TrainingPage: FunctionComponent<TrainingPageProps> = (props) => {
  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      <Typography.Title>Subir modelo entrenado</Typography.Title>
      <Tabs>
        {tabs.map((tab) => (
          <Tabs.TabPane tab={tab.title} key={tab.directory}>
            <TrainingPageTab {...tab} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Space>
  )
}

export default TrainingPage
