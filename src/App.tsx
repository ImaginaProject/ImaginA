import { Admin, Resource, CustomRoutes } from 'react-admin'
import { Route } from 'react-router-dom'
import 'antd/dist/antd.css'
import './App.css'

import { i18nProvider } from './locale/i18nProvider'

import MainLayout from './components/main/MainLayout'
import MainDashboard from './components/main/MainDashboard'
import DailyCapacityPage from './components/daily-capacity/DailyCapacityPage'
import DatasetManager from './components/dataset/DatasetManager'
import UploadTrainedModelPage from './components/training/UploadTrainedModelPage'
import SpecialDaysPage from './components/special-days/SpecialDaysPage'

const App = () => (
  <div className="App">
    <Admin
      layout={MainLayout}
      dashboard={MainDashboard}
      i18nProvider={i18nProvider}
    >
      <CustomRoutes>
        <Route path="/daily-capacity" element={<DailyCapacityPage />} />
      </CustomRoutes>
      <Resource name="daily-sells" />
      {/* ... */}
      <CustomRoutes>
        <Route path="/upload-model" element={<UploadTrainedModelPage />} />
      </CustomRoutes>
      {/* ... */}
      <CustomRoutes>
        <Route path="/config-special-days" element={<SpecialDaysPage />} />
      </CustomRoutes>
    </Admin>
  </div>
)

export default App
