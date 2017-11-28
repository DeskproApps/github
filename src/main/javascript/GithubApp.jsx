import React from 'react';
import PropTypes from 'prop-types';
import { Routes, Route } from '@deskpro/apps-sdk-react';
import { Loader } from '@deskpro/react-components';
import { PageHome, PageCreate, PageSettings, PageAuth } from './UI';
import { githubAuthenticate } from './utils/github';

/**
 * Renders an app which links GitHub issues to tickets.
 */
export default class GithubApp extends React.PureComponent {
  static propTypes = {
    /**
     * Instance of sdk storage.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/storage.html
     */
    storage: PropTypes.object,
    /**
     * Instance of sdk route.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/route.html
     */
    route:   PropTypes.object,
    /**
     * Instance of sdk ui.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/ui.html
     */
    ui:      PropTypes.object
  };

  /**
   * Invoked immediately after a component is mounted
   */
  componentDidMount() {
    const { storage, route } = this.props;

    // The app setting will be empty the first time the app is run.
    // Route to the settings page on the first run so the admin can setup
    // oauth creds.
    if (!storage.app.settings) {
      return route.to('settings');
    }

    // The user does not have an oauth access token yet. Send them to the
    // authentication page.
    if (!storage.app.user_settings) {
      return route.to('auth');
    }

    // Authenticate with GitHub when the user has an oauth access token.
    this.githubAuthenticate();
  }

  /**
   * Invoked before a mounted component receives new props
   *
   * Re-authenticates with GitHub when the access token has changed.
   *
   * @param {*} prevProps
   */
  componentDidReceiveProps(prevProps) {
    const prevApp = prevProps.storage.app;
    const nowApp  = this.props.storage.app;

    if (
      (!prevApp.user_settings && nowApp.user_settings) ||
      (nowApp.user_settings && (prevApp.user_settings.access_token !== nowApp.user_settings.access_token))
      ) {
      return this.githubAuthenticate();
    }
  }

  /**
   * Authenticates with GitHub using the oauth access token
   *
   * Routes to the index page after successful authentication. Otherwise
   * routes to the settings page.
   */
  githubAuthenticate = () => {
    const { storage, ui, route } = this.props;

    githubAuthenticate(storage.app.user_settings.access_token)
      .then(() => route.to('home'))
      .catch((e) => {
        if (String(e) !== 'access_token') {
          ui.error('Invalid GitHub token');
        }
        route.to('settings');
      });
  };

  /**
   * @returns {XML}
   */
  render() {
    return (
      <Routes>
        <Route location="settings" component={PageSettings} />
        <Route location="create" component={PageCreate} />
        <Route location="auth" component={PageAuth} />
        <Route location="home" component={PageHome} />
        <Route defaultRoute>
          <div className="dp-text-center">
            <Loader />
          </div>
        </Route>
      </Routes>
    );
  }
}
