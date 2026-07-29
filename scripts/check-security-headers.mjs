const CHECKER_VERSION = "3.0";

const baseUrl = (
  process.argv[2] ||
  process.env.SECURITY_CHECK_URL ||
  "http://localhost:3000"
).replace(/\/+$/, "");

const commonRequirements = {
  "content-security-policy": (value) =>
    value.includes("default-src 'self'") &&
    value.includes("frame-ancestors 'none'"),

  "x-content-type-options": (value) => value.toLowerCase() === "nosniff",

  "x-frame-options": (value) => value.toUpperCase() === "DENY",

  "referrer-policy": (value) =>
    value.toLowerCase() === "strict-origin-when-cross-origin",

  "permissions-policy": (value) =>
    value.includes("camera=()") &&
    value.includes("microphone=()") &&
    value.includes("geolocation=()"),

  "cross-origin-opener-policy": (value) =>
    value.toLowerCase() === "same-origin-allow-popups",
};

const robotsRequirement = {
  "x-robots-tag": (value) =>
    value.includes("noindex") && value.includes("nofollow"),
};

function isNotPubliclyCacheable(value) {
  const normalized = value.toLowerCase();

  return (
    normalized.length > 0 &&
    !normalized.includes("public") &&
    !normalized.includes("s-maxage") &&
    !normalized.includes("immutable")
  );
}

function hasNoStore(value) {
  return value.toLowerCase().includes("no-store");
}

async function inspectRoute({ pathname, requirements, allowedStatuses }) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    redirect: "manual",
    headers: {
      "user-agent": `school-security-header-check/${CHECKER_VERSION}`,
    },
  });

  console.log(`\n${pathname} -> ${response.status}`);

  let failed = false;

  const validStatus = allowedStatuses.includes(response.status);

  console.log(`${validStatus ? "PASS" : "FAIL"} status: ${response.status}`);

  if (!validStatus) {
    failed = true;
  }

  for (const [headerName, validate] of Object.entries(requirements)) {
    const value = response.headers.get(headerName) ?? "";

    const valid = value.length > 0 && validate(value);

    console.log(
      `${valid ? "PASS" : "FAIL"} ${headerName}: ${
        value || "(tidak tersedia)"
      }`,
    );

    if (!valid) {
      failed = true;
    }
  }

  return {
    failed,
    response,
  };
}

async function main() {
  console.log(`Security checker v${CHECKER_VERSION}`);

  console.log(`Memeriksa header keamanan pada ${baseUrl}`);

  const publicResult = await inspectRoute({
    pathname: "/",
    allowedStatuses: [200],
    requirements: commonRequirements,
  });

  const adminResult = await inspectRoute({
    pathname: "/admin/dashboard",
    allowedStatuses: [200, 301, 302, 303, 307, 308, 401, 403],
    requirements: {
      ...commonRequirements,
      ...robotsRequirement,

      "cache-control": isNotPubliclyCacheable,
    },
  });

  const apiResult = await inspectRoute({
    pathname: "/api/security-check",
    allowedStatuses: [204],
    requirements: {
      ...commonRequirements,
      ...robotsRequirement,

      "cache-control": hasNoStore,
    },
  });

  const poweredBy = publicResult.response.headers.get("x-powered-by");

  const poweredByFailed = Boolean(poweredBy);

  console.log(
    `\n${poweredByFailed ? "FAIL" : "PASS"} x-powered-by: ${
      poweredBy || "(tidak tersedia)"
    }`,
  );

  if (
    publicResult.failed ||
    adminResult.failed ||
    apiResult.failed ||
    poweredByFailed
  ) {
    console.error("\nPemeriksaan header keamanan gagal.");

    process.exit(1);
  }

  console.log("\nSemua pemeriksaan header keamanan berhasil.");
}

main().catch((error) => {
  console.error("\nTidak dapat menjalankan pemeriksaan:", error);

  console.error(
    "Pastikan server Next.js sedang berjalan pada alamat yang diperiksa.",
  );

  process.exit(1);
});
