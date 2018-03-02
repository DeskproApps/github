import React from 'react';
import PropTypes from 'prop-types';

export default class ScreenSettings extends React.Component {
  static propTypes = {
    finishInstall: PropTypes.func.isRequired,
    settings:      PropTypes.array.isRequired,
    values:        PropTypes.array.isRequired,
    settingsForm:  PropTypes.func.isRequired,
    dpapp:         PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.state = {
      oauthSettings: null,
      error:         null
    };
  }

  componentDidMount() {
    const { oauth } = this.props.dpapp;

    oauth.settings('github')
      .then(oauthSettings => {
        this.setState({
          oauthSettings,
          error: null
        });

        return oauthSettings;
      })
      .catch(error => {
        this.setState({
          oauthSettings: null,
          error:         new Error(error)
        });
      });
  }

  onSettings(settings) {
    const { oauth } = this.props.dpapp;
    const { finishInstall } = this.props;
    const providerName = 'github';

    // retrieve the oauth proxy settings for github
    oauth.settings(providerName)
      .then(oauthSettings => {
        const connectionProps = {
          providerName,
          urlRedirect:    oauthSettings.urlRedirect,
          clientId:       settings.clientId,
          clientSecret:   settings.clientSecret,
          urlAuthorize:   'https://github.com/login/oauth/authorize',
          urlAccessToken: 'https://github.com/login/oauth/access_token',
          scopes:         ['public_repo']
        };

        return oauth.register(providerName, connectionProps).then(() => connectionProps);
      })
      .then(connectionProps => {
        return oauth.access(providerName)
          .then(() => { return connectionProps; })
          .catch(() => Promise.reject('oauth2 error'));
      })
      .then(() => {
        return finishInstall(settings)
          .then(({ onStatus }) => onStatus());
      })
      .catch(error => {
        return new Error(error);
      });
  }

  render() {
    const { settings, values, finishInstall, settingsForm: SettingsForm } = this.props;
    const redirectUrl = this.state.oauthSettings ? this.state.oauthSettings.urlRedirect : null;
    const errorFree = this.state.error === null;

    if (settings.length) {
      let newSettings = [...settings];
      const newValues = { ...values, urlRedirect: errorFree ? 'Loading...' : 'Not Available' };

      if (redirectUrl && errorFree) {
        newValues.urlRedirect = redirectUrl;
        newSettings = newSettings.map(el => (el.name === 'urlRedirect' ? { ...el, defaultValue: redirectUrl } : el));
      }

      let formRef;
      return (
        <div className={'settings'}>
          <SettingsForm
            settings={newSettings}
            values={newValues}
            ref={ref => { formRef = ref; }}
            onSubmit={this.onSettings.bind(this)}
          />
          <button className={'btn-action'} onClick={() => formRef.submit()}>
            Update Settings
          </button>
        </div>
      );
    }

    finishInstall(null)
      .then(({ onStatus }) => onStatus())
      .catch(error => new Error(error));

    return null;
  }
}
