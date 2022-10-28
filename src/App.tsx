import { Admin, Resource } from 'react-admin'
import 'antd/dist/antd.css'
import './App.css'

import MainLayout from './components/main/MainLayout'
import MainDashboard from './components/main/MainDashboard'

function App() {
  return (
    <div className="App">
      <Admin
        layout={MainLayout}
        dashboard={MainDashboard}
      >
        <Resource name='about'/>
      </Admin>
    </div>
  )
}

export default App
