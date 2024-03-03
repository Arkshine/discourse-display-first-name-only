import { apiInitializer } from "discourse/lib/api";
import User from "discourse/models/user";
import discourseDebounce from "discourse-common/lib/debounce";
import { observes } from "discourse-common/utils/decorators";

export default apiInitializer("1.8.0", (api) => {
  // Removes the number at the end of string.
  // E.g. "username1" => "username"
  api.formatUsername((username) => {
    return username.replace(/\d+$/, "");
  });

  // Prefilling the username based on the first name.
  api.modifyClass("component:modal/create-account", {
    pluginId: "display-first-name-only",

    init() {
      this._super(...arguments);

      if (!this.model.skipConfirmation) {
        // When the modal opens, check immediately if we can prefill the username.
        this.prefillUsername();
      }
    },

    @observes("model.accountUsername")
    prefillUsername(data) {
      if (
        this.prefilledUsername === this.model.accountUsername ||
        !this.model.accountUsername
      ) {
        return;
      }

      const checkUsername = async () => {
        const username = this.model.accountUsername.trim().split("_")[0];
        const result = await User.checkUsername(username, this.accountEmail);

        if (result.suggestion) {
          this.setProperties({
            accountUsername: result.suggestion,
            prefilledUsername: result.suggestion,
          });
        } else {
          this.setProperties({
            accountUsername: username,
            prefilledUsername: username,
          });
        }
      };

      if (!data) {
        checkUsername();
      } else {
        discourseDebounce(this, () => checkUsername(), 1500);
      }
    },
  });
});
