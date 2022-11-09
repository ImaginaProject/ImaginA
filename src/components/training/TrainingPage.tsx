import { FunctionComponent, useState, useEffect, useMemo } from 'react'
import { Space, Button, Typography } from 'antd'


export interface TrainingPageProps {}

const TrainingPage: FunctionComponent<TrainingPageProps> = (props) => {
  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      Load the model
    </Space>
  )
}

export default TrainingPage
