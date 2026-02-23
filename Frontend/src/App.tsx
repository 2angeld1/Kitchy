import { Redirect, Route, useLocation } from 'react-router-dom';
import { IonApp, IonRouterOutlet, IonSplitPane, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Menu from './components/Menu';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Ventas from './pages/Ventas';
import Inventario from './pages/Inventario';
import Productos from './pages/Productos';
import Usuarios from './pages/Usuarios';
import ConfiguracionMenu from './pages/ConfiguracionMenu';
import MenuApp from './public/MenuApp';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* Dark mode is handled by our custom SCSS - no Ionic dark palette needed */
/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
/* import '@ionic/react/css/palettes/dark.system.css'; */

/* All styles centralized in SCSS */
import './styles/tailwind.css';
import './styles/main.scss';

setupIonicReact();

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
};

// Admin Route Component
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!isAdmin) {
    return <Redirect to="/ventas" />;
  }

  return <>{children}</>;
};

const MainRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Public override: Menu is always accessible and standalone
  if (location.pathname === '/menu') {
    return (
      <IonRouterOutlet>
        <Route exact path="/menu" component={MenuApp} />
      </IonRouterOutlet>
    );
  }

  return (
    isAuthenticated ? (
      <IonSplitPane contentId="main-content">
        <Menu />
        <IonRouterOutlet id="main-content">
          <Route exact path="/dashboard">
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          </Route>
          <Route exact path="/ventas">
            <ProtectedRoute>
              <Ventas />
            </ProtectedRoute>
          </Route>
          <Route exact path="/inventario">
            <ProtectedRoute>
              <Inventario />
            </ProtectedRoute>
          </Route>
          <Route exact path="/productos">
            <AdminRoute>
              <Productos />
            </AdminRoute>
          </Route>
          <Route exact path="/usuarios">
            <AdminRoute>
              <Usuarios />
            </AdminRoute>
          </Route>
          <Route exact path="/configuracion-menu">
            <AdminRoute>
              <ConfiguracionMenu />
            </AdminRoute>
          </Route>
          <Route exact path="/">
            <Redirect to="/ventas" />
          </Route>
          <Route exact path="/login">
            <Redirect to="/ventas" />
          </Route>
        </IonRouterOutlet>
      </IonSplitPane>
    ) : (
      <IonRouterOutlet>
        {/* Login/Register/etc */}
        <Route exact path="/login">
          <Login />
        </Route>
        <Route exact path="/register">
          <Register />
        </Route>
        <Route>
          <Redirect to="/login" />
        </Route>
      </IonRouterOutlet>
    )
  );
};

const App: React.FC = () => (
  <IonApp>
    <ThemeProvider>
      <AuthProvider>
        <IonReactRouter>
          <MainRoutes />
        </IonReactRouter>
      </AuthProvider>
    </ThemeProvider>
  </IonApp>
);

export default App;