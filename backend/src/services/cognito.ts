import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  GetUserCommand,
  AdminGetUserCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "node:crypto";
import { env } from "../config/env.js";
import { logger } from "../config/logger.js";

let client: CognitoIdentityProviderClient | null = null;

function getClient() {
  if (!client) {
    client = new CognitoIdentityProviderClient({ region: env.cognitoRegion });
  }
  return client;
}

function computeSecretHash(username: string): string | undefined {
  if (!env.cognitoClientSecret) return undefined;
  return crypto
    .createHmac("sha256", env.cognitoClientSecret)
    .update(username + env.cognitoClientId)
    .digest("base64");
}

export function isCognitoConfigured(): boolean {
  return Boolean(env.cognitoUserPoolId && env.cognitoClientId);
}

export async function signUp(email: string, password: string, name: string) {
  const c = getClient();
  const params: any = {
    ClientId: env.cognitoClientId,
    Username: email,
    Password: password,
    UserAttributes: [
      { Name: "email", Value: email },
      { Name: "name", Value: name },
    ],
  };
  const hash = computeSecretHash(email);
  if (hash) params.SecretHash = hash;

  const resp = await c.send(new SignUpCommand(params));
  logger.info({ email, confirmed: resp.UserConfirmed }, "Cognito signup");
  return { userSub: resp.UserSub, confirmed: resp.UserConfirmed ?? false };
}

export async function confirmSignUp(email: string, code: string) {
  const c = getClient();
  const params: any = {
    ClientId: env.cognitoClientId,
    Username: email,
    ConfirmationCode: code,
  };
  const hash = computeSecretHash(email);
  if (hash) params.SecretHash = hash;

  await c.send(new ConfirmSignUpCommand(params));
  logger.info({ email }, "Cognito email confirmed");
}

export async function signIn(email: string, password: string) {
  const c = getClient();
  const authParams: any = {
    USERNAME: email,
    PASSWORD: password,
  };
  const hash = computeSecretHash(email);
  if (hash) authParams.SECRET_HASH = hash;

  const resp = await c.send(
    new InitiateAuthCommand({
      ClientId: env.cognitoClientId,
      AuthFlow: "USER_PASSWORD_AUTH",
      AuthParameters: authParams,
    })
  );
  const result = resp.AuthenticationResult;
  if (!result?.AccessToken || !result?.IdToken) {
    throw new Error("Authentication failed — no tokens returned");
  }
  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
    expiresIn: result.ExpiresIn,
  };
}

export async function getUserFromAccessToken(accessToken: string) {
  const c = getClient();
  const resp = await c.send(new GetUserCommand({ AccessToken: accessToken }));
  const attrs = Object.fromEntries(
    (resp.UserAttributes ?? []).map((a) => [a.Name, a.Value])
  );
  return {
    sub: attrs.sub!,
    email: attrs.email!,
    name: attrs.name ?? attrs.email!,
    emailVerified: attrs.email_verified === "true",
  };
}

export async function forgotPassword(email: string) {
  const c = getClient();
  const params: any = {
    ClientId: env.cognitoClientId,
    Username: email,
  };
  const hash = computeSecretHash(email);
  if (hash) params.SecretHash = hash;

  await c.send(new ForgotPasswordCommand(params));
  logger.info({ email }, "Cognito forgot password code sent");
}

export async function confirmForgotPassword(email: string, code: string, newPassword: string) {
  const c = getClient();
  const params: any = {
    ClientId: env.cognitoClientId,
    Username: email,
    ConfirmationCode: code,
    Password: newPassword,
  };
  const hash = computeSecretHash(email);
  if (hash) params.SecretHash = hash;

  await c.send(new ConfirmForgotPasswordCommand(params));
  logger.info({ email }, "Cognito password reset confirmed");
}
