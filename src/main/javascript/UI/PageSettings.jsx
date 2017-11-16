import React from 'react';
import PropTypes from 'prop-types';
import { sdkConnect } from '@deskpro/apps-sdk-react';
import { Container } from '@deskpro/react-components';
import { Form, Input, Button, validators } from '@deskpro/react-components/lib/bindings/redux-form';
import { OAUTH_ACCESS_URI, OAUTH_AUTH_URI } from '../constants';

/**
 * Renders the app settings page.
 */
class PageSettings extends React.PureComponent {
  static propTypes = {
    /**
     * Instance of sdk oauth.
     */
    oauth:   PropTypes.object.isRequired,
    /**
     * Instance of sdk route.
     */
    route:   PropTypes.object.isRequired,
    /**
     * Instance of sdk storage.
     */
    storage: PropTypes.object.isRequired
  };

  /**
   * Called when the form is submitted
   */
  handleSubmit = (settings) => {
    const connection = Object.assign({}, settings, {
      urlAccessToken: OAUTH_ACCESS_URI,
      urlAuthorize:   OAUTH_AUTH_URI,
      scopes:         ['public_repo']
    });
    this.props.oauth.register('github', connection);
    this.props.route.to('auth');
  };

  /**
   * @returns {XML}
   */
  render() {
    const { oauth, storage } = this.props;

    return (
      <Container className="dp-github-container">
        <Form
          name="settings"
          initialValues={storage.app.settings}
          onSubmit={storage.onSubmitApp(this.handleSubmit)}
        >
          <p>
            You must register this app with GitHub before using it.
            From your <a href="https://github.com/settings/developers" target="_blank" rel="noopener noreferrer">
              GitHub settings page
            </a> click the "Register a new application" button.
          </p>
          <p>
            Fill out the app registration form and when you come to the "Authorization callback URL" field
            enter the following value:
          </p>
          <p>
            <code>{oauth.providers.github ? oauth.providers.github.urlRedirect : ''}</code>
          </p>
          <p>
            Click the "Register application" button, and find the "Client ID" and "Client Secret"
            values on the next page. Enter those values below and click "Save".
          </p>
          <Input
            label="Client ID"
            id="clientId"
            name="clientId"
            validate={validators.required}
          />
          <Input
            label="Client Secret"
            id="clientSecret"
            name="clientSecret"
            validate={validators.required}
          />
          <Button>
            Save
          </Button>
        </Form>
      </Container>
    );
  }
}

export default sdkConnect(PageSettings);
