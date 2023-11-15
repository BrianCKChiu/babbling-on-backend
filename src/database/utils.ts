interface SignInResponse {
  idToken: string;
}

export async function fireBaseSignInWithEmail(
  email: string,
  password: string
): Promise<string> {
  const apiUrl =
    "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key";

  const response = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password, returnSecureToken: true }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to sign in with email and password. Status: ${response.status}`
    );
  }

  const json: SignInResponse = await response.json();
  return json.idToken;
}
