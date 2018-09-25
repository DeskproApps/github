import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Panel, Button, Tabs, TabMenu, List } from '@deskpro/apps-components';
import { Form, Select, Input, Textarea, Group, required } from '../Forms';
import Issue from './Issue';

import { reposToOptions, issuesToOptions } from '../utils/forms';
import {
  githubFetchRepo,
  splitRepoFullName,
  linkGithubIssueFormToCustomField,
  githubIsAuthenticated, githubAuthenticate, githubFetchRepos,
  githubSearchIssue, githubFetchIssue, githubCustomFieldToIssue,
  debounce
} from '../utils/github';

/**
 * Renders a tab containing a form which is used to link an existing Github issue
 * to the open ticket.
 */
class PageLinkIssue extends React.PureComponent {
  static propTypes = {
    /**
     * Whether or not the tab is hidden or not.
     */
    hidden:  PropTypes.bool,

    history: PropTypes.object.isRequired,

    dpapp: PropTypes.object.isRequired
  };

  static defaultProps = {
    hidden: false,
  };

  state = {
    issueData: [],
    repos:     [],
    query:     '',
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
   * Makes an API call to GitHub to get all the issues for the given repo and stores
   * them in component state
   *
   * @param {string} repo
   */
  loadRepoIssues = (repo) => {
    const { dpapp }  = this.props;

    if (repo) {
      const info = splitRepoFullName(repo);
      githubFetchRepo(info.userName, info.repoName)
        .then(({ issues }) => {

          const promises = issues.map((issue) => {
            issue.repo = issue.repository_url.split('/').slice(-2).join('/');
            return githubFetchIssue(issue);
          });

          return Promise.all(promises).then(issueData => this.setState({ issueData }))
        }).catch(dpapp.ui.showErrorNotification);
    }
  };

  /**
   * Called when the repo value changes
   *
   * @param {{value: string}} value
   */
  handleRepoChange = (value) => {
    this.loadRepoIssues(value);
  };

  handleSearch = (value) => {
    console.log("Search");
    if (value) {
      githubSearchIssue(value);
    }
  };

  linkIssue = (issue) => {
    console.log(issue);
  };

  /**
   * Called when the form is submitted
   */
  handleSubmit = (values) => {
    const { dpapp, history }  = this.props;

    if (! values.number.value) {
      return ;
    }

    const contextObject       = dpapp.context.get('ticket');
    const customFields        = dpapp.context.get('ticket').customFields;
    const { tabUrl }          = dpapp.context.hostUI;

    const customField = linkGithubIssueFormToCustomField(values);
    customFields.getAppField('githubIssues', [])
      .then((issues) => {
        return customFields.setAppField('githubIssues', issues.concat([customField]))
          .then(() => {
            history.push("home", null);
            history.go(1);
          });
      }).catch(e => {
        console.error(e);
      dpapp.ui.showErrorNotification(e);
    });
  };

  /**
   * @returns {XML}
   */
  render() {
    const { issueData, repos } = this.state;
    const { hidden } = this.props;

    if (hidden) {
      return null;
    }

    // const selectParse = (value) => {
    //   if (value && value.value !== undefined) {
    //     return value.value;
    //   }
    //   return null;
    // };

    return (
      <Panel border={"none"} >
        <Form name="search_issue">
          <Input
            label="Search for a card"
            icon="search"
            onChange={debounce(this.handleSearch, 200)}
          />
        </Form>
        <Form name="link_issue" onSubmit={this.handleSubmit}>
          <Select
            label=    "Repository:"
            name=     "repo"

            validate= {required}
            onChange= {this.handleRepoChange}
            options=  {reposToOptions(repos)}
            required
          />
        </Form>
        {issueData.map(issue => <Issue issue={issue} onLink={() => this.linkIssue(issue)}/>)}
      </Panel>
    );
  }
}

export default PageLinkIssue;
