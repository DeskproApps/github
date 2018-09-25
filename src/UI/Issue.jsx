import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Action, ActionBar, Menu, DataList } from '@deskpro/apps-components';


import { trimString } from '../utils/strings';

/**
 * Renders a single issue which has been linked to the open ticket.
 */
class Issue extends React.PureComponent
{
  static propTypes = {
    issue:    PropTypes.object.isRequired,
    onUnlink: PropTypes.func,
    onLink:   PropTypes.func,
  };

  static defaultProps = {
    onUnlink: false,
    onLink: false,
  };

  state = {
    menuOpen: false,
    confirmUnlink: false,
  };

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.closeMenu);
  }

  toggleMenu = () => {
    if (this.state.menuOpen) {
      this.closeMenu();
    } else {
      this.openMenu();
    }
  };

  openMenu = () => {
    this.setState({
      menuOpen: true
    });
    document.addEventListener('mousedown', this.closeMenu);
  };

  closeMenu = () => {
    this.setState({
      menuOpen: false
    });
    document.removeEventListener('mousedown', this.closeMenu);
  };

  confirmUnlink = () => {
    this.setState({
      confirmUnlink: true,
    });
  };

  render() {
    const { issue, onUnlink, onLink } = this.props;
    const { confirmUnlink, menuOpen } = this.state;
    return (
      <ListItem className="dp-github-issue">

        <ActionBar title={<a href={issue.html_url} target="_blank">#{issue.number} - {trimString(issue.title, 22)}</a>}>
          <Menu
            onClick={this.toggleMenu}
            isOpen={menuOpen}
          >
            <Action label="Open" icon="open" onClick={() => window.open(issue.html_url, "_blank")} />
            { onUnlink && !confirmUnlink && <Action label="Unlink" icon="unlink" onClick={this.confirmUnlink} /> }
            { onUnlink && confirmUnlink && <Action label="Are you sure?" onClick={onUnlink} /> }
            { onLink && <Action label="Link" icon="link" onClick={onLink} /> }
          </Menu>
        </ActionBar>

        <DataList data={[
          {
            label: "Repo",
            value: `${issue.repoInfo.userName}/${issue.repoInfo.repoName}`
          },
          {
            label: "Status",
            value: issue.state
          },
          issue.milestone ? {
            label: "Milestone",
            value: issue.milestone
          } : null,
          issue.assignee ? {
            label: "Assignee",
            value: issue.assignee.login
          } : null,
        ].filter(x => !!x)} />

        {issue.labels.length > 0 && (
          <div>
            Labels:
            <div>
              {issue.labels.map((label) => (
                <span style={{ backgroundColor: `#${label.color}` }}>
              {label.name}
            </span>
              ))}
            </div>
          </div>
        )}
      </ListItem>
    )
  }
}

export default Issue;
