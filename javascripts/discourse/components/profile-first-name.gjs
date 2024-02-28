import Component from "@glimmer/component";
import { inject as service } from "@ember/service";
import UserStatusMessage from "discourse/components/user-status-message";
import userStatus from "discourse/helpers/user-status";
import { prioritizeNameInUx } from "discourse/lib/settings";
import { formatUsername } from "discourse/lib/utilities";

export default class ProfileFirstName extends Component {
  @service currentUser;

  get user() {
    return this.args.outletArgs.model;
  }

  get formattedUsername() {
    return formatUsername(this.user?.username);
  }

  get firstName() {
    return this.user.name.split(/\s/)[0];
  }

  get nameFirst() {
    return prioritizeNameInUx(this.user.name);
  }

  <template>
    <div
      class="{{if this.nameFirst 'full-name first-name-only' 'username'}}
        user-profile-names__primary"
    >
      {{if this.nameFirst this.firstName this.formattedUsername}}
      {{userStatus this.user currentUser=this.currentUser}}
      {{#if this.user.status}}
        <UserStatusMessage @status={{this.user.status}} />
      {{/if}}
    </div>
  </template>
}
