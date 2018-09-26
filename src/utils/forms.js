import { trimString } from './strings';

/**
 * @param {Array} repos
 * @returns {Array}
 */
export function reposToOptions(repos) {
  return repos.map(repo => (
    {
      label: repo.full_name,
      value: repo.full_name
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

/**
 * @param {Array} contributors
 * @returns {Array}
 */
export function contributorsToOptions(contributors) {
  return contributors.map(contributor => (
    {
      label: contributor,
      value: contributor
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
