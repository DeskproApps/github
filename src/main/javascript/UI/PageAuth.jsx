import React from 'react';
import PropTypes from 'prop-types';
import { Container, Heading, Button } from '@deskpro/react-components';
import { sdkConnect } from '@deskpro/apps-sdk-react';

/**
 * Renders the authentication page.
 */
class PageAuth extends React.Component {
  static propTypes = {
    /**
     * Instance of sdk storage.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/storage.html
     */
    storage: PropTypes.object,
    /**
     * Instance of sdk oauth.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/oauth.html
     */
    oauth:   PropTypes.object,
    /**
     * Instance of sdk route.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/route.html
     */
    route:   PropTypes.object,
    /**
     * Instance of sdk ui.
     * @see https://deskpro.gitbooks.io/deskpro-apps/content/api/props/ui.html
     */
    ui:      PropTypes.object
  };

  handleClick = () => {
    const { oauth, storage, route, ui } = this.props;

    oauth.access('github')
      .then((resp) => {
        if (resp && resp.access_token) {
          storage.setApp({
            user_settings: { access_token: resp.access_token }
          }, () => {
            route.to('home');
          });
        }
        return resp;
      }).catch(ui.error);
  };

  /**
   * @returns {XML}
   */
  render() {
    return (
      <Container className="dp-github-container">
        <Heading size={3}>
          Authenticate
        </Heading>
        <p>
          You must authenticate with GitHub before you continue.
        </p>
        <Button onClick={this.handleClick}>
          Authenticate
        </Button>
      </Container>
    );
  }
}

export default sdkConnect(PageAuth);
