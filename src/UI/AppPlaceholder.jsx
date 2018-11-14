import React from 'react';
import { Action, List, Panel } from "@deskpro/apps-components";

class AppPlaceholder extends React.PureComponent
{
  render() {
    return (
      <Panel title={"Linked Issues"} border={"none"} className="dp-github-container">
        <Action icon={"search"} label={"Find"} />
        <Action icon={"add"} label={"Create"} />
        <List className="dp-github-issues" />
      </Panel>
    )
  }
}

export default AppPlaceholder;
