import React from 'react';
import PropTypes from 'prop-types';
import { Router, Route, Switch } from 'react-router'
import { createMemoryHistory as createHistory } from "history";
import { Loader} from '@deskpro/apps-components';
import { PageHome, PageCreate, PageAuth } from './UI';
import { githubAuthenticate, setAccessToken  } from './utils/github';

const history = createHistory({
  initialEntries: ["loading"],
  initialIndex: 0
});

/**
 * Renders an app which links GitHub issues to tickets.
 */
export default class GithubApp extends React.PureComponent
{
  static propTypes = {
    /**
     * instance of app client.
     */
    dpapp: PropTypes.object,
  };

  /**
   * Invoked immediately after a component is mounted
   */
  componentDidMount() {

    const { storage } = this.props.dpapp;
    storage.getAppStorage('user_settings').then(settings => {
      if (! settings) {
        history.push("auth", null);
        history.go(1);
        return;
      }
      // Authenticate with GitHub when the user has an oauth access token.
      setAccessToken(settings.access_token);
      this.githubAuthenticate();
    });
  }

  /**
   * Authenticates with GitHub using the oauth access token
   *
   * Routes to the index page after successful authentication. Otherwise
   * routes to the settings page.
   */
  githubAuthenticate = () => {
    const { dpapp } = this.props;

    githubAuthenticate()
      .then(() => {
        history.push("home", null);
        history.go(1);
      })
      .catch((e) => {
        if (String(e) !== 'access_token') {
          dpapp.ui.showNotification('Invalid GitHub token', 'error');
        }
        history.push("settings", null);
        history.go(1);
      });
  };

  renderPageHome = (props) => <PageHome {...props} dpapp={this.props.dpapp}/>;

  renderPageCreate = (props) => <PageCreate {...props} dpapp={this.props.dpapp}/>;

  renderPageAuth = (props) => <PageAuth {...props} dpapp={this.props.dpapp}/>;

  /**
   * @returns {*}
   */
  render() {
    return (
      <Router history={history} >
        <Switch>
          <Route path="create" render={this.renderPageCreate} />
          <Route path="auth" render={this.renderPageAuth} />
          <Route path="home" render={this.renderPageHome} />
          <Route render={() => <Loader />} />
        </Switch>
      </Router>
    );
  }
}
