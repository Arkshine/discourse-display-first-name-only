import { apiInitializer } from "discourse/lib/api";
import User from "discourse/models/user";

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

      if (
        this.model.skipConfirmation ||
        this.hasAuthOptions ||
        !this.model.accountUsername
      ) {
        return;
      }

      const firstName = this.model.accountUsername.trim().split("_")[0];

      User.checkUsername(firstName, this.accountEmail).then((result) => {
        if (result.suggestion) {
          this.setProperties({
            accountUsername: result.suggestion,
            prefilledUsername: result.suggestion,
          });
        }
      });
    },
  });
});
