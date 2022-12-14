import { FunctionComponent } from 'react'
import { Tabs, Space, Typography } from 'antd'
import { useTranslate } from 'react-admin'
import DailySellsDMTab from './tabs/DailySellsDMTab'
import DailyCapacityDMTab from './tabs/DailyCapacityDMTab'

export interface UploadTrainedModelPageProps {}

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
        <Tabs.TabPane tab="Aforo diario" key="1">
          <DailyCapacityDMTab />
        </Tabs.TabPane>
        <Tabs.TabPane tab="Ventas diarias" key="2">
          <DailySellsDMTab />
        </Tabs.TabPane>
      </Tabs>
    </Space>
  )
}

export default DatasetManagerPage
