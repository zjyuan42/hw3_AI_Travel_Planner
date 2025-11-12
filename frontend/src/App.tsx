import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from 'react-query'
import Layout from './components/Layout'
import Home from './pages/Home'
// import TravelPlan from './pages/TravelPlan'
// import Budget from './pages/Budget'
// import Settings from './pages/Settings'
// import Login from './pages/Login'
// import Register from './pages/Register'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* <Route path="/login" element={<Login />} /> */}
        {/* <Route path="/register" element={<Register />} /> */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          {/* <Route path="plan" element={<TravelPlan />} /> */}
          {/* <Route path="budget" element={<Budget />} /> */}
          {/* <Route path="settings" element={<Settings />} /> */}
        </Route>
      </Routes>
    </QueryClientProvider>
  )
}

export default App