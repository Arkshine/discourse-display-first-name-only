import { apiInitializer } from "discourse/lib/api";
import User from "discourse/models/user";
import discourseDebounce from "discourse-common/lib/debounce";
import { observes } from "discourse-common/utils/decorators";

export default apiInitializer("1.8.0", (api) => {
  const siteSettings = api.container.lookup("service:site-settings");

  if (
    !siteSettings.full_name_required ||
    !siteSettings.prioritize_username_in_ux
  ) {
    return;
  }

  // Removes the number at the end of string.
  // E.g. "username1" => "username"
  api.formatUsername((username) => {
    return username.replace(/\d+$/, "");
  });

  // Prefilling the username based on the first name.
  api.modifyClass("component:modal/create-account", {
    pluginId: "display-first-name-only",

    prefillUsername() {
      // do nothing by overwriting the method.
    },

    init() {
      this._super(...arguments);

      if (!this.model.skipConfirmation) {
        // When the modal opens, check immediately if we can prefill the username.
        this.prefillUsernameFromName();
      }
    },

    @observes("model.accountEmail", "model.accountName")
    prefillUsernameFromName(data) {
      if (this.prefilledUsername) {
        if (this.model.accountUsername === this.prefilledUsername) {
          this.set("model.accountUsername", "");
        }
        this.set("prefilledUsername", null);
      }

      if (!this.model.accountName?.length) {
        return;
      }

      if (this.get("nameValidation.ok")) {
        const checkUsername = async () => {
          const name = this.accountName.trim().split(/\s/)[0];
          if (!name.length) {
            return;
          }
          const result = await User.checkUsername(name, this.accountEmail);

          if (result.suggestion) {
            this.setProperties({
              accountUsername: result.suggestion,
              prefilledUsername: result.suggestion,
            });
          } else {
            this.setProperties({
              accountUsername: name,
              prefilledUsername: name,
            });
          }
        };

        if (!data) {
          checkUsername();
        } else {
          discourseDebounce(this, () => checkUsername(), 500);
        }
      }
    },
  });
});
