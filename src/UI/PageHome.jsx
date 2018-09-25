import React from 'react';
import PropTypes from 'prop-types';
import { Action, Panel, Button, List } from '@deskpro/apps-components';

import { githubFetchIssue, githubCustomFieldToIssue, combineRepoFullName } from '../utils/github';
import Issue from './Issue';
import githubLogo from '../main/resources/icon.png';

const confirm = window && typeof window.confirm === 'function' ? window.confirm : () => true;
/**
 * Renders a page which displays the issues which have been linked to the
 * open ticket.
 */
class PageHome extends React.PureComponent
{
  static propTypes = {
    history: PropTypes.object.isRequired,
    dpapp: PropTypes.object.isRequired
  };

  state = {
    issueData: []
  };

  /**
   * Invoked immediately after a component is mounted
   */
  componentDidMount() {
    this.loadIssues();
  }

  // /**
  //  * Invoked immediately after updating occurs
  //  */
  // componentDidUpdate(prevProps) {
  //   if (prevProps.storage.entity.issues !== this.props.storage.entity.issues) {
  //     this.loadIssues();
  //   }
  // }

  /**
   * Loads the issue data from GitHub
   *
   * The issues linked to the open ticket are saved in app storage by id. This
   * method gets the full details for each issue from the GitHub API.
   */
  loadIssues = () => {
    const { dpapp, history } = this.props;
    const customFields = dpapp.context.get('ticket').customFields;

    customFields.getAppField('githubIssues', [])
      .then((issues) => {
        // if (!issues || issues.length === 0) {
        //   history.push("create", null);
        //   history.go(1);
        // }

        const promises = issues.map((issue) => {
          return githubFetchIssue(githubCustomFieldToIssue(issue));
        });

        return Promise.all(promises).then(issueData => this.setState({ issueData }))
      }).catch(dpapp.ui.showErrorNotification);
  };

  openLink = () => {
    const { history } = this.props;
    history.push("link", null);
    history.go(1);
  };

  openCreate = () => {
    const { history } = this.props;
    history.push("create_issue", null);
    history.go(1);
  };

  /**
   * Callback passed to the "Linked Issues" page, which gets called to unlink an issue
   * from the current ticket
   *
   * @param {*} issue
   * @returns {Promise}
   */
  handleUnlinkIssue = (issue) => {
    const { dpapp } = this.props;
    const customFields = dpapp.context.get('ticket').customFields;

    const repo = combineRepoFullName(issue.repoInfo);
    customFields.getAppField('githubIssues', [])
      .then((issues) => {
        const newIssues = issues.filter((i) => {
          const ii = githubCustomFieldToIssue(i);
          return !(ii.number === issue.number && ii.repo === repo);
        });

        return customFields.setAppField('githubIssues', newIssues)
          .then(() => {
            return this.loadIssues();
          });
      }).catch(dpapp.ui.showErrorNotification);
  };

  /**
   * @returns {XML}
   */
  render() {
    const { issueData } = this.state;
    const { history } = this.props;

    return (
      <Panel title={"Linked Issues"} border={"none"} className="dp-github-container">
        <Action icon={"search"} label={"Find"} onClick={this.openLink}/>
        <Action icon={"add"} label={"Create"} onClick={this.openCreate}/>
        <List className="dp-github-issues">
          {issueData.map((issue) => (
            <Issue
              issue={issue}
              key={issue.number}
              iconUrl={githubLogo}
              onUnlink={() => { this.handleUnlinkIssue(issue); }}
            />
          ))}
        </List>

      </Panel>
    );
  }
}

export default PageHome;
