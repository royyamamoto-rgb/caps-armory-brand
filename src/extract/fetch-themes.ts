/**
 * fetch-themes.ts
 * GitHub Contents API fetcher for caps-armory-app/constants/themes.ts.
 *
 * Notes on SHA semantics:
 * - GitHub Contents API rejects blob SHAs in the `?ref=` query — it expects a
 *   commit SHA, branch, or tag. So callers pass a ref (default "master") to
 *   fetch the current content of that ref, and the response's `.sha` field is
 *   the *blob* SHA of the returned file.
 * - To enforce the SHA pin from `.themes-pin` (a blob SHA), the caller passes
 *   `expectedSha` and this function throws if the blob SHA in the response
 *   does not match. Pass `expectedSha: null` to skip the check (used by the
 *   drift detector when probing HEAD).
 */

const ENDPOINT =
  "https://api.github.com/repos/royyamamoto-rgb/caps-armory-app/contents/constants/themes.ts";

export interface FetchArgs {
  /** Blob SHA pin to verify against; pass `null` to skip the check. */
  expectedSha: string | null;
  /** Git ref to fetch from (branch / tag / commit-sha). Defaults to "master". */
  ref?: string;
  /** GitHub PAT or installation token with read access. */
  token: string;
}

export interface FetchResult {
  /** Blob SHA returned by the API. */
  sha: string;
  /** Decoded UTF-8 source of `constants/themes.ts`. */
  source: string;
}

export async function fetchThemesAt({
  expectedSha,
  ref = "master",
  token,
}: FetchArgs): Promise<FetchResult> {
  const url = `${ENDPOINT}?ref=${encodeURIComponent(ref)}`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) {
    throw new Error(`themes.ts fetch ${res.status}`);
  }
  const body = (await res.json()) as {
    sha: string;
    encoding: string;
    content: string;
  };
  if (expectedSha !== null && body.sha !== expectedSha) {
    throw new Error(
      `sha mismatch: expected ${expectedSha}, got ${body.sha}`,
    );
  }
  const source = Buffer.from(
    body.content,
    body.encoding as BufferEncoding,
  ).toString("utf8");
  return { sha: body.sha, source };
}
