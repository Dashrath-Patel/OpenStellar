import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.scss';

import ScrollToTopBtn from './components/menu/ScrollToTop';

// New MUI-based pages
import HomePage from './pages/home/NewHomePage';
import NewBounty from './pages/new_bounty/NewBountyPage';
import InProgress from './pages/in_progress/InProgressPage';
import MyBounties from './pages/my_bounties/MyBountiesPage';
import Settings from './pages/settings/SettingsPage';
import MuiDemoPage from './pages/demo/MuiDemoPage';
import ReposShowcasePage from './pages/repos/ReposShowcasePage';
import BountyDetailPage from './pages/bounty_detail/BountyDetailPage';
import BountyApplicationsPage from './pages/bounty_applications/BountyApplicationsPage';
import SubmitWorkPage from './pages/submit_work/SubmitWorkPage';

// Auth pages
import AuthCallback from './pages/auth/AuthCallback';

// Old pages (kept for detail views temporarily)
import PreviewNewBounty from './pages/new_bounty/PreviewNewBounty';
import InBountyListing from './pages/in_progress/InBountyListing';
import MyBountiesListing from './pages/my_bounties/MyBountiesListing';

function ScrollTop() {
  const location = useLocation();
  useEffect(() => window.scrollTo(0, 0), [location.pathname]);
  return null;
}

export default function App() {
  return (
    <div className='app'>
      <ScrollTop />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/demo' element={<MuiDemoPage />} />
        <Route path='/auth/callback' element={<AuthCallback />} />
        <Route path='/repos' element={<ReposShowcasePage />} />
        <Route path='/bounty/:id' element={<BountyDetailPage />} />
        <Route path='/bounty/:id/applications' element={<BountyApplicationsPage />} />
        <Route path='/bounty/:id/submit-work' element={<SubmitWorkPage />} />
        <Route path='/NewBounty' element={<NewBounty />} />
        <Route path='/NewBounty/Preview' element={<PreviewNewBounty />} />
        <Route path='/InProgress' element={<InProgress />} />
        <Route path='/InProgress/:id' element={<InBountyListing />} />
        <Route path='/MyBounties' element={<MyBounties />} />
        <Route path='/MyBounties/:id' element={<MyBountiesListing />} />
        <Route path='/Settings' element={<Settings />} />
        <Route path='*' element={<Navigate to='/' replace />} />
      </Routes>
      <ScrollToTopBtn />
      <ToastContainer
        position='top-right'
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
      />
    </div>
  );
}
