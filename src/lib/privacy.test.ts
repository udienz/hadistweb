import { describe, expect, it } from "vitest";
import { privacyContact } from "./privacy";

describe("privacyContact", () => {
  it("reads the name and a valid email from the environment", () => {
    expect(privacyContact({ PRIVACY_CONTACT_NAME: " Owner ", PRIVACY_CONTACT_EMAIL: "owner@example.com" })).toEqual({
      name: "Owner",
      email: "owner@example.com",
    });
  });

  it("leaves out an empty or malformed value", () => {
    expect(privacyContact({ PRIVACY_CONTACT_NAME: " ", PRIVACY_CONTACT_EMAIL: "not an email" })).toEqual({ name: null, email: null });
    expect(privacyContact({})).toEqual({ name: null, email: null });
  });
});
