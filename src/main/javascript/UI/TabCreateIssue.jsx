import React from 'react';
import PropTypes from 'prop-types';
import { sdkConnect } from '@deskpro/apps-sdk-react';
import { Container, Group, TagSet, Button } from '@deskpro/react-components';
import { Form, Select, Input, Textarea, validators } from '@deskpro/redux-components';
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
class TabCreateIssue extends React.PureComponent {
  static propTypes = {
    /**
     * Whether or not the tab is hidden or not.
     */
    hidden:  PropTypes.bool,
    /**
     * List of Github repos the authenticated user belongs to.
     */
    repos:   PropTypes.array,
    /**
     * Instance of sdk route.
     */
    route:   PropTypes.object.isRequired,
    /**
     * Instance of sdk ui.
     */
    ui:      PropTypes.object.isRequired,
    /**
     * Instance of sdk context.
     */
    context: PropTypes.object.isRequired
  };

  static defaultProps = {
    hidden: false,
    repos:  []
  };

  /**
   * Constructor
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state  = {
      projects:     [],
      issues:       [],
      milestones:   [],
      contributors: []
    };
  }

  /**
   * Makes an API call to GitHub to get the projects, issues, milestones, etc for
   * the given repo and stores the values in component state
   *
   * @param {string} repo
   */
  loadRepoEntities = (repo) => {
    if (repo) {
      const info = splitRepoFullName(repo);
      githubFetchRepo(info.userName, info.repoName)
        .then(({ projects, issues, milestones, contributors }) => {
          return this.setState({ projects, issues, milestones, contributors });
        }).catch(this.props.ui.error);
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
  handleSubmit = (issue) => {
    const { route, context } = this.props;

    return githubSaveIssue(issue, context.object.id, context.props.tabUrl)
      .then((newIssue) => {
        return context.customFields.getAppField('githubIssues', [])
          .then((issues) => {
            issues.push(githubIssueToCustomField(newIssue));

            return context.customFields.setAppField('githubIssues', issues)
              .then(() => {
                return route.to('home');
              });
          });
      })
      .catch(this.props.ui.error);
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
      <Container className="dp-github-container">
        <Form name="create_issue" onSubmit={this.handleSubmit}>
          <Select
            label="Repository:"
            id="repo"
            name="repo"
            parse={selectParse}
            options={reposToOptions(repos)}
            onChange={this.handleRepoChange}
          />
          <Select
            label="Project:"
            id="project"
            name="project"
            parse={selectParse}
            options={projectsToOptions(projects)}
          />
          <Input
            label="Title:"
            id="title"
            name="title"
            validate={validators.required}
          />
          <Textarea
            label="Description:"
            id="body"
            name="body"
            validate={validators.required}
          />
          <Select
            label="Milestone:"
            id="milestone"
            name="milestone"
            parse={selectParse}
            options={milestonesToOptions(milestones)}
          />
          <Select
            label="Assignee:"
            id="assignee"
            name="assignee"
            parse={selectParse}
            options={contributorsToOptions(contributors)}
          />
          <Group label="Labels">
            <TagSet
              id="labels"
              name="labels"
              tags={[]}
              options={[]}
            />
          </Group>
          <Button>
            Create
          </Button>
        </Form>
      </Container>
    );
  }
}

export default sdkConnect(TabCreateIssue);
