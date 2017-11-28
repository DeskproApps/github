import React from 'react';
import PropTypes from 'prop-types';
import { Tabs, TabLink, Container } from '@deskpro/react-components';
import { sdkConnect } from '@deskpro/apps-sdk-react';
import { githubIsAuthenticated, githubAuthenticate, githubFetchRepos } from '../utils/github';
import TabCreateIssue from './TabCreateIssue';
import TabLinkIssue from './TabLinkIssue';

/**
 * Renders the primary page, which displays tabs to create a Github issue or
 * link an existing issue to the open ticket.
 */
class PageCreate extends React.Component {
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
     */
    ui:      PropTypes.object.isRequired
  };

  /**
   * Constructor
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      repos:     [],
      activeTab: 'link'
    };
  }

  /**
   * Invoked immediately after a component is mounted
   */
  componentDidMount() {
    this.loadRepos();
  }

  /**
   * Fetches all the repos and loads them into the component state
   */
  loadRepos = () => {
    const { storage, route, ui } = this.props;

    if (!githubIsAuthenticated() && storage.app.user_settings.access_token) {
      githubAuthenticate(storage.app.user_settings.access_token)
        .then(() => {
          return githubFetchRepos()
            .then((repos) => {
              return this.setState({ repos });
            }).catch(ui.error);
        })
        .catch((e) => {
          if (String(e) !== 'access_token') {
            ui.error('Invalid GitHub token');
          }
          route.to('settings');
        });
    } else {
      return githubFetchRepos()
        .then((repos) => {
          return this.setState({ repos });
        }).catch(ui.error);
    }
  };

  /**
   * Called when the active tab changes
   *
   * @param {string} activeTab
   */
  handleTabChange = (activeTab) => {
    this.setState({ activeTab });
  };

  /**
   * @returns {XML}
   */
  render() {
    const { repos, activeTab } = this.state;

    return (
      <Container style={{ padding: 0 }}>
        <Tabs active={activeTab} onChange={this.handleTabChange}>
          <TabLink name="link">
            Link Issue
          </TabLink>
          <TabLink name="create">
            Create Issue
          </TabLink>
        </Tabs>
        <TabLinkIssue
          repos={repos}
          hidden={activeTab !== 'link'}
        />
        <TabCreateIssue
          repos={repos}
          hidden={activeTab !== 'create'}
        />
      </Container>
    );
  }
}

export default sdkConnect(PageCreate);
