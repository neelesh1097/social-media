import './Index.css'
import {Route , Routes} from 'react-router-dom'

import Login from './pages/Login';
import Feed from './pages/Feed';
import Message from './pages/Message';
import ChatBox from './pages/ChatBox';
import Connection from './pages/Connection'
import Discover from './pages/Discover';
import CreatePost from './pages/CreatePost';
import Profile from './pages/Profile';




function App() {


  return (
    <>
    <Routes>
     <Route path ='/login'  element={<Login/>} />
      <Route index element={<Feed/>} />
         <Route path ='/message'  element={<Message/>} />
         <Route path ='/message/:id'  element={<ChatBox/>} />
          <Route path ='/connection'  element={<Connection/>} />
          <Route path ='/discover'  element={<Discover/>} />
           <Route path ='/profile'  element={<Profile/>} />
            <Route path ='/profile/:profileId'  element={<Profile/>} />
             <Route path ='/create-post'  element={<CreatePost/>} />
         
    </Routes>
    
    </>
  )
}

export default App
