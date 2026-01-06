import { ChatProvider } from './context/ChatContext'
import ChatContainer from './components/chat/ChatContainer'
import './App.css'
import './styles/theme-overrides.css'

function App() {
  return (
    <ChatProvider>
      <div className="app">
        <ChatContainer />
      </div>
    </ChatProvider>
  )
}

export default App
