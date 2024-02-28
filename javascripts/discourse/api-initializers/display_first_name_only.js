import { h } from "virtual-dom";
import { apiInitializer } from "discourse/lib/api";
import { formatUsername } from "discourse/lib/utilities";
import ProfileFirstName from "../components/profile-first-name";
import UserCardFirstName from "../components/user-card-first-name";

export default apiInitializer("1.8.0", (api) => {
  api.renderInOutlet("user-card-after-username", UserCardFirstName);
  api.renderInOutlet("user-post-names", ProfileFirstName);

  api.reopenWidget("poster-name", {
    userLink(attrs, text) {
      return h(
        "a",
        {
          attributes: {
            href: attrs.usernameUrl,
            "data-user-card": attrs.username,
            class: `${
              this.siteSettings.hide_user_profiles_from_public &&
              !this.currentUser
                ? "non-clickable"
                : ""
            }`,
          },
        },
        formatUsername(attrs.name.split(/\s/)[0] || attrs.username)
      );
    },
  });
});
