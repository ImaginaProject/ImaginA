/* eslint-disable max-len */
import {
  FunctionComponent,
} from 'react'

import {
  Typography,
  Timeline,
} from 'antd'

import tagMessages from './logs'

export interface ChangeLogProps {}

const ChangeLog: FunctionComponent<ChangeLogProps> = () => (
  <>
    <Typography.Title level={5}>
      ChangeLog
    </Typography.Title>
    <Timeline>
      {tagMessages.map((info) => (
        <Timeline.Item key={info.tag}>
          <Typography.Text strong>{info.tag}</Typography.Text>
          {': '}
          <Typography.Text>{info.message}</Typography.Text>
        </Timeline.Item>
      ))}
    </Timeline>
  </>
)
export default ChangeLog
