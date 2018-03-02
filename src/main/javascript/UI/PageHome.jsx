import React from 'react';
import PropTypes from 'prop-types';
import { sdkConnect, LinkButton } from '@deskpro/apps-sdk-react';
import { Container, Heading, List } from '@deskpro/react-components';
import { githubFetchIssue, githubCustomFieldToIssue, combineRepoFullName } from '../utils/github';
import Issue from './Issue';

/**
 * Renders a page which displays the issues which have been linked to the
 * open ticket.
 */
class PageHome extends React.PureComponent {
  static propTypes = {
    /**
     * Instance of sdk storage.
     */
    storage: PropTypes.object.isRequired,
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

  /**
   * Constructor
   *
   * @param {*} props
   */
  constructor(props) {
    super(props);
    this.state = {
      issueData: []
    };
  }

  /**
   * Invoked immediately after a component is mounted
   */
  componentDidMount() {
    this.loadIssues();
  }

  /**
   * Invoked immediately after updating occurs
   */
  componentDidUpdate(prevProps) {
    if (prevProps.storage.entity.issues !== this.props.storage.entity.issues) {
      this.loadIssues();
    }
  }

  /**
   * Loads the issue data from GitHub
   *
   * The issues linked to the open ticket are saved in app storage by id. This
   * method gets the full details for each issue from the GitHub API.
   */
  loadIssues = () => {
    const { route, context } = this.props;

    context.customFields.getAppField('githubIssues', [])
      .then((issues) => {
        if (!issues || issues.length === 0) {
          return route.to('create');
        }

        const promises = issues.map((issue) => {
          return githubFetchIssue(githubCustomFieldToIssue(issue));
        });

        return Promise.all(promises)
          .then(issueData => this.setState({ issueData }))
          .catch(this.props.ui.error);
      }).catch(this.props.ui.error);
  };

  /**
   * Callback passed to the "Linked Issues" page, which gets called to unlink an issue
   * from the current ticket
   *
   * @param {*} issue
   * @returns {Promise}
   */
  handleUnlinkIssue = (issue) => {
    const { context } = this.props;

    if (confirm('Are you sure you want to unlink this issue?')) {

      const repo = combineRepoFullName(issue.repoInfo);
      context.customFields.getAppField('githubIssues', [])
        .then((issues) => {
          const newIssues = issues.slice(0).filter((i) => {
            const ii = githubCustomFieldToIssue(i);
            return ii.number !== issue.number && ii.repo !== repo;
          });

          return context.customFields.setAppField('githubIssues', newIssues)
            .then(() => {
              return this.loadIssues();
            });
        }).catch(this.props.ui.error);
    }
  };

  /**
   * @returns {XML}
   */
  render() {
    const { issueData } = this.state;

    return (
      <Container className="dp-github-container">
        <Heading size={3}>
          Linked Issues
        </Heading>
        <List className="dp-github-issues">
          {issueData.map((issue) => (
            <Issue
              issue={issue}
              key={issue.number}
              onUnlink={() => { this.handleUnlinkIssue(issue); }}
            />
          ))}
        </List>
        <LinkButton to="create">
          Link another issue
        </LinkButton>
      </Container>
    );
  }
}

export default sdkConnect(PageHome);
