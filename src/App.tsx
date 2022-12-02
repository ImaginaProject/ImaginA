import { Admin, Resource, CustomRoutes } from 'react-admin'
import { Route } from 'react-router-dom'
import 'antd/dist/antd.css'
import './App.css'

import { i18nProvider } from './locale/i18nProvider'

import MainLayout from './components/main/MainLayout'
import MainDashboard from './components/main/MainDashboard'
import DailyCapacityPage from './components/daily-capacity/DailyCapacityPage'
import DatasetManagerPage from './components/dataset/DatasetManagerPage'
import UploadTrainedModelPage from './components/training/UploadTrainedModelPage'
import SpecialDaysPage from './components/special-days/SpecialDaysPage'
import RetrainingListPage from './components/training/RetrainingListPage'
import RetrainReportPage from './components/training/RetrainReportPage'
import DailySellsPage from './components/daily-sells/DailySellsPage'

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
      <CustomRoutes>
        <Route path="/daily-sells" element={<DailySellsPage />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route path="/dataset/manager" element={<DatasetManagerPage />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route path="/training/retraining" element={<RetrainingListPage />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route path="/training/upload-model" element={<UploadTrainedModelPage />} />
      </CustomRoutes>
      <CustomRoutes>
        <Route path="/training/retraining/reports" element={<RetrainReportPage />} />
      </CustomRoutes>
      {/* ... */}
      <CustomRoutes>
        <Route path="/config-special-days" element={<SpecialDaysPage />} />
      </CustomRoutes>
      <Resource name="NoFound" />
    </Admin>
  </div>
)

export default App
