import React from 'react';
import PropTypes from 'prop-types';
import { Loader, Panel, Button, Tabs, TabMenu } from '@deskpro/apps-components';

/**
 * Renders the authentication page.
 */
class PageAuth extends React.Component
{
  static propTypes = {
    history: PropTypes.object.isRequired,
    dpapp: PropTypes.object.isRequired
  };

  handleClick = () => {
    const { history, dpapp } = this.props;

    dpapp.oauth.requestAccess('github')
      .then((resp) => {
        if (resp && resp.access_token) {
          dpapp.storage.setAppStorage("user_settings", { access_token: resp.access_token }).then(() => {
            history.push("home", null);
            history.go(1);
          });
        }
        return resp;
      }).catch(dpapp.ui.showErrorNotification);
  };

  /**
   * @returns {XML}
   */
  render() {
    return (
      <Panel title={"Authenticate"} border={"none"} className="dp-github-container">
        <p>
          You must authenticate with GitHub before you continue.
        </p>

        <Button onClick={this.handleClick} className={"dp-Button--wide"}>
          Authenticate
        </Button>
      </Panel>
    );
  }
}

export default PageAuth;
