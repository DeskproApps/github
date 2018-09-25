import React from 'react';
import PropTypes from 'prop-types';
import { ActionBar, Action, Panel, Button } from '@deskpro/apps-components';

import { Form, Select, Input, Textarea, required } from '../Forms';

import { reposToOptions, projectsToOptions, contributorsToOptions, milestonesToOptions } from '../utils/forms';
import { githubFetchRepo, githubSaveIssue, splitRepoFullName, githubIssueToCustomField } from '../utils/github';

const selectParse = (value) => {
  if (value && value.value !== undefined) {
    return value.value;
  }
  return null;
};

/**
 * Renders a tab containing a form to create a new Github issue which will be linked
 * to the open ticket.
 */
class PageCreateIssue extends React.PureComponent
{

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
    projects:     [],
    issues:       [],
    milestones:   [],
    contributors: []
  };

  /**
   * Makes an API call to GitHub to get the projects, issues, milestones, etc for
   * the given repo and stores the values in component state
   *
   * @param {string} repo
   */
  loadRepoEntities = (repo) => {
    const { dpapp }  = this.props;

    if (repo) {
      const info = splitRepoFullName(repo);
      githubFetchRepo(info.userName, info.repoName)
        .then(({ projects, issues, milestones, contributors }) => {
          return this.setState({ projects, issues, milestones, contributors });
        }).catch(dpapp.ui.showErrorNotification);
    }
  };

  /**
   * Called when the repo value changes
   *
   * @param {{value: string}} value
   */
  handleRepoChange = (value) => {
    this.loadRepoEntities(value);
  };

  /**
   * Called when the form is submitted, the method passes the form values
   * to this.props.onCreateIssue()
   */
  handleSubmit = (values) => {
    const { dpapp, history }  = this.props;
    const contextObject       = dpapp.context.get('ticket');
    const customFields        = dpapp.context.get('ticket').customFields;
    const { tabUrl }          = dpapp.context.hostUI;

    const { repo, project, ...others } = values;
    const issue = { repo: repo.value, project: project.value, ...others }

    return githubSaveIssue(issue, contextObject.id, tabUrl)
      .then((newIssue) => {
        return customFields.getAppField('githubIssues', [])
          .then((issues) => {
            issues.push(githubIssueToCustomField(newIssue));

            return customFields.setAppField('githubIssues', issues)
              .then(() => {
                history.push("home", null);
                history.go(1);
              });
          });
      })
      .catch(dpapp.ui.showErrorNotification);
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
    const { repos, hidden } = this.props;
    const { projects, contributors, milestones } = this.state;

    if (hidden) {
      return null;
    }

    return (
      <Panel border={"none"} >
        <ActionBar title="Create issue">
          <Action icon="close" onClick={this.backHome} />
        </ActionBar>
        <Form name="create_issue" onSubmit={this.handleSubmit}>
          <Select
            label=    "Repository:"
            name=     "repo"
            // parse=    {selectParse}
            options=  {reposToOptions(repos)}
            onChange= {this.handleRepoChange}
          />
          <Select
            label=  "Project:"
            name=   "project"
            // parse=  {selectParse}
            options={projectsToOptions(projects)}
          />
          <Input
            label=    "Title:"
            name=     "title"
            validate={required}
          />
          <Textarea
            label=    "Description:"
            name=     "body"
            validate={required}
          />
          <Select
            label=  "Milestone:"
            name=   "milestone"
            // parse=  {selectParse}
            options={milestonesToOptions(milestones)}
          />
          <Select
            label=  "Assignee:"
            name=   "assignee"
            // parse=  {selectParse}
            options={contributorsToOptions(contributors)}
          />

          {/*<Group label="Labels">*/}
            {/*<TagSet*/}
              {/*id="labels"*/}
              {/*name="labels"*/}
              {/*tags={[]}*/}
              {/*options={[]}*/}
            {/*/>*/}
          {/*</Group>*/}

          <div className="dp-form-group">
            <Button>
              Create
            </Button>
          </div>

        </Form>
      </Panel>
    );
  }
}

export default PageCreateIssue;
