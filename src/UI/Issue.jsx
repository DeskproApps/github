import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, ListItem, Action, ActionBar, Menu, DataList } from '@deskpro/apps-components';


import { trimString } from '../utils/strings';
import { repoFromUrl } from '../utils/github';
import githubLogo from "../main/resources/icon.png";

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
    onUnlink: null,
    onLink: null,
  };

  constructor(props) {
    super(props);
    this.menu = React.createRef();
    this.state = {
      menuOpen: false,
      confirmUnlink: false,
    };
  }

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

  closeMenu = (e) => {
    if (this.menu.current && this.menu.current.contains(e.target)) {
      return;
    }
    this.setState({
      menuOpen: false,
      confirmUnlink: false
    });
    document.removeEventListener('mousedown', this.closeMenu);
  };

  confirmUnlink = () => {
    this.setState({
      confirmUnlink: true,
    });
  };

  renderAssignee = (assignee) => {
    let avatar = '';
    if (assignee.avatarUrl) {
      avatar = [<Avatar key="avatar" shape="round" src={assignee.avatarUrl} />, <span key="space"> </span>];
    }
    return <span>{avatar} {assignee.login}</span>
  };

  render() {
    const { issue, onUnlink, onLink } = this.props;
    const { confirmUnlink, menuOpen } = this.state;

    issue.repo = repoFromUrl(issue.repositoryUrl);
    return (
      <ListItem className="dp-github-issue">

        <ActionBar
          title={<a href={issue.htmlUrl} target="_blank">#{issue.number} - {trimString(issue.title, 22)}</a>}
          iconUrl={githubLogo}
        >
          <Menu
            onClick={this.toggleMenu}
            isOpen={menuOpen}
            ref={this.menu}
          >
            <Action label="Open" icon="open" onClick={() => window.open(issue.htmlUrl, "_blank")} />
            { onUnlink && !confirmUnlink && <Action label="Unlink" icon="unlink" onClick={this.confirmUnlink} /> }
            { onUnlink && confirmUnlink && <Action label="Are you sure?" onClick={onUnlink} /> }
            { onLink && <Action label="Link" icon="link" onClick={onLink} /> }
          </Menu>
        </ActionBar>

        <DataList data={[
          {
            label: "Repo",
            value: `${issue.repo}`
          },
          {
            label: "Status",
            value: issue.state
          },
          issue.milestone ? {
            label: "Milestone",
            value: issue.milestone.title
          } : null,
          issue.assignee ? {
            label: "Assignee",
            value: this.renderAssignee(issue.assignee)
          } : null,
        ].filter(x => !!x)} />

        {issue.labels.length > 0 && (
          <div>
            Labels:
            <div>
              {issue.labels.map((label) => (
                <span key={label.name} style={{ backgroundColor: `#${label.color}` }}>{label.name}</span>
              ))}
            </div>
          </div>
        )}
      </ListItem>
    )
  }
}

export default Issue;
