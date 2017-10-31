import React from 'react';
import PropTypes from 'prop-types';
import { Icon, ListElement, Heading, TextBadge } from '@deskpro/react-components';
import { trimString } from '../utils/strings';

/**
 * Renders a single issue which has been linked to the open ticket.
 */
const Issue = ({ issue, onUnlink }) => (
  <ListElement className="dp-github-issue">
    <Icon
      name="times"
      title="Unlink issue"
      className="dp-github-delete-icon"
      onClick={onUnlink}
    />
    <a href={issue.html_url} target="_blank" rel="noopener noreferrer">
      <Heading size={4}>
        #{issue.number} - {trimString(issue.title, 22)}
        <Icon name="external-link-square" />
      </Heading>
    </a>
    <div>
      Repo: {issue.repoInfo.userName}/{issue.repoInfo.repoName}
    </div>
    {/*
    <div>
      Project:
    </div>
    */}
    <div>
      Status: {issue.state}
    </div>
    {issue.milestone && (
      <div>
        Milestone: {issue.milestone}
      </div>
    )}
    {issue.assignee && (
      <div>
        Assignee: {issue.assignee.login}
      </div>
    )}
    {issue.labels.length > 0 && (
      <div>
        Labels:
        <div>
          {issue.labels.map((label) => (
            <TextBadge style={{ backgroundColor: `#${label.color}` }}>
              {label.name}
            </TextBadge>
          ))}
        </div>
      </div>
    )}
  </ListElement>
);

Issue.propTypes = {
  issue:    PropTypes.object.isRequired,
  onUnlink: PropTypes.func
};

Issue.defaultProps = {
  onUnlink: () => {}
};

export default Issue;
