import React, { useEffect, useState } from 'react';
import { BrowserRouter, Redirect, Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';

import { MainLayout } from 'components/Layout';
import PageSpinner from 'components/BasicElement/PageSpinner';
import LandingPage from './container/LandingPage/LandingPage';
import NotFound from './container/NotFoundPage/NotFound';
import * as actions from './store/actions/auth';
import './styles/main.scss';

const DashboardPage = React.lazy(() => import('container/DashboardPage/DashboardPage'));
const ProfilePage = React.lazy(() => import('container/ProfilePages/Profile'));
const SettingsPage = React.lazy(() => import('container/ProfilePages/Settings'));
const HelpPage = React.lazy(() => import('container/ProfilePages/Help'));
const SystemPage = React.lazy(() => import('container/ExplorePages/System'));
const CompanyPage = React.lazy(() => import('container/ExplorePages/Company'));
const DevicePage = React.lazy(()=>import('container/ExplorePages/Device'));

const getBasename = () => {
  return `/${process.env.PUBLIC_URL.split('/').pop()}`;
};

const App = props => {

  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("rtk");
  //Check authstate onComponentDidMount
  useEffect(() => {
    props.onTryAutoSignup();
    setLoading(false);
    return () => { };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  let content = null;
  if (!!!token && !loading) {
    content = <Redirect to='/' />;
    setLoading(!loading);
  }

  return (
    <BrowserRouter basename={getBasename()}>
      <Switch>
        <Route exact path="/" component={LandingPage} />
        {content}
        <Route >
          <MainLayout >
            <React.Suspense fallback={<PageSpinner />}>
              <Switch>
                <Route exact path="/dashboard" component={DashboardPage} />
                <Route exact path="/system" component={SystemPage} />
                <Route exact path="/device" component={DevicePage} />
                <Route exact path="/company" component={CompanyPage} />
                <Route exact path="/profile" component={ProfilePage} />
                <Route exact path="/settings" component={SettingsPage} />
                <Route exact path="/help" component={HelpPage} />
                <Route component={NotFound} />
              </Switch>
            </React.Suspense>
          </MainLayout>
        </Route>
      </Switch>
      {/* <Redirect to="/" /> */}
    </BrowserRouter>
  );
}

const mapDispatchToProps = dispatch => {
  return {
    onTryAutoSignup: () => dispatch(actions.authCheckState()),
  };
};


export default connect(null, mapDispatchToProps)(App);
