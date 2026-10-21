const { setAuthCookies, clearAuthCookies } = require("./cookies");

describe("auth cookies", () => {
  let response;

  beforeEach(() => {
    response = { cookie: jest.fn() };
  });

  test("sets secure production cookies with the supplied tokens", () => {
    setAuthCookies(response, "access-token", "refresh-token", true);

    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "access-token",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 15 * 60 * 1000
      }
    );
    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "refresh-token",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000
      }
    );
  });

  test("sets non-production cookies with lax same-site policy", () => {
    setAuthCookies(response, "access-token", "refresh-token", false);

    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "access-token",
      expect.objectContaining({ secure: false, sameSite: "lax" })
    );
    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "refresh-token",
      expect.objectContaining({ secure: false, sameSite: "lax" })
    );
  });

  test("clears both cookies using production cookie settings", () => {
    clearAuthCookies(response, true);

    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 0
      }
    );
    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "",
      {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        path: "/",
        maxAge: 0
      }
    );
  });

  test("clears both cookies using non-production cookie settings", () => {
    clearAuthCookies(response, false);

    expect(response.cookie).toHaveBeenNthCalledWith(
      1,
      "accessToken",
      "",
      expect.objectContaining({ secure: false, sameSite: "lax", maxAge: 0 })
    );
    expect(response.cookie).toHaveBeenNthCalledWith(
      2,
      "refreshToken",
      "",
      expect.objectContaining({ secure: false, sameSite: "lax", maxAge: 0 })
    );
  });
});