import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Action, ActionBar, Menu, DataList } from '@deskpro/apps-components';


import { trimString } from '../utils/strings';
import { repoFromUrl } from '../utils/github';
import { renderUser } from '../utils/forms';
import githubLogo from "../githubLogo.png";

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
            <Action key="open" label="Open" icon="open" onClick={() => window.open(issue.htmlUrl, "_blank")} />
            { onUnlink && !confirmUnlink && <Action key="unlink" label="Unlink" icon="unlink" onClick={this.confirmUnlink} /> }
            { onUnlink && confirmUnlink && <Action key="unlink" label="Are you sure?" onClick={onUnlink} /> }
            { onLink && <Action key="link" label="Link" icon="link" onClick={onLink} /> }
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
            value: renderUser(issue.assignee)
          } : null,
        ].filter(x => !!x)} />

        {issue.labels.length > 0 && (
          <div>
            Labels:
            <div>
              {issue.labels.map((label) => (
                <span key={label.name} style={{ backgroundColor: `#${label.color}`, marginRight: '1em' }}>{label.name}</span>
              ))}
            </div>
          </div>
        )}
      </ListItem>
    )
  }
}

export default Issue;
