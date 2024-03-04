import { apiInitializer } from "discourse/lib/api";
import User from "discourse/models/user";
import { observes } from "discourse-common/utils/decorators";

export default apiInitializer("1.8.0", (api) => {
  if (settings.enable_debug) {
    console.log("> DEBUG: display-first-name-only");
  }

  // Prefilling the username based on the first name.
  api.modifyClass("component:modal/create-account", {
    pluginId: "display-first-name-only",

    init() {
      this._super(...arguments);

      if (settings.enable_debug) {
        console.log(" component:modal/create-account");
        console.log("  - skipConfirmation:", this.model.skipConfirmation);
        console.log("  - hasAuthOptions:", this.hasAuthOptions);
        console.log("  - accountUsername:", this.model.accountUsername);
      }

      if (
        this.model.skipConfirmation ||
        !this.hasAuthOptions ||
        !this.model.accountUsername
      ) {
        return;
      }

      const firstName = this.model.accountUsername.trim().split("_")[0];

      if (!settings.allow_username_edit) {
        this.model.authOptions.can_edit_username = false;
      }

      User.checkUsername(firstName, this.accountEmail).then((result) => {
        if (settings.enable_debug) {
          console.log("  checkUsername, result:", result.suggestion);
        }

        if (result.suggestion) {
          this.setProperties({
            accountUsername: result.suggestion,
            prefilledUsername: result.suggestion,
          });
        } else {
          this.setProperties({
            accountUsername: firstName,
            prefilledUsername: firstName,
          });
        }
      });
    },

    @observes("emailValidation", "model.accountEmail")
    prefillUsername() {
      if (this.hasAuthOptions) {
        return;
      }

      this._super(...arguments);
    },
  });
});
