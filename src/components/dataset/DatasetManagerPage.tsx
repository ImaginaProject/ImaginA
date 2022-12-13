import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import { useTranslate } from 'react-admin'
import DatasetManagerPageTab from './DatasetManagerPageTab'
import type { DatasetManagerPageTabProps } from './DatasetManagerPageTab'

export interface UploadTrainedModelPageProps {}

const tabs: (DatasetManagerPageTabProps & { title: string })[] = [
  {
    datasetId: 'daily_capacities',
    title: 'Aforo diario',
  },
  {
    datasetId: 'daily_sells',
    title: 'Ventas diaria',
  },
]

const DatasetManagerPage: FunctionComponent<UploadTrainedModelPageProps> = () => {
  const translate = useTranslate()
  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title>
        {translate('imagina.dataset.manager.title')}
      </Typography.Title>
      <Typography.Text>
        {translate('imagina.dataset.manager.description')}
      </Typography.Text>
      <Tabs>
        {tabs.map((tab) => (
          <Tabs.TabPane tab={tab.title} key={tab.datasetId}>
            <DatasetManagerPageTab {...tab} />
          </Tabs.TabPane>
        ))}
      </Tabs>
    </Space>
  )
}

export default DatasetManagerPage
