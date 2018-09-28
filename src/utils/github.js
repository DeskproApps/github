import Octokat from 'octokat';

let github = null;

let accessToken = null;

export function setAccessToken(token) {
  accessToken = token;
}

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

export function repoFromUrl(repositoryUrl) {
  return repositoryUrl.split('/').slice(-2).join('/');
}

/**
 * Authenticates with GitHub using the given settings
 *
 * Returns a promise which resolves when the authentication succeeds, and
 * rejects when it fails.
 *
 * @returns {Promise}
 */
export function githubAuthenticate() {
  return new Promise((resolve, reject) => {
    if (!accessToken) {
      return reject('access_token');
    }

    github = new Octokat({
      token: accessToken
    });
    github
      .user
      .fetch()
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
    .user
    .repos
    .fetch({per_page: 100})
    .then(data => data);
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

  return github.repos(info.userName, info.repoName).issues(issue.number)
    .fetch()
    .then((data) => data);
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

  delete(issue.repo);

  return github.repos(info.userName, info.repoName).issues.create(issue)
    .then((newIssue) => {
      const comment = `Linked to ticket [#${entityId}](${tabUrl}).`;
      return githubAddCommentToIssue(newIssue, comment);
    });
}

export function githubAddCommentToIssue(issue, comment) {
  return github.fromUrl(issue.commentsUrl).create({body: comment})
    .then(() => issue);
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
 * Turns the given issue object to a custom field string
 *
 * @param {*} issue
 * @returns {string}
 */
export function linkGithubIssueFormToCustomField(values) {
  return `${values.repo.value} ${values.number.value}`;
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
    number: parseInt(parts[1], 10)
  };
}

export function githubSearchIssue(q) {
  if (!github) {
    return Promise.reject();
  }
  return github
    .search
    .issues
    .fetch({q: `${q} type:issue`, perPage: 50})
    .then(data => {
      return data.items;
    });
}
