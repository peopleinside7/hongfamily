import { createContext, useContext, useState, type ReactNode } from 'react'
import {
  HashRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import { StoreProvider, useStore } from './store'
import { ToastProvider } from './components/Toast'

import CharacterSelect from './screens/child/CharacterSelect'
import ChildHome from './screens/child/Home'
import ChildCalendar from './screens/child/Calendar'
import ChildChat from './screens/child/Chat'

import ParentLogin from './screens/parent/Login'
import ParentChildSelect from './screens/parent/ChildSelect'
import Dashboard from './screens/parent/Dashboard'
import Approve from './screens/parent/Approve'
import MissionManage from './screens/parent/MissionManage'
import Settings from './screens/parent/Settings'

/* ---- 부모 로그인 상태 (데모) ---- */
const AuthContext = createContext<{ authed: boolean; login: () => void; logout: () => void }>({
  authed: false,
  login: () => {},
  logout: () => {},
})
export const useAuth = () => useContext(AuthContext)

function AuthProvider({ children }: { children: ReactNode }) {
  const [authed, setAuthed] = useState(() => localStorage.getItem('hfm.auth') === '1')
  const login = () => {
    localStorage.setItem('hfm.auth', '1')
    setAuthed(true)
  }
  const logout = () => {
    localStorage.removeItem('hfm.auth')
    setAuthed(false)
  }
  return <AuthContext.Provider value={{ authed, login, logout }}>{children}</AuthContext.Provider>
}

function RequireParent({ children }: { children: ReactNode }) {
  const { authed } = useAuth()
  if (!authed) return <Navigate to="/parent/login" replace />
  return <>{children}</>
}

function ParentEntry() {
  const { authed } = useAuth()
  return <Navigate to={authed ? '/parent/select' : '/parent/login'} replace />
}

/* ---- 데모용 역할 전환 토글 (실제 모바일에선 숨김) ---- */
function RoleToggle() {
  const nav = useNavigate()
  const loc = useLocation()
  const { state } = useStore()
  const isParent = loc.pathname.startsWith('/parent')
  return (
    <div className="role-toggle">
      <button
        className={!isParent ? 'active' : ''}
        onClick={() => nav(state.lastChild ? `/child/${state.lastChild}/home` : '/child')}
      >
        🧒 자녀
      </button>
      <button className={isParent ? 'active' : ''} onClick={() => nav('/parent')}>
        👩‍👧 부모
      </button>
    </div>
  )
}

function Stage() {
  return (
    <div className="stage">
      <RoleToggle />
      <div className="phone">
        <div className="phone__notch" />
        <div className="phone__screen">
          <ToastProvider>
            <Routes>
              <Route path="/" element={<Navigate to="/child" replace />} />

              {/* 자녀 */}
              <Route path="/child" element={<CharacterSelect />} />
              <Route path="/child/:id/home" element={<ChildHome />} />
              <Route path="/child/:id/calendar" element={<ChildCalendar />} />
              <Route path="/child/:id/chat" element={<ChildChat />} />

              {/* 부모 */}
              <Route path="/parent" element={<ParentEntry />} />
              <Route path="/parent/login" element={<ParentLogin />} />
              <Route
                path="/parent/select"
                element={
                  <RequireParent>
                    <ParentChildSelect />
                  </RequireParent>
                }
              />
              <Route
                path="/parent/:id/dashboard"
                element={
                  <RequireParent>
                    <Dashboard />
                  </RequireParent>
                }
              />
              <Route
                path="/parent/:id/approve"
                element={
                  <RequireParent>
                    <Approve />
                  </RequireParent>
                }
              />
              <Route
                path="/parent/:id/missions"
                element={
                  <RequireParent>
                    <MissionManage />
                  </RequireParent>
                }
              />
              <Route
                path="/parent/settings"
                element={
                  <RequireParent>
                    <Settings />
                  </RequireParent>
                }
              />

              <Route path="*" element={<Navigate to="/child" replace />} />
            </Routes>
          </ToastProvider>
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <HashRouter>
          <Stage />
        </HashRouter>
      </AuthProvider>
    </StoreProvider>
  )
}
