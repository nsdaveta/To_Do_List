import './App.css';
import To_Do from './to-do';
import NotFound from './notfound'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Routes,Route} from 'react-router-dom';
import Home from './Home';
import Register from './Register';
import Login from './Login';
import VerifyOtp from './VerifyOtp';
import ForgotPassword from './ForgotPassword';
import useBackButton from './hooks/useBackButton';


import Navbar from './components/Navbar';
import TopNavbar from './components/TopNavbar';

function App() 
{  
  useBackButton();

  return(
    <div className={`App ${window.isDesktopTauri ? 'tauri-mode' : 'web-mode'}`}>
      {window.isDesktopTauri ? (
        <Navbar />
      ) : (
        <TopNavbar />
      )}
      <main className="main-content">
        <ToastContainer hideProgressBar={true} autoClose={2000} position="top-right" theme="colored" />
        <Routes>
          <Route index element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/register' element={<Register/>}/>
          <Route path='/verify-otp' element={<VerifyOtp/>}/>
          <Route path='/forgot-password' element={<ForgotPassword/>}/>
          <Route path='/todos' element={<To_Do/>}/>
          <Route path='*' element={<NotFound/>}/>
        </Routes>
      </main>
    </div>
  )
}
export default App;