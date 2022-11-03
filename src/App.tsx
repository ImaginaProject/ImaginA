import { Admin, Resource, CustomRoutes } from 'react-admin'
import { Route } from 'react-router-dom'
import 'antd/dist/antd.css'
import './App.css'

import MainLayout from './components/main/MainLayout'
import MainDashboard from './components/main/MainDashboard'
import DailyCapacityPage from './components/daily-capacity/DailyCapacityPage'
function App() {
  return (
    <div className="App">
      <Admin
        layout={MainLayout}
        dashboard={MainDashboard}
      >
        <CustomRoutes>
          <Route path='/daily-capacity' element={<DailyCapacityPage/>}/>
        </CustomRoutes>
        <Resource name='daily-sells'/>
        {/* ... */}
        {/* ... */}
        {/* ... */}
      </Admin>
    </div>
  )
}

export default App
