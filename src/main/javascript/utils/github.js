import GitHub from 'github-api';

let github = null;

/**
 * Splits a full repo name into user name and repo name
 *
 * Given the string 'deskpro/deskpro-components' this method returns an object
 * with the values { userName: 'deskpro', repoName: 'deskpro-components' }.
 *
 * @param {string} repoFullName
 * @returns {{userName: string, repoName: string}}
 * @throws {Error} when the repo full name is invalid
 */
export function splitRepoFullName(repoFullName) {
  const [userName, repoName] = repoFullName.split('/').filter(v => v);
  if (userName === undefined || repoName === undefined) {
    throw new Error(`Invalid repo full name "${repoFullName}"`);
  }

  return {
    userName,
    repoName
  };
}

/**
 * Creates the string representation of the given repo object
 *
 * @param {*} repoInfo
 * @returns {string}
 */
export function combineRepoFullName(repoInfo) {
  return `${repoInfo.userName}/${repoInfo.repoName}`;
}

/**
 * Authenticates with GitHub using the given settings
 *
 * Returns a promise which resolves when the authentication succeeds, and
 * rejects when it fails.
 *
 * @param {string} accessToken
 * @returns {Promise}
 */
export function githubAuthenticate(accessToken) {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      return reject('access_token');
    }

    github = new GitHub({
      token: accessToken
    });
    github
      .getUser()
      .getProfile()
      .then(resolve)
      .catch(reject);
  });
}

export function githubIsAuthenticated() {
  return github !== null;
}

/**
 * Fetches all of the repos the authenticated user has access to
 *
 * Returns a promise which resolves to an array of repositories.
 *
 * @returns {Promise}
 */
export function githubFetchRepos() {
  if (!github) {
    return Promise.resolve([]);
  }

  return github
    .getUser()
    .listRepos()
    .then(resp => resp.data);
}

/**
 * Returns a promise which resolves to an object containing the repo entities
 *
 * The resolved object contains the repo projects, contributors, issues, and
 * milestones.
 *
 * @param {string} userName
 * @param {string} repoName
 * @returns {Promise}
 */
export function githubFetchRepo(userName, repoName) {
  const repo   = github.getRepo(userName, repoName);
  const issues = github.getIssues(userName, repoName);

  return Promise.all([repo.listProjects(), repo.getContributors(), issues.listIssues(), issues.listMilestones()])
    .then((values) => {
      const contributors = [];
      if (values[1] && values[1].data) {
        for (let i = 0; i < values[1].data.length; i += 1) {
          contributors.push(values[1].data[i].login);
        }
      }

      return {
        projects:   values[0].data,
        issues:     values[2].data,
        milestones: values[3].data,
        contributors
      };
    });
}

/**
 * Returns a promise which resolves with the complete details for the given issue
 *
 * @param {{number: number, repo: string}} issue
 * @returns {Promise}
 */
export function githubFetchIssue(issue) {
  if (!github) {
    return Promise.resolve([]);
  }

  const info   = splitRepoFullName(issue.repo);
  const issues = github.getIssues(info.userName, info.repoName);

  return issues.getIssue(issue.number)
    .then((resp) => {
      return Object.assign({}, resp.data, {
        repoInfo: info
      });
    });
}

/**
 * Sends the given issue to GitHub to be saved, and leaves a comment on the issue
 * which links to the given tab url
 *
 * Returns a promise which resolves to an object containing the newly created
 * issue details.
 *
 * @param {{repo: string}} issue
 * @param {string} entityId
 * @param {string} tabUrl
 * @returns {Promise}
 */
export function githubSaveIssue(issue, entityId, tabUrl) {
  if (!github) {
    return Promise.reject();
  }

  const info  = splitRepoFullName(issue.repo);
  const issues = github.getIssues(info.userName, info.repoName);

  return issues.createIssue(issue)
    .then((resp) => {
      const newIssue = Object.assign({}, resp.data, {
        repo: issue.repo
      });
      const comment = `Linked to ticket [#${entityId}](${tabUrl}).`;
      return issues.createIssueComment(newIssue.number, comment)
        .then(() => newIssue);
    });
}

/**
 * Turns the given issue object to a custom field string
 *
 * @param {*} issue
 * @returns {string}
 */
export function githubIssueToCustomField(issue) {
  return `${issue.repo} ${issue.number}`;
}

/**
 * Turns a custom field into an issue object
 *
 * @param {String} customField
 * @returns {{repo: *|string, number: *|string}}
 */
export function githubCustomFieldToIssue(customField) {
  const parts = customField.split(' ');

  return {
    repo:   parts[0],
    number: parts[1]
  };
}
