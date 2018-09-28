import React from 'react';
import PropTypes from 'prop-types';
import { Action, ActionBar, Panel, Separator } from '@deskpro/apps-components';
import debounce from '@deskpro/js-utils/dist/debounce';
import { Form, Select, required } from '../Forms';
import Issue from './Issue';

import { reposToOptions } from '../utils/forms';
import {
  linkGithubIssueFormToCustomField,
  githubIsAuthenticated, githubAuthenticate, githubFetchRepos,
  githubIssueToCustomField, githubSearchIssue, githubAddCommentToIssue
} from '../utils/github';
import Input from "../Forms/Input";

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
            .then(({ items }) => {
              return this.setState({ repos: items });
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
        .then(({ items }) => {
          return this.setState({ repos: items });
        }).catch(dpapp.ui.showErrorNotification);
    }
  };

  /**
   * Called when the repo value changes
   *
   * @param {{fullName: string}} fullName
   */
  handleRepoChange = (fullName) => {
    const repo = this.state.repos.find(r => r.fullName === fullName);
    repo.issues.fetch()
      .then(issues => {
        this.setState({ issueData: issues.items });
      });
  };

  linkIssue = (issue) => {
    const { dpapp, history }  = this.props;
    const contextObject       = dpapp.context.get('ticket');
    const customFields        = dpapp.context.get('ticket').customFields;
    const { tabUrl }          = dpapp.context.hostUI;

    return customFields.getAppField('githubIssues', [])
      .then((issues) => {
        issues.push(githubIssueToCustomField(issue));

        const comment = `Linked to ticket [#${contextObject.id}](${tabUrl}).`;
        githubAddCommentToIssue(issue, comment);
        return customFields.setAppField('githubIssues', issues)
          .then(() => {
            history.push("home", null);
            history.go(1);
          });
      });
  };

  doSearch = (value) => {
    const { dpapp }  = this.props;

    githubSearchIssue(value)
      .then((items) => {
        this.setState({ issueData: items });
      }).catch(dpapp.ui.showErrorNotification);
  };

  debouncedSearch = debounce(this.doSearch, 1000);

  handleSearch = (value) => {
    if (value) {
      this.debouncedSearch(value)
    } else {
      this.setState({ issueData: [] });
    }
  };

  backHome = () => {
    const { history }  = this.props;
    history.push("home", null);
    history.go(1);
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

    return (
      <Panel border={"none"} >
        <ActionBar title="Search for an issue">
          <Action icon="close" onClick={this.backHome} />
        </ActionBar>
        <Form name="search_issue">
          <Input type="search" name="search" onChange={this.handleSearch}/>
        </Form>
        <Separator title="or" />
        <ActionBar title="Link issue" />
        <Form name="link_issue">
          <Select
            label=    "Repository:"
            name=     "repo"

            validate= {required}
            onChange= {this.handleRepoChange}
            options=  {reposToOptions(repos)}
            required
          />
        </Form>
        {issueData.map(issue => <Issue key={issue.id} issue={issue} onLink={() => this.linkIssue(issue)}/>)}
      </Panel>
    );
  }
}

export default PageLinkIssue;
