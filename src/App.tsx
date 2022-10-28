import { Admin, Resource } from 'react-admin'
import 'antd/dist/antd.css'
import './App.css'

import MainLayout from './components/main/MainLayout'
import MainDashboard from './components/main/MainDashboard'
import DailyCapacityShow from './components/daily-capacity/DailyCapacityShow'
import DailyCapacityList from './components/daily-capacity/DailyCapacityList'

function App() {
  return (
    <div className="App">
      <Admin
        layout={MainLayout}
        dashboard={MainDashboard}
      >
        {/* For each link in the Layout Menu items you SHOULD add a Resource as follows */}
        <Resource
          name='daily-capacity'
          list={DailyCapacityList}
          show={DailyCapacityShow}
        />
        <Resource name='daily-sells'/>
        {/* ... */}
        {/* ... */}
        {/* ... */}
      </Admin>
    </div>
  )
}

export default App
