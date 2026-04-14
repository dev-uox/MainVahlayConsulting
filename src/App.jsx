import React, { useState, Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

/* Common Components - Keep these loaded immediately */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollTop";
import PopupBox from "./components/Popupbox";
import SEO from "./components/Seo";

/* --- 1. LAZY LOAD PUBLIC PAGES --- */
const Home = lazy(() => import("./pages/Home"));
const AboutUs = lazy(() => import("./pages/About_us"));
const ContactUs = lazy(() => import("./pages/Contact_Us"));
const Services = lazy(() => import("./pages/Services"));
const Blogs = lazy(() => import("./pages/Blogs"));
const BlogDetail = lazy(() => import("./pages/Blogsdetails"));
const Testimonials = lazy(() => import("./pages/Testimonials"));
const Partners = lazy(() => import("./pages/Partners"));
const Projects = lazy(() => import("./pages/Projects"));
const IndustrySection = lazy(() => import("./Solutions"));
const TrendPage = lazy(() => import("./pages/TrendPage"));
const LeadGeneration = lazy(() => import("./pages/LeadGeneration"));
const Teams = lazy(() => import("./pages/Teams"));
const DataAnalyst = lazy(() => import("./pages/DataAnalyst"));
const Benefits = lazy(() => import("./pages/Benifits"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const Copartners = lazy(() => import("./pages/copartners"));
const Careers = lazy(() => import("./pages/careers/Careers"));
const Jobdescription = lazy(() => import("./pages/careers/Jobdescription"));
const JobApplicationForm = lazy(() => import("./pages/careers/Jobapplicationform"));
const Terms = lazy(() => import("./pages/terms"));
const Privacy = lazy(() => import("./pages/privacy"));
const PageNotFound = lazy(() => import("./pages/Pagenotfound"));

/* --- 2. LAZY LOAD AUTH --- */
const SignUp = lazy(() => import("./pages/joinus/SignUp"));
const Login = lazy(() => import("./pages/joinus/Login"));
const ForgetPassword = lazy(() => import("./pages/joinus/Forgotpassword"));
const MultiStepForm = lazy(() => import("./pages/joinus/MultiStepForm"));

/* --- 3. LAZY LOAD PROFILE --- */
const UserProfile = lazy(() => import("./pages/Profile/UserProfile"));
const CandidateAgreementPage = lazy(() => import("./pages/Profile/CandidateAgreementPage "));

/* --- 4. LAZY LOAD IT SERVICES --- */
const ItServices = lazy(() => import("./pages/ITservices/ITservices"));
const ServiceDetail = lazy(() => import("./pages/ITservices/ServiceDetail"));
const Subservices = lazy(() => import("./pages/ITservices/subservices"));

/* --- 5. LAZY LOAD ADMIN --- */
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
const Unauthorized = lazy(() => import("./pages/Unauhtorized"));
const AdminSidebarLayout = lazy(() => import("./pages/Admin/AdminSidebarLayout"));
const ReportsPage = lazy(() => import("./pages/Admin/ReportsPage.jsx"));
const ManageBlogs = lazy(() => import("./pages/Admin/ManageBlogs"));
const Jobs = lazy(() => import("./pages/Admin/Jobs"));
const ManageServices = lazy(() => import("./pages/Admin/ManageSevices"));
const ManageSubservices = lazy(() => import("./pages/Admin/ManageSubservices"));
const ManageProjects = lazy(() => import("./pages/Admin/Manageprojects"));
const ManageEmployees = lazy(() => import("./pages/Admin/Emp/MangeEmp"));
const TrashEmp = lazy(() => import("./pages/Admin/Emp/TrashEmp"));
const ApproveUsers = lazy(() => import("./pages/Admin/ApproveUsers"));
const ManageEmpdetails = lazy(() => import("./pages/Admin/Emp/ManageEmpdetails"));
const ManageSEO = lazy(() => import("./pages/Admin/ManageSEO"));
const InterestedCandidates = lazy(() => import("./pages/Admin/Cadidates"));
const ManageJoiningDates = lazy(() => import("./pages/Admin/MangeJoiningdates"));
const TrainerDailyReport = lazy(() => import("./pages/TrainerDailyReport"));
const TraineeFeedback = lazy(() => import("./pages/Admin/FeedbackToTrainee"));
const ManageAgreements = lazy(() => import("./pages/Admin/ManageAgreement"));
const AdminAgreementPage = lazy(() => import("./pages/Admin/Agreement"));
const FeedbackToTrainer = lazy(() => import("./pages/FeedbackToTrainer"));
// const TrainingWebAccess = lazy(() => import("./pages/Admin/TrainingWebAccess"));

/* --- 6. LAZY LOAD ASSESSMENT --- */
const Alogin = lazy(() => import("./components/Assessment/Alogin"));
const AtreamsAndCondition = lazy(() => import("./components/Assessment/AssementT&c"));
const Assessment = lazy(() => import("./components/Assessment/Assessment"));
const Testlist = lazy(() => import("./components/Assessment/Testlist"));
const ListeningTest = lazy(() => import("./components/Assessment/lestening_test"));
const Aptitudetest = lazy(() => import("./components/Assessment/aptitudetest"));
const Problemsolvingtest = lazy(() => import("./components/Assessment/problemsolvingtest"));
const Sellingtest = lazy(() => import("./components/Assessment/sellingtest"));
const Speakingtest = lazy(() => import("./components/Assessment/speakingtest"));
const Result = lazy(() => import("./pages/Admin/TestResult"));
const ResultDetails = lazy(() => import("./pages/Admin/ResultAns"));
const Results = lazy(() => import("./components/Assessment/ITAssesment/Results"));
const ITResultDetails = lazy(() => import("./components/Assessment/ITAssesment/ResultDetails"));
const ThankYouPage = lazy(() => import("./pages/ThankyouPage"));

/* --- LOADING SPINNER COMPONENT --- */
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
  </div>
);

const App = () => {
  const [showPopup, setShowPopup] = useState(true);

  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <ScrollToTop />
      <SEO />
      <div className="flex flex-col min-h-screen">
        {showPopup && <PopupBox onClose={() => setShowPopup(false)} />}

        <Navbar />

        <main className="flex-grow">
          {/* WRAP ROUTES IN SUSPENSE FOR LAZY LOADING */}
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/about_us" element={<AboutUs />} />
              <Route path="/contact_us" element={<ContactUs />} />
              <Route path="/services" element={<Services />} />
              <Route path="/partners" element={<Partners />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/solutions" element={<IndustrySection />} />
              <Route path="/trendpage" element={<TrendPage />} />
              <Route path="/leadgen" element={<LeadGeneration />} />
              <Route path="/teams" element={<Teams />} />
              <Route path="/dataanalyst" element={<DataAnalyst />} />
              <Route path="/benefits" element={<Benefits />} />
              <Route path="/copartners" element={<Copartners />} />
              <Route path="/testimonials" element={<Testimonials />} />
              <Route path="/case-studies" element={<CaseStudies />} />
              <Route path="/blogs" element={<Blogs />} />
              <Route
                path="/blogs/:categorySlug/:blogSlug"
                element={<BlogDetail />}
              />
              <Route path="/feedbacktotrainer" element={<FeedbackToTrainer />} />

              {/* IT Services */}
              <Route path="/categories/:categorySlug" element={<ItServices />} />
              <Route
                path="/categories/:categorySlug/services/:serviceSlug"
                element={<ServiceDetail />}
              />
              <Route
                path="/categories/:categorySlug/services/:serviceSlug/subservices/:subserviceSlug"
                element={<Subservices />}
              />

              {/* Careers */}
              <Route path="/careers" element={<Careers />} />
              <Route path="/jobdescription/:jobId" element={<Jobdescription />} />
              <Route
                path="/jobapplicationform"
                element={<JobApplicationForm />}
              />

              {/* Auth */}
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgotpassword" element={<ForgetPassword />} />
              <Route path="/multistepform" element={<MultiStepForm />} />

              {/* Profile */}
              <Route path="/profile" element={<UserProfile />} />
              <Route
                path="/my-agreement/:appId"
                element={<CandidateAgreementPage />}
              />

              {/* Assessment Public */}
              <Route path="/assessmentlogin" element={<Alogin />} />
              <Route path="/assessmentt&c" element={<AtreamsAndCondition />} />
              <Route path="/assessment" element={<Assessment />} />
              <Route path="/thankyou" element={<ThankYouPage />} />

              {/* Admin Layout */}
              <Route element={<AdminSidebarLayout />}>
                <Route
                  path="/manageblogs"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageBlogs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/jobs"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Jobs />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manageservices"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageServices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/managesubservices"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageSubservices />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manageprojects"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageProjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-emp"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageEmployees />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trash-emp"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <TrashEmp />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manage-emp/:id"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageEmpdetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manageseo"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageSEO />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/interestedcandidates"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <InterestedCandidates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/managejoiningdates"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <ManageJoiningDates />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/feedbacktotrainee"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <TraineeFeedback />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainerdailyreport"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <TrainerDailyReport />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/manageagreements"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ManageAgreements />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/agreement/:appId"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <AdminAgreementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer-reports/:batchId"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/trainer-reports/:batchId/trainee/:email"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <ReportsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Assessment Admin */}
                <Route
                  path="/testlist"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Testlist />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/listeningtest"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ListeningTest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/aptitude-test"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Aptitudetest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/problemsolvingtest"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Problemsolvingtest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/sellingtest"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Sellingtest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/speakingtest"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <Speakingtest />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/result"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <Result />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/results/:userId"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <ResultDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/itresult"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <Results />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/itresults/:userId"
                  element={
                    <ProtectedRoute roles={["admin", "recruiter"]}>
                      <ITResultDetails />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/approve-users"
                  element={
                    <ProtectedRoute roles={["admin"]}>
                      <ApproveUsers />
                    </ProtectedRoute>
                  }
                />
              </Route>

              {/* Misc */}
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/unauthorize" element={<Unauthorized />} />

              {/* 404 */}
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
      </div>
    </Router>
  );
};

export default App;