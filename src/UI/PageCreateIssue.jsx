import React from 'react';
import PropTypes from 'prop-types';
import { ActionBar, Action, Panel, Button } from '@deskpro/apps-components';

import { Form, Select, Input, Textarea, required } from '../Forms';

import { reposToOptions, projectsToOptions, contributorsToOptions, milestonesToOptions } from '../utils/forms';
import { githubIsAuthenticated,
  githubAuthenticate, githubSaveIssue, githubFetchRepos,
  githubIssueToCustomField, repoFromUrl } from '../utils/github';

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

    history: PropTypes.object.isRequired,

    dpapp: PropTypes.object.isRequired
  };


  static defaultProps = {
    hidden: false,
  };

  state  = {
    repos:        [],
    projects:     [],
    issues:       [],
    milestones:   [],
    contributors: []
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

  loadRepoEntities = (fullName) => {
    const repo = this.state.repos.find(r => r.fullName === fullName);
    const promises = [
      repo.projects.fetch(),
      repo.issues.fetch(),
      repo.milestones.fetch(),
      repo.contributors.fetch(),
    ];
    return Promise.all(promises).then(
      data => this.setState({
        projects:     data[0].items,
        issues:       data[1].items,
        milestones:   data[2].items,
        contributors: data[3].items
      })
    );
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

    const { repo, project, milestone, assignee, ...others } = values;
    const issue = { repo: repo.value, ...others };
    if (project) {
      issue.project = project.value;
    }
    if (milestone) {
      issue.milestone = milestone.value;
    }
    if (assignee) {
      issue.assignee = assignee.value;
    }

    return githubSaveIssue(issue, contextObject.id, tabUrl)
      .then((newIssue) => {
        newIssue.repo = repoFromUrl(newIssue.repositoryUrl);
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
    const { hidden } = this.props;
    const { repos, projects, contributors, milestones } = this.state;

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
            validate={required}
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
