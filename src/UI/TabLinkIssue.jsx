import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Panel, Button, Tabs, TabMenu, List } from '@deskpro/apps-components';
import { Form, Select, Input, Textarea, Group, required } from '../Forms';

import { reposToOptions, issuesToOptions } from '../utils/forms';
import { githubFetchRepo, splitRepoFullName, linkGithubIssueFormToCustomField } from '../utils/github';

/**
 * Renders a tab containing a form which is used to link an existing Github issue
 * to the open ticket.
 */
class TabLinkIssue extends React.PureComponent {
  static propTypes = {
    /**
     * Whether or not the tab is hidden or not.
     */
    hidden:  PropTypes.bool,
    /**
     * List of Github repos the authenticated user belongs to.
     */
    repos:   PropTypes.array,

    history: PropTypes.object.isRequired,

    dpapp: PropTypes.object.isRequired
  };

  static defaultProps = {
    hidden: false,
    repos:  []
  };

  state  = {
    issueData: []
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
          return this.setState({ issueData: issues });
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
    const { issueData } = this.state;
    const { repos, hidden } = this.props;

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
        <Form name="link_issue" onSubmit={this.handleSubmit}>
          <Select
            label=    "Repository:"
            name=     "repo"

            validate= {required}
            onChange= {this.handleRepoChange}
            options=  {reposToOptions(repos)}
            required
          />
          <Select
            label=    "Issue:"
            name=     "number"

            validate= {required}
            options=  {issuesToOptions(issueData)}
          />

          <div className="dp-form-group">
            <Button>
              Link
            </Button>
          </div>

        </Form>
      </Panel>
    );
  }
}

export default TabLinkIssue;
