import { Outlet } from 'react-router-dom'
import SkipLink from '../components/layout/SkipLink'
import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import ScrollToTop from '../components/layout/ScrollToTop'

export default function PublicLayout() {
  return (
    <>
      <ScrollToTop />
      <SkipLink />
      <Header />
      <main id="main-content">
        <Outlet />
      </main>
      <Footer />
    </>
  )
}
