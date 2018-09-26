import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Panel, Button, Tabs, TabMenu } from '@deskpro/apps-components';

import { githubIsAuthenticated, githubAuthenticate, githubFetchRepos } from '../utils/github';
import TabCreateIssue from './TabCreateIssue';
import TabLinkIssue from './TabLinkIssue';

/**
 * Renders the primary page, which displays tabs to create a Github issue or
 * link an existing issue to the open ticket.
 */
class PageCreate extends React.Component
{
  static propTypes = {
    history: PropTypes.object.isRequired,
    dpapp: PropTypes.object.isRequired
  };

  state = {
    repos:     [],
    activeTab: 'link'
  };

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
    const { dpapp, history } = this.props;

    if (!githubIsAuthenticated()) {
      githubAuthenticate()
        .then(() => {
          return githubFetchRepos()
            .then((repos) => {
              return this.setState({ repos });
            }).catch(dpapp.ui.showErrorNotification);
        })
        .catch((e) => {
          if (String(e) !== 'access_token') {
            dpapp.ui.showNotification('Invalid GitHub token', 'error');
          }
          history.push("home", null);
          history.go(1);
        });
    } else {
      return githubFetchRepos()
        .then((repos) => {
          return this.setState({ repos });
        }).catch(dpapp.ui.showErrorNotification);
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

    return [
        <Tabs active={activeTab} onChange={this.handleTabChange}>
          <TabMenu name="link">
            Link Issue
          </TabMenu>
          <TabMenu name="create">
            Create Issue
          </TabMenu>
        </Tabs>,
        <TabLinkIssue
          repos=  {repos}
          hidden= {activeTab !== 'link'}
          history={this.props.history}
          dpapp=  {this.props.dpapp}
        />,
        <TabCreateIssue
          repos=  {repos}
          hidden= {activeTab !== 'create'}
          history={this.props.history}
          dpapp=  {this.props.dpapp}
        />
    ];
  }
}

export default PageCreate;
