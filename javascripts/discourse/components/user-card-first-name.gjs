import Component from "@glimmer/component";
import { on } from "@ember/modifier";
import { inject as service } from "@ember/service";
import userStatus from "discourse/helpers/user-status";
import { prioritizeNameInUx } from "discourse/lib/settings";
import { formatUsername } from "discourse/lib/utilities";

export default class UserCardFirstName extends Component {
  @service currentUser;

  get user() {
    return this.args.outletArgs.user;
  }

  get showUser() {
    return this.args.outletArgs.showUser;
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

  get staff() {
    return this.user.staff ? "staff" : "";
  }

  get newUser() {
    return this.user.newUser ? "new-user" : "";
  }

  get contentHidden() {
    return this.user.profileHidden || this.user.inactive;
  }

  <template>
    {{log this}}
    <h1
      class="{{this.staff}}
        {{this.newUser}}
        {{if this.nameFirst 'full-name first-name-only' 'username'}}"
    >
      {{#if this.contentHidden}}
        <span id="discourse-user-card-title" class="name-username-wrapper">
          {{this.firstName}}
        </span>
      {{else}}
        <a
          href={{this.user.path}}
          {{on "click" this.showUser}}
          class="user-profile-link"
        >
          <span id="discourse-user-card-title" class="name-username-wrapper">
            {{if this.nameFirst this.firstName this.formattedUsername}}
          </span>
          {{userStatus this.user currentUser=this.currentUser}}
        </a>
      {{/if}}
    </h1>
  </template>
}
