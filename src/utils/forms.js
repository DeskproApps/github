import { trimString } from './strings';
import { Avatar } from "@deskpro/apps-components";
import React from "react";

/**
 * @param {Array} repos
 * @returns {Array}
 */
export function reposToOptions(repos) {
  return repos.map(repo => (
    {
      label: repo.fullName,
      value: repo.fullName,
    }
  ));
}

/**
 * @param {Array} projects
 * @returns {Array}
 */
export function projectsToOptions(projects) {
  return projects.map(project => (
    {
      label: project.name,
      value: project.id
    }
  ));
}

const renderContributor = (contributor) => {
  let avatar = '';
  if (contributor.avatarUrl) {
    avatar = [<Avatar key="avatar" shape="round" src={contributor.avatarUrl} />, <span key="space"> </span>];
  }
  return <span>{avatar} {contributor.login}</span>
};

/**
 * @param {Array} contributors
 * @returns {Array}
 */
export function contributorsToOptions(contributors) {
  return contributors.map(contributor => (
    {
      label: renderContributor(contributor),
      value: contributor.login,
    }
  ));
}

/**
 * @param {Array} milestones
 * @returns {Array}
 */
export function milestonesToOptions(milestones) {
  return milestones.map(milestone => (
    {
      label: milestone.title,
      value: milestone.id
    }
  ));
}

/**
 * @param {Array} issues
 * @returns {Array}
 */
export function issuesToOptions(issues) {
  return issues.map(issue => (
    {
      label: `#${issue.number} ${trimString(issue.title, 20)}`,
      value: issue.number
    }
  ));
}
