/* eslint-disable max-len */
import { FunctionComponent, useEffect, useState } from 'react'

import {
  Divider,
  Space,
  Statistic,
  Typography,
  Image,
  Row,
  Col,
} from 'antd'
import ChangeLog from './ChangeLog'

import DailyCapacity from '../../classes/DailyCapacity'
import DailySells from '../../classes/DailySells'

export interface MainDashboardProps {}

const MainDashboard: FunctionComponent<MainDashboardProps> = () => {
  const [dc] = useState(new DailyCapacity())
  const [ds] = useState(new DailySells())

  const [totalDCModels, setTotalDCModels] = useState(0);
  const [totalDSModels, setTotalDSModels] = useState(0);

  useEffect(() => {
    (async () => {
      // NOTE: this should be in a context to avoid double requestings, but well...
      await dc.requestAllModels()
      setTotalDCModels(dc.allModels.length)
      await ds.requestAllModels()
      setTotalDSModels(ds.allModels.length)
    })()
  }, [])

  return (
    <Space style={{ padding: '2em', width: '100%' }} direction="vertical">
      <Typography.Title level={2}>
        <Image src="/favicon.png" />
        {' '}
        ImaginA
      </Typography.Title>

      <Row gutter={[16, 16]}>
        <Col span={6}>
          <Image preview={false} src="/placeholder.jpg" />

          <br />
          <br />

          <Statistic title="Trained models for Daily Capacity" value={totalDCModels} />
          <Statistic title="Trained models for Daily Sells" value={totalDSModels} />
        </Col>

        <Col span={18}>
          <Typography.Title level={5}>
            About Us
          </Typography.Title>

          <Typography.Text>
            Create models, retrain them and do predictions.
          </Typography.Text>

          <Divider />
          <ChangeLog />
        </Col>
      </Row>
    </Space>
  )
}

export default MainDashboard
