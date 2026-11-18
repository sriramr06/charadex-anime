import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

// Layout for pages inside the app (after login): navbar on top, page below
function AppLayout() {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </>
  )
}

export default AppLayout
