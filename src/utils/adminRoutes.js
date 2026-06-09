const ADMIN_PATHS = [
  "/admin",
  "/manageblogs",
  "/jobs",
  "/manageservices",
  "/managesubservices",
  "/manageprojects",
  "/manage-emp",
  "/trash-emp",
  "/approve-users",
  "/manageseo",
  "/interestedcandidates",
  "/managejoiningdates",
  "/trainerdailyreport",
  "/feedbacktotrainee",
  "/manageagreements",
  "/agreement",
  "/trainer-reports",
  "/result",
  "/results",
  "/testlist",
  "/listeningtest",
  "/aptitude-test",
  "/problemsolvingtest",
  "/sellingtest",
  "/speakingtest",
  "/itresult",
  "/itresults",
  "/manageroles",
  "/usermanagement",
];

export function isAdminPath(pathname) {
  const path = (pathname || "").toLowerCase();
  return ADMIN_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`)
  );
}
