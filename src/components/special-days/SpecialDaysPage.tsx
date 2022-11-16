import { FunctionComponent, useState, useEffect } from 'react'
import { Space, DatePicker, Dropdown, Button, Menu, Typography } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/es'
import weekday from 'dayjs/plugin/weekday'
import localeData from 'dayjs/plugin/localeData'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import Loading from '../loading/Loading'

import { LoadingOutlined } from '@ant-design/icons'

// Load the plugins
dayjs.locale('es')
dayjs.extend(weekday)
dayjs.extend(localeData)
dayjs.extend(customParseFormat)


export interface SpecialDaysPageProps {}

const SpecialDaysPage: FunctionComponent<SpecialDaysPageProps> = (props) => {
  return (
    <Space style={{padding: '2em', width: '100%'}} direction='vertical'>
      hola
    </Space>
  )
}

export default SpecialDaysPage
