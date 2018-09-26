import React from 'react';
import PropTypes from 'prop-types';
import { ListItem, Action, ActionBar, Level, DataList } from '@deskpro/apps-components';


import { trimString } from '../utils/strings';

/**
 * Renders a single issue which has been linked to the open ticket.
 */
const Issue = ({ issue, onUnlink }) => (
  <ListItem className="dp-github-issue">

    <ActionBar title={`#${issue.number} - ${trimString(issue.title, 22)}`}>
      { onUnlink && <Action labelDisplay={"onHover"} label={"Unlink issue"} icon={"unlink"} onClick={onUnlink} /> }
      <Action labelDisplay={"onHover"} label={"Go to issue"} icon={"open"} onClick={() => window.open(issue.html_url, "_blank")} />
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
);

Issue.propTypes = {
  issue:    PropTypes.object.isRequired,
  onUnlink: PropTypes.func
};

Issue.defaultProps = {
  onUnlink: () => {}
};

export default Issue;
