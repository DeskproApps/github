import React from 'react';
import PropTypes from 'prop-types';
import { sdkConnect } from '@deskpro/apps-sdk-react';
import { Container } from '@deskpro/react-components';
import { reduxForm } from '@deskpro/react-components/dist/bindings';
import { reposToOptions, issuesToOptions } from '../utils/forms';
import { githubFetchRepo, splitRepoFullName, githubIssueToCustomField } from '../utils/github';

const { Form, Select, Button, validators } = reduxForm;

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
      issueData: []
    };
  }

  /**
   * Makes an API call to GitHub to get all the issues for the given repo and stores
   * them in component state
   *
   * @param {string} repo
   */
  loadRepoIssues = (repo) => {
    if (repo) {
      const info = splitRepoFullName(repo);
      githubFetchRepo(info.userName, info.repoName)
        .then(({ issues }) => {
          return this.setState({ issueData: issues });
        }).catch(this.props.ui.error);
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
  handleSubmit = (issue) => {
    const { ui, route, context } = this.props;

    const customField = githubIssueToCustomField(issue);
    context.customFields.getAppField('githubIssues', [])
      .then((issues) => {
        return context.customFields.setAppField('githubIssues', [...issues, customField])
          .then(() => {
            return route.to('home');
          });
      }).catch(ui.error);
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

    const selectParse = (value) => {
      if (value && value.value !== undefined) {
        return value.value;
      }
      return null;
    };

    return (
      <Container className="dp-github-container">
        <Form name="link_issue" onSubmit={this.handleSubmit}>
          <Select
            label="Repository:"
            id="repo"
            name="repo"
            parse={selectParse}
            validate={validators.required}
            onChange={this.handleRepoChange}
            onBlur={() => {}}
            options={reposToOptions(repos)}
            required
          />
          <Select
            label="Issue:"
            id="number"
            name="number"
            parse={selectParse}
            validate={validators.required}
            options={issuesToOptions(issueData)}
          />
          <Button>
            Link
          </Button>
        </Form>
      </Container>
    );
  }
}

export default sdkConnect(TabLinkIssue);
