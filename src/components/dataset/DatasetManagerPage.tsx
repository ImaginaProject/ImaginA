import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import { useTranslate } from 'react-admin'
import DailySellsDMTab from './tabs/DailySellsDMTab'
import DailyCapacityDMTab from './tabs/DailyCapacityDMTab'

export interface UploadTrainedModelPageProps {}

const tabs = [
  {
    label: 'Aforo diario',
    key: '1',
    children: <DailyCapacityDMTab />,
  },
  {
    label: 'Ventas diarias',
    key: '2',
    children: <DailySellsDMTab />,
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
      <Tabs items={tabs} />
    </Space>
  )
}

export default DatasetManagerPage
